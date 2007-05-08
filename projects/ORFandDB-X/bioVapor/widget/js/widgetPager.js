/* Made by José María Fernández, CNIO 2007*/
/* For ORFandDB/X */

/* Widget Pager object declaration */
WidgetPager = function (theuri,theparamid,theparamns,theparamhtml,/* optional */ thedefaultlogo) {
	this.widgetURI=theuri;
	this.widgetParamId=theparamid;
	this.widgetParamNS=theparamns;
	this.widgetParamHTML=theparamhtml;
	this.DEFAULTLOGO=(!thedefaultlogo)?"<div align='center'><h3><i>NO LOGO WAS SET FOR THE WIDGET</i></h3></div>":thedefaultlogo;

	this.pagerPane=null;
	this.pageContentPane=null;
	
	this.defaultFetch=new Array();
	
	this.ishtmlfetch=null;
	this.viewMode='none';
	
	// Content stylesheet
	this.xslStylesheet=null;

	// Result list
	this.xmlDoc=null;

	this.pagerMode='none';
	// Default XSLT pager stylesheet
	this.xslDefaultPagerURL = "xslt/simplePager.xsl";


	// The search
	this.ensemblId=null;
	this.namespace=null;
	this.markup=null;

	// This array will host the shreded nodes
	this.content=new Array();
	this.maxcontent=0;
	this.state=new Array();

	// Possible widget GET parameters
	//this.qsParm = new Array();
	
	// widget message namespace
	this.NSprefix = new Array();
	this.NSprefix['msg'] = 'http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.6';
	
	// Prefetching infrastructure
	this.continuedTimeOut=null;
	this.continueLoops=null;
	
	// This is needed by the asynchronous show
	this.activePlace=WidgetPager.ActivePagers.length;
	WidgetPager.ActivePagers[this.activePlace]=this;
	
	// Let's work!!!!!
	// this.widgetPagerInit();
};

WidgetPager.prototype = {
	setPanes: function (thePager,thePageContent) {
		this.pagerPane=thePager;
		this.pageContentPane=thePageContent;
	},
	
	showError: function (e,widURL) {
		this.xmlDoc=null;
		if(widURL!=null) {
			WidgetCommon.getElementById(this.pagerPane).innerHTML = this.DEFAULTLOGO;
		}
		var errmesg;
		if(!e) {
			errmesg='';
		} else {
			errmesg="<br /><pre>"+WidgetCommon.DebugError(e)+"</pre>";
		}
		var urlerrmesg=(widURL!=null && widURL!='')?"<i>There was an error while retrieving <a href='"+widURL+"'>"+widURL+"</a></i>":'';
		WidgetCommon.getElementById(this.pageContentPane).innerHTML = "<h2>"+urlerrmesg+errmesg+"</h2>";
	},

	widgetPagerInit: function () {
		// Parsing Query String
		var qsParm = new Array();
		WidgetCommon.parseQS(qsParm);
		
		//netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

		if(this.widgetURI!=null && this.pagerPane!=null && this.pageContentPane!=null) {
			if(BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') {
				this.ishtmlfetch='true';
			}
			
			/*
			this.ensemblId=null;
			this.namespace=null;
			*/

			if('ensemblId' in qsParm && qsParm['ensemblId'].length>0) {
				this.ensemblId=qsParm['ensemblId'][0];
			} else {
				if('ensID' in qsParm && qsParm['ensID'].length>0) {
					this.ensemblId=qsParm['ensID'][0];
				} else {
					if('search' in qsParm && qsParm['search'].length>0) {
						this.ensemblId=qsParm['search'][0];
					}
				}
			}

			if(this.ensemblId!=null && this.ensemblId.length==0) {
				this.ensemblId=null;
			}

			if('namespace' in qsParm && qsParm['namespace'].length>0) {
				this.namespace=qsParm['namespace'][0];
			} else {
				this.namespace='EnsEMBL';
			}

			if(this.namespace) {
				if(this.namespace.length==0) {
					this.namespace=null;
				} else if(this.namespace=='General') {
					this.markup=this.ensemblId;
				}
			}

			if(this.ensemblId!=null) {
				var widURL=this.buildWidgetURI(this.ensemblId,this.namespace);
				var myXMLHTTPRequest = new XMLHttpRequest();
				try {
					myXMLHTTPRequest.widget=this;
					myXMLHTTPRequest.open("GET", widURL, true);
					myXMLHTTPRequest.onreadystatechange = function() {
						if(myXMLHTTPRequest.readyState==4) {
							try {
								if(myXMLHTTPRequest.status==200) {
									myXMLHTTPRequest.widget.gotResults(myXMLHTTPRequest.responseXML,widURL);
								} else {
									myXMLHTTPRequest.widget.gotResults(null,widURL);
								}
							} catch(e) {
								myXMLHTTPRequest.widget.gotResults(null,widURL);
							}
						}
					};

					// Go, go, power asynchronous
					WidgetCommon.getElementById(this.pagerPane).innerHTML = 'Querying for results. Please wait...';
					myXMLHTTPRequest.send(null);

				} catch(e) {
					this.showError(e,widURL);
				}
			} else {
				WidgetCommon.getElementById(this.pagerPane).innerHTML = this.DEFAULTLOGO;
				//WidgetCommon.getElementById(pageContentPane).innerHTML = "<h2><i>No EnsEMBL ID has been specified using ensemblId parameter</i></h2>";
				WidgetCommon.getElementById(this.pageContentPane).innerHTML = "<h2><i>Please select a gene</i></h2>";
			}
		} else {
			if(this.pagerPane!=null && this.pageContentPane!=null) {
				WidgetCommon.getElementById(this.pagerPane).innerHTML = this.DEFAULTLOGO;
				WidgetCommon.getElementById(this.pageContentPane).innerHTML = "<h2><i>No widget params have been instantiated when the widget was created</i></h2>";
			} else {
				alert("FATAL ERROR: You (the widget creator) must call setPanes before using this generic widget pager!!!!");
			}
		}
	},
	
	buildWidgetURI: function (ensID,namespace,html)
	{
		var qsParm=new Array();
		qsParm[this.widgetParamId]=ensID;
		if(this.widgetParamNS && namespace) {
			qsParm[this.widgetParamNS]=namespace;
		}
		if(this.widgetParamHTML && html) {
			qsParm[this.widgetParamHTML]=html;
		}

		return WidgetCommon.generateQS(qsParm,this.widgetURI);
	},

	processIncludeNodes: function (nodeList)
	{
		// Internet Explorer has a weird behavior
		// related to JavaScript and CSS on content dynamically
		// loaded using XMLHTTPRequest (like CARGO widgets)
		// and put as DIV children,
		// probably due the severe security problems
		// it had with JavaScript and CSS in the past.
		// So, we have to dynamically load both of them.
		if(nodeList!=null) {
			var iinc=0;
			var minc=nodeList.length;
			for(;iinc<minc;iinc++) {
				var includeType=nodeList[iinc].getAttribute("type");
				var includeURL=nodeList[iinc].getAttribute("href");

				if(includeType=='CSS') {
					WidgetCommon.dhtmlLoadCSS(includeURL);
				}
				if(includeType=='javascript') {
					WidgetCommon.dhtmlLoadScript(includeURL);
				}
			}
		}
	},
	
	gotResults: function (responseXML,widURL)
	{
		try {
			if(responseXML==null)
				throw "Request "+widURL+" failed";

			this.xmlDoc = responseXML;
			WidgetCommon.getElementById(this.pageContentPane).innerHTML = 'Results have been obtained. Starting pre-processing task...';


			// Getting default fetch uri and parameters
			var nodeFetchURI=WidgetCommon.xpathEvaluate("//msg:defaultFetchURI",this.xmlDoc,this.NSprefix);
			if(nodeFetchURI!=null) {
				for(var fetchi=0; fetchi<nodeFetchURI.length; fetchi++) {
					var widgetFetchURI=nodeFetchURI[fetchi].getAttribute('href');
					var widgetFetchParamId=nodeFetchURI[fetchi].getAttribute('idAttr');
					var widgetFetchParamNS=nodeFetchURI[fetchi].getAttribute('nsAttr');
					var widgetFetchParamHTML=nodeFetchURI[fetchi].getAttribute('htmlAttr');
					var widgetFetchParamMarkup=nodeFetchURI[fetchi].getAttribute('markupAttr');
					var widgetFetchScope=nodeFetchURI[fetchi].getAttribute('scope');
					if(!widgetFetchURI) {
						widgetFetchURI=null;
					}
					if(!widgetFetchParamId) {
						widgetFetchParamId=null;
					}
					if(!widgetFetchParamNS) {
						widgetFetchParamNS=null;
					}
					if(!widgetFetchParamHTML) {
						widgetFetchParamHTML=null;
					}
					if(!widgetFetchParamMarkup) {
						widgetFetchParamMarkup=null;
					}
					if(!widgetFetchScope) {
						widgetFetchScope=null;
					}
					var adefaultfetch = new WidgetPager.DefaultFetchURI(widgetFetchURI,widgetFetchParamId,widgetFetchParamNS,widgetFetchParamHTML,widgetFetchParamMarkup,widgetFetchScope);
					this.defaultFetch[adefaultfetch.scope()]=adefaultfetch;
				}
			}
			nodeFetchURI=null;

			// Getting document fragments
			var nodeResult=WidgetCommon.xpathEvaluate("//msg:result",this.xmlDoc,this.NSprefix);
			if(nodeResult!=null && nodeResult.length>0) {
				var nodei=0;
				this.maxcontent=nodeResult.length;
				for(nodei=0;nodei<this.maxcontent;nodei++) {
					// Finding the child
					var child=nodeResult[nodei].firstChild;
					while(child!=null && child.nodeType!=1 && child.tagName.substr(child.tagName.indexOf(':',0)+1)!='content') {
						child=child.nextSibling;
					}
					// Did we find the child?
					this.content[nodei+1]=nodeResult[nodei];
					if(child!=null) {
						if(this.ishtmlfetch) {
							var strser="";
							var ser=new XMLSerializer();

							var itergrand=child.firstChild;
							while(itergrand) {
								if(itergrand.nodeType==1) {
									strser+=ser.serializeToString(itergrand);
								} else {
									if(itergrand.nodeType==3 || itergrand.nodeType==4) {
										strser+=Sarissa.getText(itergrand,false);
									}
								}
								itergrand=itergrand.nextSibling;
							}
							this.content[nodei+1]=strser;
						}
						this.state[nodei+1]=new String('');
					} else {
						this.state[nodei+1]=null;
					}
				}

				// Now do the pager task
				var pagerURL=null;

				// In HTML mode we must used a degraded pager (sigh)
				if(!this.ishtmlfetch) {
					// Get the pager
					var nodePager=WidgetCommon.xpathEvaluate("//msg:pagerView",this.xmlDoc,this.NSprefix);
					pagerURL=(nodePager!=null && nodePager.length>0)?nodePager[0].getAttribute('href'):null;

					if(pagerURL==null || pagerURL == undefined || pagerURL=='') {
						pagerURL=this.xslDefaultPagerURL;
						this.pagerMode='XSLT';
					} else {
						this.pagerMode=nodePager[0].getAttribute('showMode');
						if(!this.pagerMode) {
							this.pagerMode='none';
						}
						if(this.pagerMode!='none' && nodePager!=null && nodePager.length>0) {
							// It is custom, so apply what it is needed by the pager
							var nodeInc=WidgetCommon.xpathEvaluate("//msg:pagerView/msg:include",this.xmlDoc,this.NSprefix);

							this.processIncludeNodes(nodeInc);
						}
					}
				} else {
					this.pagerMode='none';
				}
				
				if(this.pagerMode!='none') {
					var myXMLHTTPRequest=new XMLHttpRequest();
					myXMLHTTPRequest.widget=this;
					myXMLHTTPRequest.onreadystatechange = function() {
						if(myXMLHTTPRequest.readyState==4) {
							try {
								if(myXMLHTTPRequest.status==200) {
									myXMLHTTPRequest.widget.gotPagerXSLT(myXMLHTTPRequest.responseXML,pagerURL);
								} else {
									myXMLHTTPRequest.widget.gotPagerXSLT(null,pagerURL);
								}
							} catch(e) {
								myXMLHTTPRequest.widget.gotPagerXSLT(null,pagerURL);
							}
						}
					};

					// Go, go, power asynchronous
					myXMLHTTPRequest.open("GET", pagerURL, true);
					WidgetCommon.getElementById(this.pagerPane).innerHTML = "Fetching pager's stylesheet. Please wait...";
					myXMLHTTPRequest.send(null);
				} else {
					this.setLocalPager();
					this.processDefaultView();
				}
			} else {
				// Sanity
				if(!this.namespace) {
					this.namespace='';
				}
				if(!this.ensemblId) {
					this.ensemblId='';
				}
				// Last message
				WidgetCommon.getElementById(this.pageContentPane).innerHTML='No OMIM result was found for '+this.ensemblId+' on namespace '+this.namespace;
				WidgetCommon.getElementById(this.pagerPane).innerHTML=this.DEFAULTLOGO;
			}

		} catch(e) {
			this.showError(e,widURL);
		}
	},

	setLocalPager: function ()
	{
		// By program pager
		WidgetCommon.getElementById(this.pagerPane).innerHTML = '<div align="center">Found '+
			this.maxcontent+' result'+((this.maxcontent>1)?'s':'')+
			'<form name="pagerForm"><a href="javascript:widgetPager.showOne(1)">First</a> <select id="computedPager" name="pager" size="1" style="width:280" onChange="widgetPager.showOne(this.options[this.selectedIndex].value)"></select> <a href="javascript:widgetPager.showOne('+
			(this.content.length - 1)+')">Last</a></form></div>';
		var selectElem=WidgetCommon.getElementById('computedPager');
		for(var coni=1;coni<=this.maxcontent;coni++) {
			var title=this.content[coni].getAttribute('title');
			if(!title) {
				title=new String(coni);
			}

			var optelem=document.createElement('option');
			//optelem.text=title.substr(0,30)+((title.length>30)?'...':'');
			optelem.text=title;
			optelem.value=coni;
			try {
				selectElem.add(optelem,null);
			} catch(ex) {
				selectElem.add(optelem);
			}
		}
	},

	gotPagerXSLT: function (responseXML,xslPagerURL)
	{
		try {
			if(responseXML==null)
				throw "Request "+xslPagerURL+" failed";

			// Do the pager task
			var xslPager = responseXML;

			var xsltProc = new XSLTProcessor();
			WidgetCommon.getElementById(this.pagerPane).innerHTML = "Importing pager's stylesheet...";
			xsltProc.importStylesheet(xslPager);
			xsltProc.clearParameters();
			
			WidgetCommon.getElementById(this.pagerPane).innerHTML = "Applying pager's stylesheet...";
			var fragment = xsltProc.transformToFragment(this.xmlDoc, document);
			//xsltProc.reset();

			WidgetCommon.getElementById(this.pagerPane).innerHTML = "";

			WidgetCommon.getElementById(this.pagerPane).appendChild(fragment);
			this.processDefaultView();
		} catch(e) {
			this.showError(e,xslPagerURL);
		}
	},

	processDefaultView: function ()
	{		
		// Get the XSL URL, if any
		var viewURL=null;
		if(!this.ishtmlfetch) {
			var nodeDefView=WidgetCommon.xpathEvaluate("//msg:defaultView",this.xmlDoc,this.NSprefix);
			if(nodeDefView!=null && nodeDefView.length>0) {
				viewURL=nodeDefView[0].getAttribute('href');
				this.viewMode=nodeDefView[0].getAttribute('showMode');
			}

			if(!this.viewMode) {
				this.viewMode='none';
			}
		} else {
			this.viewMode='none';
		}

		var nodeInc=WidgetCommon.xpathEvaluate("//msg:defaultView/msg:include",this.xmlDoc,this.NSprefix);
		this.processIncludeNodes(nodeInc);

		if(!viewURL || this.viewMode=='none') {
			// And we don't have to forget this
			this.showOne(1);
		} else {
			// And now, get XSL itself
			var myXMLHTTPRequest=new XMLHttpRequest();
			myXMLHTTPRequest.widget=this;
			myXMLHTTPRequest.onreadystatechange = function() {
				if(myXMLHTTPRequest.readyState==4) {
					try {
						if(myXMLHTTPRequest.status==200) {
							myXMLHTTPRequest.widget.gotContentXSLT(myXMLHTTPRequest.responseXML,viewURL);
						} else {
							myXMLHTTPRequest.widget.gotContentXSLT(null,viewURL);
						}
					} catch(e) {
						myXMLHTTPRequest.widget.gotContentXSLT(null,viewURL);
					}
				}
			};

			// Go, go, power asynchronous
			myXMLHTTPRequest.open("GET", viewURL, true);
			WidgetCommon.getElementById(this.pageContentPane).innerHTML = "Fetching content's stylesheet. Please wait...";
			myXMLHTTPRequest.send(null);
		}
	},

	gotContentXSLT: function (responseXML,xslURL)
	{
		try {
			if(responseXML==null)
				throw "Request "+xslURL+" failed";

			this.xslStylesheet = responseXML;


			// And we don't have to forget this
			this.showOne(1);
		} catch(e) {
			this.showError(e,xslURL);
		}
	},
	
	showOne: function (theVal) {
		this.show(theVal,theVal);
		//this.prefetch(theVal+1,theVal+5);
	},

	show: function (fromVal,toVal)
	{
		WidgetCommon.getElementById(this.pageContentPane).innerHTML = "";

		this.prefetch(fromVal,toVal+5);
		WidgetPager.ContinueShow(this.activePlace,fromVal,toVal);
	},

	prefetch: function (fromVal,toVal)
	{
		if(toVal>this.maxcontent) {
			toVal=this.maxcontent;
		}
		if(fromVal<1) {
			fromVal=1;
		}
		for(var nodei=fromVal;nodei<=toVal;nodei++) {
			if(this.state[nodei]) {
				// Already fetched (or fetching)
				continue;
			}
			var thecontent=this.content[nodei];
			// So, let's fetch!
			var fetchURI=null;

			if(!thecontent.getAttribute('href')) {
				var id=thecontent.getAttribute('id');
				var namespace=thecontent.getAttribute('namespace');
				if(!namespace) {
					namespace=null;
				}
				
				// Let's seek the uri builder
				var nssearch=(!namespace)?WidgetPager.DefaultScope:namespace;
				var uriBuilder=null;
				if(nssearch in this.defaultFetch) {
					uriBuilder=this.defaultFetch[nssearch];
				} else if(WidgetPager.DefaultScope in this.defaultFetch) {
					uriBuilder=this.defaultFetch[WidgetPager.DefaultScope];
				} else {
					// Error
				}
				
				if(uriBuilder) {
					fetchURI=uriBuilder.buildURI(id,namespace,this.ishtmlfetch,this.markup);
				}
			} else {
				fetchURI=thecontent.getAttribute('href');
			}
				
			// It is a noop when there is no fetch uri
			if(fetchURI) {
				this.doPrefetch(fetchURI,nodei,fromVal);
			}
		}
	},

	doPrefetch: function (fetchURI,nodei,fromVal)
	{
		var prefetchXML=new XMLHttpRequest();
		prefetchXML.thei=nodei;
		prefetchXML.render=(nodei==fromVal)?1:null;
		prefetchXML.widget=this;
		prefetchXML.onreadystatechange = function() {
			if(prefetchXML.readyState==4) {
				try {
					if(prefetchXML.status==200) {
						if(prefetchXML.widget.ishtmlfetch) {
							prefetchXML.widget.content[prefetchXML.thei]=prefetchXML.responseText;
						} else {
							//content[prefetchXML.thei]=prefetchXML.responseXML;
							prefetchXML.widget.content[prefetchXML.thei].appendChild(prefetchXML.responseXML.documentElement);
						}

						prefetchXML.widget.state[prefetchXML.thei]=new String('');

						/*
						if(prefetchXML.render) {
							WidgetPager.ContinueShow(prefetchXML.widget.activePlace,prefetchXML.thei,prefetchXML.thei);
						}
						var divi=document.createElement('div');
						divi.innerHTML=prefetchXML.thei;
						WidgetCommon.getElementById(prefetchXML.widget.pageContentPane).appendChild(divi);
						*/
					} else {
						//alert("ERROR: Could not fetch information for "+id);
						prefetchXML.widget.state[prefetchXML.thei]=new String("ERROR: Could not fetch "+fetchURI);
					}
				} catch(e) {
					prefetchXML.widget.state[prefetchXML.thei]=new String(
						"ERROR: Could not fetch "+fetchURI+" because your browser is perhaps in offline mode!!!<pre>"+
						WidgetCommon.DebugError(e)+"</pre>"
					);
				}
			}
		};

		// Go, go, power asynchronous
		this.state[nodei]=prefetchXML;
		prefetchXML.open("GET", fetchURI, true);
		prefetchXML.send(null);
	}

};

// Static members/methods

WidgetPager.ActivePagers=new Array();

WidgetPager.ContinueShow = function (activePlace,fromVal,toVal) {
	var widget=WidgetPager.ActivePagers[activePlace];
	if(!widget) {
		// We should show some sort of error message here!!!!
		return;
	}
	if(widget.continuedTimeOut!=null) {
		clearTimeout(widget.continuedTimeOut);
		widget.continuedTimeOut=null;
	} else {
		widget.continueLoops=600;
	}
	if(toVal>widget.maxcontent) {
		toVal=widget.maxcontent;
	}
	if(fromVal<1) {
		fromVal=1;
	}
	if(fromVal<=toVal) {
		//WidgetCommon.getElementById(pageContentPane).innerHTML = "Importing content's stylesheet...";
		for(var nodei=fromVal;nodei<=toVal;nodei++) {
			// Avoiding race conditions
			var thestate=widget.state[nodei];
			// Skipping null contents
			if(thestate!=null && thestate instanceof String) {
				if(thestate.length==0) {
					var thecontent=widget.content[nodei];
					if(widget.viewMode=='none') {
						WidgetCommon.getElementById(widget.pageContentPane).innerHTML += thecontent;
					} else {
						var xsltProc = new XSLTProcessor();
						xsltProc.importStylesheet(widget.xslStylesheet);
						xsltProc.clearParameters();

						// This is the ONLY point which is stopping Opera to work in native mode!
						var fragment;
						try {
							fragment = xsltProc.transformToFragment(thecontent, document);
							WidgetCommon.getElementById(widget.pageContentPane).appendChild(fragment);
						} catch(e) {
							/*
							alert(e.name);
							alert(e.message);
							alert(thecontent);
							alert(thestate);
							*/
							WidgetCommon.getElementById(widget.pageContentPane).innerHTML='Could not fetch/show this record?!?!?!?<br />Reason: <pre>'+WidgetCommon.DebugError(e)+'</pre>';
						}
						//xsltProc.reset();
					}
				} else {
					WidgetCommon.getElementById(widget.pageContentPane).innerHTML='Could not fetch/show this record?!?!?!?<br />Reason: '+thestate;
				}
			} else {
				if(thestate!=null) {
					//alert("Waiting for the fetch "+nodei+" state "+thestate);
					widget.continueLoops--;
					if(widget.continueLoops<=0) {
						//alert("Ya estoy hasta los bytes de iterar!");
						if('cancel' in thestate) {
							try {
								thestate.onreadystatechange=null;
								thestate.cancel();
							} catch(e) {
								// Do nothing(R)
							}
						}

					} else {
						// Each quarter of a second, results are checked
						widget.continuedTimeOut=setTimeout("WidgetPager.ContinueShow("+activePlace+","+nodei+","+toVal+")",500);
					}
				} else {
					try {
						throw "FATAL ERROR: Null asynchronous query object found on WidgetPager.ContinueShow!";
					} catch(e) {
						widget.showError(e,null);
					}
				}
			}
		}
	}
};


WidgetPager.DefaultScope = '__default__';
WidgetPager.GlobalScope = 'General';

/* URI builder */
WidgetPager.DefaultFetchURI = function (thefetchuri,theidattr,thensattr,thehtmlattr,themarkupattr,thenamespace) {
	this.widgetFetchURI=thefetchuri;
	this.widgetFetchParamId=theidattr;
	this.widgetFetchParamNS=thensattr;
	this.widgetFetchParamHTML=(!thehtmlattr)?false:true;
	this.widgetFetchParamMarkup=themarkupattr;
	this.widgetFetchScope=(!thenamespace)?WidgetPager.DefaultScope:thenamespace;
};

WidgetPager.DefaultFetchURI.prototype = {
	buildURI: function (id, /* optional */ ns, html, markup) {
		var qsParm=new Array();
		qsParm[this.widgetFetchParamId]=id;
		if(this.widgetFetchParamNS && namespace) {
			qsParm[this.widgetFetchParamNS]=namespace;
		}
		if(this.widgetFetchParamHTML && html) {
			qsParm[this.widgetFetchParamHTML]='true';
		}

		if(this.widgetFetchParamMarkup && markup) {
			qsParm[this.widgetFetchParamMarkup]=markup;
		}

		return WidgetCommon.generateQS(qsParm,this.widgetFetchURI);
	},
	
	isHTMLFetch: function () {
		return this.widgetFetchParamHTML;
	},
	
	scope: function() {
		return this.widgetFetchScope;
	}
};

/* Data: either content or view */
WidgetPager.Data = function (thecontent,thefetchuri,thedataname,theusagescope) {
	this.includeNodes=new Array();
	if(!thefetchuri) {
		this.state=new String('');
		this.content=thecontent;
	} else {
		this.state=null;
		this.content=thefetchuri;
	}
	this.dataName=thedataname;
	this.usageScope=theusagescope;
	this.onReady=null;
};

WidgetPager.Data.prototype = {
	scope: function() {
		return this.usageScope;
	},
	
	processIncludeNodes: function (nodeList)
	{
		// Internet Explorer has a weird behavior
		// related to JavaScript and CSS on content dynamically
		// loaded using XMLHTTPRequest (like CARGO widgets)
		// and put as DIV children,
		// probably due the severe security problems
		// it had with JavaScript and CSS in the past.
		// So, we have to dynamically load both of them.
		if(nodeList!=null) {
			var iinc=0;
			var minc=nodeList.length;
			for(;iinc<minc;iinc++) {
				var include=new Object();
				include.includeType=nodeList[iinc].getAttribute("type");
				include.includeURL=nodeList[iinc].getAttribute("href");
				this.includeNodes.push(include);
			}
		}
	},
	
	doPrefetch: function (onreadyfunction)
	{
		if(this.state) {
			// Already fetched (or fetching)
			return;
		}
		this.onReady = onreadyfunction;
		var fetchURI = this.content;
		var prefetchXML=new XMLHttpRequest();
		prefetchXML.data=this;
		prefetchXML.onreadystatechange = function() {
			if(prefetchXML.readyState==4) {
				try {
					if(prefetchXML.status==200) {
						if(prefetchXML.data.ishtmlfetch) {
							prefetchXML.data.content=prefetchXML.responseText;
						} else {
							//content[prefetchXML.thei]=prefetchXML.responseXML;
							prefetchXML.data.content.appendChild(prefetchXML.responseXML.documentElement);
						}

						prefetchXML.data.state=new String('');

					} else {
						//alert("ERROR: Could not fetch information for "+id);
						prefetchXML.data.state=new String("ERROR: Could not fetch "+fetchURI);
					}
				} catch(e) {
					prefetchXML.data.state=new String(
						"ERROR: Could not fetch "+fetchURI+" because your browser is perhaps in offline mode!!!<pre>"+
						WidgetCommon.DebugError(e)+"</pre>"
					);
				}
				// Calling the last function
				if(prefetchXML.data.onReady instanceof Function) {
					prefetchXML.data.onReady();
					prefetchXML.data.onReady=null;
				}
			}
		};

		// Go, go, power asynchronous
		this.state=prefetchXML;
		prefetchXML.open("GET", fetchURI, true);
		prefetchXML.send(null);
	}
};
	
/* Contents */
WidgetPager.Content = function (theid,thenamespace,thecontent,thefetchuri,thetitle) {
	WidgetPager.Data.call(this,thecontent,thefetchuri,thetitle,(!thenamespace)?WidgetPager.GeneralScope:thenamespace);
	this.id=theid;
};
WidgetPager.Content.prototype = new WidgetPager.Data;
WidgetPager.Content.prototype.constructor = WidgetPager.Content;

/* Views */
WidgetPager.View = function (thename,thescope,theviewmode,thecontent,thefetchuri,themimetype) {
	WidgetPager.Data.call(this,thecontent,thefetchuri,thename,(!thescope)?WidgetPager.DefaultScope:thescope);
	this.viewMode=(!theviewmode)?'none':theviewmode;
	this.mimeType=themimetype;
};
WidgetPager.View.prototype = new WidgetPager.Data;
WidgetPager.View.prototype.constructor = WidgetPager.View;

WidgetPager.View.prototype.applyView = function (data,elementId) {
	// Precondition: the information must be previously fetched (if needed).

	for(var iinc=0;iinc<this.includeNodes.length;iinc++) {
		var include=this.includeNodes[iinc];

		if(include.includeType=='CSS') {
			WidgetCommon.dhtmlLoadCSS(include.includeURL);
		}
		if(include.includeType=='javascript') {
			WidgetCommon.dhtmlLoadScript(include.includeURL);
		}
	}
	// Now, time to apply the view.
	switch(this.viewMode) {
		case 'CSS':
		case 'javascript':
			if(this.viewMode=='CSS') {
				WidgetCommon.dhtmlLoadCSSContent(this.content);
			} else {
				WidgetCommon.dhtmlLoadScriptContent(this.content);
			}
		case 'none':
			WidgetCommon.getElementById(elementId).innerHTML += data.content;
			break;
		case 'XSLT':
			var xsltProc = new XSLTProcessor();
			xsltProc.importStylesheet(this.content);
			xsltProc.clearParameters();

			var fragment;
			try {
				fragment = xsltProc.transformToFragment(data.content, document);
				WidgetCommon.getElementById(elementId).appendChild(fragment);
			} catch(e) {
				/*
				alert(e.name);
				alert(e.message);
				alert(thecontent);
				alert(thestate);
				*/
				WidgetCommon.getElementById(elementId).innerHTML='Could not fetch/show this record?!?!?!?<br />Reason: <pre>'+WidgetCommon.DebugError(e)+'</pre>';
			}
			break;
		case 'applet':
		case 'plugin':
			/* Not implemented yet */
			break;
	}
};

var widgetURI=null;
var widgetParamId=null;
var widgetParamNS=null;
var widgetParamHTML=null;

var pagerPane=null;
var pageContentPane=null;

var widgetFetchURI=null;
var widgetFetchParamId=null;
var widgetFetchParamNS=null;
var widgetFetchParamHTML=null;

var ishtmlfetch=null;
var pagerMode='none';
var viewMode='none';

// Result list
var xmlDoc;

// Default XSLT pager stylesheet
var xslDefaultPagerURL = "xslt/simplePager.xsl";

// Content stylesheet
var xslStylesheet;

// The search
var ensemblId=null;
var namespace=null;


// This array will host the shreded nodes
var content=new Array();
var maxcontent=0;
var state=new Array();

// Possible widget GET parameters
var qsParm = new Array();
/*
qsParm['ensemblId'] = null;
qsParm['ensID'] = null;
qsParm['search'] = null;
qsParm['namespace'] = null;
*/

// widget message namespace
var NSprefix = new Array();
NSprefix['msg'] = 'http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.5';

var DEFAULTLOGO="<div align='center'><h3><i>NO LOGO WAS SET FOR THE WIDGET</i></h3></div>";

function setPanes(thePager,thePageContent)
{
	pagerPane=thePager;
	pageContentPane=thePageContent;
}

function setWidgetParams(theuri,thedefaultlogo,theparamid,theparamns,theparamhtml)
{
	widgetURI=theuri;
	DEFAULTLOGO=thedefaultlogo;
	widgetParamId=theparamid;
	widgetParamNS=theparamns;
	widgetParamHTML=theparamhtml;
}

function showError(e,widURL) {
	xmlDoc=null;
	if(widURL!=null) {
		getElemById(pagerPane).innerHTML = DEFAULTLOGO;
	}
	var errmesg;
	if(!e) {
		errmesg='';
	} else {
		errmesg="<br />JavaScript Error: "+e.name+"<br />JavaScript Message: "+e.message;
	}
	var urlerrmesg=(widURL!=null && widURL!='')?"<i>There was an error while retrieving <a href='"+widURL+"'>"+widURL+"</a></i>":'';
	getElemById(pageContentPane).innerHTML = "<h2>"+urlerrmesg+errmesg+"</h2>";
}

function widgetPagerInit() {
	// load the xslt file, example1.xsl
	
	//netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	
	if(widgetURI!=null && pagerPane!=null && pageContentPane!=null) {
		if(BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') {
			ishtmlfetch='true';
		}
		ensemblId=null;
		namespace=null;

		if('ensemblId' in qsParm && qsParm['ensemblId'].length>0) {
			ensemblId=qsParm['ensemblId'][0];
		} else {
			if('ensID' in qsParm && qsParm['ensID'].length>0) {
				ensemblId=qsParm['ensID'][0];
			} else {
				if('search' in qsParm && qsParm['search'].length>0) {
					ensemblId=qsParm['search'][0];
				}
			}
		}
		
		if(ensemblId!=null && ensemblId.length==0) {
			ensemblId=null;
		}

		if('namespace' in qsParm && qsParm['namespace'].length>0) {
			namespace=qsParm['namespace'][0];
		} else {
			namespace='EnsEMBL';
		}
		
		if(namespace && namespace.length==0) {
			namespace=null;
		}
		
		if(ensemblId!=null) {
			var widURL=buildWidgetURI(ensemblId,namespace);
			var myXMLHTTPRequest = new XMLHttpRequest();
			try {
				myXMLHTTPRequest.open("GET", widURL, true);
				myXMLHTTPRequest.onreadystatechange = function() {
					if(myXMLHTTPRequest.readyState==4) {
						try {
							if(myXMLHTTPRequest.status==200) {
								gotResults(myXMLHTTPRequest.responseXML,widURL);
							} else {
								gotResults(null,widURL);
							}
						} catch(e) {
							gotResults(null,widURL);
						}
					}
				};

				// Go, go, power asynchronous
				getElemById(pagerPane).innerHTML = 'Querying for results. Please wait...';
				myXMLHTTPRequest.send(null);

			} catch(e) {
				showError(e,widURL);
			}
		} else {
			getElemById(pagerPane).innerHTML = DEFAULTLOGO;
			//getElemById(pageContentPane).innerHTML = "<h2><i>No EnsEMBL ID has been specified using ensemblId parameter</i></h2>";
			getElemById(pageContentPane).innerHTML = "<h2><i>Please select a gene</i></h2>";
		}
	} else {
		if(pagerPane!=null && pageContentPane!=null) {
			getElemById(pagerPane).innerHTML = DEFAULTLOGO;
			getElemById(pageContentPane).innerHTML = "<h2><i>No widget has been instantiated using javascript function setWidgetParams</i></h2>";
		} else {
			alert("FATAL ERROR: You (the widget creator) must call setPanes before using this generic widget pager!!!!");
		}
	}
}

function gotResults(responseXML,widURL)
{
	try {
		if(responseXML==null)
			throw "Request "+widURL+" failed";
			
		xmlDoc = responseXML;
		getElemById(pageContentPane).innerHTML = 'Results have been obtained. Starting pre-processing task...';
		
		
		// Getting default fetch uri and parameters
		var nodeFetchURI=xpathEvaluate("//msg:defaultFetchURI",xmlDoc,NSprefix);
		if(nodeFetchURI!=null && nodeFetchURI.length>0) {
			widgetFetchURI=nodeFetchURI[0].getAttribute('href');
			widgetFetchParamId=nodeFetchURI[0].getAttribute('idAttr');
			widgetFetchParamNS=nodeFetchURI[0].getAttribute('nsAttr');
			widgetFetchParamHTML=nodeFetchURI[0].getAttribute('htmlAttr');
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
		}
		nodeFetchURI=null;
		
		// Getting document fragments
		var nodeResult=xpathEvaluate("//msg:result",xmlDoc,NSprefix);
		if(nodeResult!=null && nodeResult.length>0) {
			var nodei=0;
			maxcontent=nodeResult.length;
			for(nodei=0;nodei<maxcontent;nodei++) {
				// Finding the child
				var child=nodeResult[nodei].firstChild;
				while(child!=null && child.nodeType!=1 && child.tagName.substr(child.tagName.indexOf(':',0)+1)!='content') {
					child=child.nextSibling;
				}
				// Did we find the child?
				content[nodei+1]=nodeResult[nodei];
				if(child!=null) {
					if(ishtmlfetch) {
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
						content[nodei+1]=strser;
					}
					state[nodei+1]=new String('');
				} else {
					state[nodei+1]=null;
				}
			}

			// Now do the pager task
			var pagerURL=null;

			// In HTML mode we must used a degraded pager (sigh)
			if(!ishtmlfetch) {
				// Get the pager
				var nodePager=xpathEvaluate("//msg:pagerView",xmlDoc,NSprefix);
				pagerURL=(nodePager!=null && nodePager.length>0)?nodePager[0].getAttribute('href'):null;

				if(pagerURL==null || pagerURL == undefined || pagerURL=='') {
					pagerURL=xslDefaultPagerURL;
					pagerMode='XSLT';
				} else {
					pagerMode=nodePager[0].getAttribute('showMode');
					if(!pagerMode) {
						pagerMode='none';
					}
					if(pagerMode!='none' && nodePager!=null && nodePager.length>0) {
						// It is custom, so apply what it is needed by the pager
						var nodeInc=xpathEvaluate("//msg:pagerView/msg:include",xmlDoc,NSprefix);

						processIncludeNodes(nodeInc);
					}
				}
			} else {
				pagerMode='none';
			}
			if(pagerMode!='none') {
				var myXMLHTTPRequest=new XMLHttpRequest();
				myXMLHTTPRequest.onreadystatechange = function() {
					if(myXMLHTTPRequest.readyState==4) {
						try {
							if(myXMLHTTPRequest.status==200) {
								gotPagerXSLT(myXMLHTTPRequest.responseXML,pagerURL);
							} else {
								gotPagerXSLT(null,pagerURL);
							}
						} catch(e) {
							gotPagerXSLT(null,pagerURL);
						}
					}
				};

				// Go, go, power asynchronous
				myXMLHTTPRequest.open("GET", pagerURL, true);
				getElemById(pagerPane).innerHTML = "Fetching pager's stylesheet. Please wait...";
				myXMLHTTPRequest.send(null);
			} else {
				setLocalPager();
				processDefaultView();
			}
		} else {
			// Sanity
			if(!namespace) {
				namespace='';
			}
			if(!ensemblId) {
				ensemblId='';
			}
			// Last message
			getElemById(pageContentPane).innerHTML='No OMIM result was found for '+ensemblId+' on namespace '+namespace;
			getElemById(pagerPane).innerHTML=DEFAULTLOGO;
		}
		
	} catch(e) {
		showError(e,widURL);
	}
}

function setLocalPager()
{
	// By program pager
	getElemById(pagerPane).innerHTML = '<div align="center">Found '+maxcontent+' result'+((maxcontent>1)?'s':'')+'<form name="pagerForm"><a href="javascript:showOne(1)">First</a> <select id="computedPager" name="pager" size="1" style="width:280" onChange="showOne(this.options[this.selectedIndex].value)"></select> <a href="javascript:showOne('+(content.length - 1)+')">Last</a></form></div>';
	var selectElem=getElemById('computedPager');
	for(var coni=1;coni<=maxcontent;coni++) {
		var title=content[coni].getAttribute('title');
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
}

function gotPagerXSLT(responseXML,xslPagerURL)
{
	try {
		if(responseXML==null)
			throw "Request "+xslPagerURL+" failed";
		
		// Do the pager task
		var xslPager = responseXML;
		
		var xsltProc = new XSLTProcessor();
		getElemById(pagerPane).innerHTML = "Importing pager's stylesheet...";
		xsltProc.importStylesheet(xslPager);
		xsltProc.clearParameters();

		getElemById(pagerPane).innerHTML = "Applying pager's stylesheet...";
		var fragment = xsltProc.transformToFragment(xmlDoc, document);
		//xsltProc.reset();

		getElemById(pagerPane).innerHTML = "";

		getElemById(pagerPane).appendChild(fragment);
		processDefaultView();
	} catch(e) {
		showError(e,xslPagerURL);
	}
}

function processDefaultView()
{		
	// Get the XSL URL, if any
	var viewURL=null;
	if(!ishtmlfetch) {
		var nodeDefView=xpathEvaluate("//msg:defaultView",xmlDoc,NSprefix);
		if(nodeDefView!=null && nodeDefView.length>0) {
			viewURL=nodeDefView[0].getAttribute('href');
			viewMode=nodeDefView[0].getAttribute('showMode');
		}

		if(!viewMode) {
			viewMode='none';
		}
	} else {
			viewMode='none';
	}
	
	var nodeInc=xpathEvaluate("//msg:defaultView/msg:include",xmlDoc,NSprefix);
	processIncludeNodes(nodeInc);
	
	if(!viewURL || viewMode=='none') {
		// And we don't have to forget this
		showOne(1);
	} else {
		// And now, get XSL itself
		var myXMLHTTPRequest=new XMLHttpRequest();
		myXMLHTTPRequest.onreadystatechange = function() {
			if(myXMLHTTPRequest.readyState==4) {
				try {
					if(myXMLHTTPRequest.status==200) {
						gotContentXSLT(myXMLHTTPRequest.responseXML,viewURL);
					} else {
						gotContentXSLT(null,viewURL);
					}
				} catch(e) {
					gotContentXSLT(null,viewURL);
				}
			}
		};

		// Go, go, power asynchronous
		myXMLHTTPRequest.open("GET", viewURL, true);
		getElemById(pageContentPane).innerHTML = "Fetching content's stylesheet. Please wait...";
		myXMLHTTPRequest.send(null);
	}
}

function gotContentXSLT(responseXML,xslURL)
{
	try {
		if(responseXML==null)
			throw "Request "+xslURL+" failed";
			
		xslStylesheet = responseXML;

		
		// And we don't have to forget this
		showOne(1);
	} catch(e) {
		showError(e,xslURL);
	}
}

function showOne(theVal) {
	show(theVal,theVal);
	//prefetch(theVal+1,theVal+5);
}

var continuedTimeOut=null;
var continueLoops=null;

function show(fromVal,toVal)
{
	getElemById(pageContentPane).innerHTML = "";
	
	prefetch(fromVal,toVal+5);
	continueShow(fromVal,toVal);
}

function continueShow(fromVal,toVal)
{
	if(continuedTimeOut!=null) {
		clearTimeout(continuedTimeOut);
		continuedTimeOut=null;
	} else {
		continueLoops=600;
	}
	if(toVal>maxcontent) {
		toVal=maxcontent;
	}
	if(fromVal<1) {
		fromVal=1;
	}
	if(fromVal<=toVal) {
		//getElemById(pageContentPane).innerHTML = "Importing content's stylesheet...";
		for(var nodei=fromVal;nodei<=toVal;nodei++) {
			// Avoiding race conditions
			var thecontent=content[nodei];
			var thestate=state[nodei];
			// Skipping null contents
			if(thestate!=null && thestate instanceof String) {
				if(thestate.length==0) {
					if(viewMode=='none') {
						getElemById(pageContentPane).innerHTML += thecontent;
					} else {
						var xsltProc = new XSLTProcessor();
						xsltProc.importStylesheet(xslStylesheet);
						xsltProc.clearParameters();

						// This is the ONLY point which is stopping Opera to work in native mode!
						var fragment;
						try {
							fragment = xsltProc.transformToFragment(thecontent, document);
							getElemById(pageContentPane).appendChild(fragment);
						} catch(e) {
							/*
							alert(e.name);
							alert(e.message);
							alert(thecontent);
							alert(thestate);
							*/
							getElemById(pageContentPane).innerHTML='Could not fetch/show this record?!?!?!?<br />Reason: '+e.message;
						}
						//xsltProc.reset();
					}
				} else {
					getElemById(pageContentPane).innerHTML='Could not fetch/show this record?!?!?!?<br />Reason: '+thestate;
				}
			} else {
				if(thestate!=null) {
					//alert("Waiting for the fetch "+nodei+" state "+thestate);
					continueLoops--;
					if(continueLoops<=0) {
						//alert("Ya estoy hasta los bytes de iterar!");
						if('cancel' in thestate) {
							try {
								thestate.cancel();
							} catch(e) {
								// Do nothing(R)
							}
						}
						
					} else {
						// Each quarter of a second, results are checked
						continuedTimeOut=setTimeout("continueShow("+nodei+","+toVal+")",500);
					}
				} else {
					try {
						throw "FATAL ERROR: Null asynchronous query object found on continueShow!";
					} catch(e) {
						showError(e,null);
					}
				}
			}
		}
	}
}

function prefetch(fromVal,toVal)
{
	// It is a noop when there is no fetch uri
	if(widgetFetchURI) {
		if(toVal>maxcontent) {
			toVal=maxcontent;
		}
		if(fromVal<1) {
			fromVal=1;
		}
		for(var nodei=fromVal;nodei<=toVal;nodei++) {
			if(state[nodei]) {
				// Already fetched (or fetching)
				continue;
			}
			// So, let's fetch!
			var fetchURI;
			
			if(!content[nodei].getAttribute('href')) {
				var id=content[nodei].getAttribute('id');
				var namespace=content[nodei].getAttribute('namespace');
				if(!namespace) {
					namespace=null;
				}
				fetchURI=buildFetchURI(id,namespace,ishtmlfetch);
			} else {
				fetchURI=content[nodei].getAttribute('href');
			}
			
			doPrefetch(fetchURI,nodei,fromVal);
		}
	}
}

function doPrefetch(fetchURI,nodei,fromVal)
{
	var prefetchXML=new XMLHttpRequest();
	prefetchXML.thei=nodei;
	prefetchXML.render=(nodei==fromVal)?1:null;
	prefetchXML.onreadystatechange = function() {
		if(prefetchXML.readyState==4) {
			try {
				if(prefetchXML.status==200) {
					if(ishtmlfetch) {
						content[prefetchXML.thei]=prefetchXML.responseText;
					} else {
						//content[prefetchXML.thei]=prefetchXML.responseXML;
						content[prefetchXML.thei].appendChild(prefetchXML.responseXML.documentElement);
					}

					state[prefetchXML.thei]=new String('');

					/*
					if(prefetchXML.render) {
						continueShow(prefetchXML.thei,prefetchXML.thei);
					}
					var divi=document.createElement('div');
					divi.innerHTML=prefetchXML.thei;
					getElemById(pageContentPane).appendChild(divi);
					*/
				} else {
					//alert("ERROR: Could not fetch information for "+id);
					state[prefetchXML.thei]=new String("ERROR: Could not fetch "+fetchURI);
				}
			} catch(e) {
				state[prefetchXML.thei]=new String("ERROR: Could not fetch "+fetchURI+" because your browser is perhaps in offline mode!!!");
			}
		}
	};

	// Go, go, power asynchronous
	state[nodei]=prefetch;
	prefetchXML.open("GET", fetchURI, true);
	prefetchXML.send(null);
}

function buildWidgetURI(ensID,namespace,html)
{
	var qsParm=new Array();
	qsParm[widgetParamId]=ensID;
	if(widgetParamNS && namespace) {
		qsParm[widgetParamNS]=namespace;
	}
	if(widgetParamHTML && html) {
		qsParm[widgetParamHTML]=html;
	}
	
	return generateQS(qsParm,widgetURI);
}

function buildFetchURI(id,namespace,html)
{
	var qsParm=new Array();
	qsParm[widgetFetchParamId]=id;
	if(widgetFetchParamNS && namespace) {
		qsParm[widgetFetchParamNS]=namespace;
	}
	if(widgetFetchParamHTML && html) {
		qsParm[widgetFetchParamHTML]='true';
	}
	
	return generateQS(qsParm,widgetFetchURI);
}

function processIncludeNodes(nodeList)
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
				dhtmlLoadCSS(includeURL);
			}
			if(includeType=='javascript') {
				dhtmlLoadScript(includeURL);
			}
		}
	}
}

// We parse the query-string ASAP
parseQS(qsParm);

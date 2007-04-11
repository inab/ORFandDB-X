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
qsParm['ensemblId'] = null;
qsParm['ensID'] = null;
qsParm['search'] = null;
qsParm['namespace'] = null;

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

function NSResolver(prefix)
{
	return NSprefix[prefix];
}

function getElemById(id)
{
	if(document.getElementById){    // test the most common method first.  Most browsers won't get past this test
		return document.getElementById(id);
	} else if(document.all){         // test older versions of IE
		return document.all[id];
	} else if(document.layers){      // test older versions of Netscape
		return document.layers[id];
	} else {                          // not sure what to do...return null
		return null;
	}
}

function xpathEvaluate(thexpath,thecontext,theObjResolver)
{
	if(BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') {
		var expcon=new ExprContext(thecontext);
		var tagname=thecontext.documentElement.tagName;
		// Getting main prefix (if any)
		var pretag=tagname.substring(0,tagname.indexOf(':',0));
		if(!pretag) {
			pretag='';
		} else {
			pretag+=':';
		}
		var prematch=new String(thexpath.match(/[^a-zA-Z0-9][a-zA-Z0-9]+:/));
		if(!prematch) {
			prematch='';
		} else {
			prematch=prematch.substr(1);
		}
		// Replacing prefixes
		var re=new RegExp("/"+prematch+"([^/])","g");
		var repxpath=thexpath.replace(re,"/"+pretag+"$1");
		var xp=xpathParse(repxpath);
		if(xp!=null) {
			var res=xp.evaluate(expcon);
			return (res!=null)?res.value:null;
		}
		
	} else  {
		var namespaceString="";
		for(var prefix in theObjResolver) {
			namespaceString+=' xmlns:'+prefix+'="'+theObjResolver[prefix]+'"';
		}
		Sarissa.setXpathNamespaces(thecontext,namespaceString.substring(1));

		return thecontext.selectNodes(thexpath);
	}
		/*
		var firstVal=thecontext.evaluate(thexpath,thecontext,function(prefix) {return theObjResolver[prefix];},0,null);
		var retval=new Array();
		var thisnode=firstVal.iterateNext();
		while(thisnode) {
			retval.push(thisnode);
			thisnode=firstVal.iterateNext();
		}
		return retval;
		*/
	/*
	} else {
		// my attempt to tackle with XPath-less browsers
		var xpath=xpathParse(thexpath);
		var result=xpath.evaluate(thecontext);
		alert(result);
	}
	*/
}

function showError(e,widURL) {
	xmlDoc=null;
	getElemById(pagerPane).innerHTML = DEFAULTLOGO;
	var errmesg;
	if(!e) {
		errmesg='';
	} else {
		errmesg="<br />JavaScript Error: "+e.name+"<br />JavaScript Message: "+e.message;
	}
	getElemById(pageContentPane).innerHTML = "<h2><i>There was an error while retrieving <a href='"+widURL+"'>"+widURL+"</a></i>"+errmesg+"</h2>";
}

function Init() {
	// load the xslt file, example1.xsl
	
	//netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	
	if(widgetURI && pagerPane && pageContentPane) {
		if(BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') {
			ishtmlfetch='true';
		}
		ensemblId=null;
		namespace=null;

		if(qsParm['ensemblId'] && qsParm['ensemblId'].length>0) {
			ensemblId=qsParm['ensemblId'];
		} else {
			if(qsParm['ensID'] && qsParm['ensID'].length>0) {
				ensemblId=qsParm['ensID'];
			} else {
				if(qsParm['search'] && qsParm['search'].length>0) {
					ensemblId=qsParm['search'];
				}
			}
		}

		if(qsParm['namespace'] && qsParm['namespace'].length>0) {
			namespace=qsParm['namespace'];
		} else {
			namespace='EnsEMBL';
		}

		if(ensemblId) {
			var widURL=buildWidgetURI(ensemblId,namespace);
			var myXMLHTTPRequest = new XMLHttpRequest();
			try {
				myXMLHTTPRequest.open("GET", widURL, true);
				myXMLHTTPRequest.onreadystatechange = function() {
					if(myXMLHTTPRequest.readyState==4) {
						if(myXMLHTTPRequest.status==200) {
							gotResults(myXMLHTTPRequest.responseXML,widURL);
						} else {
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
		if(pagerPane && pageContentPane) {
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
				while(child && child.nodeType!=1 && child.tagName.substr(child.tagName.indexOf(':',0)+1)!='content') {
					child=child.nextSibling;
					break;
				}
				// Did we find the child?
				content[nodei+1]=nodeResult[nodei];
				if(child) {
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
						if(myXMLHTTPRequest.status==200) {
							gotPagerXSLT(myXMLHTTPRequest.responseXML,pagerURL);
						} else {
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
	getElemById(pagerPane).innerHTML = '<div align="center">Found '+maxcontent+' result'+((maxcontent>1)?'s':'')+'<form name="pagerForm"><a href="javascript:showOne(1)">First</a> <select id="computedPager" name="pager" size="1" onChange="showOne(this.options[this.selectedIndex].value)"></select> <a href="javascript:showOne('+(content.length - 1)+')">Last</a></form></div>';
	var selectElem=getElemById('computedPager');
	for(var coni=1;coni<=maxcontent;coni++) {
		var title=content[coni].getAttribute('title');
		if(!title) {
			title=new String(coni);
		}
		
		var optelem=document.createElement('option');
		optelem.text=title.substr(0,30)+((title.length>30)?'...':'');
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
				if(myXMLHTTPRequest.status==200) {
					gotContentXSLT(myXMLHTTPRequest.responseXML,viewURL);
				} else {
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
			// Skipping null contents
			if(state[nodei]!=null && state[nodei] instanceof String) {
				if(state[nodei].length==0) {
					if(viewMode=='none') {
						getElemById(pageContentPane).innerHTML += content[nodei];
					} else {
						var xsltProc = new XSLTProcessor();
						xsltProc.importStylesheet(xslStylesheet);
						xsltProc.clearParameters();

						// This is the ONLY point which is stopping Opera to work in native mode!
						var fragment = xsltProc.transformToFragment(content[nodei], document);
						//xsltProc.reset();
						getElemById(pageContentPane).appendChild(fragment);
					}
				} else {
					getElemById(pageContentPane).innerHTML='Could not fetch/show this record?!?!?!?<br />Reason: '+state[nodei];
				}
			} else {
				//alert("Waiting for the fetch "+nodei+" state "+state[nodei]);
				continueLoops--;
				if(continueLoops<=0) {
					//alert("Ya estoy hasta los bytes de iterar!");
				} else {
					// Each half a second results are checked
					continuedTimeOut=setTimeout("continueShow("+nodei+","+toVal+")",500);
				}
				break;
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
			if(state[nodei]!=null) {
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
	var prefetchXML=state[nodei]=new XMLHttpRequest();
	prefetchXML.thei=nodei;
	prefetchXML.render=(nodei==fromVal)?1:null;
	prefetchXML.onreadystatechange = function() {
		if(prefetchXML.readyState==4) {
			if(prefetchXML.status==200) {
				if(ishtmlfetch) {
					content[prefetchXML.thei]=prefetchXML.responseText;
				} else {
					content[prefetchXML.thei]=prefetchXML.responseXML;
					//content[thei].appendChild(prefetchXML.responseXML.documentElement);
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
		}
	};

	// Go, go, power asynchronous
	prefetchXML.open("GET", fetchURI, true);
	prefetchXML.send(null);
}

function parseQS(qsParm)
{
	var query = document.location.search.substring(1);
	var parms = query.split('&');
	for (var i=0; i<parms.length; i++) {
		var pos = parms[i].indexOf('=');
		if (pos > 0) {
			var key = parms[i].substring(0,pos);
			key = unescape(key.replace(/\+/g,' '));
			var val = parms[i].substring(pos+1);
			val = unescape(val.replace(/\+/g,' '));
			qsParm[key] = val;
		}
	}
	
	return qsParm;
}

function generateQS(url,qsParm)
{
	var query='';
	for (var term in qsParm) {
		if(qsParm[term]) {
			query+='&'+escape(term)+'='+escape(qsParm[term]);
		}
	}
	return url+'?'+query.substring(1);
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
	
	return generateQS(widgetURI,qsParm);
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
	
	return generateQS(widgetFetchURI,qsParm);
}

function dhtmlLoadScript(url)
{
   var e = document.createElement("script");
   e.src = url;
   e.type="text/javascript";
   document.getElementsByTagName("head")[0].appendChild(e);
}

function dhtmlLoadCSS(url)
{
   var e = document.createElement("link");
   e.rel="stylesheet";
   e.href = url;
   document.getElementsByTagName("head")[0].appendChild(e);
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

var omimWidget='getOMIM.xq';

var xmlDoc;
var xslStylesheet;

var xslDefaultPagerURL = "xslt/simplePager.xsl";

var xsltProcessor;

var qsParm = new Object();
qsParm['ensemblId'] = null;
qsParm['ensID'] = null;

var NSprefix = new Object();
NSprefix['msg'] = 'http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.4';

var DEFAULTLOGO="<div align='center'><img src='images/vitruvio2.gif'/></div>";

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
	if(BrowserDetect.browser=='Opera') {
		var firstVal=thecontext.evaluate(thexpath,thecontext,function(prefix) {return theObjResolver[prefix];},XPathResult.FIRST_ORDERED_NODE_TYPE,null);
		return firstVal;
	} else if(_SARISSA_IS_MOZ || _SARISSA_IS_IE) {
		var namespaceString="";
		for(var prefix in theObjResolver) {
			namespaceString+=' xmlns:'+prefix+'="'+theObjResolver[prefix]+'"';
		}
		namespaceString=namespaceString.substring(1);
		thecontext.setProperty("SelectionLanguage", "XPath"); 
		thecontext.setProperty("SelectionNamespaces", namespaceString);

		return thecontext.selectNodes(thexpath);
	} else {
		// my attempt to tackle with XPath-less browsers
		var xpath=xpathParse(thexpath);
		var result=xpath.evaluate(thecontext);
		alert(result);
	}
}

function showError(e,widURL) {
	xmlDoc=null;
	getElemById("pager").innerHTML = DEFAULTLOGO;
	getElemById("pageContent").innerHTML = "<h2><i>There was an error while retrieving <a href='"+widURL+"'>"+widURL+"</a></i></h2>";
	alert(e.message);
}

function Init() {
	// load the xslt file, example1.xsl
	
	//netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	
	var ensemblId=null;
	
	if(qsParm['ensemblId'] && qsParm['ensemblId'].length>0) {
		ensemblId=qsParm['ensemblId'];
	} else {
		if(qsParm['ensID'] && qsParm['ensID'].length>0) {
			ensemblId=qsParm['enslID'];
		}
	}

	if(ensemblId) {
		var widURL=callWidgetURL(omimWidget,ensemblId);
		var myXMLHTTPRequest = new XMLHttpRequest();
		try {
			myXMLHTTPRequest.open("GET", widURL, true);
			myXMLHTTPRequest.onreadystatechange = function() {
				if(myXMLHTTPRequest.readyState==4) {
					if(myXMLHTTPRequest.status==200) {
						getPager(myXMLHTTPRequest.responseXML,widURL);
					} else {
						getPager(null,widURL);
					}
				}
			};
			
			// Go, go, power asynchronous
			myXMLHTTPRequest.send(null);
			
		} catch(e) {
			showError(e,widURL);
		}
	} else {
		getElemById("pager").innerHTML = DEFAULTLOGO;
		getElemById("pageContent").innerHTML = "<h2><i>No EnsEMBL ID has been specified using ensemblId parameter</i></h2>";
	}
}

function getPager(responseXML,widURL)
{
	try {
		if(responseXML==null)
			throw "Request "+widURL+" failed";
			
		xmlDoc = responseXML;

		// Do the pager task
		var xslPagerURL='';
		if(_SARISSA_IS_MOZ || _SARISSA_IS_IE) {
			// Get the pager
			var nodeList=xpathEvaluate("//msg:pagerView/@href",xmlDoc,NSprefix);
			xslPagerURL=(nodeList!=null && nodeList.length>0)?Sarissa.getText(nodeList[0],false):null;
		} else {
			// Get the pager
			xslPagerURL=xpathEvaluate("//msg:pagerView/@href",xmlDoc,NSprefix,xpathStringType,null);
		}
		
		if(xslPagerURL==null || xslPagerURL == undefined || xslPagerURL=='') {
			xslPagerURL=xslDefaultPagerURL;
		} else {
			// It is custom, so apply what it is needed by the pager
			var nodeList=xpathEvaluate("//msg:pagerView/msg:include",xmlDoc,NSprefix);

			processIncludeNodes(nodeList);
		}
	
		var myXMLHTTPRequest=new XMLHttpRequest();
		myXMLHTTPRequest.onreadystatechange = function() {
			if(myXMLHTTPRequest.readyState==4) {
				if(myXMLHTTPRequest.status==200) {
					showPager(myXMLHTTPRequest.responseXML,xslPagerURL);
				} else {
					showPager(null,xslPagerURL);
				}
			}
		};

		// Go, go, power asynchronous
		myXMLHTTPRequest.open("GET", xslPagerURL, true);
		myXMLHTTPRequest.send(null);
	} catch(e) {
		showError(e,widURL);
	}
}

function showPager(responseXML,xslPagerURL)
{
	try {
		if(responseXML==null)
			throw "Request "+xslPagerURL+" failed";
		
		// Do the pager task
		var xslPager = responseXML;

		if(_SARISSA_IS_MOZ || _SARISSA_IS_IE) {
			var xsltPagerProc = new XSLTProcessor();
			xsltPagerProc.importStylesheet(xslPager);

			var fragment = xsltPagerProc.transformToFragment(xmlDoc, document);

			getElemById("pager").innerHTML = "";

			getElemById("pager").appendChild(fragment);
		} else {
			var xml = xmlParse(xmlDoc.value);
			var xslt = xmlParse(xslPager.value);

			getElemById("pager").innerHTML = xsltProcess(xml,xslt);
		}
		
		// Get the XSL URL, if any
		var nodeList=xpathEvaluate("//msg:defaultView/@href",xmlDoc,NSprefix);
		var xslURL=(nodeList!=null && nodeList.length>0)?Sarissa.getText(nodeList[0],false):null;

		if(xslURL!=null) {
			// It is custom, so apply what it is needed by the pager
			var nodeList=xpathEvaluate("//msg:defaultView/msg:include",xmlDoc,NSprefix);

			processIncludeNodes(nodeList);
			
			// And now, get XSL itself
			var myXMLHTTPRequest=new XMLHttpRequest();
			myXMLHTTPRequest.onreadystatechange = function() {
				if(myXMLHTTPRequest.readyState==4) {
					if(myXMLHTTPRequest.status==200) {
						applyXSLT(myXMLHTTPRequest.responseXML,xslURL);
					} else {
						applyXSLT(null,xslURL);
					}
				}
			};
			
			// Go, go, power asynchronous
			myXMLHTTPRequest.open("GET", xslURL, true);
			myXMLHTTPRequest.send(null);
		} else {
			// And we don't have to forget this
			showOne(1);
		}
	} catch(e) {
		showError(e,xslPagerURL);
	}
}

function applyXSLT(responseXML,xslURL)
{
	try {
		if(responseXML==null)
			throw "Request "+xslURL+" failed";
			
		xslStylesheet = responseXML;

		if(_SARISSA_IS_MOZ || _SARISSA_IS_IE) {
			xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(xslStylesheet);
		}
		// And we don't have to forget this
		showOne(1);
	} catch(e) {
		showError(e,xslURL);
	}
}

function showOne(theVal) {
	show(theVal,theVal);
}

function show(fromVal,toVal)
{
	if(_SARISSA_IS_MOZ || _SARISSA_IS_IE) {
		xsltProcessor.setParameter(null, "fromVal", fromVal);
		xsltProcessor.setParameter(null, "toVal", toVal);

		var fragment = xsltProcessor.transformToFragment(xmlDoc, document);

		getElemById("pageContent").innerHTML = "";

		getElemById("pageContent").appendChild(fragment);
	} else {
		var xml = xmlParse(xmlDoc.value);
		var xslt = xmlParse(xslStylesheet.value);
		var xslparams=new Object();
		xslparams['fromVal']=fromVal;
		xslparams['toVal']=toVal;
		
		getElemById("pageContent").innerHTML = xsltProcessWithParam(xml,xslt, xslparams);
	}
}

function parseQS(qsParm)
{
	var query = document.location.search.substring(1);
	var parms = query.split('&');
	for (var i=0; i<parms.length; i++) {
		var pos = parms[i].indexOf('=');
		if (pos > 0) {
			var key = unescape(parms[i].substring(0,pos));
			var val = unescape(parms[i].substring(pos+1));
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

function callWidgetURL(url,ensID)
{
	var qsParm=new Array();
	qsParm['id']=ensID;
	//qsParm['namespace']='OMIM';
	
	return generateQS(url,qsParm);
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

function oldInit2(myXMLHTTPRequest,widURL)
{
	try {
		if(myXMLHTTPRequest==null)
			throw "Request "+widURL+" failed";
			
		xmlDoc = myXMLHTTPRequest.responseXML;

		// Do the pager task
		showPager(myXMLHTTPRequest,xmlDoc);

		// Get the XSL URL, if any
		var nodeList=xpathEvaluate("//msg:defaultView/@href",xmlDoc,NSprefix);
		var xslURL=(nodeList!=null && nodeList.length>0)?Sarissa.getText(nodeList[0],false):null;

		if(xslURL!=null) {
			// And now, get XSL itself
			myXMLHTTPRequest.open("GET", xslURL, true);
			myXMLHTTPRequest.onreadystatechange = function() {
				if(myXMLHTTPRequest.readyState==4) {
					if(myXMLHTTPRequest.status==200) {
						applyXSLT(myXMLHTTPRequest,xslURL);
					} else {
						applyXSLT(null,xslURL);
					}
				}
			};
			
			// Go, go, power asynchronous
			myXMLHTTPRequest.send(null);
		} else {
			// And we don't have to forget this
			showOne(1);
		}
	} catch(e) {
		showError(e,widURL);
	}
}

function oldShowPager(myXMLHTTPRequest,xmlDocu)
{
	if(_SARISSA_IS_MOZ || _SARISSA_IS_IE) {
		// Get the pager
		var nodeList=xpathEvaluate("//msg:pagerView/@href",xmlDocu,NSprefix);
		var xslPagerURL=(nodeList!=null && nodeList.length>0)?Sarissa.getText(nodeList[0],false):null;
		if(xslPagerURL==null || xslPagerURL == undefined || xslPagerURL=='') {
			xslPagerURL=xslDefaultPagerURL;
		}

		myXMLHTTPRequest.open("GET", xslPagerURL, false);
		myXMLHTTPRequest.send(null);
		var xslPager = myXMLHTTPRequest.responseXML;
		var xsltPagerProc = new XSLTProcessor();
		xsltPagerProc.importStylesheet(xslPager);
		
		var fragment = xsltPagerProc.transformToFragment(xmlDocu, document);

		getElemById("pager").innerHTML = "";

		getElemById("pager").appendChild(fragment);
	} else {
		// Get the pager
		var xslPagerURL=xpathEvaluate("//msg:pagerView/@href",xmlDocu,NSprefix,xpathStringType,null);
		if(xslPagerURL==null || xslPagerURL == undefined || xslPagerURL=='') {
			xslPagerURL=xslDefaultPagerURL;
		}

		myXMLHTTPRequest.open("GET", xslPagerURL, false);
		myXMLHTTPRequest.send(null);
		var xslPager = myXMLHTTPRequest.responseXML;
		
		var xml = xmlParse(xmlDoc.value);
		var xslt = xmlParse(xslPager.value);
		
		getElemById("pager").innerHTML = xsltProcess(xml,xslt);
	}
}

// We parse the query-string ASAP
parseQS(qsParm);

/* Made by José María Fernández, CNIO 2007*/
/* For ORFandDB/X */
var WidgetCommon = {};

/* Zero, JavaScript dependencies */
WidgetCommon.JSDEPS=new Array(
	"browserdetect/BrowserDetect.js",
	"sarissa/sarissa.js",
	"sarissa/sarissa_ieemu_xpath.js",
	"ajaxslt/xmltoken.js",
	"ajaxslt/util.js",
	"ajaxslt/dom.js",
	"ajaxslt/xpath.js"
);

/* First, essential functions!!!! */
WidgetCommon.dhtmlLoadScript = function (url,/* optional */ basehref,thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var e = thedoc.createElement("script");
	if(!basehref) {
		basehref='';
	}
	e.src = basehref+url;
	e.type="text/javascript";
	thedoc.getElementsByTagName("head")[0].appendChild(e);
};

WidgetCommon.dhtmlLoadCSS = function (url,/* optional */ basehref,thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var e = thedoc.createElement("link");
	e.rel="stylesheet";
	if(!basehref) {
		basehref='';
	}
	e.href = basehref+url;;
	thedoc.getElementsByTagName("head")[0].appendChild(e);
};

WidgetCommon.widgetCommonInit = function ()
{
	var basehref=null;
	
	var scripts=document.getElementsByTagName("script");
	var isc;
	for(isc=0;isc < scripts.length ; isc++) {
		var src = scripts[isc].getAttribute("src");
		// Anonymous javascript blocks
		if(!src) {
			continue;
		}
		var last=src.lastIndexOf('widgetCommon.js');
		if(last!=-1 && src.match(/\/widgetCommon\.js$/)) {
			basehref=src.substring(0, last);
			break;
		}
	}
	
	if(!basehref) {
		basehref=location.href;
	}
	var lastslash=basehref.lastIndexOf('/');
	if((lastslash+1)!=basehref.length) {
		basehref=basehref.substring(0,lastslash+1);
	}
	for(var elem in WidgetCommon.JSDEPS) {
		WidgetCommon.dhtmlLoadScript(WidgetCommon.JSDEPS[elem],basehref);
	}
};

/* Second, dynamically loading the libraries (bootstraping) */
WidgetCommon.widgetCommonInit();

/* And third, the additional functions!!!! */
WidgetCommon.dhtmlLoadCSSContent = function (csscontent,/* optional */ thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var e = thedoc.createElement("style");
	e.type="text/css";
	e.innerHTML = csscontent;
	thedoc.getElementsByTagName("head")[0].appendChild(e);
};

WidgetCommon.dhtmlLoadScriptContent = function (javascriptcontent,/* optional */ thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var e = thedoc.createElement("script");
	e.type="text/javascript";
	thedoc.innerHTML = javascriptcontent;
	thedoc.getElementsByTagName("head")[0].appendChild(e);
};

// Sort of optimization
if(document.getElementById){    // test the most common method first.  Most browsers won't get past this test
	WidgetCommon.getElementById = function (id) { return document.getElementById(id); };
} else if(document.all){         // test older versions of IE
	WidgetCommon.getElementById = function (id) { return document.all[id]; };
} else if(document.layers){      // test older versions of Netscape
	WidgetCommon.getElementById = function (id) { return document.layers[id]; };
} else {                          // not sure what to do...return null
	WidgetCommon.getElementById = function (id) { return null; };
}

WidgetCommon.getForm = ('forms' in document)?
	function (formName) {
		return document.forms[formName];
	}:
	function (formName) {
		return document[formName];
	};

/* This is a sort of lazy evaluation */
WidgetCommon.xpathEvaluate = function (thexpath,thecontext,theObjResolver) {
	WidgetCommon.xpathEvaluate = (BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') ?
		function (thexpath,thecontext,theObjResolver) {
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
		}:
		function (thexpath,thecontext,theObjResolver) {
			var namespaceString="";
			for(var prefix in theObjResolver) {
				namespaceString+=' xmlns:'+prefix+'="'+theObjResolver[prefix]+'"';
			}
			Sarissa.setXpathNamespaces(thecontext,namespaceString.substring(1));

			return thecontext.selectNodes(thexpath);
		};
	return WidgetCommon.xpathEvaluate(thexpath,thecontext,theObjResolver);
};

/* Second parameter is optional */
WidgetCommon.parseQS = function (qsParm,/* optional */ url)
{
	var query = (url)?url:document.location.search.substring(1);
	var parms = query.split('&');
	for (var i=0; i<parms.length; i++) {
		var pos = parms[i].indexOf('=');
		if (pos > 0) {
			var key = parms[i].substring(0,pos);
			key = unescape(key.replace(/\+/g,' '));
			var val = parms[i].substring(pos+1);
			val = unescape(val.replace(/\+/g,' '));
			// We are now dealing with arrays, but
			// it is easier not dealing with them outside here
			if(!(key in qsParm) || !qsParm[key] || !(qsParm[key] instanceof Array)) {
				qsParm[key]=(key in qsParm)?new Array((qsParm[key])?qsParm[key]:''):new Array();
			}
			qsParm[key].push(val);
		}
	}
	
	return qsParm;
};

WidgetCommon.generateQS = function (qsParm,baseurl)
{
	var query='';
	for (var term in qsParm) {
		if(qsParm[term]) {
			var iterarray=(qsParm[term] instanceof Array)?qsParm[term]:new Array(qsParm[term]);
			
			for(var key in iterarray) {
				query+='&'+escape(term)+'='+escape(iterarray[key]);
			}
		}
	}
	return baseurl+'?'+query.substring(1);
};


WidgetCommon.DebugError = function (e) {
	return 	"JavaScript error name: "+e.name+
		"\nMessage: "+e.message+
		"\nFileName: "+e.fileName+", line "+e.lineNumber+
		"\nStackTrace: "+e.stack;
};

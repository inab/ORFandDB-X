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

function getForm(formName)
{
	return ('forms' in document)?document.forms[formName]:document[formName];
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

/* Second parameter is optional */
function parseQS(qsParm,url)
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
}

function generateQS(qsParm,baseurl)
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

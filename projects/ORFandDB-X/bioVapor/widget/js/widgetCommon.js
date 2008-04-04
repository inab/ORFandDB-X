/* Made by Jos� Mar�a Fern�ndez, CNIO 2007*/
/* For ORFandDB/X */
var WidgetCommon = {};

/* Zero, JavaScript dependencies */
WidgetCommon.JSDEPS=new Array(
	"sarissa/sarissa.js",
	"sarissa/sarissa_ieemu_xpath.js",
	"ajaxslt/xmltoken.js",
	"ajaxslt/util.js",
	"ajaxslt/dom.js",
	"ajaxslt/xpath.js"
);

WidgetCommon._timer=undefined;
WidgetCommon._loaded=undefined;
WidgetCommon.onload=undefined;

/* First, essential functions!!!! */
WidgetCommon.dhtmlLoadScript = function (url,/* optional */ basehref,thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var head=thedoc.getElementsByTagName("head")[0];
	
	// Browser detection
	if(!basehref) {
		basehref='';
	}
	/*
	if(navigator.vendor.indexOf('KDE')!=-1 || navigator.vendor.indexOf('Apple')!=-1) {
		thedoc.write("<script src='"+basehref+url+"' type='text/javascript'></script>\n");
	} else {
	*/
		var e = thedoc.createElement("script");
		e.type="text/javascript";
		if(navigator.vendor) {
			if(navigator.vendor.indexOf('KDE')!=-1 || navigator.vendor.indexOf('Apple')!=-1) {
				e.defer='defer';
			}
		}
		/*
		if(!('readyState' in e)) {
			e.defer='defer';
			e.readyState=null;
			e.onload= function () {
				e.readyState='loaded';
			};
		}
		*/
		e.src = basehref+url;
		head.appendChild(e);
		return e;
	/*
	}
	*/
};

WidgetCommon.doOnload = function() {
	WidgetCommon._loaded=1;

	if(typeof WidgetCommon.onload == 'function') {
		try {
			WidgetCommon.onload();
		} catch(we) {
			// IgnoreIt!!!(R)
		}
	} else if(WidgetCommon.onload instanceof Array) {
		for(var loind in WidgetCommon.onload) {
			if(typeof WidgetCommon.onload[loind] == 'function') {
				try {
					WidgetCommon.onload[loind]();
				} catch(we) {
					// IgnoreIt!!!(R)
				}
			}
		}
	}
};

WidgetCommon.dhtmlDelayedLoadScript = function (urls,/* optional */ basehref,thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var head=thedoc.getElementsByTagName("head")[0];
	// Browser detection
	if(!basehref) {
		basehref='';
	}
	
	var useIntervals=null;
	if(navigator.vendor) {
		if(navigator.vendor.indexOf('KDE')!=-1) {
			useIntervals=1;
		}
	/*
	} else if(navigator.userAgent) {
		if(navigator.userAgent.indexOf('MSIE')!=-1) {
			useIntervals=1;
		}
	*/
	}
	
	WidgetCommon._loaded=undefined;
	if(useIntervals) {
		var baseindex=0;
		var thecontext=thedoc;
		WidgetCommon._timer = setInterval(function() {
			//alert(baseindex+" "+urls.length+" "+thecontext.readyState+' '+thedoc.readyState+' '+thecontext.event);
			if (/loaded|complete/.test(thedoc.readyState)) {
			//if (/loaded|complete/.test(thecontext.readyState)) {
			//if (/complete/.test(thecontext.readyState)) {
				if(baseindex<urls.length) {
					thecontext=WidgetCommon.dhtmlLoadScript(urls[baseindex],basehref,thedoc); // call the onload handler
					/*
					for(var ia in thecontext) {
						alert(ia);
					}
					*/
					baseindex++;
				} else {
					clearInterval(WidgetCommon._timer);
					WidgetCommon._timer=undefined;
					WidgetCommon.doOnload();
				}
			}
		}, 100);
	} else {
		WidgetCommon.dhtmlBulkLoadScript(urls,basehref,thedoc,WidgetCommon.doOnload);
	}
};

WidgetCommon.dhtmlBulkLoadScript = function (urls,/* optional */ basehref,thedoc,thelastscript,urlsi)
{
	if(!thedoc) {
		thedoc=document;
	}
	var head=thedoc.getElementsByTagName("head")[0];
	
	if(urlsi==undefined)  urlsi=0;
	// Browser detection
	if(!basehref) {
		basehref='';
	}
	if(urlsi<urls.length) {
		var e = thedoc.createElement("script");
		e.type="text/javascript";
		var helper;
		
		if(urlsi+1!=urls.length) {
			helper=function() {
				WidgetCommon.dhtmlBulkLoadScript(urls,basehref,thedoc,thelastscript,urlsi+1);
			};
		} else if(typeof thelastscript == 'function') {
			helper=thelastscript;
		}
		if(helper) {
			e.onreadystatechange = function() {
				if(this.readyState == 'loaded' || this.readyState == 'complete') {
					e.onreadystatechange = function() {};
					helper();
				}
			};
			e.onload = function () {
				e.onload = function() {};
				helper();
			};
		}
		
		e.src = basehref+urls[urlsi];
		head.appendChild(e);
	} else if(typeof thelastscript == 'function') {
		try {
			thelastscript();
		} catch(we) {
			// IgnoreIT!!!(R)
		}
	}
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
	e.href = basehref+url;
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
	WidgetCommon.dhtmlDelayedLoadScript(WidgetCommon.JSDEPS,basehref);
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

/**************************/
/* Generic getElementById */
/**************************/
// Sort of optimization
if(document.getElementById){    // test the most common method first.  Most browsers won't get past this test
	WidgetCommon.getElementById = function (id,/* optional */ thedoc) { if(!thedoc)  thedoc=document; return thedoc.getElementById(id); };
} else if(document.all){         // test older versions of IE
	WidgetCommon.getElementById = function (id,/* optional */ thedoc) { if(!thedoc)  thedoc=document; return thedoc.all[id]; };
} else if(document.layers){      // test older versions of Netscape
	WidgetCommon.getElementById = function (id,/* optional */ thedoc) { if(!thedoc)  thedoc=document; return thedoc.layers[id]; };
} else {                          // not sure what to do...return null
	WidgetCommon.getElementById = function (id,/* optional */ thedoc) { return null; };
}

WidgetCommon.getForm = ('forms' in document)?
	function (formName,/* optional */ thedoc) {
		if(!thedoc)  thedoc=document;
		return thedoc.forms[formName];
	}:
	function (formName,/* optional */ thedoc) {
		if(!thedoc)  thedoc=document;
		return thedoc[formName];
	};

/***********************/
/* Event handling code */
/***********************/
WidgetCommon.addEventListener = function (object, eventType, listener, useCapture) {
	if(window.addEventListener) {
		// W3C DOM compatible browsers
		WidgetCommon.addEventListener = function (object, eventType, listener, useCapture) {
			try {
				if(object.addEventListener) {
					if(!useCapture)  useCapture=false;
					object.addEventListener(eventType,listener,useCapture);
				} else {
					object["on"+eventType]=listener;
				}
			} catch(e) {
				// IgnoreIt!(R)
			}
		};
	} else if(window.attachEvent) {
		// Internet Explorer
		WidgetCommon.addEventListener = function (object, eventType, listener, useCapture) {
			try {
				if(object.attachEvent) {
					object.attachEvent("on"+eventType,listener);
				} else {
					object["on"+eventType]=listener;
				}
			} catch(e) {
					// IgnoreIt!(R)
			}
		};
	} else {
		// Other????
		WidgetCommon.addEventListener = function (object, eventType, listener, useCapture) {
			try {
				object["on"+eventType]=listener;
			} catch(e) {
				// IgnoreIt!(R)
			}
		};
	}
	WidgetCommon.addEventListener(object, eventType, listener, useCapture);
};

WidgetCommon.addEventListenerToId = function (objectId, eventType, listener, useCapture, /* optional */ thedoc) {
	WidgetCommon.addEventListener(WidgetCommon.getElementById(objectId,thedoc), eventType, listener, useCapture);
};

WidgetCommon.removeEventListener = function (object, eventType, listener, useCapture) {
	if(window.removeEventListener) {
		// W3C DOM compatible browsers
		WidgetCommon.removeEventListener = function (object, eventType, listener, useCapture) {
			if(!useCapture)  useCapture=false;
			try {
				if(object.removeEventListener) {
					object.removeEventListener(eventType,listener,useCapture);
				} else if(object["on"+eventType] && object["on"+eventType]==listener) {
					object["on"+eventType]=undefined;
				}
			} catch(e) {
				// IgnoreIt!(R)
			}
		};
	} else if(window.detachEvent) {
		// Internet Explorer
		WidgetCommon.removeEventListener = function (object, eventType, listener, useCapture) {
			try {
				if(object.detachEvent) {
					object.detachEvent("on"+eventType,listener);
				} else if(object["on"+eventType] && object["on"+eventType]==listener) {
					object["on"+eventType]=undefined;
				}
			} catch(e) {
				// IgnoreIt!(R)
			}
		};
	} else {
		// Other????
		WidgetCommon.removeEventListener = function (object, eventType, listener, useCapture) {
			try {
				if(object["on"+eventType] && object["on"+eventType]==listener) {
					object["on"+eventType]=undefined;
				}
			} catch(e) {
				// IgnoreIt!(R)
			}
		};
	}
	WidgetCommon.removeEventListener(object, eventType, listener, useCapture);
};

WidgetCommon.removeEventListenerFromId = function (objectId, eventType, listener, useCapture, /* optional */ thedoc) {
	WidgetCommon.removeEventListener(WidgetCommon.getElementById(objectId,thedoc), eventType, listener, useCapture);
};

/*******************/
/* IFrame handling */
/*******************/
WidgetCommon.getIFrameDocument = function (iframe) {
	var rv = undefined;
	
	if(iframe) {
		if ('contentDocument' in iframe) {
			rv = iframe.contentDocument; 
			// rv = thedoc.frames[aID].contentDocument;
		} else {
			// IE 
			rv = iframe.contentWindow.document;
		}
	}
	
	return rv; 
};

WidgetCommon.getIFrameDocumentFromId = function (aID,/* optional */ thedoc) {
	return WidgetCommon.getIFrameDocument(WidgetCommon.getElementById(aID,thedoc));
};

// for sizing and positioning the iframe in the window
// .5 for height="50%"
WidgetCommon.setIFrameHeight = function (theIframe, h, headerHeight, /* optional */ viewport) {
	if(!viewport)  viewport=new WidgetCommon.Viewport();
	if (theIframe) {
		viewport.getWinHeight();
		//  both theIframe.height and theIframe.style.height seem to work
		//theIframe.style.height = Math.round( h * viewport.height ) + "px";
		theIframe.style.height = Math.round( (viewport.height - theIframe.offsetTop - headerHeight) * h)  + "px";
		//theIframe.style.marginTop = Math.round( (viewport.height - parseInt(theIframe.style.height) )/2 ) + "px";
	}
};

WidgetCommon.setIFrameHeightFromId = function (ifraname, h, headerHeight, /* optional */ viewport, thedoc) {
	WidgetCommon.setIFrameHeight(WidgetCommon.getElementById(ifraname,thedoc), h, headerHeight, viewport);
};

WidgetCommon.setIFrameAutoResize = function (iframe,/* optional */ percent,headerHeight,canreplace) {
	if(!percent)  percent=1;
	if(!headerHeight)  headerHeight=0;
	
	//WidgetCommon.setIFrameHeight(iframe,percent,headerHeight);
	var viewport=new WidgetCommon.Viewport();
	var daemonfunc = function() { WidgetCommon.setIFrameHeight(iframe,percent,headerHeight,viewport); };
	daemonfunc();
	WidgetCommon.addEventListener(window,'resize',daemonfunc,false);
};

WidgetCommon.setIFrameAutoResizeFromId = function (ifraname,/* optional */ percent, headerHeight, canreplace, thedoc) {
	WidgetCommon,setIFrameAutoResizeFromId(WidgetCommon.getElementFromId(ifraname,thedoc),percent, headerHeight, canreplace);
};

/*****************/
/* Generic XPath */
/*****************/
/* This is a sort of lazy evaluation */
WidgetCommon.xpathEvaluate = function (thexpath,thecontext,theObjResolver) {
	WidgetCommon.xpathEvaluate = (BrowserDetect.browser=='Konqueror') ?
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
			return null;
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

/******************************************/
/* Client-side URI parsing and generation */
/******************************************/
WidgetCommon.parseQS = function (qsParm,/* optional */ url,thedoc)
{
	if(!thedoc)  thedoc=document;
	var query = (url)?url:thedoc.location.search.substring(1);
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
	var querySymbol='?';
	for (var term in qsParm) {
		if(qsParm[term]) {
			var iterarray=(qsParm[term] instanceof Array)?qsParm[term]:new Array(qsParm[term]);
			
			for(var key in iterarray) {
				query+=querySymbol+escape(term)+'='+escape(iterarray[key]);
				querySymbol='&';
			}
		}
	}
	return baseurl+query;
};

/**********************************/
/* Javascript exception debugging */
/**********************************/
WidgetCommon.DebugError = function (e) {
	if(!e)  return 'Null or undefined error';
	if(typeof e == 'string' || typeof e == 'number') {
		return 'Exception message: '+e;
	} else {
		var dbgmsg='';
		for(var facet in e) {
			dbgmsg+=facet+"\n";
		}
		
		if(BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') {
			var name;
			var message;
			var line;
			try {
				name=e.name;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				message=e.message;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				line=e.line;
			} catch(ee) {
				// IgnoreIt!
			}
			if(!name)  name='';
			if(!message)  message='';
			if(!line)  line='';
			return 	"JavaScript error name: "+name+
				"\nMessage: "+message+
				"\nLine "+line;
		} else if(BrowserDetect.browser=='Explorer') {
			var name;
			var message;
			var number;
			var description;
			try {
				name=e.name;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				message=e.message;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				number=e.number;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				description=e.description;
			} catch(ee) {
				// IgnoreIt!
			}
			if(!name)  name='';
			if(!message)  message='';
			if(!number)  number='';
			if(!description)  description='';
			return 	"JavaScript error name: "+name+
				"\nMessage: "+message+
				"\nNumber: "+number+
				"\nDescription: "+description;
		} else {
			var name;
			var message;
			var fileName;
			var lineNumber;
			var stack;
			try {
				name=e.name
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				message=e.message;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				fileName=e.fileName;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				lineNumber=e.lineNumber;
			} catch(ee) {
				// IgnoreIt!
			}
			try {
				stack=e.stack;
			} catch(ee) {
				// IgnoreIt!
			}
			if(!name)  name='';
			if(!message)  message='';
			if(!fileName)  fileName='';
			if(!lineNumber)  lineNumber='';
			if(!stack)  stack='';
			return 	"JavaScript error name: "+name+
				"\nMessage: "+message+
				"\nFileName: "+fileName+", line "+lineNumber+
				"\nStackTrace: "+stack;
		}
	}
};

/****************************************************************/
/* WidgetCommon.Viewport is a revised version of dw_viewport.js */
/*************************************************************************

  dw_viewport.js
  version date Nov 2003
  
  This code is from Dynamic Web Coding 
  at http://www.dyn-web.com/
  Copyright 2003 by Sharon Paine 
  See Terms of Use at http://www.dyn-web.com/bus/terms.html
  Permission granted to use this code 
  as long as this entire notice is included.

*************************************************************************/  
  
WidgetCommon.Viewport = function (/* optional */ thedoc,thewin) {
	this.thedoc=(!thedoc)?document:thedoc;
	this.thewin=(!thewin)?window:thewin;
}

WidgetCommon.Viewport.prototype = {
	getWinWidth: function () {
		this.width = 0;
		if (this.thewin.innerWidth) this.width = this.thewin.innerWidth - 18;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.clientWidth) 
  			this.width = this.thedoc.documentElement.clientWidth;
		else if (this.thedoc.body && this.thedoc.body.clientWidth) 
  			this.width = this.thedoc.body.clientWidth;
	},

	getWinHeight: function () {
		this.height = 0;
		if (this.thewin.innerHeight) this.height = this.thewin.innerHeight - 18;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.clientHeight) 
  			this.height = this.thedoc.documentElement.clientHeight;
		else if (this.thedoc.body && this.thedoc.body.clientHeight) 
  			this.height = this.thedoc.body.clientHeight;
	},

	getScrollX: function () {
		this.scrollX = 0;
		if (typeof this.thewin.pageXOffset == "number") this.scrollX = this.thewin.pageXOffset;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.scrollLeft)
  			this.scrollX = this.thedoc.documentElement.scrollLeft;
		else if (this.thedoc.body && this.thedoc.body.scrollLeft) 
  			this.scrollX = this.thedoc.body.scrollLeft; 
		else if (this.thewin.scrollX) this.scrollX = this.thewin.scrollX;
	},

	getScrollY: function () {
		this.scrollY = 0;    
		if (typeof this.thewin.pageYOffset == "number") this.scrollY = this.thewin.pageYOffset;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.scrollTop)
  			this.scrollY = this.thedoc.documentElement.scrollTop;
		else if (this.thedoc.body && this.thedoc.body.scrollTop) 
  			this.scrollY = this.thedoc.body.scrollTop; 
		else if (this.thewin.scrollY) this.scrollY = this.thewin.scrollY;
	},

	getAll: function () {
		this.getWinWidth();
		this.getWinHeight();
		this.getScrollX();
		this.getScrollY();
	}

};


/*******************************************************/
/* Random numbers and string generators static methods */
/*******************************************************/

/*
	getRandomInt was taken from Mozilla Developer Center.
	It returns a random integer between min and max.
	Using Math.round() will give you a non-uniform distribution!
*/
WidgetCommon.getRandomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**************************/
/* Now, an UUID generator */
/**************************/
WidgetCommon.getRandomUUID = function () {
	var rarr=new Array();
	for(var i=0;i<8;i++) {
		rarr.push(WidgetCommon.getRandomInt(0,65535).toString(16));
	}
	
	return rarr[0]+rarr[1]+'-'+rarr[2]+'-'+rarr[3]+'-'+rarr[4]+'-'+rarr[5]+rarr[6]+rarr[7];
};

/****************************/
/* XML textContent handling */
/****************************/
WidgetCommon.getTextContent = function (oNode) {
	var retval;
	if(oNode) {
		try {
			if(BrowserDetect.browser=='Explorer') {
				retval=oNode.text;
			} else if(oNode.textContent!=undefined){
				retval=oNode.textContent;
			} else {
				retval=WidgetCommon.nodeGetText(oNode,true);
			}
		} catch(e) {
			retval=WidgetCommon.nodeGetText(oNode,true);
		}
	}
	
	return retval;
};

WidgetCommon.nodeGetText = function (oNode,deep) {
	var s = "";
	for(var node=oNode.firstChild; node; node=node.nextSibling){
		var nodeType = node.nodeType;
		if(nodeType == 3 || nodeType == 4){
			s += node.data;
		} else if(deep == true
			&& (nodeType == 1
			|| nodeType == 9
			|| nodeType == 11)){
			s += WidgetCommon.nodeGetText(node, true);
		}
	}
	return s;
};

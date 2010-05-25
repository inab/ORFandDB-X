/* Made by José María Fernández, CNIO 2007*/
/* For ORFandDB/X */

/**
 * @constructor
 */
WidgetCommon = function() {
};

/**
 *  WidgetCommon JavaScript dependencies
 */
WidgetCommon.JSDEPS=new Array(
	"svgweb/svg.js",
	"sarissa/sarissa.js",
	"sarissa/sarissa_ieemu_xpath.js",
	"ajaxslt/xmltoken.js",
	"ajaxslt/util.js",
	"ajaxslt/dom.js",
	"ajaxslt/xpath.js"
);

//WidgetCommon.DEBUG=true;
/**
 * This variable controls whether the WidgetCommon library generates debug output
 */
WidgetCommon.DEBUG=undefined;
WidgetCommon._timer=undefined;
WidgetCommon._loaded=undefined;
WidgetCommon.onload=undefined;
WidgetCommon.DEBUGDIV=undefined;
WidgetCommon.DEBUGDOC=undefined;
WidgetCommon.counter=0;

/* First, essential functions!!!! */

/**
 * This function allows loading a javascript library in a dynamic way
 * @param {String} url
 * @param {String} basehref
 * @param {HTMLDocument,document,Document} thedoc
 * @param {Function} onLoadScript
 */
WidgetCommon.dhtmlLoadScript = function (url,/* optional */ basehref,thedoc,onLoadScript)
{
	if(!thedoc) {
		thedoc=document;
	}
	var head=thedoc.getElementsByTagName("head")[0];
	
	// Browser detection
	if(!basehref) {
		basehref='';
	}
	var e = thedoc.createElement("script");
	if(typeof onLoadScript=='function')
		e.addEventListener('load',onLoadScript,false);

	e.type="text/javascript";
	
	var doBadTrick=undefined;
	var e2=undefined;
	if(navigator.vendor) {
		if(navigator.vendor.indexOf('KDE')!=-1 || navigator.vendor.indexOf('Apple')!=-1) {
			e.defer='defer';
			doBadTrick=1;
		}
	}

	// Very bad trick for Konqueror!
	if(doBadTrick) {
		e.id='___'+WidgetCommon.counter;
		e.readyState='loading';

		e2 = thedoc.createElement("script");
		e2.type="text/javascript";
		e2.innerHTML='document.getElementById("___'+WidgetCommon.counter+'").readyState="loaded";'+
		'var ___event=document.createEvent("HTMLEvents");'+
		'___event.initEvent("load",false,true);'+
		'document.getElementById("___'+WidgetCommon.counter+'").dispatchEvent(___event);';
		WidgetCommon.counter++;
	}
	e.src = basehref+url;
	head.appendChild(e);
	if(e2)
		head.appendChild(e2);
	return e;
};

/**
 * This is the event listener used by WidgetCommon when Javascript libraries
 * are being dynamically loaded.
 */
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

/**
 * The debug function used by internal WidgetCommon code. It takes as input
 * either an input exception object or an string
 * @param {Error} msg
 */
WidgetCommon.DebugMSG = function(msg) {
	if(WidgetCommon.DEBUG) {
		if(WidgetCommon.DEBUGDIV==undefined || WidgetCommon.DEBUGDOC==undefined) {
			var DEBUGWIN=window.open('','','width=400,height=400,scrollbars=1');
			WidgetCommon.DEBUGDOC=DEBUGWIN.document;
			WidgetCommon.DEBUGDOC.write('<html><head><title>WidgetCommon debugging</title></head><body><div id="DEBUGID"></div></body></html>');
			WidgetCommon.DEBUGDOC.close();
			WidgetCommon.DEBUGDIV = WidgetCommon.DEBUGDOC.getElementById("DEBUGID");
		}
		
		var p=WidgetCommon.DEBUGDOC.createElement('span');
		var bo=WidgetCommon.DEBUGDOC.createElement('span');
		bo.style.fontWeight='bold';
		bo.appendChild(WidgetCommon.DEBUGDOC.createTextNode((new Date()).getTime()));
		p.appendChild(bo);
		p.appendChild(WidgetCommon.DEBUGDOC.createTextNode(': '+msg));
		WidgetCommon.DEBUGDIV.insertBefore(WidgetCommon.DEBUGDOC.createElement('br'),WidgetCommon.DEBUGDIV.firstChild);
		WidgetCommon.DEBUGDIV.insertBefore(p,WidgetCommon.DEBUGDIV.firstChild);
		//WidgetCommon.DEBUGDIV.appendChild(p);
	}
};

/**
 * This function allows loading a ordered list of javascript library in a dynamic way.
 * At the end, a function is called.
 * @param {Array} urls
 * @param {String} basehref
 * @param {HTMLDocument,document,Document} thedoc
 * @param {Function} theLastScript
 */
WidgetCommon.dhtmlDelayedLoadScript = function (urls,/* optional */ basehref,thedoc,theLastScript)
{
	if(!thedoc) {
		thedoc=document;
	}
	if(urls.length==0) {
		if(typeof theLastScript=='function') {
			// WidgetCommon.DebugMSG('0 elements last script starts');
			try {
				theLastScript();
			} catch(we) {
				// WidgetCommon.DebugMSG('0 elements last script error: '+we);
				// IgnoreIT!!!(R)
			}
			// WidgetCommon.DebugMSG('0 elements last script ends');
		}
		return;
	}
	if(basehref==undefined) {
		basehref='';
	}
	
	// Browser detection
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
	
	//WidgetCommon._loaded=undefined;
	if(useIntervals) {
		var head=thedoc.getElementsByTagName("head")[0];
		var baseindex=0;
		var thecontext=thedoc;
		var timeoutFunc = function() {
			//alert(baseindex+" "+urls.length+" "+thecontext.readyState+' '+thedoc.readyState+' '+thecontext.event);
			clearTimeout(WidgetCommon._timer);
			//if (/loaded|complete/.test(thedoc.readyState)) {
			if (/loaded|complete/.test(thecontext.readyState)) {
			// if (/complete/.test(thecontext.readyState)) {
				if(baseindex<urls.length) {
					// WidgetCommon.DebugMSG('Delayed script '+urls[baseindex]+' starts');
					thecontext=WidgetCommon.dhtmlLoadScript(urls[baseindex],basehref,thedoc); // call the onload handler
					baseindex++;
					WidgetCommon._timer = setTimeout(timeoutFunc,100);
				} else {
					clearInterval(WidgetCommon._timer);
					WidgetCommon._timer=undefined;
					if(typeof theLastScript == 'function') {
						// WidgetCommon.DebugMSG('Delayed last script starts');
						try {
							theLastScript();
						} catch(e) {
							// WidgetCommon.DebugMSG('Delayed last script error: '+e);
							// IgnoreIT!!!(R)
						}
						// WidgetCommon.DebugMSG('Delayed last script ends');
					}
				}
			} else {
				WidgetCommon._timer = setTimeout(timeoutFunc,100);
			}
		};
		WidgetCommon._timer = setTimeout(timeoutFunc,100);
		/*
		var onLoadFunc = function() {
			if(baseindex<urls.length) {
				WidgetCommon.DebugMSG('Delayed script '+urls[baseindex]+' starts');
				var basebase=baseindex;
				baseindex++;
				thecontext=WidgetCommon.dhtmlLoadScript(urls[basebase],basehref,thedoc,onLoadFunc); // call the onload handler
			} else {
				if(typeof theLastScript == 'function') {
					// WidgetCommon.DebugMSG('Delayed last script starts');
					try {
						theLastScript();
					} catch(e) {
						// WidgetCommon.DebugMSG('Delayed last script error: '+e);
						// IgnoreIT!!!(R)
					}
					// WidgetCommon.DebugMSG('Delayed last script ends');
				}
			}
		};
		onLoadFunc();
		*/
	} else {
		WidgetCommon.dhtmlBulkLoadScript(urls,basehref,thedoc,theLastScript);
	}
};

/**
 * This function allows loading a ordered list of javascript library in a dynamic way.
 * At the end, a function is called.
 * @param {Array} urls
 * @param {String} basehref
 * @param {HTMLDocument,document,Document} thedoc
 * @param {Function} theLastScript
 * @param {Integer} urlsi
 */
WidgetCommon.dhtmlBulkLoadScript = function (urls,/* optional */ basehref,thedoc,theLastScript,urlsi)
{
	if(!thedoc) {
		thedoc=document;
	}
	var head=thedoc.getElementsByTagName("head")[0];
	
	if(urlsi==undefined)  urlsi=0;
	
	if(basehref==undefined) {
		basehref='';
	}
	
	if(urlsi<urls.length) {
		var e = thedoc.createElement("script");
		e.type="text/javascript";
		var helper;
		
		var scriptURL=urls[urlsi];
		var nexturlsi=urlsi+1;
		// No undefined script, please!!!!!
		if(scriptURL==undefined) {
			// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] is undefined!');
			WidgetCommon.dhtmlBulkLoadScript(urls,basehref,thedoc,theLastScript,nexturlsi);
			return;
		}
		
		if(nexturlsi!=urls.length) {
			helper=function() {
				// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' ends');
				WidgetCommon.dhtmlBulkLoadScript(urls,basehref,thedoc,theLastScript,nexturlsi);
			};
		} else if(typeof theLastScript == 'function') {
			// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' ends');
			helper=theLastScript;
		}
		if(helper) {
			if(e.addEventListener) {
				var loadE;
				var loadF = function () {
					e.removeEventListener('load',loadF,false);
					e.removeEventListener('error',loadE,false);
					loadF=undefined;
					loadE=undefined;
					try {
						helper();
					} catch(e) {
						// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' error: '+e);
						// IgnoreIT!!!(R)
					}
				}
				loadE = function(evt) {
					// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' error: '+evt.toString());
					loadF();
				};
				e.addEventListener('error',loadE,false);
				e.addEventListener('load',loadF,false);
			} else {
				e.onreadystatechange = function() {
					// On IE 'complete' state is reached both in complete *and* in error loads
					if(this.readyState == 'loaded' || this.readyState == 'complete') {
						this.onreadystatechange = function() {};
						this.onerror = function() {};
						try {
							helper();
						} catch(e) {
							// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' error: '+WidgetCommon.DebugError(e));
							// WidgetCommon.DebugMSG('and was '+helper);
							// IgnoreIT!!!(R)
						}
					}
				};
			}
		}
		
		e.src = basehref+scriptURL;
		// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' starts');
		try {
			head.appendChild(e);
		} catch(e) {
			// WidgetCommon.DebugMSG('Bulk script['+urlsi+'] '+scriptURL+' sterror: '+WidgetCommon.DebugError(e));
			// IgnoreIT!!!(R)
		}
	} else if(typeof theLastScript == 'function') {
		// WidgetCommon.DebugMSG('Bulk last script starts');
		try {
			theLastScript();
		} catch(we) {
			// WidgetCommon.DebugMSG('Bulk last script error: '+we);
			// IgnoreIT!!!(R)
		}
		// WidgetCommon.DebugMSG('Bulk last script ends');
	}
};

/**
 * This function allows loading a CSS stylesheet in a dynamic way
 * @param {String} url
 * @param {String} basehref
 * @param {HTMLDocument,document,Document} thedoc
 */
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

/**
 * Initialization of the WidgetCommon library
 * @param {Array} JSDEPS
 * @param {Function} theLastScript
 * @param {String} basehref
 */
WidgetCommon.widgetCommonInit = function (/* optional */ JSDEPS, theLastScript, basehref)
{
	//WidgetCommon.DebugMSG("WidgetCommonInit was called");
	if(JSDEPS==undefined)
		JSDEPS=WidgetCommon.JSDEPS;
		
	if(theLastScript==undefined)
		theLastScript=WidgetCommon.doOnload;
	
	// Special behavior only on init
	var doTimer;
	if(basehref==undefined) {
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
	} else {
		doTimer=1;
	}
	
	if(!doTimer || WidgetCommon._loaded) {
		WidgetCommon.dhtmlDelayedLoadScript(JSDEPS,basehref,undefined,theLastScript);
	} else {
		var counter=0;
		var interval=setInterval(function() {
			counter++;
			//if(counter % 10 == 0)
			//	WidgetCommon.DebugMSG('Still waiting...');
			if(WidgetCommon._loaded) {
				clearInterval(interval);
				WidgetCommon.dhtmlDelayedLoadScript(JSDEPS,basehref,undefined,theLastScript);
			}
		},100);
	}
};

/* Second, dynamically loading the libraries (bootstraping) */
WidgetCommon.widgetCommonInit();

/* And third, the additional functions!!!! */

/**
 * This static method injects inline CSS declarations just at the end of the document's head
 * @param {String} csscontent
 * @param {HTMLDocument,document,Document} thedoc
 */
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

/**
 * This static method injects inline Javascript sentences just at the end of the document's head 
 * @param {String} javascriptcontent
 * @param {HTMLDocument,document,Document} thedoc
 */
WidgetCommon.dhtmlLoadScriptContent = function (javascriptcontent,/* optional */ thedoc)
{
	if(!thedoc) {
		thedoc=document;
	}
	var e = thedoc.createElement("script");
	e.type="text/javascript";
	//e.appendChild(thedoc.createTextNode("<!--\n"+javascriptcontent+"\n// -->"));
	e.innerHTML=javascriptcontent;
	thedoc.getElementsByTagName("head")[0].appendChild(e);
};

/**************************/
/* Generic getElementById */
/**************************/
// Sort of optimization
/**
 * Browser agnostic, generic getElementById implementation
 * @param {String} id
 * @param {HTMLDocument,document,Document} thedoc
 * @return {HTMLElement, Element}
 */
WidgetCommon.getElementById = function(id,/* optional */ thedoc){
	if(!thedoc)
		thedoc = document;
	if (thedoc.getElementById) { // test the most common method first.  Most browsers won't get past this test
		/**
		 * Browser agnostic, generic getElementById implementation
		 * @param {String} id
		 * @param {HTMLDocument,document,Document} thedoc
		 * @return {HTMLElement, Element}
		 */
		WidgetCommon.getElementById = function(id,/* optional */ thedoc){
			if (!thedoc) 
				thedoc = document;
			return thedoc.getElementById(id);
		};
	} else if (document.all) { // test older versions of IE
		/**
		 * Browser agnostic, generic getElementById implementation
		 * @param {String} id
		 * @param {HTMLDocument,document,Document} thedoc
		 * @return {HTMLElement, Element}
		 */
		WidgetCommon.getElementById = function(id,/* optional */ thedoc){
			if (!thedoc) 
				thedoc = document;
			return thedoc.all[id];
		};
	} else if (document.layers) { // test older versions of Netscape
		/**
		 * Browser agnostic, generic getElementById implementation
		 * @param {String} id
		 * @param {HTMLDocument,document,Document} thedoc
		 * @return {HTMLElement, Element}
		 */
		WidgetCommon.getElementById = function(id,/* optional */ thedoc){
			if (!thedoc) 
				thedoc = document;
			return thedoc.layers[id];
		};
	} else { // not sure what to do...return null
		/**
		 * Browser agnostic, generic getElementById implementation
		 * @param {String} id
		 * @param {HTMLDocument,document,Document} thedoc
		 * @return {HTMLElement, Element}
		 */
		WidgetCommon.getElementById = function(id,/* optional */ thedoc){
			return null;
		};
	}
	
	return WidgetCommon.getElementById(id,thedoc);
};

/**
 * This static method patches a IE document when there is no document.getElementsByClassName function available 
 * @param {HTMLDocument, document, Document} thedoc
 */
WidgetCommon.getElementsByClassNamePatcher = function (thedoc) {
	if(typeof thedoc.getElementsByClassName !== 'function')  {
		thedoc.getElementsByClassName = function(cl) {
			var retnode = [];
			var myclass = new RegExp('\\b'+cl+'\\b');
			var elem = thedoc.getElementsByTagName('*');
			var elLength = elem.length;
			for (var i = 0; i < elLength; i++) {
				var classes = elem[i].className;
				if(myclass.test(classes)) retnode.push(elem[i]);
			}
			return retnode;
		};
	}
};

/**
 * This method looks for a FORM tag by its name attribute
 * @param {String} formName
 * @param {HTMLDocument, document, Document} thedoc
 * @return {HTMLFormElement}
 */
WidgetCommon.getForm = function(formName,/* optional */ thedoc) {
	if('forms' in document) {
		/**
		 * This method looks for a FORM tag by its name attribute
		 * @param {String} formName
		 * @param {HTMLDocument, document, Document} thedoc
		 * @return {HTMLFormElement}
		 */
		WidgetCommon.getForm = function (formName,/* optional */ thedoc) {
			if(!thedoc)  thedoc=document;
			return thedoc.forms[formName];
		};
	} else {
		/**
		 * This method looks for a FORM tag by its name attribute
		 * @param {String} formName
		 * @param {HTMLDocument, document, Document} thedoc
		 * @return {HTMLFormElement}
		 */
		WidgetCommon.getForm = function (formName,/* optional */ thedoc) {
			if(!thedoc)  thedoc=document;
			return thedoc[formName];
		};
	}
	
	return WidgetCommon.getForm(formName,thedoc);
};

/***********************/
/* Event handling code */
/***********************/

/**
 * Browser agnostic, generic addEventListener implementation
 * @param {HTMLElement} object
 * @param {String} eventType
 * @param {Function} listener
 * @param {Boolean} useCapture
 */
WidgetCommon.addEventListener = function (object, eventType, listener, useCapture) {
	if(window.addEventListener) {
		// W3C DOM compatible browsers
		/**
		 * Browser agnostic, generic addEventListener implementation
		 * @param {HTMLElement} object
		 * @param {String} eventType
		 * @param {Function} listener
		 * @param {Boolean} useCapture
		 */
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
		/**
		 * Browser agnostic, generic addEventListener implementation
		 * @param {HTMLElement} object
		 * @param {String} eventType
		 * @param {Function} listener
		 * @param {Boolean} useCapture
		 */
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
		/**
		 * Browser agnostic, generic addEventListener implementation
		 * @param {HTMLElement} object
		 * @param {String} eventType
		 * @param {Function} listener
		 * @param {Boolean} useCapture
		 */
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

/**
 * Browser agnostic, generic addEventListener implementation, which works on element Ids
 * @param {String} objectId
 * @param {String} eventType
 * @param {Function} listener
 * @param {Boolean} useCapture
 * @param {HTMLDocument, document, Document} thedoc
 */
WidgetCommon.addEventListenerToId = function (objectId, eventType, listener, useCapture, /* optional */ thedoc) {
	WidgetCommon.addEventListener(WidgetCommon.getElementById(objectId,thedoc), eventType, listener, useCapture);
};

/**
 * Browser agnostic, generic removeEventListener implementation
 * @param {HTMLElement} object
 * @param {String} eventType
 * @param {Function} listener
 * @param {Boolean} useCapture
 */
WidgetCommon.removeEventListener = function (object, eventType, listener, useCapture) {
	if(window.removeEventListener) {
		// W3C DOM compatible browsers
		/**
		 * Browser agnostic, generic removeEventListener implementation
		 * @param {HTMLElement} object
		 * @param {String} eventType
		 * @param {Function} listener
		 * @param {Boolean} useCapture
		 */
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
		/**
		 * Browser agnostic, generic removeEventListener implementation
		 * @param {HTMLElement} object
		 * @param {String} eventType
		 * @param {Function} listener
		 * @param {Boolean} useCapture
		 */
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
		/**
		 * Browser agnostic, generic removeEventListener implementation
		 * @param {HTMLElement} object
		 * @param {String} eventType
		 * @param {Function} listener
		 * @param {Boolean} useCapture
		 */
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

/**
 * Browser agnostic, generic removeEventListener implementation, which works on element Ids
 * @param {String} objectId
 * @param {String} eventType
 * @param {Function} listener
 * @param {Boolean} useCapture
 * @param {HTMLDocument, document, Document} thedoc
 */
WidgetCommon.removeEventListenerFromId = function (objectId, eventType, listener, useCapture, /* optional */ thedoc) {
	WidgetCommon.removeEventListener(WidgetCommon.getElementById(objectId,thedoc), eventType, listener, useCapture);
};

/*******************/
/* IFrame handling */
/*******************/
/**
 * This static, browser agnostic method, obtains the document managed by an iframe
 * @param {HTMLElement} iframe
 * @return {HTMLDocument, document, Document}
 */
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

/**
 * This static, browser agnostic method, obtains the document managed by an iframe, using its id
 * @param {String} aID
 * @param {HTMLDocument, document, Document} thedoc
 * @return {HTMLDocument, document, Document}
 */
WidgetCommon.getIFrameDocumentFromId = function (aID,/* optional */ thedoc) {
	return WidgetCommon.getIFrameDocument(WidgetCommon.getElementById(aID,thedoc));
};

// for sizing and positioning the iframe in the window
// .5 for height="50%"
/**
 * This static method sets the height of a given iframe
 * @param {HTMLElement} theIframe
 * @param {Float, Integer} h
 * @param {Float, Integer} headerHeight
 * @param {WidgetCommon.Viewport} viewport
 */
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

/**
 * This static method sets the height of a given iframe, based on its id
 * @param {String} ifraname
 * @param {Float, Integer} h
 * @param {Float, Integer} headerHeight
 * @param {WidgetCommon.Viewport} viewport
 * @param {HTMLDocument, document, Document} thedoc
 */
WidgetCommon.setIFrameHeightFromId = function (ifraname, h, headerHeight, /* optional */ viewport, thedoc) {
	WidgetCommon.setIFrameHeight(WidgetCommon.getElementById(ifraname,thedoc), h, headerHeight, viewport);
};

/**
 * This static method sets an auto-resize behavior on a give IFRAME
 * @param {HTMLElement} iframe
 * @param {Float, Integer} percent
 * @param {Float, Integer} headerHeight
 * @param {Boolean} canreplace
 */
WidgetCommon.setIFrameAutoResize = function (iframe,/* optional */ percent,headerHeight,canreplace) {
	if(!percent)  percent=1;
	if(!headerHeight)  headerHeight=0;
	
	//WidgetCommon.setIFrameHeight(iframe,percent,headerHeight);
	var viewport=new WidgetCommon.Viewport();
	var daemonfunc = function() { WidgetCommon.setIFrameHeight(iframe,percent,headerHeight,viewport); };
	daemonfunc();
	WidgetCommon.addEventListener(window,'resize',daemonfunc,false);
};

/**
 * This static method sets an auto-resize behavior on a give IFRAME, based on its id
 * @param {String} ifraname
 * @param {Float, Integer} percent
 * @param {Float, Integer} headerHeight
 * @param {Boolean} canreplace
 * @param {HTMLDocument, document, Document} thedoc
 */
WidgetCommon.setIFrameAutoResizeFromId = function (ifraname,/* optional */ percent, headerHeight, canreplace, thedoc) {
	WidgetCommon.setIFrameAutoResize(WidgetCommon.getElementById(ifraname,thedoc),percent, headerHeight, canreplace);
};

/*****************/
/* Generic XPath */
/*****************/
/* This is a sort of lazy evaluation */
/**
 * Browser agnostic XPath evaluation
 * @param {String} thexpath
 * @param {Node} thecontext
 * @param {Object} theObjResolver
 * @return {NodeList}
 */
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
/**
 * Query string parsing
 * @param {Object} qsParm
 * @param {String} url
 * @param {HTMLDocument, document, Document} thedoc
 * @return {Object}
 */
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

/**
 * Query string generation
 * @param {Object} qsParm
 * @param {String} baseurl
 * @return {String}
 */
WidgetCommon.generateQS = function (qsParm,baseurl)
{
	var query='';
	var querySymbol='?';
	for (var term in qsParm) {
		if(qsParm[term]) {
			var iterarray=(qsParm[term] instanceof Array)?qsParm[term]:new Array(qsParm[term]);
			
			for(var key in iterarray) {
				var eterm=escape(term).replace('+','%2B');
				var eiter=escape(iterarray[key]).replace('+','%2B');
				query+=querySymbol+eterm+'='+eiter;
				querySymbol='&';
			}
		}
	}
	return baseurl+query;
};

/**********************************/
/* Javascript exception debugging */
/**********************************/
/**
 * Javascript exception prettyprinter
 * @param {Error, String, Number} e
 * @return {String}
 */
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
			var facility;
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
				number=e.number & 0xFFFF;
				facility=e.number >>> 16;
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
			if(!facility)  facility='';
			if(!description)  description='';
			return 	"JavaScript error name: "+name+
				"\nMessage: "+message+
				"\nNumber: "+number+
				"\nFacility: "+facility+
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
				"\nURL: "+fileName+", line "+lineNumber+
				"\nStackTrace: "+stack;
		}
	}
};

/**
 * On error event handler
 * @param {String} msg
 * @param {String} url
 * @param {Integer} lineNumber
 * @return {String}
 */
WidgetCommon.parseOnError = function(msg,url,lineNumber) {
	return "JavaScript error:\nMessage: "+msg+
		"\nURL: "+url+", line "+lineNumber;
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

/**
 * @constructor
 * @param {HTMLDocument,document,Document} thedoc
 * @param {Window, window} thewin
 */
WidgetCommon.Viewport = function (/* optional */ thedoc,thewin) {
	this.thedoc=(!thedoc)?document:thedoc;
	this.thewin=(!thewin)?window:thewin;
}

WidgetCommon.Viewport.prototype = {
	/**
	 * This method obtains the window width, setting it up in the object
	 * @method
	 */
	getWinWidth: function () {
		this.width = 0;
		if (this.thewin.innerWidth) this.width = this.thewin.innerWidth - 18;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.clientWidth) 
  			this.width = this.thedoc.documentElement.clientWidth;
		else if (this.thedoc.body && this.thedoc.body.clientWidth) 
  			this.width = this.thedoc.body.clientWidth;
	},
	/**
	 * This method obtains the window height, setting it up in the object
	 * @method
	 */
	getWinHeight: function () {
		this.height = 0;
		if (this.thewin.innerHeight) this.height = this.thewin.innerHeight - 18;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.clientHeight) 
  			this.height = this.thedoc.documentElement.clientHeight;
		else if (this.thedoc.body && this.thedoc.body.clientHeight) 
  			this.height = this.thedoc.body.clientHeight;
	},
	/**
	 * This method obtains the horizontal scroll of the window content
	 * @method
	 */
	getScrollX: function () {
		this.scrollX = 0;
		if (typeof this.thewin.pageXOffset == "number") this.scrollX = this.thewin.pageXOffset;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.scrollLeft)
  			this.scrollX = this.thedoc.documentElement.scrollLeft;
		else if (this.thedoc.body && this.thedoc.body.scrollLeft) 
  			this.scrollX = this.thedoc.body.scrollLeft; 
		else if (this.thewin.scrollX) this.scrollX = this.thewin.scrollX;
	},
	/**
	 * This method obtains the vertical scroll of the window content
	 * @method
	 */
	getScrollY: function () {
		this.scrollY = 0;    
		if (typeof this.thewin.pageYOffset == "number") this.scrollY = this.thewin.pageYOffset;
		else if (this.thedoc.documentElement && this.thedoc.documentElement.scrollTop)
  			this.scrollY = this.thedoc.documentElement.scrollTop;
		else if (this.thedoc.body && this.thedoc.body.scrollTop) 
  			this.scrollY = this.thedoc.body.scrollTop; 
		else if (this.thewin.scrollY) this.scrollY = this.thewin.scrollY;
	},
	/**
	 * This method obtains all the window parameters previously described
	 * @method
	 */
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
/**
 * This function generates a random integer number in the range [min,max]
 * @param {Float, Integer} min
 * @param {Float, Integer} max
 * @return {Integer}
 */
WidgetCommon.getRandomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**************************/
/* Now, an UUID generator */
/**************************/
/**
 * This method generates an UUID v4 (random)
 * @return {String}
 */
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
/**
 * This agnostic browser function obtains the text content from an XML node
 * @param {Node} oNode
 * @return {String}
 */
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

/**
 * This accesory function is used by WidgetCommon.getTextContent
 * when there is no support for oNode.textContet
 * @param {Node} oNode
 * @param {Boolean} deep
 * @return {String}
 */
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

/**
 * It returns the local name of a node in an agnostic browser implementation
 * @param {Node, HTMLElement} node
 * @return {String}
 */
WidgetCommon.getLocalName = function(node) {
	if('localName' in node)
		return node.localName;
	
	var nodeTagName = node.tagName;
	if (nodeTagName.indexOf(':') != -1) {
		nodeTagName = nodeTagName.substring(nodeTagName.indexOf(':')+1);
	}
	
	return nodeTagName;
};

/**
 * 
 * @param {Node, HTMLElement} node
 */
WidgetCommon.clearNode = function(node) {
	while(node.hasChildNodes()) {
		node.removeChild(node.firstChild);
	}
};

/**
 * This function creates either an object or an embed element in order to load an SVG
 * @param {String} url
 * @param {String, Integer, Float} width
 * @param {String, Integer, Float} height
 * @param {Function} eventListener
 * @param {HTMLElement} parent
 * @return {HTMLElement}
 */
WidgetCommon.createSVG = function (url, parent /* optional */, width,height,eventListener) {
	var thedoc = parent.ownerDocument;
	
	// Non standard behavior, set by svgweb
	var svg = thedoc.createElement('object',true);
	svg.setAttribute('type','image/svg+xml');
	svg.setAttribute('data',url);
	if(width!=undefined && width!=null)
		svg.setAttribute('width' , width);
	if(height!=undefined && height!=null)
		svg.setAttribute('height' , height);
	
	if(typeof eventListener == 'function')
		svg.addEventListener('load',eventListener,false);
	
	svgweb.appendChild(svg,parent);
	
	return svg;
};

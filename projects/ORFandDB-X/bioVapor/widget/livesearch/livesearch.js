/*
	This code is based on livesearch.js from Bitflux.
	Adapted and completed by Jose Maria Fernandez, CNIO (C) 2007
	Original Copyright, below.
*/

/*
// +----------------------------------------------------------------------+
// | Copyright (c) 2004 Bitflux GmbH                                      |
// +----------------------------------------------------------------------+
// | Licensed under the Apache License, Version 2.0 (the "License");      |
// | you may not use this file except in compliance with the License.     |
// | You may obtain a copy of the License at                              |
// | http://www.apache.org/licenses/LICENSE-2.0                           |
// | Unless required by applicable law or agreed to in writing, software  |
// | distributed under the License is distributed on an "AS IS" BASIS,    |
// | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or      |
// | implied. See the License for the specific language governing         |
// | permissions and limitations under the License.                       |
// +----------------------------------------------------------------------+
// | Author: Bitflux GmbH <devel@bitflux.ch>                              |
// +----------------------------------------------------------------------+

*/

var liveSearchRoot = "livesearch/";
var liveSearchRootSubDir = "";
var liveSearchParams = "";

var liveSearchReq = null;
var t = null;
var liveSearchLast = "";
	
var isIE = false;
// on !IE we only have to initialize it once

function liveSearchHide() {
	WidgetCommon.getElementById("LSResult").style.display = "none";
	var highlight = WidgetCommon.getElementById("LSHighlight");
	if (highlight) {
		highlight.removeAttribute("id");
	}
}

function liveSearchHideDelayed() {
	window.setTimeout("liveSearchHide()",400);
}
	
function liveSearchKeyPress(event) {
	var error=WidgetCommon.getElementById('LSError');
	if(error)  return;
	if(liveSearchReq)  return;
	if (event.keyCode == 10 || event.keyCode == 13 || event.keyCode == 27) {
		//Enter or ESC
		WidgetCommon.getElementById("LSResult").style.display = "none";
		highlight = WidgetCommon.getElementById("LSHighlight");
		if (highlight) {
			highlight.removeAttribute("id");
			if(event.keyCode != 27 && 'termText' in highlight) {
				termSelected(highlight.termText);
			}
		}
		return;
	} else if (event.keyCode == 40 ) {
		//KEY DOWN
		highlight = WidgetCommon.getElementById("LSHighlight");
		if (!highlight) {
			highlight = WidgetCommon.getElementById("LSShadow").firstChild.firstChild;
		} else {
			highlight.removeAttribute("id");
			highlight = highlight.nextSibling;
		}
		if (highlight) {
			highlight.setAttribute("id","LSHighlight");
		} 
		if (!isIE) { event.preventDefault(); }
	} else if (event.keyCode == 38 ) {
		//KEY UP
		highlight = WidgetCommon.getElementById("LSHighlight");
		if (!highlight) {
			highlight = WidgetCommon.getElementById("LSResult").firstChild.firstChild.lastChild;
		} else {
			highlight.removeAttribute("id");
			highlight = highlight.previousSibling;
		}
		if (highlight) {
				highlight.setAttribute("id","LSHighlight");
		}
		if (!isIE) { event.preventDefault(); }
	}
}


function liveSearchDoSearch() {
	if (typeof liveSearchRoot == "undefined") {
		liveSearchRoot = "";
	}
	if (typeof liveSearchRootSubDir == "undefined") {
		liveSearchRootSubDir = "";
	}
	if (typeof liveSearchParams == "undefined") {
		liveSearchParams = "";
	}
	var liveSearch=WidgetCommon.getForm('searchform').search.value;
	if(liveSearch != '') {
		var liveSearchTokens=liveSearch.split(" ");
		liveSearch=liveSearchTokens.pop();
	}
	
	// Asterisk removal
	var aster=liveSearch.indexOf('*');
	if(aster!=-1) {
		liveSearch=liveSearch.substring(0,aster);
	}
	
	if (liveSearchLast != liveSearch) {
		// Aborting previous search in course
		var liveSearchQ=liveSearchReq;
		if (liveSearchQ) {
			if(liveSearchQ.readyState < 4) {
				liveSearchQ.onreadystatechange=null;
				liveSearchQ.abort();
			}
			liveSearchQ=liveSearchReq=null;
		}
		liveSearchLast = liveSearch;
		
		// Restricting searches to terms of 2 or more words
		if ( liveSearch.length < 2 ) {
			liveSearchHide();
			return false;
		}

		// Issuing the search
		var qsParm=new Array();
		qsParm['search'] = liveSearch;

		var searchQuery=WidgetCommon.generateQS(qsParm,liveSearchRoot + "livesearch.xq");
		liveSearchQ = new XMLHttpRequest();
		liveSearchQ.onreadystatechange= function() {
			if (liveSearchQ.readyState == 4) {
				var  sh = WidgetCommon.getElementById("LSShadow");
				try {
					if(liveSearchQ.status==200) {
						if(liveSearchQ==liveSearchReq) {
							liveSearchReq=null;
							var  res = WidgetCommon.getElementById("LSResult");
							res.style.display = "block";
							sh.innerHTML = '';
							var foundterms=liveSearchQ.responseXML.getElementsByTagName('term');
							if(foundterms.length>0) {
								var lista=document.createElement('ul');
								lista.className+=' '+"LSRes";
								for(var i=0;i<foundterms.length;i++) {
									var term=foundterms[i].getAttribute('name');
									var hits=foundterms[i].getAttribute('hits');
									//var freq=foundterms[i].getAttribute('freq');
									var elem=document.createElement('li');
									elem.className+=' '+"LSRow";
									elem.termText=term;
									elem.innerHTML='<a href="javascript:termSelected('+
										"'"+term+"'"+
										')"><span class="term">'+term+'</span> ('+
										hits+' hit'+((hits==1)?'':'s')+')</a>';
									lista.appendChild(elem);
								}
								var hasmore=liveSearchQ.responseXML.getElementsByTagName('more');
								if(hasmore.length>0) {
									var elem=document.createElement('li');
									elem.className+=' '+"LSRow";
									elem.innerHTML='<span style="margin-left: 1em;">...</span>';
									lista.appendChild(elem);
								}
								sh.appendChild(lista);
							} else {
								sh.innerHTML="<div class='LSRes'><span id='LSNotFound'>(No hits found for '"+liveSearchQ.responseXML.documentElement.getAttribute('search')+"')</span></div>";
							}
						}
					} else if(liveSearchQ.status==404) {
				 		sh.innerHTML="<div class='LSRes'><span id='LSError'>Error while connecting to '"+searchQuery+"': not found</span></div>";
					} else {
				 		sh.innerHTML="<div class='LSRes'><span id='LSError'>Error while connecting to '"+searchQuery+"': code "+liveSearchQ.status+"</span></div>";
					}
				} catch(e) {
					sh.innerHTML="<div class='LSRes'><span id='LSError'>Your browser is probably in offline mode. Please switch it to online mode</span></div>";
				}
			}
		};
		liveSearchQ.open("GET", searchQuery);
		liveSearchQ.send(null);
		// Advertising the search
		liveSearchReq = liveSearchQ;
		var  res = WidgetCommon.getElementById("LSResult");
		res.style.display = "block";
		var  sh = WidgetCommon.getElementById("LSShadow");
		sh.innerHTML = "<div class='LSRes'><span id='LSSearching'>Looking for terms beginning with '"+liveSearch+"'</span></div>";
	}
}

function liveSearchStart() {
	if (t) {
		clearTimeout(t);
	}
	t = setTimeout("liveSearchDoSearch()",200);
}

function liveSearchSubmit() {
	var highlight = WidgetCommon.getElementById("LSHighlight");
	if (highlight && highlight.firstChild) {
		window.location = liveSearchRoot + liveSearchRootSubDir + highlight.firstChild.nextSibling.getAttribute("href");
		return false;
	} 
	else {
		return true;
	}
}

function termSelected(term) {
    var q = WidgetCommon.getForm('searchform').search;
    var tokens=q.value.split(" ");
    tokens[tokens.length-1]=liveSearchLast=term;
    q.value=tokens.join(" ");
    liveSearchHide();
    q.focus();
}

var _timer=null;
var _init=null;

function liveSearchInit() {
	if(navigator.vendor) {
		if(navigator.vendor.indexOf('KDE')!=-1 || navigator.vendor.indexOf('Apple')!=-1) {
			if(!WidgetCommon._loaded) {
				_timer = setInterval(function() {
					if (WidgetCommon._loaded && !_init) {
						_init=1;
						liveSearchInit(); // call the onload handler
					}
				}, 10);
				return;
			} else if(_timer) {
				_init=1;
				clearInterval(_timer);
			}
		}
	}
	
	
	if (BrowserDetect.browser=='Konqueror' || BrowserDetect.browser=='Safari') {
		WidgetCommon.getElementById('livesearch').addEventListener("keydown",liveSearchKeyPress,false);
//		WidgetCommon.getElementById('livesearch').addEventListener("blur",liveSearchHide,false);
	} else if (navigator.product == "Gecko") {
		
		WidgetCommon.getElementById('livesearch').addEventListener("keypress",liveSearchKeyPress,false);
		WidgetCommon.getElementById('livesearch').addEventListener("blur",liveSearchHideDelayed,false);
		
	} else {
		WidgetCommon.getElementById('livesearch').attachEvent('onkeydown',liveSearchKeyPress);
//		WidgetCommon.getElementById('livesearch').attachEvent("onblur",liveSearchHide,false);
		isIE = true;
	}
	
	WidgetCommon.getElementById('livesearch').setAttribute("autocomplete","off");

}


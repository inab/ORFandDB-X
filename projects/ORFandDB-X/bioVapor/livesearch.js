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

var liveSearchParams = "";

var liveSearchReq = null;
var t = null;
var liveSearchLast = "";
	
var isIE = false;
// on !IE we only have to initialize it once

function liveSearchHide() {
	getElemById("LSResult").style.display = "none";
	var highlight = getElemById("LSHighlight");
	if (highlight) {
		highlight.removeAttribute("id");
	}
}

function liveSearchHideDelayed() {
	window.setTimeout("liveSearchHide()",400);
}
	
function liveSearchKeyPress(event) {
	
	if (event.keyCode == 10 || event.keyCode == 13 || event.keyCode == 27) {
		//Enter or ESC
		getElemById("LSResult").style.display = "none";
		highlight = getElemById("LSHighlight");
		if (highlight) {
			highlight.removeAttribute("id");
			if(event.keyCode != 27 && 'termText' in highlight) {
				termSelected(highlight.termText);
			}
		}
		return;
	} else if (event.keyCode == 40 ) {
		//KEY DOWN
		highlight = getElemById("LSHighlight");
		if (!highlight) {
			highlight = getElemById("LSShadow").firstChild.firstChild;
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
		highlight = getElemById("LSHighlight");
		if (!highlight) {
			highlight = getElemById("LSResult").firstChild.firstChild.lastChild;
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
	var liveSearch=getForm('searchform').search.value;
	if(liveSearch != '') {
		var liveSearchTokens=liveSearch.split(" ");
		liveSearch=liveSearchTokens.pop();
	}
	if (liveSearchLast != liveSearch) {
		// Aborting previous search in course
		var liveSearchQ=liveSearchReq;
		if (liveSearchQ && liveSearchQ.readyState < 4) {
			liveSearchQ.abort();
			liveSearchReq=null;
		}
		liveSearchLast = liveSearch;
		if ( liveSearch == "") {
			liveSearchHide();
			return false;
		}

		// Issuing the search
		var qsParm=new Array();
		qsParm['search'] = liveSearch;

		var searchQuery=generateQS(qsParm,liveSearchRoot + "livesearch.xq");
		liveSearchQ = new XMLHttpRequest();
		liveSearchQ.onreadystatechange= function() {
			if (liveSearchQ.readyState == 4) {
				if(liveSearchQ.status==200) {
					if(liveSearchQ==liveSearchReq) {
						var  res = getElemById("LSResult");
						res.style.display = "block";
						var  sh = getElemById("LSShadow");
						sh.innerHTML = '';
						var foundterms=liveSearchQ.responseXML.getElementsByTagName('term');
						if(foundterms.length>0) {
							var lista=document.createElement('ul');
							lista.className="LSRes";
							for(var i=0;i<foundterms.length;i++) {
								var term=foundterms[i].getAttribute('name');
								var hits=foundterms[i].getAttribute('hits');
								var elem=document.createElement('li');
								elem.className="LSRow";
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
								elem.className="LSRow";
								elem.innerHTML='<span style="margin-left: 1em;">...</span>';
								lista.appendChild(elem);
							}
							sh.appendChild(lista);
						} else {
							sh.innerHTML="<i>(No hits found for '"+liveSearchQ.responseXML.documentElement.getAttribute('search')+"')</i>";
						}
					}
				 }
			}
		};
		liveSearchQ.open("GET", searchQuery);
		liveSearchQ.send(null);
		// Advertising the search
		liveSearchReq = liveSearchQ;
		var  res = getElemById("LSResult");
		res.style.display = "block";
		var  sh = getElemById("LSShadow");
		sh.innerHTML = "<i>Looking for '"+liveSearch+"'</i>";
	}
}

function liveSearchStart() {
	if (t) {
		clearTimeout(t);
	}
	t = setTimeout("liveSearchDoSearch()",200);
}

function liveSearchSubmit() {
	var highlight = getElemById("LSHighlight");
	if (highlight && highlight.firstChild) {
		window.location = liveSearchRoot + liveSearchRootSubDir + highlight.firstChild.nextSibling.getAttribute("href");
		return false;
	} 
	else {
		return true;
	}
}

function termSelected(term) {
    var q = getForm('searchform').search;
    var tokens=q.value.split(" ");
    tokens[tokens.length-1]=liveSearchLast=term;
    q.value=tokens.join(" ");
    liveSearchHide();
    q.focus();
}

function liveSearchInit() {
	
	if (navigator.userAgent.indexOf("Safari") > 0) {
		getElemById('livesearch').addEventListener("keydown",liveSearchKeyPress,false);
//		getElemById('livesearch').addEventListener("blur",liveSearchHide,false);
	} else if (navigator.product == "Gecko") {
		
		getElemById('livesearch').addEventListener("keypress",liveSearchKeyPress,false);
		getElemById('livesearch').addEventListener("blur",liveSearchHideDelayed,false);
		
	} else {
		getElemById('livesearch').attachEvent('onkeydown',liveSearchKeyPress);
//		getElemById('livesearch').attachEvent("onblur",liveSearchHide,false);
		isIE = true;
	}
	
	getElemById('livesearch').setAttribute("autocomplete","off");

}


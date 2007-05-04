var log;
MessageDisplay = function(elemId) {
    this.area = document.getElementById(elemId);
    this.display("Logging initialized");
};
MessageDisplay.prototype.display = function(sMsg){
    var msg = document.createElement("div");
    msg.appendChild(document.createTextNode(sMsg));
    this.area.appendChild(msg);
};

var procsNeeded = 2; 
var procsLoaded = 0;
// used to transform from XML to Grid View HTML
var xml2grid = new XSLTProcessor();
// used to transform the Grid View HTML to XML
var grid2xml = new XSLTProcessor();

// initialize everything, called on window load
function init() {
    log = new MessageDisplay("messages");
    log.display("Loading stylesheets...");
    prepareProcessor("../xsl/xml2grid.xml", xml2grid);
    //prepareProcessor("../xsl/grid2xml.xml", grid2xml);
};
window.onload = init;

// prepares the given processor using 
// the XML from the given URL
function prepareProcessor(url, proc) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4 ) {
            proc.importStylesheet(xmlhttp.responseXML);
            log.display("Loaded: "+url);
            if((++procsLoaded) == procsNeeded){
                log.display("All stylesheets loaded");
            };
        };
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send(null);
};

// loads the XML from the given URL
// and renders it as a Grid
function loadXmlFromUri(url) {
	Sarissa.updateContentFromURI(url, document.getElementById("gridView"), xml2grid);
};

function showSourceView() {
	var source = document.getElementById("gridView").innerHTML;
	var doc = (new DOMParser()).parseFromString(source, "text/xml");
	Sarissa.updateContentFromNode(doc, document.getElementById("sourceView"), grid2xml);
};



function Sxe() {

};
 
Sxe.elemControlMouseOver = function(oCaller) {
    oCaller.style.border = "1px outset menu";
    oCaller.style.backgroundColor = "menu";
};
Sxe.elemControlMouseOut = function(oCaller) {
    oCaller.style.border = "1px solid transparent";
    oCaller.style.backgroundColor = "transparent";
};
// Used by buttons in the editable area
// Hides and shows the childnodes

Sxe.toggleVisibility = function (oCaller, oTarget) {
   if(oTarget.style.display != "none") {
       oTarget.style.display = "none";
   } else {
       oTarget.style.display = "block";
   };
   //nextFocus.focus();
};
function setContextNode(){};

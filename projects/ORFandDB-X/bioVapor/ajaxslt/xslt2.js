
function xsltProcessWithParam(xmlDoc, stylesheet, param) {
	xsltLog('XML STYLESHEET:');
	xsltLogXml(xmlText(stylesheet));
	xsltLog('XML INPUT:');
	xsltLogXml(xmlText(xmlDoc));
	
	var output = domCreateDocumentFragment(new XDocument);
	var input = new ExprContext(xmlDoc);
  
	// Setting up initial parameters
	if(param!=null) {
		for(var name in param) {
			input.setVariable(name, param[name]);
		}
	}

	// And last, the evaluation
	xsltProcessContext(input, stylesheet, output);

	var ret = xmlText(output);

	xsltLog('HTML OUTPUT:');
	xsltLogXml(ret);

	return ret;
}

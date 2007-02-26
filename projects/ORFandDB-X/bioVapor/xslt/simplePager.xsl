<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:vapor="http://www.cnio.es/scombio/bioVapor/0.3">

	<xsl:output method="html" />

	<xsl:template match="/">
<html>
<head>
<title>bioVapor Simple Pager</title>
</head>
<body>
<div align="center">
<form name="pagerForm"><a href="javascript:showOne(1)">First</a> <select name="pager" size="1" onChange="showOne(this.options[this.selectedIndex].value)">
<xsl:for-each select="//vapor:result"><option><xsl:value-of select="position()"/></option></xsl:for-each>
</select> <a href="javascript:showOne({count(//vapor:result)})">Last</a></form>
</div>
</body>
</html>
	</xsl:template>
</xsl:stylesheet>

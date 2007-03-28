<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:msg="http://www.cnio.es/scombio/bioVapor/0.4">

	<xsl:output method="html" />

	<xsl:template match="/">
<html>
<head>
<title>widget Simple Pager</title>
</head>
<body>
<div align="center">
<form name="pagerForm"><a href="javascript:showOne(1)">First</a> <select name="pager" size="1" onChange="showOne(this.options[this.selectedIndex].value)">
<xsl:for-each select="//msg:result"><option><xsl:value-of select="position()"/></option></xsl:for-each>
</select> <a href="javascript:showOne({count(//msg:result)})">Last</a></form>
</div>
</body>
</html>
	</xsl:template>
</xsl:stylesheet>

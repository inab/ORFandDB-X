<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:msg="http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.5">

	<xsl:output method="html" />

	<xsl:template match="/">
<html>
<head>
<title>widget Simple Pager</title>
</head>
<body>
<div align="center">
<form name="pagerForm"><a href="javascript:showOne(1)">First</a> <select name="pager" size="1" style="width:280" onChange="showOne(this.options[this.selectedIndex].value)">
<xsl:for-each select="//msg:result">
<xsl:variable name="title">
<xsl:choose>
<xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when>
<xsl:otherwise><xsl:value-of select="position()"/></xsl:otherwise>
</xsl:choose>
</xsl:variable>
<option value="{position()}"><xsl:value-of select="substring($title,1,30)"/><xsl:if test="string-length($title) &gt; 30">...</xsl:if></option>
</xsl:for-each>
</select> <a href="javascript:showOne({count(//msg:result)})">Last</a></form>
</div>
</body>
</html>
	</xsl:template>
</xsl:stylesheet>

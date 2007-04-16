<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:msg="http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.5"
	xmlns:mim="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/OMIM">

	<xsl:output method="html" />

	<xsl:template match="/">
<html>
<head>
<title>OMIM widget Pager</title>
</head>
<body>
<div align="left">
<table>
<tr valign="top"><td align="center">Found <xsl:value-of select="count(//msg:result)" /> result<xsl:if test="count(//msg:result)!=1">s</xsl:if> on <img src="images/omim.gif"/>
<xsl:choose>
<xsl:when test="//msg:result">
<form name="pagerForm"><select name="pager" size="1" style="width:280" onChange="showOne(this.options[this.selectedIndex].value)">
<xsl:for-each select="//msg:result">
<xsl:variable name="title">
<xsl:choose>
<xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when>
<xsl:when test="msg:content/mim:record/@title"><xsl:value-of select="msg:content/mim:record/@title"/></xsl:when>
<xsl:otherwise><xsl:value-of select="@id"/></xsl:otherwise>
</xsl:choose>
</xsl:variable>
<option value="{position()}"><xsl:value-of select="substring($title,1,30)"/><xsl:if test="string-length($title) &gt; 30">...</xsl:if></option>
</xsl:for-each>
</select></form>
</xsl:when>
<xsl:otherwise>
<h2><i>No result was found for <xsl:value-of select="/msg:message/@query"/>.<br />We apologize for the inconvenience</i></h2>
</xsl:otherwise>
</xsl:choose></td>
<td><img src="images/jhu.gif"/></td></tr>
</table>
</div>
</body>
</html>
	</xsl:template>
</xsl:stylesheet>

<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:vapor="http://www.cnio.es/scombio/bioVapor/0.3"
	xmlns:mim="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/OMIM">

	<xsl:output method="html" />

	<xsl:template match="/">
<html>
<head>
<title>bioVapor OMIM Pager</title>
</head>
<body>
<div align="left">
<table>
<tr valign="top"><td align="center"><img src="images/omim.gif"/>
<xsl:choose>
<xsl:when test="//vapor:result">
<form name="pagerForm"><select name="pager" size="1" onChange="showOne(this.options[this.selectedIndex].value)">
<xsl:for-each select="//vapor:result"><option value="{position()}"><xsl:value-of select="vapor:content/mim:record/@mimNumber"/></option></xsl:for-each>
</select></form>
</xsl:when>
<xsl:otherwise>
<h2><i>No result was found for <xsl:value-of select="/vapor:message/@query"/>.<br />We apologize for the inconvenience</i></h2>
</xsl:otherwise>
</xsl:choose></td>
<td><img src="images/jhu.gif"/></td></tr>
</table>
</div>
</body>
</html>
	</xsl:template>
</xsl:stylesheet>

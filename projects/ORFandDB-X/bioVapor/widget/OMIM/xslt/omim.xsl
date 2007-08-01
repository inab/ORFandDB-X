<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:msg="http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.6"
	xmlns:mim="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4.0/OMIM"
	xmlns:odb="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4.0"
	xmlns:exist="http://exist.sourceforge.net/NS/exist"
>

	<xsl:param name="fromVal">1</xsl:param>
	<xsl:param name="toVal">1</xsl:param>
	<xsl:output method="html" />
	
	<xsl:template match="/">
<html>
<head>
<title>Results for <xsl:choose><xsl:when test="msg:message/@query"><xsl:value-of select="msg:message/@query"/></xsl:when><xsl:otherwise><xsl:value-of select="mim:record/@title"/> (<xsl:value-of select="mim:record/@mimNumber"/>)</xsl:otherwise></xsl:choose><xsl:if test="msg:message/@timestamp"> on <xsl:value-of select="msg:message/@timestamp"/></xsl:if></title>
<script type="text/javascript" src="OMIM/xslt/omim.js" />
<link rel="stylesheet" href="OMIM/xslt/omim.css" type="text/css" />
</head>
<body>
	<xsl:choose>
		<xsl:when test="//msg:result">
			<xsl:apply-templates select="//msg:result[position() &gt;= $fromVal and position() &lt;= $toVal]/msg:content/mim:record"/>
		</xsl:when><xsl:otherwise>
			<xsl:apply-templates select="//mim:record"/>
		</xsl:otherwise>
	</xsl:choose>
</body>
</html>
	</xsl:template>

	<xsl:template match="mim:record">
<h2><u>Record <xsl:value-of select="@mimNumber"/></u><br /><xsl:value-of select="@title"/></h2>

<xsl:apply-templates select="mim:locus"/>

<xsl:if test="mim:alias">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> ALIASES</h2>
<b class="expander-content">
<xsl:for-each select="mim:alias"><xsl:value-of select="text()"/><br/></xsl:for-each>
</b>
</div>
</xsl:if>

<xsl:if test="mim:included">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> ALTERNATIVE TITLES AND SYMBOLS</h2>
<b class="expander-content">
<xsl:for-each select="mim:included"><xsl:value-of select="text()"/><br/></xsl:for-each>
</b>
</div>
</xsl:if>

<xsl:if test="mim:seeAlso">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> SEE ALSO</h2>
<p class="expander-content"><xsl:for-each select="mim:seeAlso"><xsl:value-of select="text()"/>; </xsl:for-each></p>
</div>
</xsl:if>

<xsl:for-each select="mim:movedTo"><p><i>This entry was moved to <xsl:value-of select="@mimNumber"/></i></p></xsl:for-each>

<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> TEXT</h2>
<div class="expander-content"><xsl:apply-templates select="mim:text"/></div>
</div>

<xsl:if test="mim:allelicVariant">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> ALLELIC VARIANTS</h2>
<div class="expander-content">
<xsl:apply-templates select="mim:allelicVariant"/>
</div>
</div>
</xsl:if>

<xsl:apply-templates select="mim:clinicalSynopsis"/>

<xsl:if test="mim:bibref">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> REFERENCES</h2>
<div align="left" class="expander-content">
<table>
<colgroup>
<col />
<col width="100%"/>
</colgroup>
<xsl:apply-templates select="mim:bibref"/>
</table>
</div>
</div>
</xsl:if>
<!--
	Commented out to remove superfluous information
<xsl:apply-templates select="mim:entryHistory"/>
-->
<br />Widget Design (C) 2006-2007 CNIO - José M. Fernández
<br />Content Copyright (C) 1996-2007 Johns Hopkins University
<hr />
	</xsl:template>
	
	<xsl:template match="mim:locus">
Gene map locus <xsl:value-of select="@id"/> <i>(<xsl:value-of select="@eDate"/>)</i>
<blockquote>
<ul>
<xsl:for-each select="mim:geneSymbol"><li><xsl:value-of select="text()"/></li></xsl:for-each>
</ul>
</blockquote>
	</xsl:template>
	
	<xsl:template match="mim:entryHistory">
		<xsl:if test="mim:created">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> CREATION</h2>
<div class="expander-content">
<xsl:for-each select="mim:created"><xsl:value-of select="text()"/>: <xsl:value-of select="@date"/><br /></xsl:for-each>
<br />
</div>
</div>
		</xsl:if>
		<xsl:if test="mim:attribution">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> CONTRIBUTION</h2>
<div class="expander-content">
<xsl:for-each select="mim:attribution"><xsl:value-of select="text()"/>: <xsl:value-of select="@date"/><br /></xsl:for-each>
<br />
</div>
</div>
		</xsl:if>
		<xsl:if test="mim:edited">
<div class="expander-closed">
<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> EDIT HISTORY</h2>
<div class="expander-content">
<xsl:for-each select="mim:edited"><xsl:value-of select="text()"/>: <xsl:value-of select="@date"/><br /></xsl:for-each>
<br />
</div>
</div>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="mim:bibref">
<tr valign="top"><td align="right"><b><xsl:value-of select="@num"/>.</b></td><td><xsl:value-of select="text()"/></td></tr>
	</xsl:template>
	
	<xsl:template match="mim:text">
		<xsl:param name="level">3</xsl:param>
		
		<xsl:apply-templates select="*">
			<xsl:with-param name="level" select="$level"/>
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template match="mim:para|mim:term">
		<p><xsl:apply-templates select="node()"/></p>
	</xsl:template>
	
	<xsl:template match="odb:link">
		<xsl:variable name="texto"><xsl:choose>
			<xsl:when test="odb:text and (odb:text/exist:match or string-length(odb:text/text()) &gt; 0)">
				<xsl:apply-templates select="odb:text/node()"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@id"/>
			</xsl:otherwise>
		</xsl:choose></xsl:variable>
		
		<xsl:if test="$texto">
			<xsl:variable name="exthref"><xsl:choose>
				<xsl:when test="@namespace = 'MIM'">widgetOMIM.html?namespace=OMIM&amp;ensemblId=</xsl:when>
				<xsl:when test="@namespace = 'ENZYME'">http://www.expasy.ch/enzyme/</xsl:when>
				<xsl:when test="@namespace = 'dbSNP'">http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=snp&amp;cmd=search&amp;term=</xsl:when>
			</xsl:choose></xsl:variable>
			
			<xsl:choose>
				<xsl:when test="$exthref">
					<a href="{$exthref}{@id}" target="_blank"><xsl:copy-of select="$texto"/></a>
				</xsl:when>
				<xsl:otherwise>
					<u><xsl:value-of select="$texto"/></u>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="exist:match">
		<span class="highlight"><xsl:apply-templates select="node()"/></span>
	</xsl:template>
	
	<xsl:template match="mim:section">
		<xsl:param name="level">3</xsl:param>
		
		<div class="expander-closed">
		<xsl:element name="h{$level}"><xsl:attribute name="class">expander</xsl:attribute><xsl:attribute name="onclick">swe(this)</xsl:attribute><span class="expander-plus">+</span> <xsl:value-of select="@name"/></xsl:element>
		<div class="expander-content">
		<xsl:apply-templates select="*">
			<xsl:with-param name="level" select="$level + 1"/>
		</xsl:apply-templates>
		</div>
		</div>
	</xsl:template>
	
	<xsl:template match="mim:allelicVariant">
		<div class="expander-closed">
		<h3 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> <a name="{@allelicID}"><xsl:value-of select="@allelicID"/></a><xsl:text>: </xsl:text><xsl:value-of select="@name"/> [<xsl:value-of select="mim:mutation/@raw"/>]</h3>
		<div class="expander-content">
		<xsl:if test="mim:alias">
<div class="expander-closed">
<h4 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> ALIASES</h4>
<div class="expander-content">
<xsl:for-each select="mim:alias"><b><xsl:value-of select="text()"/></b><br/></xsl:for-each>
</div>
</div>
		</xsl:if>
		<xsl:apply-templates select="mim:text">
			<xsl:with-param name="level" select="4"/>
		</xsl:apply-templates>
		</div>
		</div>
	</xsl:template>
	
	<xsl:template match="mim:clinicalSynopsis">
		<div class="expander-closed">
		<h2 class="expander" onclick="swe(this)"><span class="expander-plus">+</span> CLINICAL SYNOPSIS</h2>
			<div align="left" class="expander-content">
			<table>
				<colgroup>
					<col/>
					<col width="100%"/>
				</colgroup>
				<xsl:for-each select="mim:key">
				<tr valign="top">
					<td><ul><li><b><xsl:value-of select="@name"/></b></li></ul></td>
					<td><xsl:apply-templates select="mim:term"/></td>
				</tr>
				</xsl:for-each>
			</table>
			</div>
		</div>
	</xsl:template>
</xsl:stylesheet>

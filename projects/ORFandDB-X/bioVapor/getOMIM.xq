xquery version "1.0";

declare option exist:serialize "omit-xml-declaration=no indent=yes media-type=application/xml";

declare namespace msg="http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.4";

import module namespace mim="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/OMIM" at "omim.xqws";

import module namespace request="http://exist-db.org/xquery/request";

let $query:=request:get-parameter("id",())
let $nsquery:=request:get-parameter("namespace","EnsEMBL")
return
<msg:message query='{$query}' namespace='{$nsquery}' timestamp='{current-dateTime()}'>
<msg:defaultView showMode='XSLT' mime='text/html' href='xslt/omim.xsl'>
	<msg:include type='javascript' href='xslt/omim.js' />
	<msg:include type='CSS' href='xslt/omim.css' />
</msg:defaultView>
<msg:pagerView showMode='XSLT' mime='text/html' href='xslt/omimPager.xsl' />{
for $id in $query
let $results:= if($nsquery="OMIM") then (mim:getRecord($id)) else (mim:getRecordsFromEnsID($id))
	for $res in $results
	return <msg:result namespace='OMIM' id='{$res/@mimNumber}'><msg:content>{$res}</msg:content></msg:result>
}</msg:message>

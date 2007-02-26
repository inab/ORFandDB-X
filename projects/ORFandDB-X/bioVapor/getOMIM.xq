xquery version "1.0";

declare option exist:serialize "omit-xml-declaration=no indent=yes media-type=application/xml";

declare namespace vapor="http://www.cnio.es/scombio/bioVapor/0.3";

import module namespace mim="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/OMIM" at "omim.xqws";

import module namespace request="http://exist-db.org/xquery/request";

let $query:=request:get-parameter("id",())
let $nsquery:=request:get-parameter("namespace","EnsEMBL")
return
<vapor:message query='{$query}' namespace='{$nsquery}' timestamp='{current-dateTime()}'>
<vapor:defaultView showMode='XSLT' mime='text/html' href='xslt/omim.xsl' />
<vapor:pagerView showMode='XSLT' mime='text/html' href='xslt/omimPager.xsl' />{
for $id in $query
let $results:= if($nsquery="OMIM") then (mim:getRecord($id)) else (mim:getRecordsFromEnsID($id))
	for $res in $results
	return <vapor:result namespace='OMIM' id='{$res/@mimNumber}'><vapor:content>{$res}</vapor:content></vapor:result>
}</vapor:message>

xquery version "1.0";

declare option exist:optimize "enable=yes";
declare option exist:serialize "omit-xml-declaration=no indent=yes media-type=application/xml";

declare namespace msg="http://www.cnio.es/scombio/jmfernandez/widgetMessage/0.5";

import module namespace mim="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/OMIM" at "omim.xqws";

import module namespace request="http://exist-db.org/xquery/request";

let $query:=request:get-parameter("id",())
let $nsquery:=request:get-parameter("namespace","EnsEMBL")
let $gethtml:=request:get-parameter("html","false")
let $onefetch:=request:get-parameter("onefetch","false")
let $results:=(
	for $id in $query
	return if($nsquery="OMIM") then (
			mim:getRecord($id)
		) else (
			if($nsquery="FTS") then (
				mim:getRecordsWithFTS($id)
			) else (
				mim:getRecordsFromEnsID($id)
			)
		)
	)
return
<msg:message query='{$query}' namespace='{$nsquery}' timestamp='{current-dateTime()}'>
<msg:defaultView showMode='{if($gethtml = "true") then "none" else "XSLT"}' mime='text/html'>{
	if($gethtml != "true") then
		 attribute href {'xslt/omim.xsl'}
	else
		()
}	<msg:include type='javascript' href='xslt/omim.js' />
	<msg:include type='CSS' href='xslt/omim.css' />
</msg:defaultView>{
	if($gethtml != 'true') then
		<msg:pagerView showMode='XSLT' mime='text/html' href='xslt/omimPager.xsl' />
	else
		()
}<msg:defaultFetchURI href='getOMIMRecord.xq' idAttr='id' htmlAttr='html' />{
	for $res in $results
	return <msg:result namespace='OMIM' id='{$res/@mimNumber}' title='{$res/@title}'>{
			if($onefetch = 'true') then
				<msg:content>{
					if($gethtml = 'true') then
						transform:transform($res,'xmldb:exist:///xslt/omim.xsl',())
					else
						$res
				}</msg:content>
			else ()
		}</msg:result>
}</msg:message>

xquery version "1.0";

(:
declare option exist:optimize "enable=yes";
declare option exist:serialize "omit-xml-declaration=no indent=yes media-type=application/xml";
:)

import module namespace mim="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/4.0/OMIM" at "omim.xqws";

import module namespace request="http://exist-db.org/xquery/request";
import module namespace util="http://exist-db.org/xquery/util";
import module namespace transform="http://exist-db.org/xquery/transform";

let $query:=request:get-parameter("id",())
let $gethtml:=request:get-parameter("html","false")
let $res:=mim:getRecord($query)
return 
	if($gethtml = 'true') then (
		util:declare-option('exist:serialize',"indent=no media-type=text/html"),
		transform:stream-transform($res,'xmldb:exist:///xslt/omim.xsl',())
	) else (
		util:declare-option('exist:serialize',"omit-xml-declaration=no indent=yes media-type=application/xml"),
		$res
	)

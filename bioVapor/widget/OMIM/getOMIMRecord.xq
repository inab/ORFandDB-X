xquery version "1.0";

declare namespace exist="http://exist.sourceforge.net/NS/exist";
declare namespace mimmark="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4.0/OMIM/mark";

import module namespace mim="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4.0/OMIM" at "omim.xqws";
(:
Previous line only works from HTTP interface

import module namespace mim="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4.0/OMIM" at "xmldb:exist:///db/widget/OMIM/omim.xqws";
:)

import module namespace request="http://exist-db.org/xquery/request";
import module namespace util="http://exist-db.org/xquery/util";
import module namespace transform="http://exist-db.org/xquery/transform";
import module namespace ft="http://exist-db.org/xquery/lucene";

declare option exist:serialize "highlight-matches=elements omit-xml-declaration=no indent=yes media-type=application/xml";

(:
declare option exist:optimize "enable=yes";
:)

declare function mimmark:set-markups($input as node()*,$markup as xs:string?) as node()*
{
	if($markup) then (
	    util:expand(
    		for $elem in $input
    		let $marked := $elem[ft:query(.,$markup)]
    			return
    				if($marked) then
    					$marked
    				else
    					$elem
		)
	) else
		$input
};

let $query:=request:get-parameter("id",())
let $markup:=request:get-parameter("markup",())
let $gethtml:=request:get-parameter("html","false")
let $res:=util:expand(mim:getRecord($query,$markup))
return
	if($gethtml = 'true') then (
		util:declare-option('exist:serialize',"indent=no media-type=text/html"),
		transform:stream-transform($res,'xmldb:exist:///widget/OMIM/xslt/omim.xsl',())
	) else (
		util:declare-option('exist:serialize',"highlight-matches=elements omit-xml-declaration=no indent=yes media-type=application/xml"),
		$res
	)

xquery version "1.0";

(:
	This code has been adapted from 
	eXist distribution.
:)

(::pragma exist:output-size-limit -1::)
declare namespace ls="http://www.cnio.es/scombio/jmfernandez/ORFandDB/4.0/livesearch";
declare namespace t="http://exist-db.org/xquery/text";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace request="http://exist-db.org/xquery/request";

declare variable $maxterms as xs:int := 15;

declare function ls:term-callback($term as xs:string, $data as xs:int+) 
as element()+ {
	<term name="{$term}" hits="{$data[4]}" freq="{$data[1]}" />,
	if ($data[3] > 15) then
		<more />
	else
		()
};

let $t := request:get-parameter("search", ()),
    $collection := request:get-parameter("collection", "/db/OMIM")
return
    <terms search="{$t}">
	{
	    t:index-terms(collection($collection), $t, util:function("ls:term-callback", 2), $maxterms + 1)
	}
    </terms>

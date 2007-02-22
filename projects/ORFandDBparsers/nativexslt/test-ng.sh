#!/bin/sh

#perl nativexslt.pl -bt keyword -et keywordList -etf -ot o:__ORFANDDB__ \
#-xslt /usr/people/jmfernandez/projects/ORFandDB/analyzer/xml/UniProtKW.xst \
#-cmp gz -o biba.xml /drives/databases/UniProt/knowledgebase/docs/keydef.xml.gz

perl nativexslt-ng.pl -bt entry -et copyright -ot __ORFANDDB__ \
-xslt UniProt.xst -cmp bz2 -o bobo.xml unifake.xml.bz2

#perl nativexslt-ng.pl -bt entry -et copyright -ot __ORFANDDB__ \
#-xslt UniProt.xst -o bobo.xml unifake.xml

#!/bin/sh

#perl nativexslt.pl -bt keyword -et keywordList -etf -ot o:__ORFANDDB__ \
#-xslt /usr/people/jmfernandez/projects/ORFandDB/analyzer/xml/UniProtKW.xst \
#-cmp gz -o biba.xml /drives/databases/UniProt/knowledgebase/docs/keydef.xml.gz

perl nativexslt.pl -bt entry -et copyright -ot o:__ORFANDDB__ \
-xslt /usr/people/jmfernandez/projects/ORFandDB/analyzer/xml/UniProt.xst \
-cmp gz -o bobi.xml /drives/databases/UniProt/knowledgebase/uniprot_sprot.xml.gz

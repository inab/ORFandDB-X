#!/bin/sh

THEBASEDIR=$(dirname "$0")

if [ $# -lt 1 ] ; then
	cat 1>&2 <<EOF
This Sarissa update script needs at least one parameter:
either the new Sarissa revision to install or 'cvs'.
EOF
	exit 1
fi

THEREV="$1"

case "$THEBASEDIR" in
	/*)
		;;
	*)
		THEBASEDIR="${PWD}/${THEBASEDIR}"
		;;
esac

LOCALSARISSA="$THEBASEDIR"/widget/js/sarissa
SNAPSHOT=sarissa-snapshot

# Getting the latest copy!
rm -rf "$LOCALSARISSA"
svn update "$LOCALSARISSA"

rm -rf sarissa-snapshot
case "$THEREV" in
	cvs)
		if [ ! -d sarissa-cvs ] ; then
			cvs -d:pserver:anonymous@sarissa.cvs.sourceforge.net:/cvsroot/sarissa login <<EOF
EOF

			cvs -z3 -d:pserver:anonymous@sarissa.cvs.sourceforge.net:/cvsroot/sarissa co -d sarissa-cvs -P sarissa
		else
			cd sarissa-cvs
			cvs update
			cd ..
		fi

		cp -dprf sarissa-cvs "$SNAPSHOT"
		;;
	*)
		wget "http://prdownloads.sourceforge.net/sarissa/sarissa-full-${THEREV}.zip"
		mkdir -p sarissa-sf
		unzip "sarissa-full-${THEREV}.zip" -d sarissa-sf
		cp -dprf "sarissa-sf/sarissa-full-${THEREV}/gr/abiss/js/sarissa" "$SNAPSHOT"
		rm -rf sarissa-sf "sarissa-full-${THEREV}.zip"
		;;
esac
find "$SNAPSHOT" -name CVS -exec rm -rf {} \; >& /dev/null
find "$SNAPSHOT" -type f -name .cvsignore -exec rm -rf {} \; >& /dev/null
svn -R list "$LOCALSARISSA" | sed 's#/$##g' | sort > "${THEBASEDIR}"/sarissa-old.ls-R
find "$SNAPSHOT" | tail -n +2 | cut -d / -f 2- | sort > "${THEBASEDIR}"/sarissa-snapshot.ls-R
diff "${THEBASEDIR}"/sarissa-old.ls-R "${THEBASEDIR}"/"$SNAPSHOT".ls-R > "${THEBASEDIR}"/sarissa-ls-R.diff
cp -dprf "$SNAPSHOT"/* "$SNAPSHOT"/.[a-zA-Z]* "$LOCALSARISSA"

cd "$LOCALSARISSA"

addedfiles=$(grep '^> ' "$THEBASEDIR"/sarissa-ls-R.diff | cut -c 3-)
erasedfiles=$(grep '^< ' "$THEBASEDIR"/sarissa-ls-R.diff | cut -c 3-)

echo "Files to add:"
echo "$addedfiles"
echo
echo "Files to erase:"
echo "$erasedfiles"
echo

if [ -n "$addedfiles" ] ; then
	svn add $(grep '^> ' "$THEBASEDIR"/sarissa-ls-R.diff | cut -c 3-)
fi
if [ -n "$erasedfiles" ] ; then
	svn remove $(grep '^< ' "$THEBASEDIR"/sarissa-ls-R.diff | cut -c 3-)
fi
svn commit
cd "$THEBASEDIR"
rm -rf "$SNAPSHOT" sarissa-old.ls-R "$SNAPSHOT".ls-R sarissa-ls-R.diff

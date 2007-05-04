#!/bin/sh

THEBASEDIR=$(dirname "$0")

case "$THEBASEDIR" in
	/*)
		;;
	*)
		THEBASEDIR="${PWD}/${THEBASEDIR}"
		;;
esac

LOCALSARISSA="$THEBASEDIR"/widget/sarissa

# Getting the latest copy!
rm -rf "$LOCALSARISSA"
svn update "$LOCALSARISSA"

if [ ! -d sarissa-cvs ] ; then
	cvs -d:pserver:anonymous@sarissa.cvs.sourceforge.net:/cvsroot/sarissa login <<EOF
EOF

	cvs -z3 -d:pserver:anonymous@sarissa.cvs.sourceforge.net:/cvsroot/sarissa co -d sarissa-cvs -P sarissa
else
	cd sarissa-cvs
	cvs update
	cd ..
fi

rm -rf sarissa-snapshot
cp -dprf sarissa-cvs sarissa-snapshot
find sarissa-snapshot -name CVS -exec rm -rf {} \; >& /dev/null
find sarissa-snapshot -type f -name .cvsignore -exec rm -rf {} \; >& /dev/null
svn -R list "$LOCALSARISSA" | sed 's#/$##g' | sort > "${THEBASEDIR}"/sarissa-old.ls-R
find sarissa-snapshot | tail -n +2 | cut -d / -f 2- | sort > "${THEBASEDIR}"/sarissa-snapshot.ls-R
diff "${THEBASEDIR}"/sarissa-old.ls-R "${THEBASEDIR}"/sarissa-snapshot.ls-R > "${THEBASEDIR}"/sarissa-ls-R.diff
cp -dprf sarissa-snapshot/* sarissa-snapshot/.[a-zA-Z]* "$LOCALSARISSA"

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
rm -rf sarissa-snapshot sarissa-old.ls-R sarissa-snapshot.ls-R sarissa-ls-R.diff

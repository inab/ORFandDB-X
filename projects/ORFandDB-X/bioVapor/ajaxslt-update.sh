#!/bin/sh

THEBASEDIR=$(dirname "$0")

case "$THEBASEDIR" in
	/*)
		;;
	*)
		THEBASEDIR="${PWD}/${THEBASEDIR}"
		;;
esac

LOCALAJAXSLT="$THEBASEDIR"/widget/ajaxslt

# Getting the latest copy!
rm -rf "$LOCALAJAXSLT"
svn update "$LOCALAJAXSLT"

if [ ! -d ajaxslt-svn ] ; then
	svn checkout http://ajaxslt.googlecode.com/svn/trunk/ ajaxslt-svn
else
	svn update ajaxslt-svn
fi

rm -rf ajaxslt-snapshot
cp -dprf ajaxslt-svn ajaxslt-snapshot
find ajaxslt-snapshot -name .svn -exec rm -rf {} \; >& /dev/null
find ajaxslt-snapshot -type f -name .svnignore -exec rm -rf {} \; >& /dev/null
svn -R list ajaxslt | sed 's#/$##g' | sort > "$THEBASEDIR"/ajaxslt-old.ls-R
find ajaxslt-snapshot | tail -n +2 | cut -d / -f 2- | sort > "$THEBASEDIR"/ajaxslt-snapshot.ls-R
diff "$THEBASEDIR"/ajaxslt-old.ls-R "$THEBASEDIR"/ajaxslt-snapshot.ls-R > "$THEBASEDIR"/ajaxslt-ls-R.diff
cp -dprf ajaxslt-snapshot/* ajaxslt-snapshot/.[a-zA-Z]* "$LOCALAJAXSLT"

cd ajaxslt
addedfiles=$(grep '^> ' "$THEBASEDIR"/ajaxslt-ls-R.diff | cut -c 3-)
erasedfiles=$(grep '^< ' "$THEBASEDIR"/ajaxslt-ls-R.diff | cut -c 3-)

echo "Files to add:"
echo "$addedfiles"
echo
echo "Files to erase:"
echo "$erasedfiles"
echo

if [ -n "$addedfiles" ] ; then
	svn add $(grep '^> ' "$THEBASEDIR"/ajaxslt-ls-R.diff | cut -c 3-)
fi
if [ -n "$erasedfiles" ] ; then
	svn remove $(grep '^< ' "$THEBASEDIR"/ajaxslt-ls-R.diff | cut -c 3-)
fi
svn commit
cd "$THEBASEDIR"
rm -rf ajaxslt-snapshot ajaxslt-old.ls-R ajaxslt-snapshot.ls-R ajaxslt-ls-R.diff

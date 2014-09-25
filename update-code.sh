#!/bin/bash

if [ -z "$1" ]; then
	echo "usage: ./update-code.sh audit-log-hash"
	exit 1
fi

# Update the audit log repo to the indicated hash.

if ! (cd code-audit-log && git fetch && git checkout -q $1); then
	exit 2
fi

# Compile out the code to a new tag.
TAG=$(cd editor; nodejs editor/publish.js compile-code)
if [ ! $? ]; then
	echo $TAG
	exit 2
fi

# Check out that tag.
if ! (cd base-code; git checkout -q $TAG;) then
	exit 3
fi

# Push the tag. Using --force in case it already exists. Not the best,
# but we rewrite history in this repository anyway.
if ! (cd base-code; git push --force origin $TAG:$TAG;) then
	exit 3
fi

# Write the latest tag and its hash to a JSON file.
AUDIT_HASH_ABBREV=$(cd code-audit-log/; git log -n1 --format=format:%h $1)
TAG_HASH=$(cd base-code/; git log -n1 --format=format:%H $TAG)
TAG_HASH_ABBREV=$(cd base-code/; git log -n1 --format=format:%h $TAG)
TAG_DATE=$(cd base-code/; git log -n1 --format=format:%aD $TAG)
cat > public_html/latest.json <<EOF;
{
	"audit_hash": "$1",
	"audit_hash_abbrev": "$AUDIT_HASH_ABBREV",
	"tag": "$TAG",
	"code_hash": "$TAG_HASH",
	"code_hash_abbrev": "$TAG_HASH_ABBREV",
	"pub_date": "$TAG_DATE"
}
EOF


exit

# Run simple-generator on the tag.

(cd simple-generator/;
	nodejs make_index ../base-code;

	rm -rf new-current;
	export TEMPLATE=../code-template.html;
	nodejs index.js ../base-code/ new-current /current;
	)

# Clear temporary index files so they don't accidentally get committed.
(cd base-code;
	rm -rf by_title/ section_{,parents_,children_}index.json;
	)

# Fix permissions. Files must be readable by nginx and directories
# executable.
chmod -R a+r simple-generator/new-current/
find simple-generator/new-current/ -type d | xargs chmod a+x

# Swap the 'current' directory with the new files.

mv public_html/current old-current
mv simple-generator/new-current/ public_html/current
rm -rf old-current

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

# Run simple-generator on the tag.

(cd simple-generator/;
	nodejs make_index ../base-code;

	rm -rf new-current;
	export TEMPLATE=../code-template.html;
	nodejs index.js ../base-code/ new-current /current;
	)

# Fix permissions. Files must be readable by nginx and directories
# executable.
chmod -R a+r simple-generator/new-current/
find simple-generator/new-current/ -type d | xargs chmod a+x

# Swap the 'current' directory with the new files.

mv public_html/current old-current
mv simple-generator/new-current/ public_html/current
rm -rf old-current

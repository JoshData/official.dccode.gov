# For testing ONLY. Overwrites /current/index.html with
# a new rendering.

cd simple-generator/
export TEMPLATE=../code-template.html
nodejs index.js ../base-code ../public_html/current /current ^../base-code/index.xml

# This bash script sets up a new server to host this website.
# Run with sudo. But clone the repository in a place that
# is world-readable so nginx can access the static files.

apt-get install -y openssl

# Generated files are readable by root only.
umask 077

# SSL
#####

mkdir -p /etc/ssl/local

# Generate a new private key if one doesn't already exist.
# Set the umask so the key file is not world-readable.
if [ ! -f /etc/ssl/local/ssl_private_key.pem ]; then
	echo generating SSL private key...
	openssl genrsa -out /etc/ssl/local/ssl_private_key.pem 2048
fi

# Generate a certificate signing request if one doesn't already exist.
if [ ! -f /etc/ssl/local/ssl_cert_sign_req.csr ]; then
	openssl req -new \
		-key /etc/ssl/local/ssl_private_key.pem \
		-out /etc/ssl/local/ssl_cert_sign_req.csr \
	  	-sha256 \
	  	-subj "/C=US/ST=DC/L=Washington/O=Council of the District of Columbia/CN=official.dccode.gov"
fi

# Generate a SSL certificate by self-signing if a SSL certificate doesn't yet exist.
if [ ! -f /etc/ssl/local/ssl_certificate.pem ]; then
	echo generating self-signed certificate...
	openssl x509 -req -days 365 \
	  -in /etc/ssl/local/ssl_cert_sign_req.csr \
	  -signkey /etc/ssl/local/ssl_private_key.pem \
	  -out /etc/ssl/local/ssl_certificate.pem
fi

# Pre-generate a 2048 bit random parameter for DH elliptic curves.
if [ ! -f /etc/ssl/local/dhparam.pem ]; then
	echo generating DHEC parameters...
	openssl dhparam \
		-outform pem \
		-out /etc/ssl/local/dhparam.pem \
		2048
fi

# NGINX

apt-get install -y nginx

cp conf/nginx.conf /etc/nginx/sites-enabled/default
cp conf/nginx-ssl.conf /etc/nginx/
sed -i "s#PUBLIC_HTML_DIRECTORY#`pwd`/public_html#" /etc/nginx/sites-enabled/default 

service nginx restart

# make the public files readable by nginx
chmod a+x .. . public_html public_html/static
chmod -R a+r public_html

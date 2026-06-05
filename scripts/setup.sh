#!/bin/bash
DOMAIN="api-mahasiswa-4c.rifkiaja.my.id"
EMAIL="mhs4c@yasudah.com"
DATA_PATH="data"
NGINX_CONF_DIR="docker/nginx"

echo "Setup laravel docker production environment"

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

#######################
# SETUP ENV
#######################
if [ ! -f .env ]; then
    echo "Copying environment file..."
    cp .env.example .env
    sed -i 's/# DB_DATABASE=/DB_DATABASE=app/' .env
    sed -i 's/# DB_USERNAME=/DB_USERNAME=laravel/' .env
    sed -i 's/# DB_PASSWORD=/DB_PASSWORD=secret/' .env
else
    echo ".env file already exists. Skipping copy."
fi

##########################
# ISSUE CERTIFICATE FOR SSL
###########################
echo "Issue Certificate for SSL..."
cp $NGINX_CONF_DIR/default.base.conf $NGINX_CONF_DIR/default.prod.conf

docker compose -f docker-compose.yml up nginx -d

sleep 3

docker compose -f docker-compose.yml run --rm certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive

if [ -d "$DATA_PATH/live/$DOMAIN" ]; then
    echo "execute HTTPS Config Nginx"
    cp $NGINX_CONF_DIR/default.https.conf $NGINX_CONF_DIR/default.prod.conf
else
    echo "[ERROR] Failed to issue certificate"
    exit 1
fi

#######################
# START ALL CONTAINERS
#######################
echo "Starting Docker containers..."
docker compose -f docker-compose.yml up -d

docker compose -f docker-compose.yml exec nginx nginx -s reload

echo -n "Waiting for services to initialize."
until docker compose -f docker-compose.yml exec -T mysql mysqladmin ping -h"127.0.0.1" --silent; do
    echo -n "."
    sleep 2
done
echo -e "\nDatabase is ready to accept connections!"


###########################################
# SETUP LARAVEL APP KEY, MIGRATION, SEEDERS
###########################################
if ! grep -q "APP_KEY=base64:" .env; then
    echo "Generating application key..."
    docker compose -f docker-compose.yml exec php php artisan key:generate
fi

echo "Running database migrations"
docker compose -f docker-compose.yml exec php php artisan migrate --force


echo "Optimizing Laravel..."
docker compose -f docker-compose.yml exec php php artisan config:clear
docker compose -f docker-compose.yml exec php php artisan cache:clear
docker compose -f docker-compose.yml exec php php artisan route:clear
docker compose -f docker-compose.yml exec php php artisan view:clear

echo "Setup complete!"
echo "Your application is running at: https://$DOMAIN:9003"
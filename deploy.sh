./build.sh

# copy deployment package to server
rsync -a -e 'ssh -o "IdentitiesOnly=yes" -i ~/.ssh/digitalocean' $(pwd)/tmp/build zach@144.126.223.221:/home/zach/sites/blog
echo "Deployment package copied to server"

ssh -o "IdentitiesOnly=yes" -i ~/.ssh/digitalocean zach@144.126.223.221 << 'EOF'
sudo systemctl restart blog
sudo nginx -s reload
EOF
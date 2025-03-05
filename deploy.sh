./build.sh

build_dir="./tmp/build"
cert="~/.ssh/digital-ocean-key"
user="zach"
ip="143.244.177.175"
app_dir="/home/zach/sites/my-app"  
options="IdentitiesOnly=yes" 

# copy deployment package to server
rsync -a -e "ssh -o $options -i $cert" \
     "$build_dir" \
     $user@$ip:$app_dir

echo "Deployment finished"

# restart the service and nginx
# ssh -o "IdentitiesOnly=yes" -i $cert $user@$ip << 'EOF'
# sudo systemctl restart my-app
# sudo nginx -s reload
# EOF
# echo "Service restarted"
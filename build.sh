mkdir -p tmp/build/frontend/build

GOOS=linux GOARCH=amd64 go build \
    -o ./tmp/build/app \
    ./cmd/main.go

cp .env ./tmp/build/.env

npm run build
npm run tw-build

cp ./frontend/index.html ./tmp/build/frontend/index.html
cp ./frontend/build/App.js ./tmp/build/frontend/build/App.js
cp ./frontend/build/style.css ./tmp/build/frontend/build/style.css
cp ./frontend/build/SBLBibLit.ttf ./tmp/build/frontend/build/SBLBibLit.ttf


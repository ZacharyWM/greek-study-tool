mkdir -p tmp/build/frontend/build

GOOS=linux GOARCH=amd64 go build \
    -o ./tmp/build/app \
    ./cmd/main.go
npm run build

cp ./frontend/index.html \
    ./tmp/build/frontend/index.html

cp ./frontend/build/App.js \
    ./tmp/build/frontend/build/App.js

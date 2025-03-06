# Biblical Greek study tool built with Go and React.

The backend is a Go web server that serves up static html and javascript files.

The front end is a React app that gets compiled into a single javascript file.

# Running the app locally:

## Environment set up

Install the Go programming language.
For backend live reloading, install `air` with `go install github.com/air-verse/air@latest`.
Install `npm` for the front end.
Run `npm install`.
Run `npm run tw-build` to build the Tailwind styles.

### To run the Go server:

Run the server with the `air` command.

### To run the front end:

Run the front end with `npm run dev`
If you make any style change, run `npm run tw-build` again - TODO: configure to live-reload

# nebree8.com

An app with a Go/Appengine backend and Angular Material frontend.

## Dependencies / Tools

- [Go Appengine SDK](https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Go)
- typescript: npm install -g typescript

For deployment only:

- ng-annotate: npm install -g ng-annotate
- uglify: npm install -g uglify

## Running locally

`dev_appengine.py` is part of the Go AppEngine SDK. `tsc` is the typescript compiler.

```bash
rm -rf deploy/
dev_appengine.py .
tsc -w  # Continuously recompile typescript files.
# View at http://localhost:8080
```

## Deploying to AppEngine

`appcfg.py` is part of the Go AppEngine SDK.

```bash
make
appcfg.py update deploy
```

## Backend

Implemented in /nebree8.go, provides a straightforward CRUD api rooted at /api/.
A mapping from URL to Go function is in the "init" function.

## Frontend

Implemented in /static, largely follows the layout of the Angular Seed app.

- app.html: sources CSS, JS, and has an ng-view and ng-app
- app.css: app-wide CSS (most of the styling is from Angular material, so not much here)
- app.js: configures the nebree8App app.
- random-drinks.js: pure javascript implementation of generating random drinks.
- drink-list/\*: template and controller for the list of drinks
- drink-detail/\*: template and controllers for the page showing the details of a drink.

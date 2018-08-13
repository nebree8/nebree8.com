# nebree8.com

An app with a Go/Appengine backend and Angular Material frontend.

## Dependencies / Tools

- [Go Appengine SDK](https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Go)
- npm install

## Running locally

`dev_appserver.py` is part of the Go AppEngine SDK. `tsc` is the typescript compiler.

```bash
rm -rf deploy/
dev_appserver.py app.yaml
npm run tsc # Compile typescript once, or...
npm run tsc-w # Watch for changes to and automatically recompile.
# View at http://localhost:8080
```

## Deployment checklist

* Update recipes and featured list
* `make` to build the minified sources for deployment in `deploy/`
* Do a quick verification of contents of deploy with `dev_appserver.py deploy/app.yaml`
* Deploy to appengine using `gcloud app deploy --project nebree8 deploy/`
* Load http://nebree8.com and check list of excluded recipes in the Chrome console
* Configure ingredients on frontend and backend
* Run backend with `--frontend=http://nebree8.com` (not default) and `--check_ingredients` (the default) to check consistency
* In case of bugs, revert serving version at [console.cloud.google.com](https://console.cloud.google.com/appengine/versions?project=nebree8&serviceId=default)

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

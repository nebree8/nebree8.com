# nebree8.com

An app with a Go/Appengine backend and Angular Material frontend.

## Dependencies / Tools

- [Go Appengine SDK](https://cloud.google.com/appengine/downloads#Google_App_Engine_SDK_for_Go)
- npm install

## Running locally


```bash
dev_appserver.py app.yaml
npm run build  # Build/minify typescript, css, copy html to public/ once.
npm run watch # Watch for changes and automatically rebuild
# View at http://localhost:8080
```
`dev_appserver.py` is part of the Go AppEngine SDK.

## Deployment checklist

* Update recipes and featured list
* Do a quick manual test using `dev_appserver.py`
* Deploy to appengine using `gcloud app deploy --project nebree8 app.yaml`
* Load http://nebree8.com and check list of excluded recipes in the Chrome console
* Configure ingredients on frontend and backend
* Run backend with `--frontend=http://nebree8.com` (not default) and `--check_ingredients` (the default) to check consistency
* In case of bugs, revert serving version at [console.cloud.google.com](https://console.cloud.google.com/appengine/versions?project=nebree8&serviceId=default)

## Backend

Implemented in /nebree8.go, provides a straightforward CRUD api rooted at /api/.
A mapping from URL to Go function is in the "init" function.

## Frontend

Implemented in /ng-app, largely follows the layout of the Angular Seed app.

- public/app.html: sources CSS, JS, and has an ng-view and ng-app
- public/admin.htm: alternate app for admin
- ng-app/app.css: app-wide CSS (most of the styling is from Angular material, so not much here)
- ng-app/app.ts: configures the nebree8App app.
- ng-app/*: each directory is a component. See .ts for more information.

Files in ng-app are transformed and copied to public/ by gulp. Run gulp once
using `npm run build`, or to watch and incrementally build use `npm run watch`.

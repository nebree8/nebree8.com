# nebree8.com

An app with a Go/Appengine backend and Angular Material frontend.

## Backend

Implemented in /nebree8.go, provides a straightforward CRUD api rooted at /api/.

## Frontend

Implemented in /static, largely follows the layout of the Angular Seed app.

- app.html: sources CSS, JS, and has an ng-view and ng-app
- app.css: app-wide CSS (most of the styling is from Angular material, so not much here)
- app.js: configures the nebree8App app.
- random-drinks.js: pure javascript implementation of generating random drinks.
- drink-list/*: template and controller for the list of drinks
- drink-detail/*: template and controllers for the page showing the details of a drink.

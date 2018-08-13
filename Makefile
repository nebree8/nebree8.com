.PHONY: deploy
deploy:
	rm -rf deploy/
	#(cd static; make)
	$$(npm bin)/tsc
	mkdir -p deploy/static
	cp app.yaml index.yaml *.go deploy/
	cp -R static/all_drinks static/icons static/thumbs \
		deploy/static/
	$$(npm bin)/uglifycss static/app.css > deploy/static/app.css
	$$(npm bin)/ng-annotate -a static/compiled.js > static/compiled.annotated.js
	$$(npm bin)/uglifyjs static/compiled.annotated.js -o deploy/static/compiled.js
	for html in $$(find static -name '*.html'); do \
		mkdir -p deploy/$$(dirname $$html); cp $$html deploy/$$html; \
	done

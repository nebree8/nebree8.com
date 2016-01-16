CC="java -jar /home/sagarm/.bin/closure-compiler.jar"
.PHONY: deploy
deploy:
	rm -rf deploy/
	#(cd static; make)
	tsc
	mkdir -p deploy/static
	cp app.yaml index.yaml *.go deploy/
	cp -R static/*.html static/compiled.js static/app.css static/all_drinks \
		static/icons static/thumbs \
		deploy/static/
	ng-annotate -a static/compiled.js > static/compiled.annotated.js
	uglify -s static/compiled.annotated.js -o deploy/static/compiled.js
	for html in $$(find static -name '*.html'); do \
		mkdir -p deploy/$$(dirname $$html); cp $$html deploy/$$html; \
	done

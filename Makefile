.PHONY: deploy
deploy:
	rm -r deploy/
	(cd static; make)
	mkdir -p deploy/static
	cp app.yaml *.go deploy/
	cp -R static/*.html static/compiled.js static/app.css static/all_drinks \
		static/icons static/thumbs \
		deploy/static/
	for html in $$(find static -name '*.html'); do \
		mkdir -p deploy/$$(dirname $$html); cp $$html deploy/$$html; \
	done

JS_SRCS := app.js $(shell find . -mindepth 2 -name '*.js' -not -wholename '*extern*')
EXTERNS := $(shell ls ./externs/*.js)
CLOSURE_COMPILER = /home/sagarm/.bin/closure-compiler
OUTPUT_WRAPPER := %output%\\n//\# sourceMappingURL=source-map

.PHONY: compiled.js

compiled.js: $(JS_SRCS) $(EXTERNS)
	ARGS=""; for f in $(JS_SRCS); do \
		ARGS="$${ARGS} --js=$$f"; \
	done; \
	for f in $(EXTERNS); do \
		ARGS="$${ARGS} --externs=$$f"; \
	done; \
	$(CLOSURE_COMPILER) \
			--angular_pass \
			--generate_exports \
			--export_local_property_definitions \
			--compilation_level=ADVANCED_OPTIMIZATIONS \
			--create_source_map ./source-map \
			--js=../closure-library/closure/goog/base.js \
			--js_output_file $@ $$ARGS
	echo '//# sourceMappingURL=source-map' >> $@

# Old-fashion Makefile
# use this script to generate final uglified files.

TS_COMPILER = tsc
TS_FILES = $(wildcard src/*.ts)

OUT_FULL = dest/MarkdownIME.js
OUT_UGLIFIED = dest/MarkdownIME.min.js

UGLIFY = uglifyjs

.PHONY: all clean

all: MarkdownIME.js $(OUT_FULL) $(OUT_UGLIFIED)

clean:
	-rm -rf dest
	-rm MarkdownIME.js

# uglified js for production usage
MarkdownIME.js: $(OUT_UGLIFIED)
	cp $(OUT_UGLIFIED) MarkdownIME.js

$(OUT_FULL): $(TS_FILES) tsconfig.json
	$(TS_COMPILER)

$(OUT_UGLIFIED): $(OUT_FULL)
	-cat $(OUT_FULL)|grep -v console\.|$(UGLIFY) --comments -o $(OUT_UGLIFIED)

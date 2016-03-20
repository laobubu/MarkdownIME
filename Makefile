# Old-fashion Makefile
# use this script to generate final uglified files.

TS_COMPILER = tsc
TS_FILES = $(wildcard src/*.ts)

OUT_FULL = dist/MarkdownIME.js
OUT_UGLIFIED = dist/MarkdownIME.min.js

UGLIFY = uglifyjs

.PHONY: all clean

all: $(OUT_FULL) $(OUT_UGLIFIED)

clean:
	-rm -rf dist

$(OUT_FULL): $(TS_FILES) tsconfig.json
	$(TS_COMPILER)

$(OUT_UGLIFIED): $(OUT_FULL)
	$(UGLIFY) $(OUT_FULL) --compress drop_console=true --mangle --comments -o $(OUT_UGLIFIED)

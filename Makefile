# Old-fashion Makefile

TS_COMPILER = tsc
TS_FILES = $(wildcard src/*.ts)

OUT_FULL = dest/MarkdownIME.js
OUT_UGLIFIED = dest/MarkdownIME.min.js

UGLIFY = uglifyjs

.PHONY: all clean

all: MarkdownIME.js $(OUT_FULL) $(OUT_UGLIFIED)

clean:
	rm MarkdownIME.js MarkdownIME.min.js

# uglified js for production usage
MarkdownIME.js: $(OUT_UGLIFIED)
	cp $(OUT_UGLIFIED) MarkdownIME.js

$(OUT_FULL): $(TS_FILES)
	$(TS_COMPILER) --out $(OUT_FULL) $(TS_FILES)

$(OUT_UGLIFIED): $(OUT_FULL)
	-cat $(OUT_FULL)|grep -v console\.|$(UGLIFY) --comments -o $(OUT_UGLIFIED)

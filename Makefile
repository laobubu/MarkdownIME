# Old-fashion Makefile

TS_COMPILER = tsc
TS_FILES = $(wildcard *.ts)

UGLIFY = uglifyjs

.PHONY: all clean

all: MarkdownIME.js MarkdownIME.min.js

clean:
	rm MarkdownIME.js MarkdownIME.min.js

MarkdownIME.js: $(TS_FILES)
	$(TS_COMPILER) --out MarkdownIME.js $(TS_FILES)
	
MarkdownIME.min.js: MarkdownIME.js
	-cat MarkdownIME.js|grep -v console\.|$(UGLIFY) --comments -o MarkdownIME.min.js

# Old-fashion Makefile

TS_COMPILER = tsc
TS_FILES = $(wildcard *.ts)

MarkdownIME.js: $(TS_FILES)
	$(TS_COMPILER) --out MarkdownIME.js $(TS_FILES)
	
all: MarkdownIME.js

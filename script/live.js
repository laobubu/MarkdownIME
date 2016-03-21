#!/usr/bin/env Node

var bs = require('browser-sync').create();
var spawn = require('child_process').spawn;
var opn = require('opn');

bs.init({
    server: true,
    open: false,
    watchOptions: {
        ignoreInitial: true,
        ignored: '*.ts'
    }
}, function() {
    var url = 'http://localhost:' + bs.getOption('port') + "/test/index.html";
    opn(url);
});

function tsOut(data) {
    var d2 = '' + data;
    const TAG = '\x1b[2m[TS]\x1b[0m ';
    console.log(TAG + d2.trim().replace(/[\r\n]+/g, '\n' + TAG));
}

var isWindows = /^win/i.test(process.platform);
var tsc = isWindows ? 'tsc.cmd' : 'tsc';
var proc = spawn(tsc, ['-w']);
proc.stdout.on('data', tsOut);
proc.stderr.on('data', tsOut);

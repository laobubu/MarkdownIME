/**
 * PhantomJS bootstrap.
 * 
 * Make sure you have installed phantomjs. Execute this script via `npm test`
 */

/// <reference path="../typings/phantomjs/phantomjs.d.ts" />
/// <reference path="../typings/qunit/qunit.d.ts" />

'use strict';

if (typeof phantom === "undefined") {

    var connect = require('connect');
    var serveStatic = require('serve-static');

    var app = connect();
    app.use(serveStatic('.', { 'index': ['index.html'] }));
    app.listen(6041);
    
    console.log('=== MarkdownIME PhantomJS Runner ===')
    console.log('Server loaded on http://localhost:6041');

    var child = require('child_process').exec('phantomjs ' + __filename);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', function(status) {
        process.exit(status);
    })

} else (function() {

    var url = "http://localhost:6041/test/index.html";
    var page = require('webpage').create();
    var timeout = 5000;

    page.onConsoleMessage = function(msg) { console.log(msg); };
    page.onInitialized = function() { page.evaluate(addLogging); };
    page.onCallback = function(message) {
        var result;
        if (message) {
            if (message.name === 'QUnit.done') {
                result = message.data;
                exit(result.failed ? 1 : 0);
            }
        }
    };

    page.open(url, function(status) {
        if (status !== 'success') {
            console.error('Unable to access network: ' + status);
            exit(1);
        } else {
            setTimeout(function() {
                console.error('Timeout: ' + timeout + 'ms. Aborting...');
                exit(1);
            }, timeout);
        }
    });

    function addLogging() {
        document.addEventListener('DOMContentLoaded', function() {
            var currentTestAssertions = [];

            QUnit.log(function(details) {
                var response;

                // Ignore passing assertions
                if (details.result) return;

                response = details.message || '';
                if (response) response += '\n';
                response += '\x1b[0m';

                if (typeof details.expected !== 'undefined') {
                    response +=
                        '   expect: ' + details.expected + '\n' +
                        '      got: ' + details.actual + '\n';
                }

                if (details.source) {
                    response +=
                        '   source: ' + details.source + '\n';
                }

                currentTestAssertions.push('\x1b[31m * ' + response);
            });

            QUnit.testDone(function(result) {
                var name = '';
                if (result.module) name = result.module + ': ';
                name += result.name;

                if (result.failed) {
                    console.log('\x1b[31m[X]\x1b[0mFailed on ' + name);

                    for (var i = 0, len = currentTestAssertions.length; i < len; i++) {
                        console.log(currentTestAssertions[i]);
                    }
                }

                currentTestAssertions.length = 0;
            });

            QUnit.done(function(result) {
                console.log('Took ' + result.runtime + 'ms to run ' + result.total + ' tests. ' + result.passed + ' passed, ' + result.failed + ' failed.');

                window.callPhantom({
                    'name': 'QUnit.done',
                    'data': result
                });
            });
        }, false);
    }

    function exit(code) {
        if (page) page.close();
        setTimeout(function() { phantom.exit(code) }, 0);
    }
})();

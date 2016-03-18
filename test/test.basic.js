/// <reference path="../typings/qunit/qunit.d.ts" />

QUnit.module("Basic");
QUnit.test("hello", function(assert) {
    assert.equal(1, 1);
})
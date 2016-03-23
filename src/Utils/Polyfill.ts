/**
 * scrollIntoViewIfNeeded
 * 
 * A Webkit stuff, but it works like a charm!
 */

declare interface Element { scrollIntoViewIfNeeded(centerIfNeeded?: boolean); }

if (!Element.prototype['scrollIntoViewIfNeeded']) {
    Element.prototype['scrollIntoViewIfNeeded'] = function() {
        var wh = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight,
            rect = this.getBoundingClientRect();
        if (rect.bottom > wh || rect.top < 0) this.scrollIntoView()
    };
}

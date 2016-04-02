var $toc = $('#toc');
var $tocTarget = $('.toc-source');

(function makeTOC() {
    var titles = $tocTarget.children('h1,h2,h3,h4,h5');
    titles.each(function(i, ele) {
        var anchor = document.createElement('a');
        anchor.name = (ele.textContent);
        ele.insertBefore(anchor, ele.firstChild);

        var link = document.createElement('a');
        link.textContent = ele.textContent;
        link.href = '#' + encodeURIComponent(anchor.name)
        link.style.marginLeft = (1 * (ele.nodeName.substr(1) - 2)) + 'em';

        $toc.append(link);
    })

    var $window = $(window);
    $window.scroll(function() {
        $toc.css({ top: Math.max($tocTarget.offset().top - $window.scrollTop(), 0) + 'px' });
    }).scroll();
})();

// a tweak to scroll smooth for bookmarks

function smoothGo(ev) {
    var name = decodeURIComponent(this.getAttribute("href").substr(1));
    if (history.pushState) {
        history.pushState(null, name, this.getAttribute("href"));
        ev.preventDefault();
    }
    var t = $(document.getElementsByName(name)[0]);
    var pos = t.offset().top;
    $("html, body").animate({ scrollTop: pos + 'px' }, 500);
}

document.body.addEventListener('click', function(ev) {
    var e = ev.target;
    if (!e || e.nodeName !== 'A') return;
    if ((e.getAttribute("href") || "").indexOf('#') !== 0) return;
    smoothGo.call(e, ev);
}, true);

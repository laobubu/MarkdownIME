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
        $toc.css({ top: Math.max(parent.offset().top - $window.scrollTop(), 0) + 'px' });
    })
})();

var $toc = $('#toc');

(function makeTOC(parent) {
	var titles = $(parent).children('h1,h2,h3,h4,h5');
	titles.each(function(i,ele){
		var anchor = document.createElement('a');
		anchor.name = (ele.textContent);
		ele.insertBefore(anchor, ele.firstChild);
		
		var link = document.createElement('a');
		link.textContent = ele.textContent;
		link.href = '#' + encodeURIComponent(anchor.name)
		link.style.marginLeft = (1 * (ele.nodeName.substr(1) - 2)) + 'em';
		
		$toc.append(link);
	})
})('.toc-source');

$(window).scroll(function(){
    $toc.css({top: Math.max(document.getElementById('s2').offsetTop-wst,0) + 'px'});
})

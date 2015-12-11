/// <reference path="Utils.ts" />

namespace MarkdownIME.UI{
	export class Toast {
		static SHORT : number = 800;
		static LONG : number = 2000;
		
		disappearing : boolean = false;
		element : HTMLDivElement;
		timeout : number = 300;
		style : string = 
		`
		position: absolute; 
		font-size: 10pt; 
		color: #363; 
		border: 1px solid #363; 
		background: #CFC; 
		padding: 2pt 5pt; 
		border-radius: 0 0 5pt 0; 
		z-index: 32760; 
		transition: .3s ease; 
		opacity: 0; 
		`;
		
		constructor(element : HTMLDivElement, timeout : number) {
			this.element = element;
			this.timeout = timeout;
		}
		
		public show() { 
			requestAnimationFrame((function(){
				var dismiss = this.dismiss.bind(this);
				this.element.style.opacity = '1';
				this.element.addEventListener('mousemove', dismiss, false);
				if (this.timeout) 
					setTimeout(dismiss, this.timeout);
			}).bind(this));
		}
		
		public dismiss() {
			if (this.disappearing) return;
			this.disappearing = true;
			this.element.style.opacity = '0';
			setTimeout((function() {
				this.element.parentNode.removeChild(this.element);
			}).bind(this), 300);
		}
		
		public static makeToast(text : string, coveron : HTMLElement, timeout : number = 0) : Toast {
			var document = coveron.ownerDocument || (coveron['createElement'] && coveron) || document;
			var container = coveron.parentNode || (coveron['createElement'] && coveron['body']);
			
			var toast_div : HTMLDivElement = document.createElement("div");
			var toast = new Toast(toast_div, timeout);
			
			toast_div.setAttribute("style", toast.style);
			toast_div.textContent = text;
			toast_div.style.left = (coveron.offsetLeft || 0) + 'px';
			toast_div.style.top  = (coveron.offsetTop  || 0) + 'px';
			
			container.appendChild(toast_div);
			
			return toast;
		}
	}
}

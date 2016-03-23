namespace MarkdownIME.UI {
    export enum ToastStatus {
        Hidden,
        Shown,
        Hiding
    };

    /**
     * Tooltip Box, or a Toast on Android.
     * 
     * Providing a static method `showToast(text, coveron[, timeout])`, or you can construct one and control its visibility.
     */
    export class Toast {
        static SHORT: number = 1500;
        static LONG: number = 3500;

        static style: string =
        `
position: absolute;
font-family: sans-serif;
padding: 5px 10px;
background: #e4F68F;
font-size: 10pt;
line-height: 1.4em;
color: #000;
z-index: 32760;
margin-top: -10px;
transition: .2s ease;
opacity: 0;
`;

        document: Document;
        element: HTMLDivElement;
        status: ToastStatus = ToastStatus.Hidden;

        constructor(document: Document, text: string) {
            this.document = document;

            var ele = document.createElement("div");
            ele.setAttribute("style", Toast.style);
            ele.textContent = text;
            ele.addEventListener('mousedown', this.dismiss.bind(this), false);

            this.element = ele;
        }

        setPosition(left: number, topOrBottom: number, isBottom?: boolean) {
            var ele = this.element;
            ele.style.left = left + 'px';
            ele.style.top = isBottom && 'initial' || (topOrBottom + 'px');
            ele.style.bottom = isBottom && (topOrBottom + 'px') || 'initial';
        }

        show(timeout?: number) {
            var ele = this.element;
            var dismiss = this.dismiss.bind(this);
            if (!ele.parentElement)
                this.document.body.appendChild(ele);

            setTimeout(() => {
                this.status = ToastStatus.Shown;
                ele.style.opacity = '1';
                ele.style.marginTop = '0';
                if (timeout) setTimeout(dismiss, timeout);
            }, 10);
        }

        dismiss() {
            if (this.status !== ToastStatus.Shown) return;

            this.status = ToastStatus.Hiding;
            var ele = this.element;
            ele.style.opacity = '0';
            ele.style.marginTop = '-10px';

            setTimeout(() => {
                ele.parentNode.removeChild(ele);
                this.status = ToastStatus.Hidden;
            }, 300);
        }

        /** 
         * A Quick way to show a temporary Toast over an Element.
         * 
         * @param {string} text     message to be shown
         * @param {Element} ref     the location reference
         * @param {number} timeout  time in ms. 0 = do not dismiss.
         * @param {boolean} cover   true = cover on the ref. false = shown on top of the ref.
         */
        static showToast(text: string, ref: HTMLElement, timeout: number, cover?: boolean): Toast {
            var document: Document = ref.ownerDocument;

            var rect = ref['getBoundingClientRect'] && ref.getBoundingClientRect() || { left: 0, top: 0 };
            var toast = new Toast(document, text);

            rect.left += document.body.scrollLeft;
            rect.top += document.body.scrollTop;
            toast.setPosition(rect.left, rect.top, !cover);

            toast.show(timeout);

            return toast;
        }
    }
}

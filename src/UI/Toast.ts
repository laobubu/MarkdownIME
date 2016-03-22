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

            this.element = ele;
        }

        show(x: string, y: string, timeout?: number) {
            var ele = this.element;
            var dismiss = this.dismiss.bind(this);
            if (!ele.parentElement)
                this.document.body.appendChild(ele);

            ele.style.left = x;
            ele.style.top = y;
            ele.addEventListener('mousemove', dismiss, false);

            setTimeout(() => {
                this.status = ToastStatus.Shown;
                ele.style.opacity = '1';
                if (timeout) setTimeout(dismiss, timeout);
            }, 10);
        }

        dismiss() {
            if (this.status !== ToastStatus.Shown) return;

            this.status = ToastStatus.Hiding;
            this.element.style.opacity = '0';

            setTimeout(() => {
                this.element.parentNode.removeChild(this.element);
                this.status = ToastStatus.Hidden;
            }, 300);
        }

        /** A Quick way to show a temporary Toast over an Element. */
        static showToast(text: string, coveron: HTMLElement, timeout?: number): Toast {
            var document: Document = coveron.ownerDocument;

            var rect = coveron['getBoundingClientRect'] && coveron.getBoundingClientRect() || { left: 0, top: 0 };
            var toast = new Toast(document, text);

            toast.show(
                rect.left + 'px',
                rect.top + 'px',
                timeout || Toast.SHORT
            );

            return toast;
        }
    }
}

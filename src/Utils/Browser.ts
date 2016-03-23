/// <reference path="Polyfill.ts" />
/// <reference path="DOM.ts" />

namespace MarkdownIME.Utils {
    /** Move the cursor to the end of one element. */
    export function move_cursor_to_end(ele: Node) {
        var document = ele.ownerDocument;
        var selection = document.defaultView.getSelection();
        var range = document.createRange();
        var focusNode = ele;

        while (focusNode.nodeType === Node.ELEMENT_NODE) {
            //find the last non-autoClose child element node, or child text node
            let i = focusNode.childNodes.length;
            while (--i !== -1) {
                let c = focusNode.childNodes[i];
                if (
                    (c.nodeType === Node.TEXT_NODE) ||
                    (c.nodeType === Node.ELEMENT_NODE)
                ) {
                    focusNode = c;
                    break;
                }
            }
            if (i === -1) {
                break; //not found...
            }
        }

        if (Pattern.NodeName.autoClose.test(focusNode.nodeName))
            range.selectNode(focusNode);
        else
            range.selectNodeContents(focusNode);
        range.collapse(focusNode.nodeName === "BR");

        selection.removeAllRanges();
        selection.addRange(range);

        focusNode.parentElement && focusNode.parentElement.scrollIntoViewIfNeeded(true);
    }
}

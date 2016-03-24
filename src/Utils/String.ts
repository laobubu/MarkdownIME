namespace MarkdownIME.Utils {

    /** dict for text2html(string) */
    const _text2html_dict = {
        '&': '&amp;',
        '  ': '&nbsp;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;'
    }

    /** convert some chars to HTML entities (`&` -> `&amp;`) */
    export function text2html(text: string): string {
        return text.replace(/(&|  |"|\<|\>)/g, (name) => _text2html_dict[name])
    }

    /** add slash chars for a RegExp */
    export function text2regex(text: string): string {
        return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    /** dict for html_entity_decode(string) */
    const _html_entity_decode_dict = {
        'nbsp': String.fromCharCode(160),
        'amp': '&',
        'quot': '"',
        'lt': '<',
        'gt': '>'
    }

    /** convert HTML entities to chars */
    export function html_entity_decode(html: string): string {
        return html.replace(/&(nbsp|amp|quot|lt|gt);/g, (whole, name) => _html_entity_decode_dict[name])
    }

    /** remove whitespace in the DOM text. works for textNode. */
    export function trim(str: string): string {
        return str.replace(/[\t\r\n ]+/, ' ').trim();
    }
}

namespace MarkdownIME.Utils {
    /** convert some chars to HTML entities (`&` -> `&amp;`) */
    export function text2html(text: string): string {
        return text.replace(/(&|  |"|\<|\>)/g, (name) => _text2html_dict[name])
    }
    const _text2html_dict = {
        '&': '&amp;',
        '  ': '&nbsp;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;'
    }

    /** add slash chars for a RegExp */
    export function text2regex(text: string): string {
        return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    /** convert HTML entities to chars */
    export function html_entity_decode(html: string): string {
        return html.replace(/&(nbsp|amp|quot|lt|gt);/g, (whole, name) => _html_entity_decode_dict[name])
    }
    const _html_entity_decode_dict = {
        'nbsp': String.fromCharCode(160),
        'amp': '&',
        'quot': '"',
        'lt': '<',
        'gt': '>'
    }

    /** remove whitespace in the DOM text. works for textNode. */
    export function trim(str: string): string {
        return str.replace(/[\t\r\n ]+/, ' ').trim();
    }
}

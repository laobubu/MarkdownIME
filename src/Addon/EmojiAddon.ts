/// <reference path="../Renderer/InlineRenderer.ts" />

declare var twemoji : {parse(text:string, ...args:any[]):string};

namespace MarkdownIME.Addon {
	/**
	 * EmojiAddon is an add-on for InlineRenderer, translating `8-)` into ![😎](https://twemoji.maxcdn.com/36x36/1f60e.png)
	 * Part of the code comes from `markdown-it/markdown-it-emoji`
	 * 
	 * @see https://github.com/markdown-it/markdown-it-emoji/
	 */
	export class EmojiAddon implements MarkdownIME.Renderer.IInlineRendererReplacement {

		name = "Emoji";

		use_shortcuts: boolean = true;
		
		/** use twemoji to get `img` tags if possible. if it bothers, disable it. */
		use_twemoji: boolean = true;
		twemoji_config = {};

		method(text: string): string {
			text = text.replace(this.full_syntax, this.magic1.bind(this));
			if (this.use_shortcuts) {
				for (let name in this.shortcuts) {
					text = this.magic2(text, name);
				}
			}
			if (this.use_twemoji && typeof twemoji != "undefined") {
				text = twemoji.parse(text, this.twemoji_config);
			}
			return text;
		}

		full_syntax = /:(\w+):/g;
		
		/** magic1 translates `:name:` into proper emoji char */
		magic1(fulltext: string, name: string): string {
			return this.chars[name] || fulltext;
		}
		
		/** magic2 proccess shortcuts for a emoji */
		magic2(text: string, name: string) {
			var t: any[] = this.shortcuts[name];
			var c = this.chars[name];
			if (!t || !c) return text;
			for (var i = t.length - 1; i >= 0; i--) {
				if (!(t[i] instanceof RegExp)) {
					t[i] = new RegExp(t[i].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g");
				}
				text = text.replace(t[i], c);
			}
			return text;
		}

		chars = {
			"smile": "😄",
			"smiley": "😃",
			"grinning": "😀",
			"blush": "😊",
			"wink": "😉",
			"heart_eyes": "😍",
			"kissing_heart": "😘",
			"kissing_closed_eyes": "😚",
			"kissing": "😗",
			"kissing_smiling_eyes": "😙",
			"stuck_out_tongue_winking_eye": "😜",
			"stuck_out_tongue_closed_eyes": "😝",
			"stuck_out_tongue": "😛",
			"flushed": "😳",
			"grin": "😁",
			"pensive": "😔",
			"relieved": "😌",
			"unamused": "😒",
			"disappointed": "😞",
			"persevere": "😣",
			"cry": "😢",
			"joy": "😂",
			"sob": "😭",
			"sleepy": "😪",
			"disappointed_relieved": "😥",
			"cold_sweat": "😰",
			"sweat_smile": "😅",
			"sweat": "😓",
			"weary": "😩",
			"tired_face": "😫",
			"fearful": "😨",
			"scream": "😱",
			"angry": "😠",
			"rage": "😡",
			"confounded": "😖",
			"laughing": "😆",
			"satisfied": "😆",
			"yum": "😋",
			"mask": "😷",
			"sunglasses": "😎",
			"sleeping": "😴",
			"dizzy_face": "😵",
			"astonished": "😲",
			"worried": "😟",
			"frowning": "😦",
			"anguished": "😧",
			"smiling_imp": "😈",
			"open_mouth": "😮",
			"neutral_face": "😐",
			"confused": "😕",
			"hushed": "😯",
			"no_mouth": "😶",
			"innocent": "😇",
			"smirk": "😏",
			"expressionless": "😑",
			"smiley_cat": "😺",
			"smile_cat": "😸",
			"heart_eyes_cat": "😻",
			"kissing_cat": "😽",
			"smirk_cat": "😼",
			"scream_cat": "🙀",
			"crying_cat_face": "😿",
			"joy_cat": "😹",
			"pouting_cat": "😾",
			"sparkles": "✨",
			"fist": "✊",
			"hand": "✋",
			"raised_hand": "✋",
			"cat": "🐱",
			"mouse": "🐭",
			"cow": "🐮",
			"monkey_face": "🐵",
			"star": "⭐",
			"zap": "⚡",
			"umbrella": "☔",
			"hourglass": "⌛",
			"watch": "⌚",
			"black_joker": "🃏",
			"mahjong": "🀄",
			"coffee": "☕",
			"anchor": "⚓",
			"wheelchair": "♿",
			"negative_squared_cross_mark": "❎",
			"white_check_mark": "✅",
			"loop": "➿",
			"aries": "♈",
			"taurus": "♉",
			"gemini": "♊",
			"cancer": "♋",
			"leo": "♌",
			"virgo": "♍",
			"libra": "♎",
			"scorpius": "♏",
			"sagittarius": "♐",
			"capricorn": "♑",
			"aquarius": "♒",
			"pisces": "♓",
			"x": "❌",
			"exclamation": "❗",
			"heavy_exclamation_mark": "❗",
			"question": "❓",
			"grey_exclamation": "❕",
			"grey_question": "❔",
			"heavy_plus_sign": "➕",
			"heavy_minus_sign": "➖",
			"heavy_division_sign": "➗",
			"curly_loop": "➰",
			"black_medium_small_square": "◾",
			"white_medium_small_square": "◽",
			"black_circle": "⚫",
			"white_circle": "⚪",
			"white_large_square": "⬜",
			"black_large_square": "⬛"
		}

		/** shortcuts. use RegExp instead of string would be better. */
		shortcuts = {
			mad: ['>:(', '>:-('], // angry
			blush: [':")', ':-")'],
			broken_heart: ['</3', '<\\3'],
			// :\ and :-\ not used because of conflict with markdown escaping
			confused: [':/', ':-/'], // twemoji shows question
			cry: [":'(", ":'-(", ':,(', ':,-('],
			frowning: [':(', ':-('],
			heart: ['<3'],
			imp: [']:(', ']:-('],
			innocent: ['o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)'],
			joy: [":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D'],
			kissing: [':*', ':-*'],
			laughing: ['x-)', 'X-)'],
			neutral_face: [':|', ':-|'],
			open_mouth: [':o', ':-o', ':O', ':-O'],
			rage: [':@', ':-@'],
			smile: [':D', ':-D'],
			smiley: [':)', ':-)'],
			smiling_imp: [']:)', ']:-)'],
			sob: [":,'(", ":,'-(", ';(', ';-('],
			stuck_out_tongue: [':P', ':-P'],
			sunglasses: ['8-)', 'B-)'],
			sweat: [',:(', ',:-('],
			sweat_smile: [',:)', ',:-)'],
			unamused: [':s', ':-S', ':z', ':-Z', ':$', ':-$'],
			wink: [';)', ';-)']
		}
	}
}
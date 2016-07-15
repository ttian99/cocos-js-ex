/* 
 * @Author: Administrator
 * @Date:   2015-08-14 14:20:26
 * @Last Modified by:   Administrator
 * @Last Modified time: 2015-08-14 17:00:31
 */
/**
 * 			var args = [{
				type: "label", // 目前仅支持"label"和"image"
				options: {
					fillStyle: cc.color.RED,   //字体颜色
					strokeEnabled: false,		//是否描边, 默认false
					lineWidth: 1,               //描边线宽 
					strokeStyle: cc.color.YELLOW,//描边颜色
					fontName: "Arial",		//字体
					fontWeight: "bold",     //粗体 'normal'正常
					fontSize: 30			//字体大小

				},
				opacity: 255,  //默认透明度为255，可省略
				text: "我是中国人"
			}, {
				type: "image",
				color: cc.color.WHITE,
				opacity: 255,
				url: "image.png"
			}, {
				type: "label",
				options: {
					fillStyle: cc.color.BLACK,
					strokeEnabled: true,
					lineWidth: 1,
					strokeStyle: cc.color.YELLOW,
					fontName: "Arial",
					fontSize: 30
				},
				opacity: 255,
				text: "我是中国人"
			}];
 */
var Jtx = Jtx || {};

Jtx.RichText = cc.Node.extend({
	text: null,
	ctor: function(args, size) {
		this._super();
		var richText = this.text = new ccui.RichText();
		richText.ignoreContentAdaptWithSize(false);
		richText.width = (size && size.width) || 120;
		richText.height = (size && size.height) || 120;
		this.addChild(richText);
		this.pushElement(args);
	},

	pushElement: function(args) {
		if (!(args instanceof Array)) {
			console.log("err: args is not array!");
			return;
		}

		for (var i = 0; i < args.length; i++) {
			var re;
			if (args[i].type == "label") {
				args[i].options.fontWeight = args[i].options.fontWeight || 'bold';
				re = new ccui.RichElementText(i + 1, new cc.FontDefinition(args[i].options), args[i].opacity || 255, args[i].text);
			} else if (args[i].type = "image") {
				re = new ccui.RichElementImage(i + 1, args[i].color || cc.color.WHITE, args[i].opacity || 255, args[i].url);
			} else {
				console.log("args.type hasn't been supported. ");
			}
			if (re) {
				this.text.pushBackElement(re);
			}
		}
	}
});
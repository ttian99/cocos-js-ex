/* 
 * @Author: tian
 * @Date:   2015-05-11 21:17:21
 * @Last Modified by:   tian
 * @Last Modified time: 2015-05-11 21:20:18
 */

'use strict';

var Jtx = Jtx || {};
Jtx.textureCache = {};

/*
	此方法待改进!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	此方法待改进!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	此方法待改进!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	此方法待改进!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	此方法待改进!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
Jtx.Loading = function(resList, cb, json) {
	json = json || {};
	//loading layer
	var scene = Jtx.Scene.extend({
		ctor: function(_resList, _cb, _logo) {
			this._super();
			this._resList = _resList;
			this._plistCache = [];
			this.finishCb = _cb;
			this._logo = _logo;
			return true;
		},
		onEnter: function() {
			this._super();
			var self = this;

			//logo
			if (!json.wanba && this._logo) {
				var logo = new cc.Sprite(res.loading.logo_png);
				logo.setPosition(cc.visibleRect.center);
				this.addChild(logo);
			} else {
				var bg = new cc.Sprite(res.startmenu.blank_bg_jpg);
				bg.x = cc.winSize.width / 2;
				bg.y = cc.winSize.height / 2;
				this.addChild(bg);

				//batchNode优化
				var batchNode = this.batchNode = new cc.SpriteBatchNode(res.boot.startmenu_png);
				this.addChild(batchNode);

				//教授
				var doc = this.doc = new cc.Sprite(resIn.startmenu.game_logo2);
				doc.x = cc.winSize.width / 2;
				doc.y = cc.winSize.height / 2 - 115;
				batchNode.addChild(doc);

				//浮动的方块
				var unit = new cc.Sprite(resIn.startmenu.sm_unit);
				unit.x = cc.winSize.width / 2 - 90;
				unit.y = cc.winSize.height / 2 - 93;
				batchNode.addChild(unit);

				//前景的手
				var hand = new cc.Sprite(resIn.startmenu.sm_hand);
				hand.x = cc.winSize.width / 2 - 1;
				hand.y = cc.winSize.height / 2 - 114;
				batchNode.addChild(hand);

				//logo
				var logo1 = this.logo = new cc.Sprite(resIn.startmenu.game_logo);
				logo1.x = cc.winSize.width / 2;
				logo1.y = cc.winSize.height / 2 +  doc.height / 2 + 100;
				batchNode.addChild(logo1, 99);

				//logo3
				var logo3 = new cc.Sprite(resIn.startmenu.game_logo3);
				logo3.x = logo1.width / 2 + 20;
				logo3.y = -50;
				logo1.addChild(logo3);

				var up = cc.scaleBy(1.1, 1.02);
				logo1.runAction(cc.repeatForever(cc.sequence(up, up.clone().reverse())));

				//方块
				var move1 = cc.moveBy(1.1, 0, 10);
				var move2 = cc.moveBy(1.1, 0, -10);
				unit.runAction(cc.sequence(move1, move2).repeatForever());

				//流星
				var meteorPos = {
					'1': cc.p(cc.winSize.width * 0.15, cc.winSize.height * 0.76),
					'2': cc.p(cc.winSize.width * 0.2, cc.winSize.height * 0.45),
					'3': cc.p(cc.winSize.width * 0.82, cc.winSize.height * 0.45),
					'4': cc.p(cc.winSize.width * 0.77, cc.winSize.height * 0.6)
				};
				for (var i = 1; i <= 4; i++) {
					var meteor = new cc.Sprite(resIn.startmenu["meteor" + i]);
					meteor.setPosition(meteorPos[i].x, meteorPos[i].y);
					this.batchNode.addChild(meteor);
				}
			}

			//进度条背景
			var loadbg = new cc.Sprite(res.loading.loadbg_png);
			loadbg.x = cc.winSize.width / 2;
			loadbg.y = cc.winSize.height * 0.08;
			this.addChild(loadbg);

			//进度条
			var p = new cc.ProgressTimer(new cc.Sprite(res.loading.load_png));
			p.type = cc.ProgressTimer.TYPE_BAR;
			p.midPoint = cc.p(0, 0);
			p.barChangeRate = cc.p(1, 0);
			p.x = loadbg.x - 1; //原始图对的不是很齐, 要稍微修正下
			p.y = loadbg.y + 2;
			p.percentage = 0;
			this.addChild(p);

			//加载正式资源
			var startTime = Date.now();
			cc.loader.load(this._resList, function(result, count, loadedCount) {
				//资源处理
				var url = self._resList[loadedCount];
				var ext = cc.path.extname(url);
				if (_.indexOf([".plist"], ext) >= 0) {
					self._plistCache.push(url);
				}
				//计数
				var percent = 100 * (loadedCount + 1) / count;
				self.scheduleOnce(function() {
					p.percentage = percent;
				}, 0.002 * percent);
			}, function() {
				//缓存plist
				for (var i = 0; i < self._plistCache.length; i++) {
					cc.spriteFrameCache.addSpriteFrames(self._plistCache[i]);
				}
				//资源加载完毕, 跳转
				if (self._logo) {
					var max = 1000;
					var delay = Date.now() - startTime;
					delay = delay < max ? (max - delay) / 1000 : 0;
					self.scheduleOnce(function() {
						self.finishCb();
					}, delay);
				} else {
					self.finishCb();
				}
			});
		}
	});

	var newResList = [];
	for (var i = 0; i < resList.length; i++) {
		var url = resList[i];
		if (Jtx.textureCache[url]) {
			continue;
		} else {
			var ext = cc.path.extname(url);
			if (_.indexOf([".png", ".jpeg", "jpg"], ext) >= 0) {
				cc.textureCache.addImage(url);
			}
			newResList.push(url);
			Jtx.textureCache[url] = true;
		}
	}

	//执行
	if (newResList.length <= 0) {
		cb();
	} else {
		if (json.wanba) {
			Game.WanbaLoaderScene.preload(resList, function() {
				cb();
			});
		} else {
			cc.director.runScene(new scene(resList, cb, json.logo));
		}

	}
};
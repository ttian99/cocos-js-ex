var Jtx = Jtx || {};

Jtx.init = function () {
  var w = cc.winSize;
  Jtx.center = cc.p(w.width / 2, w.height / 2);
  Jtx.width = w.width;
  Jtx.height = w.height;
};

/**
 * 下一次回调调用
 * @param  {Function} cb
 */
Jtx.nextTick = function (cb) {
  setTimeout(cb, 0);
};

/**
 * 是否在左下角显示FPS信息
 * @param  {Boolean} isShow 默认是true
 */
Jtx.showFPS = function (isShow) {
  var show = cc.isUndefined(isShow) ? true : isShow;
  cc.director.setDisplayStats(show);
  var CONFIG_KEY = cc.game.CONFIG_KEY;
  var config = cc.game.config;
  config[CONFIG_KEY.showFPS] = true;
};

/**
 * 暂停游戏，防止Qzone玩吧切换到后台后崩溃
 * @param  {Boolean} isPause
 */
Jtx.pauseGame = function (isPause) {
  if (isPause) {
    cc.game._paused = true;
  } else {
    var CONFIG_KEY = cc.game.CONFIG_KEY;
    var config = cc.game.config;
    cc.game.setFrameRate(config[CONFIG_KEY.frameRate]);
  }
};

Jtx.safeParse = function (str) {
  var data = null;
  try {
    data = JSON.parse(str);
  } catch (e) {
    console.log('parse [' + str + '] failed');
  }
  return data;
};

Jtx.Evt = {};
/**
 * 接收自定义事件
 * @param  {String}   event  事件名称
 * @param  {Function} cb     cb(data);
 * @param  {cc.Node}  targetNode listener将绑定在这个node上，用于批量删除
 * @return {Listener}        事件监听器
 */
Jtx.Evt.on = function (event, cb, targetNode) {
  var listener = cc.eventManager.addCustomListener(event, function (e) {
    cb && cb(e._userData);
  });

  if (targetNode instanceof cc.Node) {
    targetNode.__listeners = targetNode._listeners || [];
    targetNode.__listeners.push(listener);
  }
  return listener;
};

/**
 * 发送自定义事件
 * @param  {String} event 事件名称
 * @param  {[type]} data  可以是任意类型，透传到on接口
 */
Jtx.Evt.emit = function (event, data) {
  cc.eventManager.dispatchCustomEvent(event, data);
};

/**
 * 删除单个listener
 * @param  {Listener} listener
 */
Jtx.Evt.removeListener = function (listener) {
  cc.eventManager.removeListener(listener);
};

/**
 * 删除节点上的所有自定义事件
 * @param  {cc.Node} targetNode
 */
Jtx.Evt.removeAllListeners = function (targetNode) {
  if (targetNode.__listeners) {
    targetNode.__listeners.forEach(function (listener) {
      cc.eventManager.removeListener(listener);
    });

    targetNode.__listeners = [];
  }
};

Jtx.addSprite = function (target, filename, x, y) {
  var s = new cc.Sprite(filename);
  s.x = x || 0;
  s.y = y || 0;
  target.addChild(s);
  return s;
};

Jtx.addLabel = function (target, title, size, x, y) {
  var lb = new cc.LabelTTF(title, 'Arial', size);
  lb.x = x || 0;
  lb.y = y || 0;
  target.addChild(lb);
  return lb;
};

/**
 * 异步加载图片
 * @param  {String}   src       or url
 * @param {Boolean} crossOrigin 默认为false
 * @param  {Function} cb        callback(texture)
 * @note   可以通过new Sprite(texture)的方式创建精灵
 */
Jtx.loadImg = function (src, crossOrigin, cb) {
  var callback = cb;
  var co = crossOrigin;
  if (cc.isUndefined(cb)) {
    callback = crossOrigin;
    co = false;
  }
  cc.loader.loadImg(src, {
    isCrossOrigin: co
  }, function (err, img) {
    if (err) {
      console.error(err);
      cb(null);
    } else {
      var texture2d = new cc.Texture2D();
      texture2d.initWithElement(img);
      texture2d.handleLoadedTexture();
      callback(texture2d);
    }
  });
};
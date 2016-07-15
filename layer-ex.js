var Jtx = Jtx || {};

/**
 * 建议在创建一般Layer是使用Jtx.Layer代替cc.Layer, 特性如下:
 * swallowTouchesEvent: 吞噬所用事件的传播
 * addEvent: 添加CustomEvent事件, 该事件将在Layer被移除时自动移除, 且不影响其他同名CustomEvent
 */
Jtx.Layer = cc.Layer.extend({
  swallowTouchesEvent: function() {
    var self = this;
    this.touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function(touch, event) {
        self.clickEventCB && self.clickEventCB(self);
        return true;
      }
    });
    cc.eventManager.addListener(this.touchListener, this);
  },
  sendEvent: function(EventName, userData) {
    cc.eventManager.dispatchCustomEvent(EventName, userData);
  },
  addEvent: function(EventName, func) {
    if (!Jtx.addEventToNode) {
      console.log("Jtx.Layer->addEvent 依赖Jtx.addEventToNode");
      return;
    }
    Jtx.addEventToNode(EventName, func, this);
  },
  addClickEventListener: function(cb){
    this.clickEventCB = cb;
  },
  dispatchClickEvent: function(){
    this.clickEventCB && this.clickEventCB(this);
  }
});

/**
 * MaskLayer, 蒙板层，可用于屏蔽触屏事件
 */
Jtx.MaskLayer = cc.LayerColor.extend({
  touchListener: null,
  _customCb: null,
  ctor: function(color, cb, swallowTouche) {
    //初始化
    this._super(color);
    swallowTouche = (swallowTouche===false?false:true);
    this._customCb = cb;
    var self = this;
    //绑定
    this.touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: swallowTouche,
      onTouchBegan: function(touch, event) {
        self._customCb && self._customCb(touch, event);
        return true;
      }
    });
    cc.eventManager.addListener(this.touchListener, this);
  },
  reBindCallback: function(cb){
    this._customCb = cb;
  },
  onExit: function() {
    cc.eventManager.removeListener(this.touchListener);
    this._super();
  }
});

/**
 * 创建蒙板层
 * @param  {cc.color} color      蒙板层颜色值
 * @param  {cb} onTouchBegan     回调onTouchBegan事件，用于上层特殊区域点击处理
 * @return {Jtx.MaskLayer}
 */
Jtx.maskLayer = function(color, onTouchBegan) {
  var layer = new Jtx.MaskLayer(color || cc.color(0, 0, 0, 150), onTouchBegan);
  return layer;
};

// 屏蔽触控事件层，和MaskLayer的区别在于没有颜色
Jtx.DisTouchLayer = cc.Layer.extend({
  touchListener: null,
  ctor: function(cb) {
    this._super();
    this.touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function(touch, event) {
        cb && cb(touch, event);
        return true;
      }
    });
    cc.eventManager.addListener(this.touchListener, this);
  },

  onExit: function() {
    cc.eventManager.removeListener(this.touchListener);
    this._super();
  }
});

Jtx.disTouchLayer = function(onTouchBegan) {
  var layer = new Jtx.DisTouchLayer(onTouchBegan);
  return layer;
};
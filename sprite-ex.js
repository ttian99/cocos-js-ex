var Jtx = Jtx || {};

//从resIn资源中获取SpriteFrame对象
Jtx.getSpriteFrameFromResIn = function(resInName){
  if( !resInName || typeof resInName != 'string' ){
    cc.error("Jtx.getSpriteFrameByResIn->无效的resInName");
    return;
  }
  resInName = resInName.replace('#', '');
  return cc.spriteFrameCache.getSpriteFrame(resInName);
};

/**
 * 修改Texture，Texture来源于SpriteSheet
 * @param {String} filename e.g. '#filename'
 */
cc.Sprite.prototype.setSheetTexture = function(fileName) {
  var frameName = fileName.substr(1, fileName.length - 1);
  // var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
  // this.setSpriteFrame(spriteFrame);
  this.initWithSpriteFrameName(frameName);
};

/**
 * 为了方便且安全的扩展特性, 建议在创建Sprite时都默认使用cc.Sprite, 若有特殊需要可以使用该方法
 * var sp = new Jtx.Sprite( ... );
 * 特性如下:
 * 	changeTexture: 改变Sprite的texture
 */
Jtx.Sprite = cc.Sprite.extend({
  /*
   * @param {String} textureName 如"aa.png", 或者"#aa_png"之类
   */
  changeTexture: function(textureName) {
    if (!textureName) {
      console.log("Jtx.Sprite -> changeTexture 无效的TextureName : " + textureName);
      return;
    }
    if (textureName.charAt(0) == '#') {
      var sp = cc.spriteFrameCache.getSpriteFrame(textureName.replace('#', ''));
      this.setSpriteFrame(sp);
    } else {
      var t = cc.textureCache.getTextureForKey(textureName);
      this.setTexture(t);
    }
  }
});

/*
 * 快速创建按钮Sprite
 * 特性如下:
 *  addClickEventListener: 添加点击事件的回调函数
 *  addTouchBeganEventListener: 添加开始触摸的回调函数
 *  addTouchEndedEventListener: 添加触摸结束的回调函数
 */
Jtx.Btn = Jtx.Sprite.extend({
  clickEventCB: null,
  clickEventEnable: true,
  clickEventDelay: 1.5,
  touchBeganEventCB: null,
  touchEndedEventCB: null,
  _touchSwallow: true, // 是否吞噬触摸
  _touchZoom: false,  // 是否点击放大
  _touchEnabled: true, // 是否可点击
  _priority: 0, // 触摸优先级
  _scale: 1, // 保存按钮被点击前的缩放比例
  _touchBeginWorldPos: null, // 记录按钮开始被点击时的世界坐标
  touchListener: null,
  noTimeOut: null, // 是否允许连续点击
  onEnter: function() {
    this._super();
    this.setTouchEnabled(this._touchEnabled);
  },
  onExit: function() {
    this.setTouchEnabled(false);
    this._super();
  },
  mAbs: function(a, b) {
    return Math.abs(a - b);
  },
  // appendLabel: function(str, size, color){
  //     if( this.txtLabel ){
  //         this.txtLabel.setString(str); 
  //     }
  //     else{
  //         size = size || this.height*0.5;
  //         var label = this.txtLabel = new cc.LabelTTF(str, "Arial", size);
  //         label.x = this.width/2;
  //         label.y = this.height/2;
  //         this.addChild(label);
  //         if( color ){
  //             label.fillStyle = color;
  //         }
  //     }
  // },
  bindEvent: function() {
    var self = this;
    var tmp = null;
    var maxOffset = 25;
    this.removeEvent();
    this.touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: self._touchSwallow,
      onTouchBegan: function(touch, event) {
        var self = event.getCurrentTarget();
        var pos = touch.getLocation();
        if (self.isTouchInside(touch)) {
          tmp = pos;
          self._touchBeginWorldPos = self.getParent().convertToWorldSpace(pos);

          // 如果开启放大功能则放大
          if (self._touchZoom) {
            self._scale = self.scale;
            self.scale = 1.15 * self.scale;
          }

          self.touchBeganEventCB && self.touchBeganEventCB(self);
          return true;
        } else {
          return false;
        }
      },
      onTouchMoved: function(touch, event) {
        var self = event.getCurrentTarget();
        if (!self.isTouchInside(touch) || !self.isNotMoveOut(touch)) {
          if (self._touchZoom) {
            self.scale = self._scale;
          }
          return;
        }
      },
      onTouchEnded: function(touch, event) {
        var self = event.getCurrentTarget();
        if (self._touchZoom) {
          self.scale = self._scale;
        }
        if (!self.isTouchInside(touch) || !self.isNotMoveOut(touch)) {
          return;
        }
        var pos = touch.getLocation();
        var ox = self.mAbs(pos.x, tmp.x);
        var oy = self.mAbs(pos.y, tmp.y);
        self.touchEndedEventCB && self.touchEndedEventCB(self);
        if (self.clickEventEnable && ox <= maxOffset && oy <= maxOffset) {
          self.clickEventEnable = false;
          self.clickEventCB && self.clickEventCB(self);
          if (!self.noTimeOut) {
            setTimeout(function() {
              self.clickEventEnable = true;
            }, self.clickEventDelay * 1000);
          } else {
            self.clickEventEnable = true;
          }
        } else {
          //TODO
        }
      },
      onTouchCancelled: function(touch, event) {

      }
    });
    if (this._priority !== 0) {
      cc.eventManager.addListener(this.touchListener, this._priority);
    } else {
      cc.eventManager.addListener(this.touchListener, this);
    }
  },
  removeEvent: function() {
    if (this.touchListener) {
      cc.eventManager.removeListener(this.touchListener);
      this.touchListener = null;
    }
  },
  addClickEventListener: function(cb, delay) {
    this.clickEventCB = cb;
    if (delay !== undefined) {
      this.clickEventDelay = delay;
    }
  },
  addTouchBeganEventListener: function(cb) {
    this.touchBeganEventCB = cb;
  },
  addTouchEndedEventListener: function(cb) {
    this.touchEndedEventCB = cb;
  },

  setTouchEnabled: function(bvar) {
    if (bvar) {
      this.bindEvent();
    } else {
      this.removeEvent();
    }
    this._touchEnabled = bvar;

    return this;
  },

  setPriority: function(priority) {
    if (this._priority != priority) {
      this._priority = priority;

      if (this._touchEnabled) {
        this.bindEvent();
      }
    }
    return this;
  },

  setTouchSwallow: function(bvar) {
    if (this._touchSwallow != bvar) {
      this._touchSwallow = bvar;

      if (this._touchEnabled) {
        this.bindEvent();
      }
    }
    return this;
  },

  setTouchZoom: function(bvar) {
    this._touchZoom = bvar;
    return this;
  },

  // 用于判断是否点击在按钮区域
  isTouchInside: function(touch) {
    var touchLocation = touch.getLocation();
    touchLocation = this.getParent().convertToNodeSpace(touchLocation);
    return cc.rectContainsPoint(this.getBoundingBox(), touchLocation);
  },

  // 按钮在屏幕上被移动一定的位置后点击失效
  isNotMoveOut: function(touch) {
    var touchLocation = this.getParent().convertToWorldSpace(touch.getLocation());
    var rect = cc.rect(this._touchBeginWorldPos.x - 25, this._touchBeginWorldPos.y - 25, 50, 50);
    return cc.rectContainsPoint(rect, touchLocation);
  }
});

Jtx.zoomBtn = function(filename, cb) {
  var btn = new Jtx.Btn(filename);
  btn.addClickEventListener(cb);
  btn.addTouchBeganEventListener(function() {
    btn.scale = 1.1;
  });

  btn.addTouchEndedEventListener(function() {
    btn.scale = 1;
  });
  return btn;
};
// 点击时纹理变化按钮
Jtx.twoStatBtn = function(normalImg, activeImg, cb) {
  var btn = new Jtx.Btn(normalImg);
  btn.addClickEventListener(cb);
  btn.addTouchBeganEventListener(function() {
    if (s.startsWith(activeImg, '#')) {
      btn.setSheetTexture(activeImg);
    } else {
      btn.setTexture(activeImg);
    }
  });

  btn.addTouchEndedEventListener(function() {
    if (s.startsWith(normalImg, '#')) {
      btn.setSheetTexture(normalImg);
    } else {
      btn.setTexture(normalImg);
    }
  });
  return btn;
}
// 点击前后纹理变化按钮
Jtx.twoSideBtn = function(normalImg, selectedImg, cb) {
  var btn = new Jtx.Btn(normalImg);
  btn._touchZoom = false;
  btn.startFile = normalImg;
  btn.changeTexture = function() {
    if (btn.startFile === normalImg) {
      if (s.startsWith(btn.startFile, '#')) {
        btn.setSheetTexture(selectedImg);
      } else {
        btn.setTexture(selectedImg);
      }
      btn.startFile = selectedImg;
    } else {
      if (s.startsWith(btn.startFile, '#')) {
        btn.setSheetTexture(normalImg);
      } else {
        btn.setTexture(normalImg);
      }
      btn.startFile = normalImg;
    }
  }
  btn.addClickEventListener(cb);
  return btn;
}
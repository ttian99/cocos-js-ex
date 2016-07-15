/** 
* 垂直方向pageview
* @class Jtx.PageViewVertical
* @public
* @example
~
//创建
var pageView = new Jtx.PageViewVertical();
//设置剪裁区域
pageView.setContentSize(cc.size(w, h));
//事件
pageView.addScrolledEventListener(function(sender){
	//判断能否上下分
	上箭头.visible = sender.canPageUp();
	下箭头.visible = sender.canPageDown();
	//数据
	var elem = sender.getCurElement();
	if( !elem ){
		return;
	}
	var data = elem.getElementData();//{id:..., index:...}
});

//循环添加
var list = [...];
list.forEach(function(hero, i){
	//基本元素
	var elem = new Jtx.PageViewVerticalElement();
	elem.setElementData({id:hero.id, index:i});
	//背景
	var bg = new cc.Sprite(...);
	elem.addChild(bg);
	//技能图标
	var skillIcon = new cc.Sprite(...);
	skillIcon.y = -60;
	elem.addChild(skillIcon);
	//添加元素
	pageView.addPage(elem);
});

//滚动到指定的位置，会触发一次addScrolledEventListener
pageView.pageTo(0);

*/
Jtx.PageViewVertical = cc.Node.extend({
	_clippingNode: null,
	_width: null,
	_height: null,
	_elemList: null,
	_pageIndex: 0,
	_pageCount: 0,
	_touchBeginPos: null,
	_touchEnable: true,
	_rect: null,
	_moveNode: null,
	_moveThreshold: 25,
	_moveY: 0,
	_moveTurnSpeed: 0.2,
	_moveResetSpeed: 0.2,
	_scrolledListener: null,
	ctor: function(){
		this._super();
		this._elemList = [];
		this._bindEvent();
	},
	/**
	* 设置剪裁区域
	* @function Jtx.PageViewVertical#setContentSize
	* @public
	* @param {cc.size} size - 剪裁区域
	*/
	setContentSize: function(size){
		//矩形绘图
		var stencil = new cc.DrawNode();
        var rectangle = [
            cc.p(0, 0),
            cc.p(size.width, 0),
            cc.p(size.width, size.height),
            cc.p(0, size.height)
        ];
        var color = cc.color(255,0,0,255);//颜色无所谓，只要alpha是255就好
        stencil.drawPoly(rectangle, color, 0, color);

        //遮罩
		var clipnode = this._clippingNode = new cc.ClippingNode(stencil);
		clipnode.inverted = false;
		clipnode.x = -size.width/2;
		clipnode.y = -size.height/2;

		//进一步处理
		this._width = size.width;
		this._height = size.height;
		this.addChild(clipnode);

		//用于移动的部分
		this._moveNode = new cc.Node();
		this._clippingNode.addChild(this._moveNode);
	},
	/**
	* 获取当前的页码索引，从0开始
	* @function Jtx.PageViewVertical#getCurPageIndex
	* @public
	* @returns {Int} 页码
	*/
	getCurPageIndex: function(){
		return this._pageIndex;
	},
	/**
	* 获取当前的页码元素
	* @function Jtx.PageViewVertical#getCurElement
	* @public
	* @returns {Jtx.PageViewVerticalElement} 页码元素
	*/
	getCurElement: function(){
		return this._elemList[this._pageIndex];
	},
	/**
	* 增加一个page，page请使用new Jtx.PageViewVerticalElement()创建
	* @function Jtx.PageViewVertical#addPage
	* @public
	* @param {Jtx.PageViewVerticalElement} element - page元素
	*/
	addPage: function(element){
		element.x = this._width*0.5;
		element.y = this._height*(-this._pageCount+0.5);
		this._moveNode.addChild(element);
		this._elemList.push(element);
		this._pageCount++;
	},
	_bindEvent: function(){
		//用户操作
		var self = this;
		var touchListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: this._onTouchBegan.bind(this),
			onTouchMoved: this._onTouchMoved.bind(this),
			onTouchEnded: this._onTouchEnd.bind(this),
			onTouchCancelled: function(touch, event) {
				//TODO
			}
		});
		cc.eventManager.addListener(touchListener, this);
	},
	_onTouchBegan: function(touch, event){
		if( !this._rect ){
			var worldP = this.getParent().convertToWorldSpace(this.getPosition());
			this._rect = cc.rect(worldP.x-this._width/2, worldP.y-this._height/2, this._width, this._height);
		}
		if( !this._touchEnable ){
			this._touchBeginPos = null;
			return false;
		}
		var p = this._touchBeginPos = touch.getLocation();
		if( cc.rectContainsPoint( this._rect, p ) ){
			return true;
		}
		return false;
	},
	_onTouchMoved: function(touch, event){
		if( !this._touchBeginPos ){
			return;
		}
		var p = touch.getLocation();
		var yoff = (p.y - this._touchBeginPos.y)/2;
		this._moveNode.y = this._moveY+yoff;
	},
	_onTouchEnd: function(touch, event){
		if( !this._touchBeginPos ){
			return;
		}
		var p = touch.getLocation();
		var yoff = p.y - this._touchBeginPos.y;
		if(yoff>this._moveThreshold){
			this.pageDown();
		}
		else if(yoff<-this._moveThreshold){
			this.pageUp();
		}
		else{
			this.pageReset();
		}
		//this._moveY += yoff;
	},
	/**
	* 判断能否下翻，即页码索引变大
	* @function Jtx.PageViewVertical#canPageDown
	* @public
	* @param {Boolean} 是否
	*/
	canPageDown: function(){
		if( this._pageIndex >= (this._pageCount-1) ){
			return false;
		}
		else{
			return true;
		}
	},
	/**
	* 判断能否上翻，即页码索引变小
	* @function Jtx.PageViewVertical#canPageUp
	* @public
	* @param {Boolean} 是否
	*/
	canPageUp: function(){
		if( this._pageIndex <= 0 ){
			return false;
		}
		else{
			return true;
		}
	},
	/**
	* 下翻一页，会触发addScrolledEventListener，自动判断能否下翻
	* @function Jtx.PageViewVertical#pageDown
	* @public
	*/
	pageDown: function(){
		if( !this._touchEnable ){
			return;
		}
		if( !this.canPageDown() ){
			this.pageReset();
		}
		else{
			var self = this;
			this._touchEnable = false;
			//移动
			var move = cc.moveTo(this._moveTurnSpeed, 0, this._moveY+this._height);
			var cfunc = cc.callFunc(function(){
				self._moveY += self._height;
				self._pageIndex++;
				self._touchEnable = true;
				self._scrolledListener && self._scrolledListener(self);
			});
			this._moveNode.runAction( cc.sequence(move, cfunc) );
		}
	},
	/**
	* 上翻一页，会触发addScrolledEventListener，自动判断能否上翻
	* @function Jtx.PageViewVertical#pageUp
	* @public
	*/
	pageUp: function(){
		if( !this._touchEnable ){
			return;
		}
		if( !this.canPageUp() ){
			this.pageReset();
		}
		else{
			var self = this;
			this._touchEnable = false;
			//移动
			var move = cc.moveTo(this._moveTurnSpeed, 0, this._moveY-this._height);
			var cfunc = cc.callFunc(function(){
				self._moveY -= self._height;
				self._pageIndex--;
				self._touchEnable = true;
				self._scrolledListener && self._scrolledListener(self);
			});
			this._moveNode.runAction( cc.sequence(move, cfunc) );
		}
	},
	/**
	* page位置恢复，内部已处理，外部应该不需要手动调用
	* @function Jtx.PageViewVertical#pageReset
	* @public
	*/
	pageReset: function(){
		var self = this;
		this._touchEnable = false;
		//移动
		var move = cc.moveTo(this._moveResetSpeed, 0, this._moveY);
		var cfunc = cc.callFunc(function(){
			self._touchEnable = true;
		});
		this._moveNode.runAction( cc.sequence(move, cfunc) );
	},
	/**
	* 翻页到指定页码索引
	* @function Jtx.PageViewVertical#pageTo
	* @public
	* @param {Int} index - 页码索引
	* @param {Number} [dur=0] - 动画时间
	*/
	pageTo: function(index, dur){
		if( index >= this._pageCount ){
			console.log("无法滚动到page:"+index+'!');
			this._scrolledListener && this._scrolledListener(this);
			return;
		}
		this._moveY = this._height*index;
		this._pageIndex = index;
		if( !dur ){
			this._moveNode.y = this._moveY;
			this._scrolledListener && this._scrolledListener(this);
		}
		else{
			var self = this;
			this._touchEnable = false;
			//移动
			var move = cc.moveTo(dur, 0, this._moveY);
			var cfunc = cc.callFunc(function(){
				self._touchEnable = true;
				self._scrolledListener && self._scrolledListener(self);
			});
			this._moveNode.runAction( cc.sequence(move, cfunc) );
		}
	},
	/**
	* 添加一个滚动结束的回调
	* @function Jtx.PageViewVertical#addScrolledEventListener
	* @public
	* @param {Function} func - 回调函数
	*/
	addScrolledEventListener: function(func){
		this._scrolledListener = func;
	}
});

/** 
* Jtx.PageViewVertical的页面元素和Jtx.PageViewVertical配合使用
* @class Jtx.PageViewVerticalElement
* @public
*/
Jtx.PageViewVerticalElement = cc.Node.extend({
	/**
	* 设定附加的数据，以方便后续的调用
	* @function Jtx.PageViewVerticalElement#setElementData
	* @public
	* @param {*} data - 数据
	*/
	setElementData: function(data){
		this.setUserData(data);
	},
	/**
	* 获取附加的数据
	* @function Jtx.PageViewVerticalElement#getElementData
	* @public
	* @returns {*} 数据
	*/
	getElementData: function(){
		return this.getUserData();
	}
});

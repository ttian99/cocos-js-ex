var Jtx = Jtx || {};

/**
 * 建议在创建一般Layer是使用Jtx.Layer代替cc.Layer, 特性如下:
 * addEvent: 添加CustomEvent事件, 该事件将在Scene被移除时自动移除, 且不影响其他同名CustomEvent
 */
Jtx.Scene = cc.Scene.extend({
	sendEvent: function(EventName, userData) {
		cc.eventManager.dispatchCustomEvent(EventName, userData);
	},
	addEvent: function(EventName, func) {
		if( !Jtx.addEventToNode ){
			console.log("Jtx.Layer->addEvent 依赖Jtx.addEventToNode");
			return;
		}
		Jtx.addEventToNode(EventName, func, this);
	}
});
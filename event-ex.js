var Jtx = Jtx || {};

/**
* 添加常规CustomEvent
* @param {String} EventName 事件名
* @param {Function} func 回调函数
*
* 需要注意的是该方法注册的CustomEvent在移除时, 所有同名的事件都将被一起移除
*/
Jtx.addEvent = function(EventName, func) {
	cc.eventManager.addCustomListener(EventName, function(event) {
		func && func(event, event.getUserData());
	});
};

/**
* 添加隶属于node节点的CustomEvent
* @param {String} EventName 事件名
* @param {Function} func 回调函数
* @param {cc.Node} node 节点对象, 一般是Scene或者Layer
*
* 该方法注册的CustomEvent会在node被移除时自动移除, 不需要手动操作, 且其他的同名CustomEvent不受影响
*/
Jtx.addEventToNode = function(EventName, func, node){
	if( !node ){
		console.log("Jtx.addEventToNode : node参数不能为空!");
		return;
	}
	if( !(node instanceof cc.Node) ){
		console.log("Jtx.addEventToNode: node不是cc.Node类型");
		return;
	}
	var listener = cc.EventListener.create({
	    event: cc.EventListener.CUSTOM,
	    eventName: EventName,
	    callback: function(event){
	    	func && func(event, event.getUserData());
	    }
    });    
    cc.eventManager.addListener(listener, node);
};

/**
* 触发CustomEvent, 
* @param {String} EventName 事件名
* @param {Any} userData 附加参数, 只能是一个, 若想同时传递多个, 请使用[]或者{}
*/
Jtx.sendEvent = function(EventName, userData) {
	cc.eventManager.dispatchCustomEvent(EventName, userData);
};

/**
* 移除常规CustomEvent, 
* @param {String} EventName 事件名
*
* 需要注意的是该方法会将所有同名的事件都将被一起移除, 包括Jtx.addEvent和Jtx.addEventToNode添加的事件
*/
Jtx.removeEvent = function(EventName){
	cc.eventManager.removeCustomListeners(EventName);
}

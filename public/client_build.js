/* This header is placed at the beginning of the output file and defines the
	special `__require`, `__getFilename`, and `__getDirname` functions.
*/
(function() {
	/* __modules is an Array of functions; each function is a module added
		to the project */
var __modules = {},
	/* __modulesCache is an Array of cached modules, much like
		`require.cache`.  Once a module is executed, it is cached. */
	__modulesCache = {},
	/* __moduleIsCached - an Array of booleans, `true` if module is cached. */
	__moduleIsCached = {};
/* If the module with the specified `uid` is cached, return it;
	otherwise, execute and cache it first. */
function __require(uid, parentUid) {
	if(!__moduleIsCached[uid]) {
		// Populate the cache initially with an empty `exports` Object
		__modulesCache[uid] = {"exports": {}, "loaded": false};
		__moduleIsCached[uid] = true;
		if(uid === 0 && typeof require === "function") {
			require.main = __modulesCache[0];
		} else {
			__modulesCache[uid].parent = __modulesCache[parentUid];
		}
		/* Note: if this module requires itself, or if its depenedencies
			require it, they will only see an empty Object for now */
		// Now load the module
		__modules[uid].call(this, __modulesCache[uid], __modulesCache[uid].exports);
		__modulesCache[uid].loaded = true;
	}
	return __modulesCache[uid].exports;
}
/* This function is the replacement for all `__filename` references within a
	project file.  The idea is to return the correct `__filename` as if the
	file was not concatenated at all.  Therefore, we should return the
	filename relative to the output file's path.

	`path` is the path relative to the output file's path at the time the
	project file was concatenated and added to the output file.
*/
function __getFilename(path) {
	return require("path").resolve(__dirname + "/" + path);
}
/* Same deal as __getFilename.
	`path` is the path relative to the output file's path at the time the
	project file was concatenated and added to the output file.
*/
function __getDirname(path) {
	return require("path").resolve(__dirname + "/" + path + "/../");
}
/********** End of header **********/
/********** Start module 0: /home/derek/projects/chatroom/public/client.js **********/
__modules[0] = function(module, exports) {
const WebSocketWrapper = __require(1,0);
window.socket = new WebSocketWrapper(
	new WebSocket("ws://" + location.host)
);

socket.on("disconnect", function() {
});

socket.on("error", () => {
	socket.disconnect();
});


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runafterDOMload);
} else {  // `DOMContentLoaded` already fired
    runafterDOMload();
}

function runafterDOMload(){
	$("#newMessage").on("submit", function sendMessage(e) {
		e.preventDefault();
	});

	socket.request("entry", $("#username").val() );
	socket.emit("joined room", location.pathname);

	socket.on('open line', function(name, color) {
		if (document.getElementById("id:"+name) === null){
			placement = document.getElementById("messageList");
			let newDiv = document.createElement("div"),
			newName = document.createElement("li"),
			newMess = document.createElement("li");
			newDiv.id = 'id:'+name;
			newName.classList.add("name");
			newName.style.color = color;
			newDiv.classList.add("slidein");
			newName.textContent = name + ": ";
			newMess.textContent = "";
			newDiv.appendChild(newName);
			newDiv.appendChild(newMess);
			placement.appendChild(newDiv);
			scrollToBottom();
		}
	});

	socket.on('update line', function(msg = "", name) {
		namedelement = document.getElementById('id:'+name).children[1];
		if (namedelement !== null) {
			namedelement.innerHTML = msg;
		}
	});

	socket.on('publish line', function(name) {
		var div = document.getElementById('id:' + name);
		div.id = ".";
		div.classList.add("fadein");
		div.classList.remove("slidein");
	});

	socket.on('close line', function(name, fade = 0) {
		closedMess = document.getElementById('id:'+name);
		closedMess.classList.remove("slidein");
		if (fade = 0){
			closedMess.classList.add("blipout");
		}
		else {
			closedMess.classList.add("fade");
		}
		function delaykill(){
			closedMess = document.getElementById('id:'+name)
			if (closedMess !== null){
				closedMess.remove();
				closedMess.id = ".";
			}
		}
		closetimeout = setTimeout(delaykill, 305);
	});
	socket.on('server message', function(msg, color = "#9999ff") {
		placement = document.getElementById("messageList");
		let newDiv = document.createElement("div"),
				newMess = document.createElement("li");
		newDiv.classList.add("slideinnocol");
		newMess.style.color = color;
		newMess.innerHTML = msg;
		newDiv.appendChild(newMess);
		placement.appendChild(newDiv);
		scrollToBottom();
	});
	var sendform = document.getElementById("message");

	var line_open_status = 0;

	function enter_focus(e, type = 0){
		if (e.which === 13 || e.keyCode === 13) {
			if(document.activeElement === document.body)
			sendform.focus();
			else if (document.activeElement == sendform){
				if (sendform.value !== ""){
					socket.emit('publish line', sendform.value);
				}
				sendform.value = "";
				sendform.blur();
			}
		}

		function gain_focus(){
			if (line_open_status === 0)
			socket.emit('open line');
			line_open_status = 1;
		}

		function lose_focus(){
			if (sendform.value === "" && line_open_status === 1)
			socket.emit('close line');
			line_open_status = 0;
		}

		if (document.activeElement === sendform){
			gain_focus();
		}
		else{
			lose_focus();
		}
	}

	function form_keyup(e){
		if (document.activeElement === sendform)
		socket.emit('rolling update', sendform.value);
	}


	var messageDiv = document.getElementById("messageList");

	function scrollToBottom(){
		let isScrolledToBottom = messageDiv.scrollHeight - messageDiv.clientHeight <= messageDiv.scrollTop + 40;
		if (isScrolledToBottom){
			var scroll_interval = setInterval(function(){messageDiv.scrollTop = messageDiv.scrollHeight;}, 20);
			var scroll_timeout = setTimeout(function(){clearInterval(scroll_interval)}, 300);
		}
	}
	sendform.addEventListener('keyup', form_keyup);
	sendform.addEventListener('focus', enter_focus);
	sendform.addEventListener('blur', enter_focus);
	document.body.addEventListener('keyup', enter_focus, 1);

};

return module.exports;
}
/********** End of module 0: /home/derek/projects/chatroom/public/client.js **********/
/********** Start module 1: /home/derek/projects/chatroom/node_modules/ws-wrapper/lib/wrapper.js **********/
__modules[1] = function(module, exports) {
"use strict";
const WebSocketChannel = __require(2,1);

class WebSocketWrapper extends WebSocketChannel {
	constructor(socket, options) {
		super();
		this._wrapper = this;
		options = options || {};
		if(typeof options.debug === "function") {
			this._debug = options.debug;
		} else if(options.debug === true) {
			this._debug = console.log.bind(console);
		} else {
			this._debug = () => {}; // no-op
		}
		if(typeof options.errorToJSON !== "function") {
			this._errorToJSON = (err) => {
				if(typeof window === "undefined") {
					return JSON.stringify({"message": err.message});
				} else {
					return JSON.stringify(err,
						Object.getOwnPropertyNames(err) );
				}
			};
		} else {
			this._errorToJSON = options.errorToJSON;
		}
		if(options.requestTimeout > 0)
			this._requestTimeout = options.requestTimeout | 0;
		this._opened = false;
		this._pendingSend = [];
		this._lastRequestId = 0;
		/* Object of pending requests; keys are the request ID, values are
			Objects containing `resolve` and `reject` functions used to
			resolve the request's Promise. */
		this._pendingRequests = {};
		/* Object of WebSocketChannels (except `this` associated with this
			WebSocket); keys are the channel name. */
		this._channels = {};
		this._data = {};
		this._socket = null;
		if(socket && socket.constructor) {
			this.bind(socket);
		}
	}

	bind(socket) {
		if(this._socket) {
			var s = this._socket;
			s.onopen = s.onmessage = s.onerror = s.onclose = null;
		}
		this._socket = socket;
		socket.onopen = (event) => {
			this._opened = true;
			this._debug("socket: onopen");
			for(var i = 0; i < this._pendingSend.length; i++) {
				if(this.isConnected) {
					this._debug("wrapper: Sending pending message:",
						this._pendingSend[i]);
					try {
						this._socket.send(this._pendingSend[i]);
					} catch(e) {
						this._pendingSend = this._pendingSend.slice(i - 1);
						throw e;
					}
				} else {
					break;
				}
			}
			this._pendingSend = this._pendingSend.slice(i);
			this.emit("open", event);
		};
		socket.onmessage = (event) => {
			this._debug("socket: onmessage", event.data);
			this.emit("message", event, event.data);
			this._onMessage(event.data);
		};
		socket.onerror = (event) => {
			this._debug("socket: onerror", event);
			this.emit("error", event);
		};
		socket.onclose = (event) => {
			var opened = this._opened;
			this._opened = false;
			this._debug("socket: onclose", event);
			this.emit("close", event, opened);
			this.emit("disconnect", event, opened);
		};
		if(this.isConnected) {
			socket.onopen();
		}
		return this;
	}

	get socket() {
		return this._socket;
	}

	set socket(socket) {
		this.bind(socket);
	}
	abort() {
		for(var id in this._pendingRequests) {
			this._pendingRequests[id].reject(new Error("Request was aborted") );
		}
		this._pendingRequests = {};
		this._pendingSend = [];
		return this;
	}
	of(namespace) {
		if(namespace == null) {
			return this;
		}
		if(!this._channels[namespace]) {
			this._channels[namespace] = new WebSocketChannel(namespace, this);
		}
		return this._channels[namespace];
	}

	get isConnecting() {
		return this._socket && this._socket.readyState ===
			this._socket.constructor.CONNECTING;
	}

	get isConnected() {
		return this._socket && this._socket.readyState ===
			this._socket.constructor.OPEN;
	}

	send(data, ignoreMaxQueueSize) {
		if(this.isConnected) {
			this._debug("wrapper: Sending message:", data);
			this._socket.send(data);
		} else if(ignoreMaxQueueSize ||
			this._pendingSend.length < WebSocketWrapper.MAX_SEND_QUEUE_SIZE)
		{
			this._debug("wrapper: Queuing message:", data);
			this._pendingSend.push(data);
		} else {
			throw new Error("WebSocket is not connected and send queue is full");
		}
		return this;
	}

	disconnect() {
		if(this._socket)
			this._socket.close.apply(this._socket, arguments);
		return this;
	}
	_onMessage(msg) {
		try {
			msg = JSON.parse(msg);
			if(msg["ws-wrapper"] === false)
				return;
			if(msg.a) {
				var argsArray = [];
				for(var i in msg.a) {
					argsArray[i] = msg.a[i];
				}
				msg.a = argsArray;
			}
			/* If `msg` does not have an `a` Array with at least 1 element,
				ignore the message because it is not a valid event/request */
			if(msg.a instanceof Array && msg.a.length >= 1 &&
				(msg.c || WebSocketChannel.NO_WRAP_EVENTS.indexOf(msg.a[0]) < 0) )
			{
				var event = {
					"name": msg.a.shift(),
					"args": msg.a,
					"requestId": msg.i
				};
				var channel = msg.c == null ? this : this._channels[msg.c];
				if(!channel) {
					if(msg.i >= 0) {
						this._sendReject(msg.i, new Error(
							`Channel '${msg.c}' does not exist`
						) );
					}
					this._debug(`wrapper: Event '${event.name}' ignored ` +
							`because channel '${msg.c}' does not exist.`);
				} else if(channel._emitter.emit(event.name, event) ) {
					this._debug(`wrapper: Event '${event.name}' sent to ` +
						"event listener");
				} else {
					if(msg.i >= 0) {
						this._sendReject(msg.i, new Error(
							"No event listener for '" + event.name + "'" +
							(msg.c ? " on channel '" + msg.c + "'" : "")
						) );
					}
					this._debug(`wrapper: Event '${event.name}' had no ` +
						"event listener");
				}
			} else if(this._pendingRequests[msg.i]) {
				this._debug("wrapper: Processing response for request", msg.i);
				if(msg.e !== undefined) {
					var err = msg.e;
					if(msg._ && err) {
						err = new Error(err.message);
						for(var key in msg.e) {
							err[key] = msg.e[key];
						}
					}
					this._pendingRequests[msg.i].reject(err);
				} else {
					this._pendingRequests[msg.i].resolve(msg.d);
				}
				clearTimeout(this._pendingRequests[msg.i].timer);
				delete this._pendingRequests[msg.i];
			}
		} catch(e) {
			/* Note: It's also possible for uncaught exceptions from event
				handlers to end up here. */
		}
	}

	/* The following methods are called by a WebSocketChannel to send data
		to the Socket. */
	_sendEvent(channel, eventName, args, isRequest) {
		var data = {"a": args};
		if(channel != null) {
			data.c = channel;
		}
		var request;
		if(isRequest) {
			/* Unless we send petabytes of data using the same socket,
				we won't worry about `_lastRequestId` getting too big. */
			data.i = ++this._lastRequestId;
			request = new Promise((resolve, reject) => {
				var pendReq = this._pendingRequests[data.i] = {
					"resolve": resolve,
					"reject": reject
				};
				if(this._requestTimeout > 0) {
					pendReq.timer = setTimeout(() => {
						reject(new Error("Request timed out") );
						delete this._pendingRequests[data.i];
					}, this._requestTimeout);
				}
			});
		}
		this.send(JSON.stringify(data) );
		return request;
	}

	_sendResolve(id, data) {
		this.send(JSON.stringify({
			"i": id,
			"d": data
		}), true /* ignore max queue length */);
	}

	_sendReject(id, err) {
		var isError = err instanceof Error;
		if(isError) {
			err = JSON.parse(this._errorToJSON(err) );
		}
		this.send(JSON.stringify({
			"i": id,
			"e": err,
			"_": isError ? 1 : undefined
		}), true /* ignore max queue length */);
	}

	get(key) {
		return this._data[key];
	}

	set(key, value) {
		this._data[key] = value;
		return this;
	}
}

/* Maximum number of items in the send queue.  If a user tries to send more
	messages than this number while a WebSocket is not connected, errors will
	be thrown. */
WebSocketWrapper.MAX_SEND_QUEUE_SIZE = 10;

module.exports = WebSocketWrapper;

return module.exports;
}
/********** End of module 1: /home/derek/projects/chatroom/node_modules/ws-wrapper/lib/wrapper.js **********/
/********** Start module 2: /home/derek/projects/chatroom/node_modules/ws-wrapper/lib/channel.js **********/
__modules[2] = function(module, exports) {
"use strict";
const EventEmitter = __require(3,2).EventEmitter;

/* A WebSocketChannel exposes an EventEmitter-like API for sending and handling
	events or requests over the channel through the attached WebSocketWrapper.

	`var channel = new WebSocketChannel(name, socketWrapper);`
		- `name` - the namespace for the channel
		- `socketWrapper` - the WebSocketWrapper instance to which data should
			be sent
*/
class WebSocketChannel {
	constructor(name, socketWrapper) {
		this._name = name;
		this._wrapper = socketWrapper;
		this._emitter = new EventEmitter();
		this._wrappedListeners = new WeakMap();
	}
	get name() {
		return this._name;
	}
	set name(name) {
		throw new Error("Setting the channel name is not allowed");
	}

	/* Expose EventEmitter-like API
		When `eventName` is one of the `NO_WRAP_EVENTS`, the event handlers
		are left untouched, and the emitted events are just sent to the
		EventEmitter; otherwise, event listeners are wrapped to process the
		incoming request and the emitted events are sent to the WebSocketWrapper
		to be serialized and sent over the WebSocket. */

	on(eventName, listener) {
		if(this._name == null && WebSocketChannel.NO_WRAP_EVENTS.indexOf(eventName) >= 0)
			/* Note: The following is equivalent to:
					`this._emitter.on(eventName, listener.bind(this));`
				But thanks to eventemitter3, the following is a touch faster. */
			this._emitter.on(eventName, listener, this);
		else
			this._emitter.on(eventName, this._wrapListener(listener) );
		return this;
	}

	once(eventName, listener) {
		if(this._name == null && WebSocketChannel.NO_WRAP_EVENTS.indexOf(eventName) >= 0)
			this._emitter.once(eventName, listener, this);
		else
			this._emitter.once(eventName, this._wrapListener(listener) );
		return this;
	}

	removeListener(eventName, listener) {
		if(this._name == null && WebSocketChannel.NO_WRAP_EVENTS.indexOf(eventName) >= 0)
			this._emitter.removeListener(eventName, listener);
		else
			this._emitter.removeListener(eventName,
				this._wrappedListeners.get(listener) );
		return this;
	}

	removeAllListeners(eventName) {
		this._emitter.removeAllListeners(eventName);
		return this;
	}

	eventNames() {
		return this._emitter.eventNames();
	}

	listeners(eventName) {
		if(this._name == null && WebSocketChannel.NO_WRAP_EVENTS.indexOf(eventName) >= 0)
			return this._emitter.listeners(eventName);
		else {
			return this._emitter.listeners(eventName).map((wrapper) => {
				return wrapper._original;
			});
		}
	}

	/* The following `emit` and `request` methods will serialize and send the
		event over the WebSocket using the WebSocketWrapper. */
	emit(eventName) {
		if(this._name == null && WebSocketChannel.NO_WRAP_EVENTS.indexOf(eventName) >= 0)
			return this._emitter.emit.apply(this._emitter, arguments);
		else
			return this._wrapper._sendEvent(this._name, eventName, arguments);
	}

	/* Temporarily set the request timeout for the next request. */
	timeout(tempTimeout) {
		this._tempTimeout = tempTimeout;
		return this;
	}

	request(eventName) {
		var oldTimeout = this._wrapper._requestTimeout;
		if(this._tempTimeout !== undefined) {
			this._wrapper._requestTimeout = this._tempTimeout;
			delete this._tempTimeout;
		}
		var ret = this._wrapper._sendEvent(this._name, eventName, arguments, true);
		this._wrapper._requestTimeout = oldTimeout;
		return ret;
	}

	_wrapListener(listener) {
		if(typeof listener !== "function") {
			throw new TypeError("\"listener\" argument must be a function");
		}
		var wrapped = this._wrappedListeners.get(listener);
		if(!wrapped) {
			wrapped = function channelListenerWrapper(event)
			{
				/* This function is called when an event is emitted on this
					WebSocketChannel's `_emitter` when the WebSocketWrapper
					receives an incoming message for this channel.  If this
					event is a request, special processing is needed to
					send the response back over the socket.  Below we use
					the return value from the original `listener` to
					determine what response should be sent back.

					`this` refers to the WebSocketChannel instance
					`event` has the following properties:
					- `name`
					- `args`
					- `requestId`
				*/
				try {
					var returnVal = listener.apply(this, event.args);
				} catch(err) {
					if(event.requestId >= 0) {
						/* If event listener throws, pass that Error back
							as a response to the request */
						this._wrapper._sendReject(
							event.requestId, err);
					}
					throw err;
				}
				if(returnVal instanceof Promise) {
					/* If event listener returns a Promise, respond once
						the Promise resolves */
					returnVal
						.then((data) => {
							if(event.requestId >= 0) {
								this._wrapper._sendResolve(
									event.requestId, data);
							}
						})
						.catch((err) => {
							if(event.requestId >= 0) {
								this._wrapper._sendReject(
									event.requestId, err);
							}
						});
				} else if(event.requestId >= 0) {
					/* Otherwise, assume that the `returnVal` is what
						should be passed back as the response */
					this._wrapper._sendResolve(
						event.requestId, returnVal);
				}
			}.bind(this); // Bind the channel to the `channelListenerWrapper`
			wrapped._original = listener;
			this._wrappedListeners.set(listener, wrapped);
		}
		return wrapped;
	}

	get(key) {
		return this._wrapper.get(key);
	}

	set(key, value) {
		this._wrapper.set(key, value);
		return this;
	}
}
WebSocketChannel.prototype.addListener = WebSocketChannel.prototype.on;
WebSocketChannel.prototype.off = WebSocketChannel.prototype.removeListener;
WebSocketChannel.NO_WRAP_EVENTS = ["open", "message", "error", "close", "disconnect"];
module.exports = WebSocketChannel;

return module.exports;
}
/********** End of module 2: /home/derek/projects/chatroom/node_modules/ws-wrapper/lib/channel.js **********/
/********** Start module 3: /home/derek/projects/chatroom/node_modules/eventemitter3/index.js **********/
__modules[3] = function(module, exports) {
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}
if (Object.create) {
  Events.prototype = Object.create(null);
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prefixed = prefix;
EventEmitter.EventEmitter = EventEmitter;
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

return module.exports;
}
/********** End of module 3: /home/derek/projects/chatroom/node_modules/eventemitter3/index.js **********/
/********** Footer **********/
if(typeof module === "object")
	module.exports = __require(0);
else
	return __require(0);
})();
/********** End of footer **********/

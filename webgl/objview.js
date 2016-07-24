// generatedy by JSX compiler 0.9.19 (2013-03-21 22:04:57 +0900; 9d30054a3dff5ceafecf582f0da34e9926e8eb77)
var JSX = {};
(function (JSX) {
/**
 * copies the implementations from source interface to target
 */
function $__jsx_merge_interface(target, source) {
	for (var k in source.prototype)
		if (source.prototype.hasOwnProperty(k))
			target.prototype[k] = source.prototype[k];
}

/**
 * defers the initialization of the property
 */
function $__jsx_lazy_init(obj, prop, func) {
	function reset(obj, prop, value) {
		delete obj[prop];
		obj[prop] = value;
		return value;
	}

	Object.defineProperty(obj, prop, {
		get: function () {
			return reset(obj, prop, func());
		},
		set: function (v) {
			reset(obj, prop, v);
		},
		enumerable: true,
		configurable: true
	});
}

/**
 * sideeffect().a /= b
 */
function $__jsx_div_assign(obj, prop, divisor) {
	return obj[prop] = (obj[prop] / divisor) | 0;
}

/*
 * global functions, renamed to avoid conflict with local variable names
 */
var $__jsx_parseInt = parseInt;
var $__jsx_parseFloat = parseFloat;
var $__jsx_isNaN = isNaN;
var $__jsx_isFinite = isFinite;

var $__jsx_encodeURIComponent = encodeURIComponent;
var $__jsx_decodeURIComponent = decodeURIComponent;
var $__jsx_encodeURI = encodeURI;
var $__jsx_decodeURI = decodeURI;

var $__jsx_ObjectToString = Object.prototype.toString;
var $__jsx_ObjectHasOwnProperty = Object.prototype.hasOwnProperty;

/*
 * profiler object, initialized afterwards
 */
function $__jsx_profiler() {
}

/*
 * public interface to JSX code
 */
JSX.require = function (path) {
	var m = $__jsx_classMap[path];
	return m !== undefined ? m : null;
};

JSX.profilerIsRunning = function () {
	return $__jsx_profiler.getResults != null;
};

JSX.getProfileResults = function () {
	return ($__jsx_profiler.getResults || function () { return {}; })();
};

JSX.postProfileResults = function (url, cb) {
	if ($__jsx_profiler.postResults == null)
		throw new Error("profiler has not been turned on");
	return $__jsx_profiler.postResults(url, cb);
};

JSX.resetProfileResults = function () {
	if ($__jsx_profiler.resetResults == null)
		throw new Error("profiler has not been turned on");
	return $__jsx_profiler.resetResults();
};
JSX.DEBUG = false;
/**
 * class _Main extends Object
 * @constructor
 */
function _Main() {
}

/**
 * @constructor
 */
function _Main$() {
};

_Main$.prototype = new _Main;

/**
 * @param {Array.<undefined|!string>} args
 */
_Main.main$AS = function (args) {
	/** @type {HTMLCanvasElement} */
	var canvas;
	/** @type {WebGLRenderingContext} */
	var gl;
	/** @type {WebGLShader} */
	var vs;
	/** @type {WebGLShader} */
	var fs;
	/** @type {WebGLProgram} */
	var prog;
	/** @type {!number} */
	var frame_num;
	/** @type {*} */
	var draw_frame;
	/** @type {HTMLDivElement} */
	var rcv;
	canvas = dom.document.getElementById('cvs');
	gl = canvas.getContext('experimental-webgl', ({ premultipliedAlpha: false }));
	_Main.gl = gl;
	vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, dom.document.getElementById('vs').text);
	gl.compileShader(vs);
	if (! (!! gl.getShaderParameter(vs, gl.COMPILE_STATUS))) {
		dom.window.alert(gl.getShaderInfoLog(vs));
	}
	fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, dom.document.getElementById('fs').text);
	gl.compileShader(fs);
	if (! (!! gl.getShaderParameter(fs, gl.COMPILE_STATUS))) {
		dom.window.alert(gl.getShaderInfoLog(fs));
	}
	prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	if (! (!! gl.getProgramParameter(prog, gl.LINK_STATUS))) {
		dom.window.alert(gl.getProgramInfoLog(prog));
	}
	_Main.prog = prog;
	gl.useProgram(prog);
	frame_num = 0;
	draw_frame = (function () {
		/** @type {M44} */
		var proj_mat;
		/** @type {M44} */
		var mv_mat;
		/** @type {!number} */
		var vpos;
		/** @type {!number} */
		var npos;
		/** @type {!number} */
		var i;
		/** @type {GLObject} */
		var obj;
		/** @type {M44} */
		var $this$0;
		/** @type {M44} */
		var m$0;
		/** @type {M44} */
		var $this$0$0;
		/** @type {!number} */
		var rad$0;
		++ frame_num;
		proj_mat = M44$setFrustum$LM44$NNNNNN(new M44$(), -1, 1, -1, 1, 3, 10);
		$this$0$0 = new M44$();
		M44$set$LM44$N($this$0$0, 1);
		$this$0$0.m14 = 0;
		$this$0$0.m24 = 0;
		$this$0$0.m34 = -6;
		$this$0 = $this$0$0;
		rad$0 = frame_num * 0.01;
		m$0 = M44$setRotation$LM44$NNNN(new M44$(), rad$0, 0, 1, 0);
		mv_mat = M44$mul$LM44$LM44$LM44$($this$0, new M44$LM44$($this$0), m$0);
		gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'projectionMatrix'), false, M44$array$LM44$(proj_mat));
		gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'modelviewMatrix'), false, M44$array$LM44$(mv_mat));
		gl.clearColor(0.5, 0.5, 0.5, 0.5);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		vpos = gl.getAttribLocation(prog, 'vertex');
		npos = gl.getAttribLocation(prog, 'normal');
		for (i = 0; i < _Main.objs.length; ++ i) {
			obj = _Main.objs[i];
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.vbuf);
			gl.vertexAttribPointer(vpos, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(vpos);
			if (dom.document.getElementById('smooth').checked) {
				gl.bindBuffer(gl.ARRAY_BUFFER, obj.snbuf);
			} else {
				gl.bindBuffer(gl.ARRAY_BUFFER, obj.nbuf);
			}
			gl.vertexAttribPointer(npos, 3, gl.FLOAT, true, 0, 0);
			gl.enableVertexAttribArray(npos);
			gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length / 3);
		}
		dom.window.setTimeout(draw_frame, 20);
	});
	dom.window.setTimeout(draw_frame, 20);
	rcv = dom.document.getElementById('rcv');
	rcv.ondragover = (function (e) {
		e.preventDefault();
	});
	rcv.ondrop = (function (e) {
		/** @type {DragEvent} */
		var de;
		/** @type {File} */
		var file;
		/** @type {FileReader} */
		var file_reader;
		e.preventDefault();
		de = e;
		file = de.dataTransfer.files[0];
		file_reader = new FileReader();
		file_reader.onload = (function (e) {
			/** @type {!string} */
			var obj_txt;
			/** @type {ObjFile} */
			var obj;
			/** @type {GLObject} */
			var globj;
			obj_txt = e.target.result;
			obj = ObjFile$parse$S(obj_txt);
			globj = new GLObject$LObjFile$(obj);
			_Main$show$LGLObject$(globj);
		});
		file_reader.readAsText(file);
	});
	dom.document.getElementById("miku").onclick = (function (e) {
		/** @type {XMLHttpRequest} */
		var xhr;
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = (function (e) {
			/** @type {!string} */
			var obj_txt;
			/** @type {ObjFile} */
			var obj;
			/** @type {GLObject} */
			var globj;
			if (xhr.readyState === 4) {
				obj_txt = xhr.responseText;
				obj = ObjFile$parse$S(obj_txt);
				globj = new GLObject$LObjFile$(obj);
				_Main$show$LGLObject$(globj);
			}
		});
		xhr.open("GET", "miku2.obj", true);
		xhr.send("");
	});
};

var _Main$main$AS = _Main.main$AS;

/**
 * @param {GLObject} obj
 */
_Main.show$LGLObject$ = function (obj) {
	/** @type {WebGLRenderingContext} */
	var gl;
	/** @type {WebGLBuffer} */
	var vbuf$0;
	/** @type {WebGLBuffer} */
	var nbuf$0;
	/** @type {WebGLBuffer} */
	var snbuf$0;
	gl = _Main.gl;
	vbuf$0 = obj.vbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbuf$0);
	gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
	nbuf$0 = obj.nbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nbuf$0);
	gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
	snbuf$0 = obj.snbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, snbuf$0);
	gl.bufferData(gl.ARRAY_BUFFER, obj.smoothNormals, gl.STATIC_DRAW);
	_Main.objs.push(obj);
};

var _Main$show$LGLObject$ = _Main.show$LGLObject$;

/**
 * class dom extends Object
 * @constructor
 */
function dom() {
}

/**
 * @constructor
 */
function dom$() {
};

dom$.prototype = new dom;

/**
 * @param {!string} id
 * @return {HTMLElement}
 */
dom.id$S = function (id) {
	return dom.document.getElementById(id);
};

var dom$id$S = dom.id$S;

/**
 * @param {!string} id
 * @return {HTMLElement}
 */
dom.getElementById$S = function (id) {
	return dom.document.getElementById(id);
};

var dom$getElementById$S = dom.getElementById$S;

/**
 * @param {!string} tag
 * @return {HTMLElement}
 */
dom.createElement$S = function (tag) {
	return dom.document.createElement(tag);
};

var dom$createElement$S = dom.createElement$S;

/**
 * class EventInit extends Object
 * @constructor
 */
function EventInit() {
}

/**
 * @constructor
 */
function EventInit$() {
	this.bubbles = false;
	this.cancelable = false;
};

EventInit$.prototype = new EventInit;

/**
 * class CustomEventInit extends EventInit
 * @constructor
 */
function CustomEventInit() {
}

CustomEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function CustomEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.detail = null;
};

CustomEventInit$.prototype = new CustomEventInit;

/**
 * class MutationObserverInit extends Object
 * @constructor
 */
function MutationObserverInit() {
}

/**
 * @constructor
 */
function MutationObserverInit$() {
	this.childList = false;
	this.attributes = false;
	this.characterData = false;
	this.subtree = false;
	this.attributeOldValue = false;
	this.characterDataOldValue = false;
	this.attributeFilter = null;
};

MutationObserverInit$.prototype = new MutationObserverInit;

/**
 * class UIEventInit extends EventInit
 * @constructor
 */
function UIEventInit() {
}

UIEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function UIEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
};

UIEventInit$.prototype = new UIEventInit;

/**
 * class FocusEventInit extends Object
 * @constructor
 */
function FocusEventInit() {
}

/**
 * @constructor
 */
function FocusEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
	this.relatedTarget = null;
};

FocusEventInit$.prototype = new FocusEventInit;

/**
 * class MouseEventInit extends UIEventInit
 * @constructor
 */
function MouseEventInit() {
}

MouseEventInit.prototype = new UIEventInit;
/**
 * @constructor
 */
function MouseEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
	this.screenX = 0;
	this.screenY = 0;
	this.clientX = 0;
	this.clientY = 0;
	this.ctrlKey = false;
	this.shiftKey = false;
	this.altKey = false;
	this.metaKey = false;
	this.button = 0;
	this.buttons = 0;
	this.relatedTarget = null;
	this.region = null;
};

MouseEventInit$.prototype = new MouseEventInit;

/**
 * class WheelEventInit extends Object
 * @constructor
 */
function WheelEventInit() {
}

/**
 * @constructor
 */
function WheelEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
	this.screenX = 0;
	this.screenY = 0;
	this.clientX = 0;
	this.clientY = 0;
	this.ctrlKey = false;
	this.shiftKey = false;
	this.altKey = false;
	this.metaKey = false;
	this.button = 0;
	this.buttons = 0;
	this.relatedTarget = null;
	this.deltaX = 0;
	this.deltaY = 0;
	this.deltaZ = 0;
	this.deltaMode = 0;
};

WheelEventInit$.prototype = new WheelEventInit;

/**
 * class KeyboardEventInit extends Object
 * @constructor
 */
function KeyboardEventInit() {
}

/**
 * @constructor
 */
function KeyboardEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
	this.char = "";
	this.key = "";
	this.location = 0;
	this.ctrlKey = false;
	this.shiftKey = false;
	this.altKey = false;
	this.metaKey = false;
	this.repeat = false;
	this.locale = "";
	this.charCode = 0;
	this.keyCode = 0;
	this.which = 0;
};

KeyboardEventInit$.prototype = new KeyboardEventInit;

/**
 * class CompositionEventInit extends Object
 * @constructor
 */
function CompositionEventInit() {
}

/**
 * @constructor
 */
function CompositionEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
	this.data = null;
	this.locale = "";
};

CompositionEventInit$.prototype = new CompositionEventInit;

/**
 * class ProgressEventInit extends EventInit
 * @constructor
 */
function ProgressEventInit() {
}

ProgressEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function ProgressEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.lengthComputable = false;
	this.loaded = 0;
	this.total = 0;
};

ProgressEventInit$.prototype = new ProgressEventInit;

/**
 * class XMLHttpRequestOptions extends Object
 * @constructor
 */
function XMLHttpRequestOptions() {
}

/**
 * @constructor
 */
function XMLHttpRequestOptions$() {
	this.anon = false;
};

XMLHttpRequestOptions$.prototype = new XMLHttpRequestOptions;

/**
 * class TrackEventInit extends EventInit
 * @constructor
 */
function TrackEventInit() {
}

TrackEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function TrackEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.track = null;
};

TrackEventInit$.prototype = new TrackEventInit;

/**
 * class PopStateEventInit extends EventInit
 * @constructor
 */
function PopStateEventInit() {
}

PopStateEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function PopStateEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.state = null;
};

PopStateEventInit$.prototype = new PopStateEventInit;

/**
 * class HashChangeEventInit extends EventInit
 * @constructor
 */
function HashChangeEventInit() {
}

HashChangeEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function HashChangeEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.oldURL = "";
	this.newURL = "";
};

HashChangeEventInit$.prototype = new HashChangeEventInit;

/**
 * class PageTransitionEventInit extends EventInit
 * @constructor
 */
function PageTransitionEventInit() {
}

PageTransitionEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function PageTransitionEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.persisted = false;
};

PageTransitionEventInit$.prototype = new PageTransitionEventInit;

/**
 * class DragEventInit extends EventInit
 * @constructor
 */
function DragEventInit() {
}

DragEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function DragEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.view = null;
	this.detail = 0;
	this.screenX = 0;
	this.screenY = 0;
	this.clientX = 0;
	this.clientY = 0;
	this.ctrlKey = false;
	this.shiftKey = false;
	this.altKey = false;
	this.metaKey = false;
	this.button = 0;
	this.buttons = 0;
	this.relatedTarget = null;
	this.dataTransfer = null;
};

DragEventInit$.prototype = new DragEventInit;

/**
 * class CloseEventInit extends EventInit
 * @constructor
 */
function CloseEventInit() {
}

CloseEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function CloseEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.wasClean = false;
	this.code = 0;
	this.reason = "";
};

CloseEventInit$.prototype = new CloseEventInit;

/**
 * class StorageEventInit extends EventInit
 * @constructor
 */
function StorageEventInit() {
}

StorageEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function StorageEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.key = null;
	this.oldValue = null;
	this.newValue = null;
	this.url = "";
	this.storageArea = null;
};

StorageEventInit$.prototype = new StorageEventInit;

/**
 * class MessageEventInit extends EventInit
 * @constructor
 */
function MessageEventInit() {
}

MessageEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function MessageEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.data = null;
	this.origin = "";
	this.lastEventId = "";
	this.source = null;
	this.ports = null;
};

MessageEventInit$.prototype = new MessageEventInit;

/**
 * class ErrorEventInit extends EventInit
 * @constructor
 */
function ErrorEventInit() {
}

ErrorEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function ErrorEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.message = "";
	this.filename = "";
	this.lineno = 0;
};

ErrorEventInit$.prototype = new ErrorEventInit;

/**
 * class EventSourceInit extends Object
 * @constructor
 */
function EventSourceInit() {
}

/**
 * @constructor
 */
function EventSourceInit$() {
	this.withCredentials = false;
};

EventSourceInit$.prototype = new EventSourceInit;

/**
 * class IDBObjectStoreParameters extends Object
 * @constructor
 */
function IDBObjectStoreParameters() {
}

/**
 * @constructor
 */
function IDBObjectStoreParameters$() {
	this.keyPath = null;
	this.autoIncrement = false;
};

IDBObjectStoreParameters$.prototype = new IDBObjectStoreParameters;

/**
 * class IDBIndexParameters extends Object
 * @constructor
 */
function IDBIndexParameters() {
}

/**
 * @constructor
 */
function IDBIndexParameters$() {
	this.unique = false;
	this.multiEntry = false;
};

IDBIndexParameters$.prototype = new IDBIndexParameters;

/**
 * class IDBVersionChangeEventInit extends EventInit
 * @constructor
 */
function IDBVersionChangeEventInit() {
}

IDBVersionChangeEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function IDBVersionChangeEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.oldVersion = 0;
	this.newVersion = null;
};

IDBVersionChangeEventInit$.prototype = new IDBVersionChangeEventInit;

/**
 * class NotificationOptions extends Object
 * @constructor
 */
function NotificationOptions() {
}

/**
 * @constructor
 */
function NotificationOptions$() {
	this.titleDir = "";
	this.body = "";
	this.bodyDir = "";
	this.tag = "";
	this.iconUrl = "";
};

NotificationOptions$.prototype = new NotificationOptions;

/**
 * class RTCSessionDescriptionInit extends Object
 * @constructor
 */
function RTCSessionDescriptionInit() {
}

/**
 * @constructor
 */
function RTCSessionDescriptionInit$() {
	this.type = "";
	this.sdp = "";
};

RTCSessionDescriptionInit$.prototype = new RTCSessionDescriptionInit;

/**
 * class RTCIceCandidateInit extends Object
 * @constructor
 */
function RTCIceCandidateInit() {
}

/**
 * @constructor
 */
function RTCIceCandidateInit$() {
	this.candidate = "";
	this.sdpMid = "";
	this.sdpMLineIndex = 0;
};

RTCIceCandidateInit$.prototype = new RTCIceCandidateInit;

/**
 * class RTCIceServer extends Object
 * @constructor
 */
function RTCIceServer() {
}

/**
 * @constructor
 */
function RTCIceServer$() {
	this.url = "";
	this.credential = null;
};

RTCIceServer$.prototype = new RTCIceServer;

/**
 * class RTCConfiguration extends Object
 * @constructor
 */
function RTCConfiguration() {
}

/**
 * @constructor
 */
function RTCConfiguration$() {
	this.iceServers = null;
};

RTCConfiguration$.prototype = new RTCConfiguration;

/**
 * class DataChannelInit extends Object
 * @constructor
 */
function DataChannelInit() {
}

/**
 * @constructor
 */
function DataChannelInit$() {
	this.reliable = false;
};

DataChannelInit$.prototype = new DataChannelInit;

/**
 * class RTCPeerConnectionIceEventInit extends EventInit
 * @constructor
 */
function RTCPeerConnectionIceEventInit() {
}

RTCPeerConnectionIceEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function RTCPeerConnectionIceEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.candidate = null;
};

RTCPeerConnectionIceEventInit$.prototype = new RTCPeerConnectionIceEventInit;

/**
 * class MediaStreamEventInit extends EventInit
 * @constructor
 */
function MediaStreamEventInit() {
}

MediaStreamEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function MediaStreamEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.stream = null;
};

MediaStreamEventInit$.prototype = new MediaStreamEventInit;

/**
 * class DataChannelEventInit extends EventInit
 * @constructor
 */
function DataChannelEventInit() {
}

DataChannelEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function DataChannelEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.channel = null;
};

DataChannelEventInit$.prototype = new DataChannelEventInit;

/**
 * class MediaStreamConstraints extends Object
 * @constructor
 */
function MediaStreamConstraints() {
}

/**
 * @constructor
 */
function MediaStreamConstraints$() {
	this.video = null;
	this.audio = null;
};

MediaStreamConstraints$.prototype = new MediaStreamConstraints;

/**
 * class MediaTrackConstraints extends Object
 * @constructor
 */
function MediaTrackConstraints() {
}

/**
 * @constructor
 */
function MediaTrackConstraints$() {
	this.mandatory = null;
	this.optional = null;
};

MediaTrackConstraints$.prototype = new MediaTrackConstraints;

/**
 * class HitRegionOptions extends Object
 * @constructor
 */
function HitRegionOptions() {
}

/**
 * @constructor
 */
function HitRegionOptions$() {
	this.path = null;
	this.id = "";
	this.parentID = null;
	this.cursor = "";
	this.control = null;
	this.label = null;
	this.role = null;
};

HitRegionOptions$.prototype = new HitRegionOptions;

/**
 * class WebGLContextAttributes extends Object
 * @constructor
 */
function WebGLContextAttributes() {
}

/**
 * @constructor
 */
function WebGLContextAttributes$() {
	this.alpha = false;
	this.depth = false;
	this.stencil = false;
	this.antialias = false;
	this.premultipliedAlpha = false;
	this.preserveDrawingBuffer = false;
};

WebGLContextAttributes$.prototype = new WebGLContextAttributes;

/**
 * class WebGLContextEventInit extends EventInit
 * @constructor
 */
function WebGLContextEventInit() {
}

WebGLContextEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function WebGLContextEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.statusMessage = "";
};

WebGLContextEventInit$.prototype = new WebGLContextEventInit;

/**
 * class DeviceOrientationEventInit extends EventInit
 * @constructor
 */
function DeviceOrientationEventInit() {
}

DeviceOrientationEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function DeviceOrientationEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.alpha = null;
	this.beta = null;
	this.gamma = null;
	this.absolute = false;
};

DeviceOrientationEventInit$.prototype = new DeviceOrientationEventInit;

/**
 * class DeviceMotionEventInit extends EventInit
 * @constructor
 */
function DeviceMotionEventInit() {
}

DeviceMotionEventInit.prototype = new EventInit;
/**
 * @constructor
 */
function DeviceMotionEventInit$() {
	this.bubbles = false;
	this.cancelable = false;
	this.acceleration = null;
	this.accelerationIncludingGravity = null;
	this.rotationRate = null;
	this.interval = null;
};

DeviceMotionEventInit$.prototype = new DeviceMotionEventInit;

/**
 * class ObjFile extends Object
 * @constructor
 */
function ObjFile() {
}

/**
 * @constructor
 */
function ObjFile$() {
	this.vertices = [];
	this.normals = [];
	this.texcoords = [];
	this.faces = [];
};

ObjFile$.prototype = new ObjFile;

/**
 * @param {!string} txt
 * @return {ObjFile}
 */
ObjFile.parse$S = function (txt) {
	/** @type {ObjFile} */
	var obj;
	/** @type {Array.<undefined|!string>} */
	var lines;
	/** @type {!number} */
	var line_num;
	/** @type {undefined|!string} */
	var line;
	/** @type {Array.<undefined|!string>} */
	var words;
	/** @type {Array.<undefined|ObjFile$CVTN>} */
	var face;
	/** @type {!number} */
	var wi;
	/** @type {Array.<undefined|!string>} */
	var nums;
	/** @type {ObjFile$CVTN} */
	var vtn;
	obj = ({vertices: [], normals: [], texcoords: [], faces: []});
	lines = txt.split('\n');
	for (line_num = 0; line_num < lines.length; ++ line_num) {
		line = lines[line_num];
		if (line.length < 1) {
			continue;
		}
		words = line.split(' ');
		switch (words[0]) {
		default:
			break;
		case 'v':
			obj.vertices.push($__jsx_parseFloat(words[1]));
			obj.vertices.push($__jsx_parseFloat(words[2]));
			obj.vertices.push($__jsx_parseFloat(words[3]));
			break;
		case 'vt':
			obj.texcoords.push($__jsx_parseFloat(words[1]));
			obj.texcoords.push($__jsx_parseFloat(words[2]));
			break;
		case 'vn':
			obj.normals.push($__jsx_parseFloat(words[1]));
			obj.normals.push($__jsx_parseFloat(words[2]));
			obj.normals.push($__jsx_parseFloat(words[3]));
			break;
		case 'f':
			face = new Array(words.length - 1);
			for (wi = 1; wi < words.length; ++ wi) {
				nums = words[wi].split('/');
				vtn = ({vindex: 0, tindex: 0, nindex: 0});
				if (nums.length === 1) {
					vtn.vindex = $__jsx_parseInt(nums[0]);
					vtn.tindex = NaN;
					vtn.nindex = NaN;
				} else {
					if (nums.length === 3) {
						vtn.vindex = $__jsx_parseInt(nums[0]);
						vtn.tindex = $__jsx_parseInt(nums[1]);
						vtn.nindex = $__jsx_parseInt(nums[2]);
					}
				}
				face[wi - 1] = vtn;
			}
			obj.faces.push(face);
			break;
		}
	}
	return obj;
};

var ObjFile$parse$S = ObjFile.parse$S;

/**
 * class GLObject extends Object
 * @constructor
 */
function GLObject() {
}

/**
 * @constructor
 * @param {ObjFile} obj
 */
function GLObject$LObjFile$(obj) {
	/** @type {!number} */
	var num_triangles;
	/** @type {!number} */
	var triangle_num;
	/** @type {!number} */
	var i;
	/** @type {!number} */
	var fi;
	/** @type {Array.<undefined|ObjFile$CVTN>} */
	var face;
	/** @type {!number} */
	var ti;
	/** @type {!number} */
	var vi0;
	/** @type {!number} */
	var vi1;
	/** @type {!number} */
	var vi2;
	/** @type {V3} */
	var v0;
	/** @type {V3} */
	var v1;
	/** @type {V3} */
	var v2;
	/** @type {V3} */
	var n;
	/** @type {V3} */
	var n0;
	/** @type {V3} */
	var n1;
	/** @type {V3} */
	var n2;
	/** @type {V3} */
	var $this$0;
	/** @type {!number} */
	var l$0;
	/** @type {Array.<undefined|!number>} */
	var vertices$0;
	/** @type {Array.<undefined|!number>} */
	var vertices$1;
	/** @type {Array.<undefined|!number>} */
	var vertices$2;
	/** @type {Array.<undefined|V3>} */
	var smoothNormalVertex$0;
	this.vertices = null;
	this.normals = null;
	this.smoothNormalVertex = null;
	this.smoothNormals = null;
	this.vbuf = null;
	this.nbuf = null;
	this.snbuf = null;
	this.weight = [];
	num_triangles = 0;
	triangle_num = 0;
	for (i = 0; i < obj.faces.length; ++ i) {
		num_triangles += obj.faces[i].length - 2;
	}
	this.vertices = new Float32Array(num_triangles * 9);
	this.normals = new Float32Array(num_triangles * 9);
	this.smoothNormals = new Float32Array(num_triangles * 9);
	this.smoothNormalVertex = new Array(obj.vertices.length);
	for (i = 0; i < obj.vertices.length; ++ i) {
		this.weight[i] = 0;
	}
	for (fi = 0; fi < obj.faces.length; ++ fi) {
		face = obj.faces[fi];
		for (ti = 1; ti < face.length - 1; ++ ti) {
			vi0 = face[0].vindex - 1;
			vi1 = face[ti].vindex - 1;
			vi2 = face[ti + 1].vindex - 1;
			v0 = new V3$NNN((vertices$0 = obj.vertices)[vi0 * 3], vertices$0[vi0 * 3 + 1], vertices$0[vi0 * 3 + 2]);
			v1 = new V3$NNN((vertices$1 = obj.vertices)[vi1 * 3], vertices$1[vi1 * 3 + 1], vertices$1[vi1 * 3 + 2]);
			v2 = new V3$NNN((vertices$2 = obj.vertices)[vi2 * 3], vertices$2[vi2 * 3 + 1], vertices$2[vi2 * 3 + 2]);
			this.vertices.set([ v0.x, v0.y, v0.z ], triangle_num * 9);
			this.vertices.set([ v1.x, v1.y, v1.z ], triangle_num * 9 + 3);
			this.vertices.set([ v2.x, v2.y, v2.z ], triangle_num * 9 + 6);
			$this$0 = V3$cross$LV3$LV3$LV3$(new V3$(), V3$sub$LV3$LV3$(v1, v0), V3$sub$LV3$LV3$(v2, v0));
			l$0 = Math.sqrt(V3$len2$LV3$($this$0));
			n = (l$0 > 0 ? V3$mul$LV3$N($this$0, 1 / l$0) : $this$0);
			this.normals.set([ n.x, n.y, n.z ], triangle_num * 9);
			this.normals.set([ n.x, n.y, n.z ], triangle_num * 9 + 3);
			this.normals.set([ n.x, n.y, n.z ], triangle_num * 9 + 6);
			GLObject$smoothVertice$LGLObject$NNNN(this, vi0, n.x, n.y, n.z);
			GLObject$smoothVertice$LGLObject$NNNN(this, vi1, n.x, n.y, n.z);
			GLObject$smoothVertice$LGLObject$NNNN(this, vi2, n.x, n.y, n.z);
			++ triangle_num;
		}
	}
	triangle_num = 0;
	for (fi = 0; fi < obj.faces.length; ++ fi) {
		face = obj.faces[fi];
		for (ti = 1; ti < face.length - 1; ++ ti) {
			vi0 = face[0].vindex - 1;
			vi1 = face[ti].vindex - 1;
			vi2 = face[ti + 1].vindex - 1;
			n0 = (smoothNormalVertex$0 = this.smoothNormalVertex)[vi0];
			n1 = smoothNormalVertex$0[vi1];
			n2 = smoothNormalVertex$0[vi2];
			this.smoothNormals.set([ n0.x, n0.y, n0.z ], triangle_num * 9);
			this.smoothNormals.set([ n1.x, n1.y, n1.z ], triangle_num * 9 + 3);
			this.smoothNormals.set([ n2.x, n2.y, n2.z ], triangle_num * 9 + 6);
			++ triangle_num;
		}
	}
};

GLObject$LObjFile$.prototype = new GLObject;

/**
 * @param {GLObject} $this
 * @param {!number} index
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 */
GLObject.smoothVertice$LGLObject$NNNN = function ($this, index, x, y, z) {
	/** @type {undefined|!number} */
	var w;
	/** @type {V3} */
	var v;
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	if ($this.weight[index] == 0) {
		$this.smoothNormalVertex[index] = new V3$NNN(x, y, z);
	} else {
		w = $this.weight[index];
		v = $this.smoothNormalVertex[index];
		x$0 = (v.x * w + x) / (w + 1);
		y$0 = (v.y * w + y) / (w + 1);
		z$0 = (v.z * w + z) / (w + 1);
		v.x = x$0;
		v.y = y$0;
		v.z = z$0;
	}
	$this.weight[index]++;
};

var GLObject$smoothVertice$LGLObject$NNNN = GLObject.smoothVertice$LGLObject$NNNN;

/**
 * class MVQ extends Object
 * @constructor
 */
function MVQ() {
}

/**
 * @constructor
 */
function MVQ$() {
};

MVQ$.prototype = new MVQ;

/**
 * class V2 extends Object
 * @constructor
 */
function V2() {
}

/**
 * @constructor
 */
function V2$() {
	this.x = 0;
	this.y = 0;
};

V2$.prototype = new V2;

/**
 * @constructor
 * @param {V2} v
 */
function V2$LV2$(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	this.x = 0;
	this.y = 0;
	x$0$0 = v.x;
	y$0$0 = v.y;
	this.x = x$0$0;
	this.y = y$0$0;
};

V2$LV2$.prototype = new V2;

/**
 * @constructor
 * @param {Array.<undefined|!number>} v
 */
function V2$AN(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	x$0$0 = v[0];
	y$0$0 = v[1];
	this.x = x$0$0;
	this.y = y$0$0;
};

V2$AN.prototype = new V2;

/**
 * @constructor
 * @param {Float32Array} v
 */
function V2$LFloat32Array$(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	x$0$0 = v[0];
	y$0$0 = v[1];
	this.x = x$0$0;
	this.y = y$0$0;
};

V2$LFloat32Array$.prototype = new V2;

/**
 * @constructor
 * @param {!number} x
 * @param {!number} y
 */
function V2$NN(x, y) {
	this.x = x;
	this.y = y;
};

V2$NN.prototype = new V2;

/**
 * @constructor
 * @param {V3} v
 */
function V2$LV3$(v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	this.x = 0;
	this.y = 0;
	x$0 = v.x;
	y$0 = v.y;
	this.x = x$0;
	this.y = y$0;
};

V2$LV3$.prototype = new V2;

/**
 * @constructor
 * @param {V4} v
 */
function V2$LV4$(v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	this.x = 0;
	this.y = 0;
	x$0 = v.x;
	y$0 = v.y;
	this.x = x$0;
	this.y = y$0;
};

V2$LV4$.prototype = new V2;

/**
 * @param {V2} $this
 * @return {Array.<undefined|!number>}
 */
V2.array$LV2$ = function ($this) {
	return [ $this.x, $this.y ];
};

var V2$array$LV2$ = V2.array$LV2$;

/**
 * @param {V2} $this
 * @param {!number} z
 * @return {V3}
 */
V2.V3$LV2$N = function ($this, z) {
	return new V3$LV2$N($this, z);
};

var V2$V3$LV2$N = V2.V3$LV2$N;

/**
 * @param {V2} $this
 * @param {!number} z
 * @param {!number} w
 * @return {V4}
 */
V2.V4$LV2$NN = function ($this, z, w) {
	return new V4$LV2$NN($this, z, w);
};

var V2$V4$LV2$NN = V2.V4$LV2$NN;

/**
 * @param {V2} $this
 * @param {V3} v
 * @return {V2}
 */
V2.set$LV2$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x = x$0;
	$this.y = y$0;
	return $this;
};

var V2$set$LV2$LV3$ = V2.set$LV2$LV3$;

/**
 * @param {V2} $this
 * @param {V4} v
 * @return {V2}
 */
V2.set$LV2$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x = x$0;
	$this.y = y$0;
	return $this;
};

var V2$set$LV2$LV4$ = V2.set$LV2$LV4$;

/**
 * @param {V2} $this
 * @return {V2}
 */
V2.clone$LV2$ = function ($this) {
	return new V2$LV2$($this);
};

var V2$clone$LV2$ = V2.clone$LV2$;

/**
 * @param {V2} $this
 * @return {V2}
 */
V2.clear$LV2$ = function ($this) {
	$this.x = 0;
	$this.y = 0;
	return $this;
};

var V2$clear$LV2$ = V2.clear$LV2$;

/**
 * @param {V2} $this
 * @param {!number} x
 * @param {!number} y
 * @return {V2}
 */
V2.set$LV2$NN = function ($this, x, y) {
	$this.x = x;
	$this.y = y;
	return $this;
};

var V2$set$LV2$NN = V2.set$LV2$NN;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {V2}
 */
V2.set$LV2$LV2$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x = x$0;
	$this.y = y$0;
	return $this;
};

var V2$set$LV2$LV2$ = V2.set$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {Array.<undefined|!number>} v
 * @return {V2}
 */
V2.set$LV2$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x = x$0;
	$this.y = y$0;
	return $this;
};

var V2$set$LV2$AN = V2.set$LV2$AN;

/**
 * @param {V2} $this
 * @param {Float32Array} v
 * @return {V2}
 */
V2.set$LV2$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x = x$0;
	$this.y = y$0;
	return $this;
};

var V2$set$LV2$LFloat32Array$ = V2.set$LV2$LFloat32Array$;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {!boolean}
 */
V2.equals$LV2$LV2$ = function ($this, v) {
	var $math_abs_t;
	return (($math_abs_t = v.x - $this.x) >= 0 ? $math_abs_t : -$math_abs_t) < 0.000001 && (($math_abs_t = v.y - $this.y) >= 0 ? $math_abs_t : -$math_abs_t) < 0.000001;
};

var V2$equals$LV2$LV2$ = V2.equals$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {V2} v
 * @param {!number} eps
 * @return {!boolean}
 */
V2.equals$LV2$LV2$N = function ($this, v, eps) {
	var $math_abs_t;
	return (($math_abs_t = v.x - $this.x) >= 0 ? $math_abs_t : -$math_abs_t) < eps && (($math_abs_t = v.y - $this.y) >= 0 ? $math_abs_t : -$math_abs_t) < eps;
};

var V2$equals$LV2$LV2$N = V2.equals$LV2$LV2$N;

/**
 * @param {V2} $this
 * @param {!number} x
 * @param {!number} y
 * @return {V2}
 */
V2.add$LV2$NN = function ($this, x, y) {
	$this.x += x;
	$this.y += y;
	return $this;
};

var V2$add$LV2$NN = V2.add$LV2$NN;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {V2}
 */
V2.add$LV2$LV2$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x += x$0;
	$this.y += y$0;
	return $this;
};

var V2$add$LV2$LV2$ = V2.add$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {Array.<undefined|!number>} v
 * @return {V2}
 */
V2.add$LV2$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x += x$0;
	$this.y += y$0;
	return $this;
};

var V2$add$LV2$AN = V2.add$LV2$AN;

/**
 * @param {V2} $this
 * @param {Float32Array} v
 * @return {V2}
 */
V2.add$LV2$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x += x$0;
	$this.y += y$0;
	return $this;
};

var V2$add$LV2$LFloat32Array$ = V2.add$LV2$LFloat32Array$;

/**
 * @param {V2} $this
 * @param {!number} x
 * @param {!number} y
 * @return {V2}
 */
V2.sub$LV2$NN = function ($this, x, y) {
	$this.x -= x;
	$this.y -= y;
	return $this;
};

var V2$sub$LV2$NN = V2.sub$LV2$NN;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {V2}
 */
V2.sub$LV2$LV2$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x -= x$0;
	$this.y -= y$0;
	return $this;
};

var V2$sub$LV2$LV2$ = V2.sub$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {Array.<undefined|!number>} v
 * @return {V2}
 */
V2.sub$LV2$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x -= x$0;
	$this.y -= y$0;
	return $this;
};

var V2$sub$LV2$AN = V2.sub$LV2$AN;

/**
 * @param {V2} $this
 * @param {Float32Array} v
 * @return {V2}
 */
V2.sub$LV2$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x -= x$0;
	$this.y -= y$0;
	return $this;
};

var V2$sub$LV2$LFloat32Array$ = V2.sub$LV2$LFloat32Array$;

/**
 * @param {V2} $this
 * @param {!number} x
 * @param {!number} y
 * @return {V2}
 */
V2.mul$LV2$NN = function ($this, x, y) {
	$this.x *= x;
	$this.y *= y;
	return $this;
};

var V2$mul$LV2$NN = V2.mul$LV2$NN;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {V2}
 */
V2.mul$LV2$LV2$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x *= x$0;
	$this.y *= y$0;
	return $this;
};

var V2$mul$LV2$LV2$ = V2.mul$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {Array.<undefined|!number>} v
 * @return {V2}
 */
V2.mul$LV2$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x *= x$0;
	$this.y *= y$0;
	return $this;
};

var V2$mul$LV2$AN = V2.mul$LV2$AN;

/**
 * @param {V2} $this
 * @param {Float32Array} v
 * @return {V2}
 */
V2.mul$LV2$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.x *= x$0;
	$this.y *= y$0;
	return $this;
};

var V2$mul$LV2$LFloat32Array$ = V2.mul$LV2$LFloat32Array$;

/**
 * @param {V2} $this
 * @param {!number} s
 * @return {V2}
 */
V2.mul$LV2$N = function ($this, s) {
	$this.x *= s;
	$this.y *= s;
	return $this;
};

var V2$mul$LV2$N = V2.mul$LV2$N;

/**
 * @param {V2} $this
 * @return {V2}
 */
V2.neg$LV2$ = function ($this) {
	$this.x *= -1;
	$this.y *= -1;
	return $this;
};

var V2$neg$LV2$ = V2.neg$LV2$;

/**
 * @param {V2} $this
 * @return {V2}
 */
V2.normalize$LV2$ = function ($this) {
	/** @type {!number} */
	var l;
	l = Math.sqrt(V2$len2$LV2$($this));
	return (l > 0 ? V2$mul$LV2$N($this, 1 / l) : $this);
};

var V2$normalize$LV2$ = V2.normalize$LV2$;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {!number}
 */
V2.cross$LV2$LV2$ = function ($this, v) {
	return $this.x * v.y - v.x * $this.y;
};

var V2$cross$LV2$LV2$ = V2.cross$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {!number}
 */
V2.dot$LV2$LV2$ = function ($this, v) {
	return $this.x * v.x + $this.y * v.y;
};

var V2$dot$LV2$LV2$ = V2.dot$LV2$LV2$;

/**
 * @param {V2} $this
 * @return {!number}
 */
V2.len$LV2$ = function ($this) {
	return Math.sqrt(V2$len2$LV2$($this));
};

var V2$len$LV2$ = V2.len$LV2$;

/**
 * @param {V2} $this
 * @return {!number}
 */
V2.len2$LV2$ = function ($this) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	(x = $this.x, y = $this.y);
	return x * x + y * y;
};

var V2$len2$LV2$ = V2.len2$LV2$;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {!number}
 */
V2.dist$LV2$LV2$ = function ($this, v) {
	return Math.sqrt(V2$dist2$LV2$LV2$($this, v));
};

var V2$dist$LV2$LV2$ = V2.dist$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {V2} v
 * @return {!number}
 */
V2.dist2$LV2$LV2$ = function ($this, v) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	x = v.x - $this.x;
	y = v.y - $this.y;
	return x * x + y * y;
};

var V2$dist2$LV2$LV2$ = V2.dist2$LV2$LV2$;

/**
 * @param {V2} $this
 * @param {V2} v0
 * @param {V2} v1
 * @param {!number} ratio
 * @return {V2}
 */
V2.lerp$LV2$LV2$LV2$N = function ($this, v0, v1, ratio) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	$this.x = (x$0 = v0.x) + ratio * (v1.x - x$0);
	$this.y = (y$0 = v0.y) + ratio * (v1.y - y$0);
	return $this;
};

var V2$lerp$LV2$LV2$LV2$N = V2.lerp$LV2$LV2$LV2$N;

/**
 * @param {V2} $this
 * @param {M22} m
 * @return {V2}
 */
V2.transformBy$LV2$LM22$ = function ($this, m) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	(x = $this.x, y = $this.y);
	$this.x = m.m11 * x + m.m12 * y;
	$this.y = m.m21 * x + m.m22 * y;
	return $this;
};

var V2$transformBy$LV2$LM22$ = V2.transformBy$LV2$LM22$;

/**
 * @param {V2} $this
 * @param {M33} m
 * @return {V2}
 */
V2.transformBy$LV2$LM33$ = function ($this, m) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	(x = $this.x, y = $this.y);
	$this.x = m.m11 * x + m.m12 * y + m.m13;
	$this.y = m.m21 * x + m.m22 * y + m.m23;
	return $this;
};

var V2$transformBy$LV2$LM33$ = V2.transformBy$LV2$LM33$;

/**
 * @return {!string}
 */
V2.prototype.toString = function () {
	return "V2" + JSON.stringify(V2$array$LV2$(this));
};

/**
 * class V3 extends Object
 * @constructor
 */
function V3() {
}

/**
 * @constructor
 */
function V3$() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
};

V3$.prototype = new V3;

/**
 * @constructor
 * @param {V3} v
 */
function V3$LV3$(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	/** @type {!number} */
	var z$0$0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	x$0$0 = v.x;
	y$0$0 = v.y;
	z$0$0 = v.z;
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z$0$0;
};

V3$LV3$.prototype = new V3;

/**
 * @constructor
 * @param {Array.<undefined|!number>} v
 */
function V3$AN(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	/** @type {!number} */
	var z$0$0;
	x$0$0 = v[0];
	y$0$0 = v[1];
	z$0$0 = v[2];
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z$0$0;
};

V3$AN.prototype = new V3;

/**
 * @constructor
 * @param {Float32Array} v
 */
function V3$LFloat32Array$(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	/** @type {!number} */
	var z$0$0;
	x$0$0 = v[0];
	y$0$0 = v[1];
	z$0$0 = v[2];
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z$0$0;
};

V3$LFloat32Array$.prototype = new V3;

/**
 * @constructor
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 */
function V3$NNN(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

V3$NNN.prototype = new V3;

/**
 * @constructor
 * @param {V2} v
 * @param {!number} z
 */
function V3$LV2$N(v, z) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	this.x = 0;
	this.y = 0;
	x$0$0 = v.x;
	y$0$0 = v.y;
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z;
};

V3$LV2$N.prototype = new V3;

/**
 * @constructor
 * @param {V4} v
 */
function V3$LV4$(v) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	/** @type {!number} */
	var z$0$0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	x$0$0 = v.x;
	y$0$0 = v.y;
	z$0$0 = v.z;
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z$0$0;
};

V3$LV4$.prototype = new V3;

/**
 * @param {V3} $this
 * @return {Array.<undefined|!number>}
 */
V3.array$LV3$ = function ($this) {
	return [ $this.x, $this.y, $this.z ];
};

var V3$array$LV3$ = V3.array$LV3$;

/**
 * @param {V3} $this
 * @return {V2}
 */
V3.V2$LV3$ = function ($this) {
	return new V2$LV3$($this);
};

var V3$V2$LV3$ = V3.V2$LV3$;

/**
 * @param {V3} $this
 * @param {!number} w
 * @return {V4}
 */
V3.V4$LV3$N = function ($this, w) {
	return new V4$LV3$N($this, w);
};

var V3$V4$LV3$N = V3.V4$LV3$N;

/**
 * @param {V3} $this
 * @param {V2} v
 * @param {!number} z
 * @return {V3}
 */
V3.set$LV3$LV2$N = function ($this, v, z) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z;
	return $this;
};

var V3$set$LV3$LV2$N = V3.set$LV3$LV2$N;

/**
 * @param {V3} $this
 * @param {V4} v
 * @return {V3}
 */
V3.set$LV3$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	return $this;
};

var V3$set$LV3$LV4$ = V3.set$LV3$LV4$;

/**
 * @param {V3} $this
 * @return {V3}
 */
V3.clone$LV3$ = function ($this) {
	return new V3$LV3$($this);
};

var V3$clone$LV3$ = V3.clone$LV3$;

/**
 * @param {V3} $this
 * @return {V3}
 */
V3.clear$LV3$ = function ($this) {
	$this.x = 0;
	$this.y = 0;
	$this.z = 0;
	return $this;
};

var V3$clear$LV3$ = V3.clear$LV3$;

/**
 * @param {V3} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {V3}
 */
V3.set$LV3$NNN = function ($this, x, y, z) {
	$this.x = x;
	$this.y = y;
	$this.z = z;
	return $this;
};

var V3$set$LV3$NNN = V3.set$LV3$NNN;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {V3}
 */
V3.set$LV3$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	return $this;
};

var V3$set$LV3$LV3$ = V3.set$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {Array.<undefined|!number>} v
 * @return {V3}
 */
V3.set$LV3$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	return $this;
};

var V3$set$LV3$AN = V3.set$LV3$AN;

/**
 * @param {V3} $this
 * @param {Float32Array} v
 * @return {V3}
 */
V3.set$LV3$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	return $this;
};

var V3$set$LV3$LFloat32Array$ = V3.set$LV3$LFloat32Array$;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {!boolean}
 */
V3.equals$LV3$LV3$ = function ($this, v) {
	return V3$equals$LV3$LV3$N($this, v, 0.000001);
};

var V3$equals$LV3$LV3$ = V3.equals$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {V3} v
 * @param {!number} eps
 * @return {!boolean}
 */
V3.equals$LV3$LV3$N = function ($this, v, eps) {
	var $math_abs_t;
	return (($math_abs_t = v.x - $this.x) >= 0 ? $math_abs_t : -$math_abs_t) < eps && (($math_abs_t = v.y - $this.y) >= 0 ? $math_abs_t : -$math_abs_t) < eps && (($math_abs_t = v.z - $this.z) >= 0 ? $math_abs_t : -$math_abs_t) < eps;
};

var V3$equals$LV3$LV3$N = V3.equals$LV3$LV3$N;

/**
 * @param {V3} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {V3}
 */
V3.add$LV3$NNN = function ($this, x, y, z) {
	$this.x += x;
	$this.y += y;
	$this.z += z;
	return $this;
};

var V3$add$LV3$NNN = V3.add$LV3$NNN;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {V3}
 */
V3.add$LV3$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	$this.x += x$0;
	$this.y += y$0;
	$this.z += z$0;
	return $this;
};

var V3$add$LV3$LV3$ = V3.add$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {Array.<undefined|!number>} v
 * @return {V3}
 */
V3.add$LV3$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x += x$0;
	$this.y += y$0;
	$this.z += z$0;
	return $this;
};

var V3$add$LV3$AN = V3.add$LV3$AN;

/**
 * @param {V3} $this
 * @param {Float32Array} v
 * @return {V3}
 */
V3.add$LV3$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x += x$0;
	$this.y += y$0;
	$this.z += z$0;
	return $this;
};

var V3$add$LV3$LFloat32Array$ = V3.add$LV3$LFloat32Array$;

/**
 * @param {V3} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {V3}
 */
V3.sub$LV3$NNN = function ($this, x, y, z) {
	$this.x -= x;
	$this.y -= y;
	$this.z -= z;
	return $this;
};

var V3$sub$LV3$NNN = V3.sub$LV3$NNN;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {V3}
 */
V3.sub$LV3$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	$this.x -= x$0;
	$this.y -= y$0;
	$this.z -= z$0;
	return $this;
};

var V3$sub$LV3$LV3$ = V3.sub$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {Array.<undefined|!number>} v
 * @return {V3}
 */
V3.sub$LV3$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x -= x$0;
	$this.y -= y$0;
	$this.z -= z$0;
	return $this;
};

var V3$sub$LV3$AN = V3.sub$LV3$AN;

/**
 * @param {V3} $this
 * @param {Float32Array} v
 * @return {V3}
 */
V3.sub$LV3$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x -= x$0;
	$this.y -= y$0;
	$this.z -= z$0;
	return $this;
};

var V3$sub$LV3$LFloat32Array$ = V3.sub$LV3$LFloat32Array$;

/**
 * @param {V3} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {V3}
 */
V3.mul$LV3$NNN = function ($this, x, y, z) {
	$this.x *= x;
	$this.y *= y;
	$this.z *= z;
	return $this;
};

var V3$mul$LV3$NNN = V3.mul$LV3$NNN;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {V3}
 */
V3.mul$LV3$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	$this.x *= x$0;
	$this.y *= y$0;
	$this.z *= z$0;
	return $this;
};

var V3$mul$LV3$LV3$ = V3.mul$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {Array.<undefined|!number>} v
 * @return {V3}
 */
V3.mul$LV3$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x *= x$0;
	$this.y *= y$0;
	$this.z *= z$0;
	return $this;
};

var V3$mul$LV3$AN = V3.mul$LV3$AN;

/**
 * @param {V3} $this
 * @param {Float32Array} v
 * @return {V3}
 */
V3.mul$LV3$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	$this.x *= x$0;
	$this.y *= y$0;
	$this.z *= z$0;
	return $this;
};

var V3$mul$LV3$LFloat32Array$ = V3.mul$LV3$LFloat32Array$;

/**
 * @param {V3} $this
 * @param {!number} s
 * @return {V3}
 */
V3.mul$LV3$N = function ($this, s) {
	$this.x *= s;
	$this.y *= s;
	$this.z *= s;
	return $this;
};

var V3$mul$LV3$N = V3.mul$LV3$N;

/**
 * @param {V3} $this
 * @return {V3}
 */
V3.neg$LV3$ = function ($this) {
	$this.x *= -1;
	$this.y *= -1;
	$this.z *= -1;
	return $this;
};

var V3$neg$LV3$ = V3.neg$LV3$;

/**
 * @param {V3} $this
 * @return {V3}
 */
V3.normalize$LV3$ = function ($this) {
	/** @type {!number} */
	var l;
	l = Math.sqrt(V3$len2$LV3$($this));
	return (l > 0 ? V3$mul$LV3$N($this, 1 / l) : $this);
};

var V3$normalize$LV3$ = V3.normalize$LV3$;

/**
 * @param {V3} $this
 * @param {V3} v0
 * @param {V3} v1
 * @return {V3}
 */
V3.cross$LV3$LV3$LV3$ = function ($this, v0, v1) {
	/** @type {!number} */
	var x0;
	/** @type {!number} */
	var y0;
	/** @type {!number} */
	var z0;
	/** @type {!number} */
	var x1;
	/** @type {!number} */
	var y1;
	/** @type {!number} */
	var z1;
	(x0 = v0.x, y0 = v0.y, z0 = v0.z);
	(x1 = v1.x, y1 = v1.y, z1 = v1.z);
	$this.x = y0 * z1 - z0 * y1;
	$this.y = z0 * x1 - x0 * z1;
	$this.z = x0 * y1 - y0 * x1;
	return $this;
};

var V3$cross$LV3$LV3$LV3$ = V3.cross$LV3$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {!number}
 */
V3.dot$LV3$LV3$ = function ($this, v) {
	return $this.x * v.x + $this.y * v.y + $this.z * v.z;
};

var V3$dot$LV3$LV3$ = V3.dot$LV3$LV3$;

/**
 * @param {V3} $this
 * @return {!number}
 */
V3.len$LV3$ = function ($this) {
	return Math.sqrt(V3$len2$LV3$($this));
};

var V3$len$LV3$ = V3.len$LV3$;

/**
 * @param {V3} $this
 * @return {!number}
 */
V3.len2$LV3$ = function ($this) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	(x = $this.x, y = $this.y, z = $this.z);
	return x * x + y * y + z * z;
};

var V3$len2$LV3$ = V3.len2$LV3$;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {!number}
 */
V3.dist$LV3$LV3$ = function ($this, v) {
	return Math.sqrt(V3$dist2$LV3$LV3$($this, v));
};

var V3$dist$LV3$LV3$ = V3.dist$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {V3} v
 * @return {!number}
 */
V3.dist2$LV3$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	x = v.x - $this.x;
	y = v.y - $this.y;
	z = v.z - $this.z;
	return x * x + y * y + z * z;
};

var V3$dist2$LV3$LV3$ = V3.dist2$LV3$LV3$;

/**
 * @param {V3} $this
 * @param {V3} v0
 * @param {V3} v1
 * @param {!number} ratio
 * @return {V3}
 */
V3.lerp$LV3$LV3$LV3$N = function ($this, v0, v1, ratio) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	$this.x = (x$0 = v0.x) + ratio * (v1.x - x$0);
	$this.y = (y$0 = v0.y) + ratio * (v1.y - y$0);
	$this.z = (z$0 = v0.z) + ratio * (v1.z - z$0);
	return $this;
};

var V3$lerp$LV3$LV3$LV3$N = V3.lerp$LV3$LV3$LV3$N;

/**
 * @param {V3} $this
 * @param {M33} m
 * @return {V3}
 */
V3.transformBy$LV3$LM33$ = function ($this, m) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	(x = $this.x, y = $this.y, z = $this.z);
	$this.x = m.m11 * x + m.m12 * y + m.m13 * z;
	$this.y = m.m21 * x + m.m22 * y + m.m23 * z;
	$this.z = m.m31 * x + m.m32 * y + m.m33 * z;
	return $this;
};

var V3$transformBy$LV3$LM33$ = V3.transformBy$LV3$LM33$;

/**
 * @param {V3} $this
 * @param {M44} m
 * @return {V3}
 */
V3.transformBy$LV3$LM44$ = function ($this, m) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	(x = $this.x, y = $this.y, z = $this.z);
	$this.x = m.m11 * x + m.m12 * y + m.m13 * z + m.m14;
	$this.y = m.m21 * x + m.m22 * y + m.m23 * z + m.m24;
	$this.z = m.m31 * x + m.m32 * y + m.m33 * z + m.m34;
	return $this;
};

var V3$transformBy$LV3$LM44$ = V3.transformBy$LV3$LM44$;

/**
 * @return {!string}
 */
V3.prototype.toString = function () {
	return "V3" + JSON.stringify(V3$array$LV3$(this));
};

/**
 * class V4 extends Object
 * @constructor
 */
function V4() {
}

/**
 * @constructor
 */
function V4$() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;
};

V4$.prototype = new V4;

/**
 * @constructor
 * @param {V4} v
 */
function V4$LV4$(v) {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;
	V4$set$LV4$LV4$(this, v);
};

V4$LV4$.prototype = new V4;

/**
 * @constructor
 * @param {Array.<undefined|!number>} v
 */
function V4$AN(v) {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;
	V4$set$LV4$AN(this, v);
};

V4$AN.prototype = new V4;

/**
 * @constructor
 * @param {Float32Array} v
 */
function V4$LFloat32Array$(v) {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;
	V4$set$LV4$LFloat32Array$(this, v);
};

V4$LFloat32Array$.prototype = new V4;

/**
 * @constructor
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @param {!number} w
 */
function V4$NNNN(x, y, z, w) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
};

V4$NNNN.prototype = new V4;

/**
 * @constructor
 * @param {V2} v
 * @param {!number} z
 * @param {!number} w
 */
function V4$LV2$NN(v, z, w) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	this.x = 0;
	this.y = 0;
	x$0$0 = v.x;
	y$0$0 = v.y;
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z;
	this.w = w;
};

V4$LV2$NN.prototype = new V4;

/**
 * @constructor
 * @param {V3} v
 * @param {!number} w
 */
function V4$LV3$N(v, w) {
	/** @type {!number} */
	var x$0$0;
	/** @type {!number} */
	var y$0$0;
	/** @type {!number} */
	var z$0$0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	x$0$0 = v.x;
	y$0$0 = v.y;
	z$0$0 = v.z;
	this.x = x$0$0;
	this.y = y$0$0;
	this.z = z$0$0;
	this.w = w;
};

V4$LV3$N.prototype = new V4;

/**
 * @param {V4} $this
 * @return {Array.<undefined|!number>}
 */
V4.array$LV4$ = function ($this) {
	return [ $this.x, $this.y, $this.z, $this.w ];
};

var V4$array$LV4$ = V4.array$LV4$;

/**
 * @param {V4} $this
 * @return {V2}
 */
V4.V2$LV4$ = function ($this) {
	return new V2$LV4$($this);
};

var V4$V2$LV4$ = V4.V2$LV4$;

/**
 * @param {V4} $this
 * @return {V3}
 */
V4.V3$LV4$ = function ($this) {
	return new V3$LV4$($this);
};

var V4$V3$LV4$ = V4.V3$LV4$;

/**
 * @param {V4} $this
 * @param {V2} v
 * @param {!number} z
 * @param {!number} w
 * @return {V4}
 */
V4.set$LV4$LV2$NN = function ($this, v, z, w) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z;
	$this.w = w;
	return $this;
};

var V4$set$LV4$LV2$NN = V4.set$LV4$LV2$NN;

/**
 * @param {V4} $this
 * @param {V3} v
 * @param {!number} w
 * @return {V4}
 */
V4.set$LV4$LV3$N = function ($this, v, w) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	$this.w = w;
	return $this;
};

var V4$set$LV4$LV3$N = V4.set$LV4$LV3$N;

/**
 * @param {V4} $this
 * @return {V4}
 */
V4.clone$LV4$ = function ($this) {
	return new V4$LV4$($this);
};

var V4$clone$LV4$ = V4.clone$LV4$;

/**
 * @param {V4} $this
 * @return {V4}
 */
V4.clear$LV4$ = function ($this) {
	$this.x = 0;
	$this.y = 0;
	$this.z = 0;
	$this.w = 0;
	return $this;
};

var V4$clear$LV4$ = V4.clear$LV4$;

/**
 * @param {V4} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @param {!number} w
 * @return {V4}
 */
V4.set$LV4$NNNN = function ($this, x, y, z, w) {
	$this.x = x;
	$this.y = y;
	$this.z = z;
	$this.w = w;
	return $this;
};

var V4$set$LV4$NNNN = V4.set$LV4$NNNN;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {V4}
 */
V4.set$LV4$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	w$0 = v.w;
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	$this.w = w$0;
	return $this;
};

var V4$set$LV4$LV4$ = V4.set$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {Array.<undefined|!number>} v
 * @return {V4}
 */
V4.set$LV4$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	$this.w = w$0;
	return $this;
};

var V4$set$LV4$AN = V4.set$LV4$AN;

/**
 * @param {V4} $this
 * @param {Float32Array} v
 * @return {V4}
 */
V4.set$LV4$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x = x$0;
	$this.y = y$0;
	$this.z = z$0;
	$this.w = w$0;
	return $this;
};

var V4$set$LV4$LFloat32Array$ = V4.set$LV4$LFloat32Array$;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {!boolean}
 */
V4.equals$LV4$LV4$ = function ($this, v) {
	return V4$equals$LV4$LV4$N($this, v, 0.000001);
};

var V4$equals$LV4$LV4$ = V4.equals$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {V4} v
 * @param {!number} eps
 * @return {!boolean}
 */
V4.equals$LV4$LV4$N = function ($this, v, eps) {
	var $math_abs_t;
	return (($math_abs_t = v.x - $this.x) >= 0 ? $math_abs_t : -$math_abs_t) < eps && (($math_abs_t = v.y - $this.y) >= 0 ? $math_abs_t : -$math_abs_t) < eps && (($math_abs_t = v.z - $this.z) >= 0 ? $math_abs_t : -$math_abs_t) < eps && (($math_abs_t = v.w - $this.w) >= 0 ? $math_abs_t : -$math_abs_t) < eps;
};

var V4$equals$LV4$LV4$N = V4.equals$LV4$LV4$N;

/**
 * @param {V4} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @param {!number} w
 * @return {V4}
 */
V4.add$LV4$NNNN = function ($this, x, y, z, w) {
	$this.x += x;
	$this.y += y;
	$this.z += z;
	$this.w += w;
	return $this;
};

var V4$add$LV4$NNNN = V4.add$LV4$NNNN;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {V4}
 */
V4.add$LV4$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	w$0 = v.w;
	$this.x += x$0;
	$this.y += y$0;
	$this.z += z$0;
	$this.w += w$0;
	return $this;
};

var V4$add$LV4$LV4$ = V4.add$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {Array.<undefined|!number>} v
 * @return {V4}
 */
V4.add$LV4$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x += x$0;
	$this.y += y$0;
	$this.z += z$0;
	$this.w += w$0;
	return $this;
};

var V4$add$LV4$AN = V4.add$LV4$AN;

/**
 * @param {V4} $this
 * @param {Float32Array} v
 * @return {V4}
 */
V4.add$LV4$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x += x$0;
	$this.y += y$0;
	$this.z += z$0;
	$this.w += w$0;
	return $this;
};

var V4$add$LV4$LFloat32Array$ = V4.add$LV4$LFloat32Array$;

/**
 * @param {V4} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @param {!number} w
 * @return {V4}
 */
V4.sub$LV4$NNNN = function ($this, x, y, z, w) {
	$this.x -= x;
	$this.y -= y;
	$this.z -= z;
	$this.w -= w;
	return $this;
};

var V4$sub$LV4$NNNN = V4.sub$LV4$NNNN;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {V4}
 */
V4.sub$LV4$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	w$0 = v.w;
	$this.x -= x$0;
	$this.y -= y$0;
	$this.z -= z$0;
	$this.w -= w$0;
	return $this;
};

var V4$sub$LV4$LV4$ = V4.sub$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {Array.<undefined|!number>} v
 * @return {V4}
 */
V4.sub$LV4$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x -= x$0;
	$this.y -= y$0;
	$this.z -= z$0;
	$this.w -= w$0;
	return $this;
};

var V4$sub$LV4$AN = V4.sub$LV4$AN;

/**
 * @param {V4} $this
 * @param {Float32Array} v
 * @return {V4}
 */
V4.sub$LV4$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x -= x$0;
	$this.y -= y$0;
	$this.z -= z$0;
	$this.w -= w$0;
	return $this;
};

var V4$sub$LV4$LFloat32Array$ = V4.sub$LV4$LFloat32Array$;

/**
 * @param {V4} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @param {!number} w
 * @return {V4}
 */
V4.mul$LV4$NNNN = function ($this, x, y, z, w) {
	$this.x *= x;
	$this.y *= y;
	$this.z *= z;
	$this.w *= w;
	return $this;
};

var V4$mul$LV4$NNNN = V4.mul$LV4$NNNN;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {V4}
 */
V4.mul$LV4$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	w$0 = v.w;
	$this.x *= x$0;
	$this.y *= y$0;
	$this.z *= z$0;
	$this.w *= w$0;
	return $this;
};

var V4$mul$LV4$LV4$ = V4.mul$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {Array.<undefined|!number>} v
 * @return {V4}
 */
V4.mul$LV4$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x *= x$0;
	$this.y *= y$0;
	$this.z *= z$0;
	$this.w *= w$0;
	return $this;
};

var V4$mul$LV4$AN = V4.mul$LV4$AN;

/**
 * @param {V4} $this
 * @param {Float32Array} v
 * @return {V4}
 */
V4.mul$LV4$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	w$0 = v[3];
	$this.x *= x$0;
	$this.y *= y$0;
	$this.z *= z$0;
	$this.w *= w$0;
	return $this;
};

var V4$mul$LV4$LFloat32Array$ = V4.mul$LV4$LFloat32Array$;

/**
 * @param {V4} $this
 * @param {!number} s
 * @return {V4}
 */
V4.mul$LV4$N = function ($this, s) {
	$this.x *= s;
	$this.y *= s;
	$this.z *= s;
	$this.w *= s;
	return $this;
};

var V4$mul$LV4$N = V4.mul$LV4$N;

/**
 * @param {V4} $this
 * @return {V4}
 */
V4.neg$LV4$ = function ($this) {
	$this.x *= -1;
	$this.y *= -1;
	$this.z *= -1;
	$this.w *= -1;
	return $this;
};

var V4$neg$LV4$ = V4.neg$LV4$;

/**
 * @param {V4} $this
 * @return {V4}
 */
V4.normalize$LV4$ = function ($this) {
	/** @type {!number} */
	var l;
	l = Math.sqrt(V4$len2$LV4$($this));
	return (l > 0 ? V4$mul$LV4$N($this, 1 / l) : $this);
};

var V4$normalize$LV4$ = V4.normalize$LV4$;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {!number}
 */
V4.dot$LV4$LV4$ = function ($this, v) {
	return $this.x * v.x + $this.y * v.y + $this.z * v.z + $this.w * v.w;
};

var V4$dot$LV4$LV4$ = V4.dot$LV4$LV4$;

/**
 * @param {V4} $this
 * @return {!number}
 */
V4.len$LV4$ = function ($this) {
	return Math.sqrt(V4$len2$LV4$($this));
};

var V4$len$LV4$ = V4.len$LV4$;

/**
 * @param {V4} $this
 * @return {!number}
 */
V4.len2$LV4$ = function ($this) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	/** @type {!number} */
	var w;
	(x = $this.x, y = $this.y, z = $this.z, w = $this.w);
	return x * x + y * y + z * z + w * w;
};

var V4$len2$LV4$ = V4.len2$LV4$;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {!number}
 */
V4.dist$LV4$LV4$ = function ($this, v) {
	return Math.sqrt(V4$dist2$LV4$LV4$($this, v));
};

var V4$dist$LV4$LV4$ = V4.dist$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {V4} v
 * @return {!number}
 */
V4.dist2$LV4$LV4$ = function ($this, v) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	/** @type {!number} */
	var w;
	x = v.x - $this.x;
	y = v.y - $this.y;
	z = v.z - $this.z;
	w = v.w - $this.w;
	return x * x + y * y + z * z + w * w;
};

var V4$dist2$LV4$LV4$ = V4.dist2$LV4$LV4$;

/**
 * @param {V4} $this
 * @param {V4} v0
 * @param {V4} v1
 * @param {!number} ratio
 * @return {V4}
 */
V4.lerp$LV4$LV4$LV4$N = function ($this, v0, v1, ratio) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	/** @type {!number} */
	var w$0;
	$this.x = (x$0 = v0.x) + ratio * (v1.x - x$0);
	$this.y = (y$0 = v0.y) + ratio * (v1.y - y$0);
	$this.z = (z$0 = v0.z) + ratio * (v1.z - z$0);
	$this.w = (w$0 = v0.w) + ratio * (v1.w - w$0);
	return $this;
};

var V4$lerp$LV4$LV4$LV4$N = V4.lerp$LV4$LV4$LV4$N;

/**
 * @param {V4} $this
 * @param {M44} m
 * @return {V4}
 */
V4.transformBy$LV4$LM44$ = function ($this, m) {
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	/** @type {!number} */
	var w;
	(x = $this.x, y = $this.y, z = $this.z, w = $this.w);
	$this.x = m.m11 * x + m.m12 * y + m.m13 * z + m.m14 * w;
	$this.y = m.m21 * x + m.m22 * y + m.m23 * z + m.m24 * w;
	$this.z = m.m31 * x + m.m32 * y + m.m33 * z + m.m34 * w;
	$this.w = m.m41 * x + m.m42 * y + m.m43 * z + m.m44 * w;
	return $this;
};

var V4$transformBy$LV4$LM44$ = V4.transformBy$LV4$LM44$;

/**
 * @return {!string}
 */
V4.prototype.toString = function () {
	return "V4" + JSON.stringify(V4$array$LV4$(this));
};

/**
 * class M22 extends Object
 * @constructor
 */
function M22() {
}

/**
 * @constructor
 */
function M22$() {
	this.m11 = 0;
	this.m21 = 0;
	this.m12 = 0;
	this.m22 = 0;
};

M22$.prototype = new M22;

/**
 * @constructor
 * @param {M22} m
 */
function M22$LM22$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m11 = m.m11;
	this.m21 = m.m21;
	this.m12 = m.m12;
	this.m22 = m.m22;
};

M22$LM22$.prototype = new M22;

/**
 * @constructor
 * @param {Array.<undefined|!number>} m
 */
function M22$AN(m) {
	this.m11 = m[0];
	this.m21 = m[1];
	this.m12 = m[2];
	this.m22 = m[3];
};

M22$AN.prototype = new M22;

/**
 * @constructor
 * @param {Float32Array} m
 */
function M22$LFloat32Array$(m) {
	this.m11 = m[0];
	this.m21 = m[1];
	this.m12 = m[2];
	this.m22 = m[3];
};

M22$LFloat32Array$.prototype = new M22;

/**
 * @constructor
 * @param {!number} m11
 * @param {!number} m12
 * @param {!number} m21
 * @param {!number} m22
 */
function M22$NNNN(m11, m12, m21, m22) {
	this.m11 = m11;
	this.m21 = m21;
	this.m12 = m12;
	this.m22 = m22;
};

M22$NNNN.prototype = new M22;

/**
 * @constructor
 * @param {V2} v0
 * @param {V2} v1
 */
function M22$LV2$LV2$(v0, v1) {
	this.m11 = v0.x;
	this.m21 = v0.y;
	this.m12 = v1.x;
	this.m22 = v1.y;
};

M22$LV2$LV2$.prototype = new M22;

/**
 * @constructor
 * @param {!number} s
 */
function M22$N(s) {
	this.m11 = this.m22 = s;
	this.m21 = this.m12 = 0;
};

M22$N.prototype = new M22;

/**
 * @constructor
 * @param {M33} m
 */
function M22$LM33$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m11 = m.m11;
	this.m21 = m.m21;
	this.m12 = m.m12;
	this.m22 = m.m22;
};

M22$LM33$.prototype = new M22;

/**
 * @constructor
 * @param {M44} m
 */
function M22$LM44$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m11 = m.m11;
	this.m21 = m.m21;
	this.m12 = m.m12;
	this.m22 = m.m22;
};

M22$LM44$.prototype = new M22;

/**
 * @param {M22} $this
 * @return {Array.<undefined|!number>}
 */
M22.array$LM22$ = function ($this) {
	return [ $this.m11, $this.m21, $this.m12, $this.m22 ];
};

var M22$array$LM22$ = M22.array$LM22$;

/**
 * @param {M22} $this
 * @return {Array.<undefined|!number>}
 */
M22.transposedArray$LM22$ = function ($this) {
	return [ $this.m11, $this.m12, $this.m21, $this.m22 ];
};

var M22$transposedArray$LM22$ = M22.transposedArray$LM22$;

/**
 * @param {M22} $this
 * @param {!number} m22
 * @return {M33}
 */
M22.M33$LM22$N = function ($this, m22) {
	return new M33$LM22$N($this, m22);
};

var M22$M33$LM22$N = M22.M33$LM22$N;

/**
 * @param {M22} $this
 * @param {!number} m22
 * @param {!number} m33
 * @return {M44}
 */
M22.M44$LM22$NN = function ($this, m22, m33) {
	return new M44$LM22$NN($this, m22, m33);
};

var M22$M44$LM22$NN = M22.M44$LM22$NN;

/**
 * @param {M22} $this
 * @param {M33} m
 * @return {M22}
 */
M22.set$LM22$LM33$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	return $this;
};

var M22$set$LM22$LM33$ = M22.set$LM22$LM33$;

/**
 * @param {M22} $this
 * @param {M44} m
 * @return {M22}
 */
M22.set$LM22$LM44$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	return $this;
};

var M22$set$LM22$LM44$ = M22.set$LM22$LM44$;

/**
 * @param {M22} $this
 * @return {M22}
 */
M22.clone$LM22$ = function ($this) {
	return new M22$LM22$($this);
};

var M22$clone$LM22$ = M22.clone$LM22$;

/**
 * @param {M22} $this
 * @return {M22}
 */
M22.setZero$LM22$ = function ($this) {
	$this.m11 = $this.m22 = 0;
	$this.m21 = $this.m12 = 0;
	return $this;
};

var M22$setZero$LM22$ = M22.setZero$LM22$;

/**
 * @param {M22} $this
 * @return {M22}
 */
M22.setIdentity$LM22$ = function ($this) {
	$this.m11 = $this.m22 = 1;
	$this.m21 = $this.m12 = 0;
	return $this;
};

var M22$setIdentity$LM22$ = M22.setIdentity$LM22$;

/**
 * @return {M22}
 */
M22.zero$ = function () {
	/** @type {M22} */
	var $this$0;
	$this$0 = new M22$();
	$this$0.m11 = $this$0.m22 = 0;
	$this$0.m21 = $this$0.m12 = 0;
	return $this$0;
};

var M22$zero$ = M22.zero$;

/**
 * @return {M22}
 */
M22.identity$ = function () {
	/** @type {M22} */
	var $this$0;
	$this$0 = new M22$();
	$this$0.m11 = $this$0.m22 = 1;
	$this$0.m21 = $this$0.m12 = 0;
	return $this$0;
};

var M22$identity$ = M22.identity$;

/**
 * @param {M22} $this
 * @param {!number} m11
 * @param {!number} m12
 * @param {!number} m21
 * @param {!number} m22
 * @return {M22}
 */
M22.set$LM22$NNNN = function ($this, m11, m12, m21, m22) {
	$this.m11 = m11;
	$this.m21 = m21;
	$this.m12 = m12;
	$this.m22 = m22;
	return $this;
};

var M22$set$LM22$NNNN = M22.set$LM22$NNNN;

/**
 * @param {M22} $this
 * @param {V2} v0
 * @param {V2} v1
 * @return {M22}
 */
M22.set$LM22$LV2$LV2$ = function ($this, v0, v1) {
	$this.m11 = v0.x;
	$this.m21 = v0.y;
	$this.m12 = v1.x;
	$this.m22 = v1.y;
	return $this;
};

var M22$set$LM22$LV2$LV2$ = M22.set$LM22$LV2$LV2$;

/**
 * @param {M22} $this
 * @param {M22} m
 * @return {M22}
 */
M22.set$LM22$LM22$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	return $this;
};

var M22$set$LM22$LM22$ = M22.set$LM22$LM22$;

/**
 * @param {M22} $this
 * @param {Array.<undefined|!number>} m
 * @return {M22}
 */
M22.set$LM22$AN = function ($this, m) {
	$this.m11 = m[0];
	$this.m21 = m[1];
	$this.m12 = m[2];
	$this.m22 = m[3];
	return $this;
};

var M22$set$LM22$AN = M22.set$LM22$AN;

/**
 * @param {M22} $this
 * @param {Float32Array} m
 * @return {M22}
 */
M22.set$LM22$LFloat32Array$ = function ($this, m) {
	$this.m11 = m[0];
	$this.m21 = m[1];
	$this.m12 = m[2];
	$this.m22 = m[3];
	return $this;
};

var M22$set$LM22$LFloat32Array$ = M22.set$LM22$LFloat32Array$;

/**
 * @param {M22} $this
 * @param {!number} s
 * @return {M22}
 */
M22.set$LM22$N = function ($this, s) {
	$this.m11 = $this.m22 = s;
	$this.m21 = $this.m12 = 0;
	return $this;
};

var M22$set$LM22$N = M22.set$LM22$N;

/**
 * @param {M22} $this
 * @param {M22} m
 * @return {!boolean}
 */
M22.equals$LM22$LM22$ = function ($this, m) {
	return M22$equals$LM22$LM22$N($this, m, 0.000001);
};

var M22$equals$LM22$LM22$ = M22.equals$LM22$LM22$;

/**
 * @param {M22} $this
 * @param {M22} m
 * @param {!number} eps
 * @return {!boolean}
 */
M22.equals$LM22$LM22$N = function ($this, m, eps) {
	var $math_abs_t;
	return ((($math_abs_t = $this.m11 - m.m11) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m21 - m.m21) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m12 - m.m12) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m22 - m.m22) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : true);
};

var M22$equals$LM22$LM22$N = M22.equals$LM22$LM22$N;

/**
 * @param {M22} $this
 * @param {M22} m
 * @return {M22}
 */
M22.add$LM22$LM22$ = function ($this, m) {
	$this.m11 += m.m11;
	$this.m21 += m.m21;
	$this.m12 += m.m12;
	$this.m22 += m.m22;
	return $this;
};

var M22$add$LM22$LM22$ = M22.add$LM22$LM22$;

/**
 * @param {M22} $this
 * @param {M22} m
 * @return {M22}
 */
M22.sub$LM22$LM22$ = function ($this, m) {
	$this.m11 -= m.m11;
	$this.m21 -= m.m21;
	$this.m12 -= m.m12;
	$this.m22 -= m.m22;
	return $this;
};

var M22$sub$LM22$LM22$ = M22.sub$LM22$LM22$;

/**
 * @param {M22} $this
 * @param {M22} m
 * @return {M22}
 */
M22.mul$LM22$LM22$ = function ($this, m) {
	return M22$mul$LM22$LM22$LM22$($this, new M22$LM22$($this), m);
};

var M22$mul$LM22$LM22$ = M22.mul$LM22$LM22$;

/**
 * @param {M22} $this
 * @param {M22} m0
 * @param {M22} m1
 * @return {M22}
 */
M22.mul$LM22$LM22$LM22$ = function ($this, m0, m1) {
	/** @type {!number} */
	var m11$0;
	/** @type {!number} */
	var m21$0;
	/** @type {!number} */
	var m11$1;
	/** @type {!number} */
	var m12$0;
	/** @type {!number} */
	var m21$1;
	/** @type {!number} */
	var m12$1;
	/** @type {!number} */
	var m22$0;
	/** @type {!number} */
	var m22$1;
	$this.m11 = (m11$1 = m0.m11) * (m11$0 = m1.m11) + (m12$0 = m0.m12) * (m21$0 = m1.m21);
	$this.m21 = (m21$1 = m0.m21) * m11$0 + (m22$0 = m0.m22) * m21$0;
	$this.m12 = m11$1 * (m12$1 = m1.m12) + m12$0 * (m22$1 = m1.m22);
	$this.m22 = m21$1 * m12$1 + m22$0 * m22$1;
	return $this;
};

var M22$mul$LM22$LM22$LM22$ = M22.mul$LM22$LM22$LM22$;

/**
 * @param {M22} $this
 * @return {M22}
 */
M22.transpose$LM22$ = function ($this) {
	/** @type {!number} */
	var m12;
	m12 = $this.m12;
	$this.m12 = $this.m21;
	$this.m21 = m12;
	return $this;
};

var M22$transpose$LM22$ = M22.transpose$LM22$;

/**
 * @param {M22} $this
 * @param {M22} m
 * @return {M22}
 */
M22.transpose$LM22$LM22$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m12;
	$this.m12 = m.m21;
	$this.m22 = m.m22;
	return $this;
};

var M22$transpose$LM22$LM22$ = M22.transpose$LM22$LM22$;

/**
 * @param {M22} $this
 * @return {!number}
 */
M22.det$LM22$ = function ($this) {
	return $this.m11 * $this.m22 - $this.m21 * $this.m12;
};

var M22$det$LM22$ = M22.det$LM22$;

/**
 * @param {M22} $this
 * @return {M22}
 */
M22.inverse$LM22$ = function ($this) {
	/** @type {!number} */
	var d;
	/** @type {!number} */
	var invDet;
	/** @type {!number} */
	var org$m11$0;
	/** @type {!number} */
	var org$m21$0;
	/** @type {!number} */
	var org$m12$0;
	/** @type {!number} */
	var org$m22$0;
	d = $this.m11 * $this.m22 - $this.m21 * $this.m12;
	if (d === 0) {
		return null;
	}
	invDet = 1 / d;
	org$m11$0 = $this.m11;
	org$m21$0 = $this.m21;
	org$m12$0 = $this.m12;
	org$m22$0 = $this.m22;
	$this.m11 = org$m22$0 * invDet;
	$this.m21 = - org$m21$0 * invDet;
	$this.m12 = - org$m12$0 * invDet;
	$this.m22 = org$m11$0 * invDet;
	return $this;
};

var M22$inverse$LM22$ = M22.inverse$LM22$;

/**
 * @param {M22} $this
 * @param {!number} s
 * @return {M22}
 */
M22.setScale$LM22$N = function ($this, s) {
	$this.m11 = s;
	$this.m21 = $this.m12 = 0;
	$this.m22 = s;
	return $this;
};

var M22$setScale$LM22$N = M22.setScale$LM22$N;

/**
 * @param {M22} $this
 * @param {!number} x
 * @param {!number} y
 * @return {M22}
 */
M22.setScale$LM22$NN = function ($this, x, y) {
	$this.m11 = x;
	$this.m21 = $this.m12 = 0;
	$this.m22 = y;
	return $this;
};

var M22$setScale$LM22$NN = M22.setScale$LM22$NN;

/**
 * @param {M22} $this
 * @param {V2} v
 * @return {M22}
 */
M22.setScale$LM22$LV2$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v.x;
	y$0 = v.y;
	$this.m11 = x$0;
	$this.m21 = $this.m12 = 0;
	$this.m22 = y$0;
	return $this;
};

var M22$setScale$LM22$LV2$ = M22.setScale$LM22$LV2$;

/**
 * @param {M22} $this
 * @param {Array.<undefined|!number>} v
 * @return {M22}
 */
M22.setScale$LM22$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.m11 = x$0;
	$this.m21 = $this.m12 = 0;
	$this.m22 = y$0;
	return $this;
};

var M22$setScale$LM22$AN = M22.setScale$LM22$AN;

/**
 * @param {M22} $this
 * @param {Float32Array} v
 * @return {M22}
 */
M22.setScale$LM22$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	x$0 = v[0];
	y$0 = v[1];
	$this.m11 = x$0;
	$this.m21 = $this.m12 = 0;
	$this.m22 = y$0;
	return $this;
};

var M22$setScale$LM22$LFloat32Array$ = M22.setScale$LM22$LFloat32Array$;

/**
 * @param {M22} $this
 * @param {!number} rad
 * @return {M22}
 */
M22.setRotation$LM22$N = function ($this, rad) {
	/** @type {!number} */
	var c;
	/** @type {!number} */
	var s;
	(c = Math.cos(rad), s = Math.sin(rad));
	$this.m11 = c;
	$this.m21 = s;
	$this.m12 = - s;
	$this.m22 = c;
	return $this;
};

var M22$setRotation$LM22$N = M22.setRotation$LM22$N;

/**
 * @return {!string}
 */
M22.prototype.toString = function () {
	return "M22" + JSON.stringify(M22$array$LM22$(this));
};

/**
 * class M33 extends Object
 * @constructor
 */
function M33() {
}

/**
 * @constructor
 */
function M33$() {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
};

M33$.prototype = new M33;

/**
 * @constructor
 * @param {M33} m
 */
function M33$LM33$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$LM33$(this, m);
};

M33$LM33$.prototype = new M33;

/**
 * @constructor
 * @param {Array.<undefined|!number>} m
 */
function M33$AN(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$AN(this, m);
};

M33$AN.prototype = new M33;

/**
 * @constructor
 * @param {Float32Array} m
 */
function M33$LFloat32Array$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$LFloat32Array$(this, m);
};

M33$LFloat32Array$.prototype = new M33;

/**
 * @constructor
 * @param {!number} m11
 * @param {!number} m12
 * @param {!number} m13
 * @param {!number} m21
 * @param {!number} m22
 * @param {!number} m23
 * @param {!number} m31
 * @param {!number} m32
 * @param {!number} m33
 */
function M33$NNNNNNNNN(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
	this.m11 = m11;
	this.m21 = m21;
	this.m31 = m31;
	this.m12 = m12;
	this.m22 = m22;
	this.m32 = m32;
	this.m13 = m13;
	this.m23 = m23;
	this.m33 = m33;
};

M33$NNNNNNNNN.prototype = new M33;

/**
 * @constructor
 * @param {V3} v0
 * @param {V3} v1
 * @param {V3} v2
 */
function M33$LV3$LV3$LV3$(v0, v1, v2) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$LV3$LV3$LV3$(this, v0, v1, v2);
};

M33$LV3$LV3$LV3$.prototype = new M33;

/**
 * @constructor
 * @param {!number} s
 */
function M33$N(s) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$N(this, s);
};

M33$N.prototype = new M33;

/**
 * @constructor
 * @param {M22} m
 * @param {!number} m22
 */
function M33$LM22$N(m, m22) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$LM22$N(this, m, m22);
};

M33$LM22$N.prototype = new M33;

/**
 * @constructor
 * @param {M44} m
 */
function M33$LM44$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	M33$set$LM33$LM44$(this, m);
};

M33$LM44$.prototype = new M33;

/**
 * @param {M33} $this
 * @return {Array.<undefined|!number>}
 */
M33.array$LM33$ = function ($this) {
	return [ $this.m11, $this.m21, $this.m31, $this.m12, $this.m22, $this.m32, $this.m13, $this.m23, $this.m33 ];
};

var M33$array$LM33$ = M33.array$LM33$;

/**
 * @param {M33} $this
 * @return {M22}
 */
M33.M22$LM33$ = function ($this) {
	return new M22$LM33$($this);
};

var M33$M22$LM33$ = M33.M22$LM33$;

/**
 * @param {M33} $this
 * @param {!number} m33
 * @return {M44}
 */
M33.M44$LM33$N = function ($this, m33) {
	return new M44$LM33$N($this, m33);
};

var M33$M44$LM33$N = M33.M44$LM33$N;

/**
 * @param {M33} $this
 * @param {M22} m
 * @param {!number} m22
 * @return {M33}
 */
M33.set$LM33$LM22$N = function ($this, m, m22) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m31 = 0;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	$this.m32 = 0;
	$this.m13 = 0;
	$this.m23 = 0;
	$this.m33 = 0;
	return $this;
};

var M33$set$LM33$LM22$N = M33.set$LM33$LM22$N;

/**
 * @param {M33} $this
 * @param {M44} m
 * @return {M33}
 */
M33.set$LM33$LM44$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m31 = m.m31;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	$this.m32 = m.m32;
	$this.m13 = m.m13;
	$this.m23 = m.m23;
	$this.m33 = m.m33;
	return $this;
};

var M33$set$LM33$LM44$ = M33.set$LM33$LM44$;

/**
 * @param {M33} $this
 * @return {M33}
 */
M33.clone$LM33$ = function ($this) {
	return new M33$LM33$($this);
};

var M33$clone$LM33$ = M33.clone$LM33$;

/**
 * @param {M33} $this
 * @return {M33}
 */
M33.setZero$LM33$ = function ($this) {
	return M33$set$LM33$N($this, 0);
};

var M33$setZero$LM33$ = M33.setZero$LM33$;

/**
 * @param {M33} $this
 * @return {M33}
 */
M33.setIdentity$LM33$ = function ($this) {
	return M33$set$LM33$N($this, 1);
};

var M33$setIdentity$LM33$ = M33.setIdentity$LM33$;

/**
 * @return {M33}
 */
M33.zero$ = function () {
	/** @type {M33} */
	var $this$0;
	$this$0 = new M33$();
	return M33$set$LM33$N($this$0, 0);
};

var M33$zero$ = M33.zero$;

/**
 * @return {M33}
 */
M33.identity$ = function () {
	/** @type {M33} */
	var $this$0;
	$this$0 = new M33$();
	return M33$set$LM33$N($this$0, 1);
};

var M33$identity$ = M33.identity$;

/**
 * @param {M33} $this
 * @param {!number} m11
 * @param {!number} m12
 * @param {!number} m13
 * @param {!number} m21
 * @param {!number} m22
 * @param {!number} m23
 * @param {!number} m31
 * @param {!number} m32
 * @param {!number} m33
 * @return {M33}
 */
M33.set$LM33$NNNNNNNNN = function ($this, m11, m12, m13, m21, m22, m23, m31, m32, m33) {
	$this.m11 = m11;
	$this.m21 = m21;
	$this.m31 = m31;
	$this.m12 = m12;
	$this.m22 = m22;
	$this.m32 = m32;
	$this.m13 = m13;
	$this.m23 = m23;
	$this.m33 = m33;
	return $this;
};

var M33$set$LM33$NNNNNNNNN = M33.set$LM33$NNNNNNNNN;

/**
 * @param {M33} $this
 * @param {V3} v0
 * @param {V3} v1
 * @param {V3} v2
 * @return {M33}
 */
M33.set$LM33$LV3$LV3$LV3$ = function ($this, v0, v1, v2) {
	$this.m11 = v0.x;
	$this.m21 = v0.y;
	$this.m31 = v0.z;
	$this.m12 = v1.x;
	$this.m22 = v1.y;
	$this.m32 = v1.z;
	$this.m13 = v2.x;
	$this.m23 = v2.y;
	$this.m33 = v2.z;
	return $this;
};

var M33$set$LM33$LV3$LV3$LV3$ = M33.set$LM33$LV3$LV3$LV3$;

/**
 * @param {M33} $this
 * @param {M33} m
 * @return {M33}
 */
M33.set$LM33$LM33$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m31 = m.m31;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	$this.m32 = m.m32;
	$this.m13 = m.m13;
	$this.m23 = m.m23;
	$this.m33 = m.m33;
	return $this;
};

var M33$set$LM33$LM33$ = M33.set$LM33$LM33$;

/**
 * @param {M33} $this
 * @param {Array.<undefined|!number>} m
 * @return {M33}
 */
M33.set$LM33$AN = function ($this, m) {
	$this.m11 = m[0];
	$this.m21 = m[1];
	$this.m31 = m[2];
	$this.m12 = m[3];
	$this.m22 = m[4];
	$this.m32 = m[5];
	$this.m13 = m[6];
	$this.m23 = m[7];
	$this.m33 = m[8];
	return $this;
};

var M33$set$LM33$AN = M33.set$LM33$AN;

/**
 * @param {M33} $this
 * @param {Float32Array} m
 * @return {M33}
 */
M33.set$LM33$LFloat32Array$ = function ($this, m) {
	$this.m11 = m[0];
	$this.m21 = m[1];
	$this.m31 = m[2];
	$this.m12 = m[3];
	$this.m22 = m[4];
	$this.m32 = m[5];
	$this.m13 = m[6];
	$this.m23 = m[7];
	$this.m33 = m[8];
	return $this;
};

var M33$set$LM33$LFloat32Array$ = M33.set$LM33$LFloat32Array$;

/**
 * @param {M33} $this
 * @param {!number} s
 * @return {M33}
 */
M33.set$LM33$N = function ($this, s) {
	$this.m11 = $this.m22 = $this.m33 = s;
	$this.m21 = $this.m31 = $this.m12 = $this.m32 = $this.m13 = $this.m23 = 0;
	return $this;
};

var M33$set$LM33$N = M33.set$LM33$N;

/**
 * @param {M33} $this
 * @param {M33} m
 * @return {!boolean}
 */
M33.equals$LM33$LM33$ = function ($this, m) {
	return M33$equals$LM33$LM33$N($this, m, 0.000001);
};

var M33$equals$LM33$LM33$ = M33.equals$LM33$LM33$;

/**
 * @param {M33} $this
 * @param {M33} m
 * @param {!number} eps
 * @return {!boolean}
 */
M33.equals$LM33$LM33$N = function ($this, m, eps) {
	var $math_abs_t;
	return ((($math_abs_t = $this.m11 - m.m11) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m21 - m.m21) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m31 - m.m31) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m12 - m.m12) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m22 - m.m22) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m32 - m.m32) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m13 - m.m13) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m23 - m.m23) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m33 - m.m33) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : true);
};

var M33$equals$LM33$LM33$N = M33.equals$LM33$LM33$N;

/**
 * @param {M33} $this
 * @param {M33} m
 * @return {M33}
 */
M33.add$LM33$LM33$ = function ($this, m) {
	$this.m11 += m.m11;
	$this.m21 += m.m21;
	$this.m31 += m.m31;
	$this.m12 += m.m12;
	$this.m22 += m.m22;
	$this.m32 += m.m32;
	$this.m13 += m.m13;
	$this.m23 += m.m23;
	$this.m33 += m.m33;
	return $this;
};

var M33$add$LM33$LM33$ = M33.add$LM33$LM33$;

/**
 * @param {M33} $this
 * @param {M33} m
 * @return {M33}
 */
M33.sub$LM33$LM33$ = function ($this, m) {
	$this.m11 -= m.m11;
	$this.m21 -= m.m21;
	$this.m31 -= m.m31;
	$this.m12 -= m.m12;
	$this.m22 -= m.m22;
	$this.m32 -= m.m32;
	$this.m13 -= m.m13;
	$this.m23 -= m.m23;
	$this.m33 -= m.m33;
	return $this;
};

var M33$sub$LM33$LM33$ = M33.sub$LM33$LM33$;

/**
 * @param {M33} $this
 * @param {M33} m
 * @return {M33}
 */
M33.mul$LM33$LM33$ = function ($this, m) {
	return M33$mul$LM33$LM33$LM33$($this, new M33$LM33$($this), m);
};

var M33$mul$LM33$LM33$ = M33.mul$LM33$LM33$;

/**
 * @param {M33} $this
 * @param {M33} m0
 * @param {M33} m1
 * @return {M33}
 */
M33.mul$LM33$LM33$LM33$ = function ($this, m0, m1) {
	/** @type {!number} */
	var m11$0;
	/** @type {!number} */
	var m21$0;
	/** @type {!number} */
	var m31$0;
	/** @type {!number} */
	var m11$1;
	/** @type {!number} */
	var m12$0;
	/** @type {!number} */
	var m13$0;
	/** @type {!number} */
	var m21$1;
	/** @type {!number} */
	var m12$1;
	/** @type {!number} */
	var m22$0;
	/** @type {!number} */
	var m22$1;
	/** @type {!number} */
	var m23$0;
	/** @type {!number} */
	var m32$0;
	/** @type {!number} */
	var m31$1;
	/** @type {!number} */
	var m32$1;
	/** @type {!number} */
	var m33$0;
	/** @type {!number} */
	var m13$1;
	/** @type {!number} */
	var m23$1;
	/** @type {!number} */
	var m33$1;
	$this.m11 = (m11$1 = m0.m11) * (m11$0 = m1.m11) + (m12$0 = m0.m12) * (m21$0 = m1.m21) + (m13$0 = m0.m13) * (m31$0 = m1.m31);
	$this.m21 = (m21$1 = m0.m21) * m11$0 + (m22$0 = m0.m22) * m21$0 + (m23$0 = m0.m23) * m31$0;
	$this.m31 = (m31$1 = m0.m31) * m11$0 + (m32$1 = m0.m32) * m21$0 + (m33$0 = m0.m33) * m31$0;
	$this.m12 = m11$1 * (m12$1 = m1.m12) + m12$0 * (m22$1 = m1.m22) + m13$0 * (m32$0 = m1.m32);
	$this.m22 = m21$1 * m12$1 + m22$0 * m22$1 + m23$0 * m32$0;
	$this.m32 = m31$1 * m12$1 + m32$1 * m22$1 + m33$0 * m32$0;
	$this.m13 = m11$1 * (m13$1 = m1.m13) + m12$0 * (m23$1 = m1.m23) + m13$0 * (m33$1 = m1.m33);
	$this.m23 = m21$1 * m13$1 + m22$0 * m23$1 + m23$0 * m33$1;
	$this.m33 = m31$1 * m13$1 + m32$1 * m23$1 + m33$0 * m33$1;
	return $this;
};

var M33$mul$LM33$LM33$LM33$ = M33.mul$LM33$LM33$LM33$;

/**
 * @param {M33} $this
 * @return {M33}
 */
M33.transpose$LM33$ = function ($this) {
	/** @type {!number} */
	var m21;
	/** @type {!number} */
	var m31;
	/** @type {!number} */
	var m32;
	(m21 = $this.m21, m31 = $this.m31, m32 = $this.m32);
	$this.m21 = $this.m12;
	$this.m31 = $this.m13;
	$this.m32 = $this.m23;
	$this.m12 = m21;
	$this.m13 = m31;
	$this.m23 = m32;
	return $this;
};

var M33$transpose$LM33$ = M33.transpose$LM33$;

/**
 * @param {M33} $this
 * @param {M33} m
 * @return {M33}
 */
M33.transpose$LM33$LM33$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m12;
	$this.m31 = m.m13;
	$this.m12 = m.m21;
	$this.m22 = m.m22;
	$this.m32 = m.m23;
	$this.m13 = m.m31;
	$this.m23 = m.m32;
	$this.m33 = m.m33;
	return $this;
};

var M33$transpose$LM33$LM33$ = M33.transpose$LM33$LM33$;

/**
 * @param {M33} $this
 * @return {!number}
 */
M33.det$LM33$ = function ($this) {
	/** @type {!number} */
	var m11;
	/** @type {!number} */
	var m12;
	/** @type {!number} */
	var m13;
	/** @type {!number} */
	var m21;
	/** @type {!number} */
	var m22;
	/** @type {!number} */
	var m23;
	/** @type {!number} */
	var m31;
	/** @type {!number} */
	var m32;
	/** @type {!number} */
	var m33;
	(m11 = $this.m11, m12 = $this.m12, m13 = $this.m13);
	(m21 = $this.m21, m22 = $this.m22, m23 = $this.m23);
	(m31 = $this.m31, m32 = $this.m32, m33 = $this.m33);
	return m11 * (m22 * m33 - m23 * m32) + m12 * (m23 * m31 - m21 * m33) + m13 * (m21 * m32 - m22 * m31);
};

var M33$det$LM33$ = M33.det$LM33$;

/**
 * @param {M33} $this
 * @return {M33}
 */
M33.inverse$LM33$ = function ($this) {
	/** @type {!number} */
	var d;
	/** @type {!number} */
	var invDet;
	/** @type {!number} */
	var m11;
	/** @type {!number} */
	var m21;
	/** @type {!number} */
	var m31;
	/** @type {!number} */
	var m12;
	/** @type {!number} */
	var m22;
	/** @type {!number} */
	var m32;
	/** @type {!number} */
	var m13;
	/** @type {!number} */
	var m23;
	/** @type {!number} */
	var m33;
	d = M33$det$LM33$($this);
	if (d === 0) {
		return null;
	}
	invDet = 1 / d;
	(m11 = $this.m11, m21 = $this.m21, m31 = $this.m31);
	(m12 = $this.m12, m22 = $this.m22, m32 = $this.m32);
	(m13 = $this.m13, m23 = $this.m23, m33 = $this.m33);
	$this.m11 = invDet * (m22 * m33 - m23 * m32);
	$this.m21 = invDet * (m23 * m31 - m21 * m33);
	$this.m31 = invDet * (m21 * m32 - m22 * m31);
	$this.m12 = invDet * (m13 * m32 - m12 * m33);
	$this.m22 = invDet * (m11 * m33 - m13 * m31);
	$this.m32 = invDet * (m12 * m31 - m11 * m32);
	$this.m13 = invDet * (m12 * m23 - m13 * m22);
	$this.m23 = invDet * (m13 * m21 - m11 * m23);
	$this.m33 = invDet * (m11 * m22 - m12 * m21);
	return $this;
};

var M33$inverse$LM33$ = M33.inverse$LM33$;

/**
 * @param {M33} $this
 * @param {!number} s
 * @return {M33}
 */
M33.setScale$LM33$N = function ($this, s) {
	return M33$set$LM33$N($this, s);
};

var M33$setScale$LM33$N = M33.setScale$LM33$N;

/**
 * @param {M33} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M33}
 */
M33.setScale$LM33$NNN = function ($this, x, y, z) {
	$this.m11 = x;
	$this.m22 = y;
	$this.m33 = z;
	$this.m21 = $this.m31 = $this.m12 = $this.m32 = $this.m13 = $this.m23 = 0;
	return $this;
};

var M33$setScale$LM33$NNN = M33.setScale$LM33$NNN;

/**
 * @param {M33} $this
 * @param {V3} v
 * @return {M33}
 */
M33.setScale$LM33$LV3$ = function ($this, v) {
	return M33$setScale$LM33$NNN($this, v.x, v.y, v.z);
};

var M33$setScale$LM33$LV3$ = M33.setScale$LM33$LV3$;

/**
 * @param {M33} $this
 * @param {Array.<undefined|!number>} v
 * @return {M33}
 */
M33.setScale$LM33$AN = function ($this, v) {
	return M33$setScale$LM33$NNN($this, v[0], v[1], v[2]);
};

var M33$setScale$LM33$AN = M33.setScale$LM33$AN;

/**
 * @param {M33} $this
 * @param {Float32Array} v
 * @return {M33}
 */
M33.setScale$LM33$LFloat32Array$ = function ($this, v) {
	return M33$setScale$LM33$NNN($this, v[0], v[1], v[2]);
};

var M33$setScale$LM33$LFloat32Array$ = M33.setScale$LM33$LFloat32Array$;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M33}
 */
M33.setRotation$LM33$NNNN = function ($this, rad, x, y, z) {
	/** @type {!number} */
	var l;
	/** @type {!number} */
	var il;
	/** @type {!number} */
	var c;
	/** @type {!number} */
	var s;
	/** @type {!number} */
	var _c;
	l = Math.sqrt(x * x + y * y + z * z);
	if (l === 0) {
		return null;
	}
	il = 1 / l;
	x *= il;
	y *= il;
	z *= il;
	(c = Math.cos(rad), s = Math.sin(rad));
	_c = 1 - c;
	$this.m11 = x * x * _c + c;
	$this.m21 = y * x * _c + z * s;
	$this.m31 = x * z * _c - y * s;
	$this.m12 = x * y * _c - z * s;
	$this.m22 = y * y * _c + c;
	$this.m32 = y * z * _c + x * s;
	$this.m13 = x * z * _c + y * s;
	$this.m23 = y * z * _c - x * s;
	$this.m33 = z * z * _c + c;
	return $this;
};

var M33$setRotation$LM33$NNNN = M33.setRotation$LM33$NNNN;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @param {V3} a
 * @return {M33}
 */
M33.setRotation$LM33$NLV3$ = function ($this, rad, a) {
	return M33$setRotation$LM33$NNNN($this, rad, a.x, a.y, a.z);
};

var M33$setRotation$LM33$NLV3$ = M33.setRotation$LM33$NLV3$;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @param {Array.<undefined|!number>} a
 * @return {M33}
 */
M33.setRotation$LM33$NAN = function ($this, rad, a) {
	return M33$setRotation$LM33$NNNN($this, rad, $this.m11, $this.m21, $this.m31);
};

var M33$setRotation$LM33$NAN = M33.setRotation$LM33$NAN;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @param {Float32Array} a
 * @return {M33}
 */
M33.setRotation$LM33$NLFloat32Array$ = function ($this, rad, a) {
	return M33$setRotation$LM33$NNNN($this, rad, $this.m11, $this.m21, $this.m31);
};

var M33$setRotation$LM33$NLFloat32Array$ = M33.setRotation$LM33$NLFloat32Array$;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @return {M33}
 */
M33.setRotateX$LM33$N = function ($this, rad) {
	return M33$setRotation$LM33$NNNN($this, rad, 1, 0, 0);
};

var M33$setRotateX$LM33$N = M33.setRotateX$LM33$N;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @return {M33}
 */
M33.setRotateY$LM33$N = function ($this, rad) {
	return M33$setRotation$LM33$NNNN($this, rad, 0, 1, 0);
};

var M33$setRotateY$LM33$N = M33.setRotateY$LM33$N;

/**
 * @param {M33} $this
 * @param {!number} rad
 * @return {M33}
 */
M33.setRotateZ$LM33$N = function ($this, rad) {
	return M33$setRotation$LM33$NNNN($this, rad, 0, 0, 1);
};

var M33$setRotateZ$LM33$N = M33.setRotateZ$LM33$N;

/**
 * @return {!string}
 */
M33.prototype.toString = function () {
	return "M33" + JSON.stringify(M33$array$LM33$(this));
};

/**
 * class M44 extends Object
 * @constructor
 */
function M44() {
}

/**
 * @constructor
 */
function M44$() {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
};

M44$.prototype = new M44;

/**
 * @constructor
 * @param {M44} m
 */
function M44$LM44$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$LM44$(this, m);
};

M44$LM44$.prototype = new M44;

/**
 * @constructor
 * @param {Array.<undefined|!number>} m
 */
function M44$AN(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$AN(this, m);
};

M44$AN.prototype = new M44;

/**
 * @constructor
 * @param {Float32Array} m
 */
function M44$LFloat32Array$(m) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$LFloat32Array$(this, m);
};

M44$LFloat32Array$.prototype = new M44;

/**
 * @constructor
 * @param {!number} m11
 * @param {!number} m12
 * @param {!number} m13
 * @param {!number} m14
 * @param {!number} m21
 * @param {!number} m22
 * @param {!number} m23
 * @param {!number} m24
 * @param {!number} m31
 * @param {!number} m32
 * @param {!number} m33
 * @param {!number} m34
 * @param {!number} m41
 * @param {!number} m42
 * @param {!number} m43
 * @param {!number} m44
 */
function M44$NNNNNNNNNNNNNNNN(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
	this.m11 = m11;
	this.m21 = m21;
	this.m31 = m31;
	this.m41 = m41;
	this.m12 = m12;
	this.m22 = m22;
	this.m32 = m32;
	this.m42 = m42;
	this.m13 = m13;
	this.m23 = m23;
	this.m33 = m33;
	this.m43 = m43;
	this.m14 = m14;
	this.m24 = m24;
	this.m34 = m34;
	this.m44 = m44;
};

M44$NNNNNNNNNNNNNNNN.prototype = new M44;

/**
 * @constructor
 * @param {V4} v0
 * @param {V4} v1
 * @param {V4} v2
 * @param {V4} v3
 */
function M44$LV4$LV4$LV4$LV4$(v0, v1, v2, v3) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$LV4$LV4$LV4$LV4$(this, v0, v1, v2, v3);
};

M44$LV4$LV4$LV4$LV4$.prototype = new M44;

/**
 * @constructor
 * @param {!number} s
 */
function M44$N(s) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$N(this, s);
};

M44$N.prototype = new M44;

/**
 * @constructor
 * @param {M22} m
 * @param {!number} m22
 * @param {!number} m33
 */
function M44$LM22$NN(m, m22, m33) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$LM22$NN(this, m, m22, m33);
};

M44$LM22$NN.prototype = new M44;

/**
 * @constructor
 * @param {M33} m
 * @param {!number} m33
 */
function M44$LM33$N(m, m33) {
	this.m11 = 0;
	this.m21 = 0;
	this.m31 = 0;
	this.m41 = 0;
	this.m12 = 0;
	this.m22 = 0;
	this.m32 = 0;
	this.m42 = 0;
	this.m13 = 0;
	this.m23 = 0;
	this.m33 = 0;
	this.m43 = 0;
	this.m14 = 0;
	this.m24 = 0;
	this.m34 = 0;
	this.m44 = 0;
	M44$set$LM44$LM33$N(this, m, m33);
};

M44$LM33$N.prototype = new M44;

/**
 * @param {M44} $this
 * @return {Array.<undefined|!number>}
 */
M44.array$LM44$ = function ($this) {
	return [ $this.m11, $this.m21, $this.m31, $this.m41, $this.m12, $this.m22, $this.m32, $this.m42, $this.m13, $this.m23, $this.m33, $this.m43, $this.m14, $this.m24, $this.m34, $this.m44 ];
};

var M44$array$LM44$ = M44.array$LM44$;

/**
 * @param {M44} $this
 * @return {M22}
 */
M44.M22$LM44$ = function ($this) {
	return new M22$LM44$($this);
};

var M44$M22$LM44$ = M44.M22$LM44$;

/**
 * @param {M44} $this
 * @param {!number} m33
 * @return {M33}
 */
M44.M33$LM44$N = function ($this, m33) {
	return new M33$LM44$($this);
};

var M44$M33$LM44$N = M44.M33$LM44$N;

/**
 * @param {M44} $this
 * @param {M22} m
 * @param {!number} m33
 * @param {!number} m44
 * @return {M44}
 */
M44.set$LM44$LM22$NN = function ($this, m, m33, m44) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m31 = 0;
	$this.m41 = 0;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	$this.m32 = 0;
	$this.m42 = 0;
	$this.m13 = 0;
	$this.m23 = 0;
	$this.m33 = m33;
	$this.m43 = 0;
	$this.m14 = 0;
	$this.m24 = 0;
	$this.m34 = 0;
	$this.m44 = m44;
	return $this;
};

var M44$set$LM44$LM22$NN = M44.set$LM44$LM22$NN;

/**
 * @param {M44} $this
 * @param {M33} m
 * @param {!number} m44
 * @return {M44}
 */
M44.set$LM44$LM33$N = function ($this, m, m44) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m31 = m.m31;
	$this.m41 = 0;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	$this.m32 = m.m32;
	$this.m42 = 0;
	$this.m13 = m.m13;
	$this.m23 = m.m23;
	$this.m33 = m.m33;
	$this.m43 = 0;
	$this.m14 = 0;
	$this.m24 = 0;
	$this.m34 = 0;
	$this.m44 = m44;
	return $this;
};

var M44$set$LM44$LM33$N = M44.set$LM44$LM33$N;

/**
 * @param {M44} $this
 * @return {M44}
 */
M44.clone$LM44$ = function ($this) {
	return new M44$LM44$($this);
};

var M44$clone$LM44$ = M44.clone$LM44$;

/**
 * @param {M44} $this
 * @return {M44}
 */
M44.setZero$LM44$ = function ($this) {
	return M44$set$LM44$N($this, 0);
};

var M44$setZero$LM44$ = M44.setZero$LM44$;

/**
 * @param {M44} $this
 * @return {M44}
 */
M44.setIdentity$LM44$ = function ($this) {
	return M44$set$LM44$N($this, 1);
};

var M44$setIdentity$LM44$ = M44.setIdentity$LM44$;

/**
 * @return {M44}
 */
M44.zero$ = function () {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$set$LM44$N($this$0, 0);
};

var M44$zero$ = M44.zero$;

/**
 * @return {M44}
 */
M44.identity$ = function () {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$set$LM44$N($this$0, 1);
};

var M44$identity$ = M44.identity$;

/**
 * @param {M44} $this
 * @param {!number} m11
 * @param {!number} m12
 * @param {!number} m13
 * @param {!number} m14
 * @param {!number} m21
 * @param {!number} m22
 * @param {!number} m23
 * @param {!number} m24
 * @param {!number} m31
 * @param {!number} m32
 * @param {!number} m33
 * @param {!number} m34
 * @param {!number} m41
 * @param {!number} m42
 * @param {!number} m43
 * @param {!number} m44
 * @return {M44}
 */
M44.set$LM44$NNNNNNNNNNNNNNNN = function ($this, m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
	$this.m11 = m11;
	$this.m21 = m21;
	$this.m31 = m31;
	$this.m41 = m41;
	$this.m12 = m12;
	$this.m22 = m22;
	$this.m32 = m32;
	$this.m42 = m42;
	$this.m13 = m13;
	$this.m23 = m23;
	$this.m33 = m33;
	$this.m43 = m43;
	$this.m14 = m14;
	$this.m24 = m24;
	$this.m34 = m34;
	$this.m44 = m44;
	return $this;
};

var M44$set$LM44$NNNNNNNNNNNNNNNN = M44.set$LM44$NNNNNNNNNNNNNNNN;

/**
 * @param {M44} $this
 * @param {V4} v1
 * @param {V4} v2
 * @param {V4} v3
 * @param {V4} v4
 * @return {M44}
 */
M44.set$LM44$LV4$LV4$LV4$LV4$ = function ($this, v1, v2, v3, v4) {
	$this.m11 = v1.x;
	$this.m21 = v1.y;
	$this.m31 = v1.z;
	$this.m41 = v1.w;
	$this.m12 = v2.x;
	$this.m22 = v2.y;
	$this.m32 = v2.z;
	$this.m42 = v2.w;
	$this.m13 = v3.x;
	$this.m23 = v3.y;
	$this.m33 = v3.z;
	$this.m43 = v3.w;
	$this.m14 = v4.x;
	$this.m24 = v4.y;
	$this.m34 = v4.z;
	$this.m44 = v4.w;
	return $this;
};

var M44$set$LM44$LV4$LV4$LV4$LV4$ = M44.set$LM44$LV4$LV4$LV4$LV4$;

/**
 * @param {M44} $this
 * @param {M44} m
 * @return {M44}
 */
M44.set$LM44$LM44$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m21;
	$this.m31 = m.m31;
	$this.m41 = m.m41;
	$this.m12 = m.m12;
	$this.m22 = m.m22;
	$this.m32 = m.m32;
	$this.m42 = m.m42;
	$this.m13 = m.m13;
	$this.m23 = m.m23;
	$this.m33 = m.m33;
	$this.m43 = m.m43;
	$this.m14 = m.m14;
	$this.m24 = m.m24;
	$this.m34 = m.m34;
	$this.m44 = m.m44;
	return $this;
};

var M44$set$LM44$LM44$ = M44.set$LM44$LM44$;

/**
 * @param {M44} $this
 * @param {Array.<undefined|!number>} m
 * @return {M44}
 */
M44.set$LM44$AN = function ($this, m) {
	$this.m11 = m[0];
	$this.m21 = m[1];
	$this.m31 = m[2];
	$this.m41 = m[3];
	$this.m12 = m[4];
	$this.m22 = m[5];
	$this.m32 = m[6];
	$this.m42 = m[7];
	$this.m13 = m[8];
	$this.m23 = m[9];
	$this.m33 = m[10];
	$this.m43 = m[11];
	$this.m14 = m[12];
	$this.m24 = m[13];
	$this.m34 = m[14];
	$this.m44 = m[15];
	return $this;
};

var M44$set$LM44$AN = M44.set$LM44$AN;

/**
 * @param {M44} $this
 * @param {Float32Array} m
 * @return {M44}
 */
M44.set$LM44$LFloat32Array$ = function ($this, m) {
	$this.m11 = m[0];
	$this.m21 = m[1];
	$this.m31 = m[2];
	$this.m41 = m[3];
	$this.m12 = m[4];
	$this.m22 = m[5];
	$this.m32 = m[6];
	$this.m42 = m[7];
	$this.m13 = m[8];
	$this.m23 = m[9];
	$this.m33 = m[10];
	$this.m43 = m[11];
	$this.m14 = m[12];
	$this.m24 = m[13];
	$this.m34 = m[14];
	$this.m44 = m[15];
	return $this;
};

var M44$set$LM44$LFloat32Array$ = M44.set$LM44$LFloat32Array$;

/**
 * @param {M44} $this
 * @param {!number} s
 * @return {M44}
 */
M44.set$LM44$N = function ($this, s) {
	$this.m11 = $this.m22 = $this.m33 = $this.m44 = s;
	$this.m21 = $this.m31 = $this.m41 = $this.m12 = $this.m32 = $this.m42 = $this.m13 = $this.m23 = $this.m43 = $this.m14 = $this.m24 = $this.m34 = 0;
	return $this;
};

var M44$set$LM44$N = M44.set$LM44$N;

/**
 * @param {M44} $this
 * @param {M44} m
 * @return {!boolean}
 */
M44.equals$LM44$LM44$ = function ($this, m) {
	return M44$equals$LM44$LM44$N($this, m, 0.000001);
};

var M44$equals$LM44$LM44$ = M44.equals$LM44$LM44$;

/**
 * @param {M44} $this
 * @param {M44} m
 * @param {!number} eps
 * @return {!boolean}
 */
M44.equals$LM44$LM44$N = function ($this, m, eps) {
	var $math_abs_t;
	return ((($math_abs_t = $this.m11 - m.m11) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m21 - m.m21) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m31 - m.m31) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m41 - m.m41) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m12 - m.m12) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m22 - m.m22) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m32 - m.m32) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m42 - m.m42) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m13 - m.m13) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m23 - m.m23) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m33 - m.m33) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m43 - m.m43) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m14 - m.m14) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m24 - m.m24) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m34 - m.m34) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.m44 - m.m44) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : true);
};

var M44$equals$LM44$LM44$N = M44.equals$LM44$LM44$N;

/**
 * @param {M44} $this
 * @param {M44} m
 * @return {M44}
 */
M44.add$LM44$LM44$ = function ($this, m) {
	$this.m11 += m.m11;
	$this.m21 += m.m21;
	$this.m31 += m.m31;
	$this.m41 += m.m41;
	$this.m12 += m.m12;
	$this.m22 += m.m22;
	$this.m32 += m.m32;
	$this.m42 += m.m42;
	$this.m13 += m.m13;
	$this.m23 += m.m23;
	$this.m33 += m.m33;
	$this.m43 += m.m43;
	$this.m14 += m.m14;
	$this.m24 += m.m24;
	$this.m34 += m.m34;
	$this.m44 += m.m44;
	return $this;
};

var M44$add$LM44$LM44$ = M44.add$LM44$LM44$;

/**
 * @param {M44} $this
 * @param {M44} m
 * @return {M44}
 */
M44.sub$LM44$LM44$ = function ($this, m) {
	$this.m11 -= m.m11;
	$this.m21 -= m.m21;
	$this.m31 -= m.m31;
	$this.m41 -= m.m41;
	$this.m12 -= m.m12;
	$this.m22 -= m.m22;
	$this.m32 -= m.m32;
	$this.m42 -= m.m42;
	$this.m13 -= m.m13;
	$this.m23 -= m.m23;
	$this.m33 -= m.m33;
	$this.m43 -= m.m43;
	$this.m14 -= m.m14;
	$this.m24 -= m.m24;
	$this.m34 -= m.m34;
	$this.m44 -= m.m44;
	return $this;
};

var M44$sub$LM44$LM44$ = M44.sub$LM44$LM44$;

/**
 * @param {M44} $this
 * @param {M44} m
 * @return {M44}
 */
M44.mul$LM44$LM44$ = function ($this, m) {
	return M44$mul$LM44$LM44$LM44$($this, new M44$LM44$($this), m);
};

var M44$mul$LM44$LM44$ = M44.mul$LM44$LM44$;

/**
 * @param {M44} $this
 * @param {M44} m0
 * @param {M44} m1
 * @return {M44}
 */
M44.mul$LM44$LM44$LM44$ = function ($this, m0, m1) {
	/** @type {!number} */
	var m11$0;
	/** @type {!number} */
	var m21$0;
	/** @type {!number} */
	var m31$0;
	/** @type {!number} */
	var m41$0;
	/** @type {!number} */
	var m11$1;
	/** @type {!number} */
	var m12$0;
	/** @type {!number} */
	var m13$0;
	/** @type {!number} */
	var m14$0;
	/** @type {!number} */
	var m21$1;
	/** @type {!number} */
	var m12$1;
	/** @type {!number} */
	var m22$0;
	/** @type {!number} */
	var m22$1;
	/** @type {!number} */
	var m23$0;
	/** @type {!number} */
	var m32$0;
	/** @type {!number} */
	var m24$0;
	/** @type {!number} */
	var m42$0;
	/** @type {!number} */
	var m31$1;
	/** @type {!number} */
	var m32$1;
	/** @type {!number} */
	var m33$0;
	/** @type {!number} */
	var m34$0;
	/** @type {!number} */
	var m41$1;
	/** @type {!number} */
	var m42$1;
	/** @type {!number} */
	var m43$0;
	/** @type {!number} */
	var m44$0;
	/** @type {!number} */
	var m13$1;
	/** @type {!number} */
	var m23$1;
	/** @type {!number} */
	var m33$1;
	/** @type {!number} */
	var m43$1;
	/** @type {!number} */
	var m14$1;
	/** @type {!number} */
	var m24$1;
	/** @type {!number} */
	var m34$1;
	/** @type {!number} */
	var m44$1;
	$this.m11 = (m11$1 = m0.m11) * (m11$0 = m1.m11) + (m12$0 = m0.m12) * (m21$0 = m1.m21) + (m13$0 = m0.m13) * (m31$0 = m1.m31) + (m14$0 = m0.m14) * (m41$0 = m1.m41);
	$this.m21 = (m21$1 = m0.m21) * m11$0 + (m22$0 = m0.m22) * m21$0 + (m23$0 = m0.m23) * m31$0 + (m24$0 = m0.m24) * m41$0;
	$this.m31 = (m31$1 = m0.m31) * m11$0 + (m32$1 = m0.m32) * m21$0 + (m33$0 = m0.m33) * m31$0 + (m34$0 = m0.m34) * m41$0;
	$this.m41 = (m41$1 = m0.m41) * m11$0 + (m42$1 = m0.m42) * m21$0 + (m43$0 = m0.m43) * m31$0 + (m44$0 = m0.m44) * m41$0;
	$this.m12 = m11$1 * (m12$1 = m1.m12) + m12$0 * (m22$1 = m1.m22) + m13$0 * (m32$0 = m1.m32) + m14$0 * (m42$0 = m1.m42);
	$this.m22 = m21$1 * m12$1 + m22$0 * m22$1 + m23$0 * m32$0 + m24$0 * m42$0;
	$this.m32 = m31$1 * m12$1 + m32$1 * m22$1 + m33$0 * m32$0 + m34$0 * m42$0;
	$this.m42 = m41$1 * m12$1 + m42$1 * m22$1 + m43$0 * m32$0 + m44$0 * m42$0;
	$this.m13 = m11$1 * (m13$1 = m1.m13) + m12$0 * (m23$1 = m1.m23) + m13$0 * (m33$1 = m1.m33) + m14$0 * (m43$1 = m1.m43);
	$this.m23 = m21$1 * m13$1 + m22$0 * m23$1 + m23$0 * m33$1 + m24$0 * m43$1;
	$this.m33 = m31$1 * m13$1 + m32$1 * m23$1 + m33$0 * m33$1 + m34$0 * m43$1;
	$this.m43 = m41$1 * m13$1 + m42$1 * m23$1 + m43$0 * m33$1 + m44$0 * m43$1;
	$this.m14 = m11$1 * (m14$1 = m1.m14) + m12$0 * (m24$1 = m1.m24) + m13$0 * (m34$1 = m1.m34) + m14$0 * (m44$1 = m1.m44);
	$this.m24 = m21$1 * m14$1 + m22$0 * m24$1 + m23$0 * m34$1 + m24$0 * m44$1;
	$this.m34 = m31$1 * m14$1 + m32$1 * m24$1 + m33$0 * m34$1 + m34$0 * m44$1;
	$this.m44 = m41$1 * m14$1 + m42$1 * m24$1 + m43$0 * m34$1 + m44$0 * m44$1;
	return $this;
};

var M44$mul$LM44$LM44$LM44$ = M44.mul$LM44$LM44$LM44$;

/**
 * @param {M44} $this
 * @return {M44}
 */
M44.transpose$LM44$ = function ($this) {
	/** @type {!number} */
	var m21;
	/** @type {!number} */
	var m31;
	/** @type {!number} */
	var m41;
	/** @type {!number} */
	var m32;
	/** @type {!number} */
	var m42;
	/** @type {!number} */
	var m43;
	(m21 = $this.m21, m31 = $this.m31, m41 = $this.m41, m32 = $this.m32, m42 = $this.m42, m43 = $this.m43);
	$this.m21 = $this.m12;
	$this.m31 = $this.m13;
	$this.m41 = $this.m14;
	$this.m12 = m21;
	$this.m32 = $this.m23;
	$this.m42 = $this.m24;
	$this.m13 = m31;
	$this.m23 = m32;
	$this.m43 = $this.m34;
	$this.m14 = m41;
	$this.m24 = m42;
	$this.m34 = m43;
	return $this;
};

var M44$transpose$LM44$ = M44.transpose$LM44$;

/**
 * @param {M44} $this
 * @param {M44} m
 * @return {M44}
 */
M44.transpose$LM44$LM44$ = function ($this, m) {
	$this.m11 = m.m11;
	$this.m21 = m.m12;
	$this.m31 = m.m13;
	$this.m41 = m.m14;
	$this.m12 = m.m21;
	$this.m22 = m.m22;
	$this.m32 = m.m23;
	$this.m42 = m.m24;
	$this.m13 = m.m31;
	$this.m23 = m.m32;
	$this.m33 = m.m33;
	$this.m43 = m.m34;
	$this.m14 = m.m41;
	$this.m24 = m.m42;
	$this.m34 = m.m43;
	$this.m44 = m.m44;
	return $this;
};

var M44$transpose$LM44$LM44$ = M44.transpose$LM44$LM44$;

/**
 * @param {M44} $this
 * @return {!number}
 */
M44.det$LM44$ = function ($this) {
	/** @type {!number} */
	var m11;
	/** @type {!number} */
	var m21;
	/** @type {!number} */
	var m31;
	/** @type {!number} */
	var m41;
	/** @type {!number} */
	var m12;
	/** @type {!number} */
	var m22;
	/** @type {!number} */
	var m32;
	/** @type {!number} */
	var m42;
	/** @type {!number} */
	var m13;
	/** @type {!number} */
	var m23;
	/** @type {!number} */
	var m33;
	/** @type {!number} */
	var m43;
	/** @type {!number} */
	var m14;
	/** @type {!number} */
	var m24;
	/** @type {!number} */
	var m34;
	/** @type {!number} */
	var m44;
	(m11 = $this.m11, m21 = $this.m21, m31 = $this.m31, m41 = $this.m41);
	(m12 = $this.m12, m22 = $this.m22, m32 = $this.m32, m42 = $this.m42);
	(m13 = $this.m13, m23 = $this.m23, m33 = $this.m33, m43 = $this.m43);
	(m14 = $this.m14, m24 = $this.m24, m34 = $this.m34, m44 = $this.m44);
	return m14 * m23 * m32 * m41 - m13 * m24 * m32 * m41 - m14 * m22 * m33 * m41 + m12 * m24 * m33 * m41 + m13 * m22 * m34 * m41 - m12 * m23 * m34 * m41 - m14 * m23 * m31 * m42 + m13 * m24 * m31 * m42 + m14 * m21 * m33 * m42 - m11 * m24 * m33 * m42 - m13 * m21 * m34 * m42 + m11 * m23 * m34 * m42 + m14 * m22 * m31 * m43 - m12 * m24 * m31 * m43 - m14 * m21 * m32 * m43 + m11 * m24 * m32 * m43 + m12 * m21 * m34 * m43 - m11 * m22 * m34 * m43 - m13 * m22 * m31 * m44 + m12 * m23 * m31 * m44 + m13 * m21 * m32 * m44 - m11 * m23 * m32 * m44 - m12 * m21 * m33 * m44 + m11 * m22 * m33 * m44;
};

var M44$det$LM44$ = M44.det$LM44$;

/**
 * @param {M44} $this
 * @return {M44}
 */
M44.inverse$LM44$ = function ($this) {
	/** @type {!number} */
	var m11;
	/** @type {!number} */
	var m21;
	/** @type {!number} */
	var m31;
	/** @type {!number} */
	var m41;
	/** @type {!number} */
	var m12;
	/** @type {!number} */
	var m22;
	/** @type {!number} */
	var m32;
	/** @type {!number} */
	var m42;
	/** @type {!number} */
	var m13;
	/** @type {!number} */
	var m23;
	/** @type {!number} */
	var m33;
	/** @type {!number} */
	var m43;
	/** @type {!number} */
	var m14;
	/** @type {!number} */
	var m24;
	/** @type {!number} */
	var m34;
	/** @type {!number} */
	var m44;
	/** @type {!number} */
	var b00;
	/** @type {!number} */
	var b01;
	/** @type {!number} */
	var b02;
	/** @type {!number} */
	var b03;
	/** @type {!number} */
	var b04;
	/** @type {!number} */
	var b05;
	/** @type {!number} */
	var b06;
	/** @type {!number} */
	var b07;
	/** @type {!number} */
	var b08;
	/** @type {!number} */
	var b09;
	/** @type {!number} */
	var b10;
	/** @type {!number} */
	var b11;
	/** @type {!number} */
	var d;
	/** @type {!number} */
	var invDet;
	(m11 = $this.m11, m21 = $this.m21, m31 = $this.m31, m41 = $this.m41, m12 = $this.m12, m22 = $this.m22, m32 = $this.m32, m42 = $this.m42, m13 = $this.m13, m23 = $this.m23, m33 = $this.m33, m43 = $this.m43, m14 = $this.m14, m24 = $this.m24, m34 = $this.m34, m44 = $this.m44);
	(b00 = m11 * m22 - m21 * m12, b01 = m11 * m32 - m31 * m12, b02 = m11 * m42 - m41 * m12, b03 = m21 * m32 - m31 * m22, b04 = m21 * m42 - m41 * m22, b05 = m31 * m42 - m41 * m32, b06 = m13 * m24 - m23 * m14, b07 = m13 * m34 - m33 * m14, b08 = m13 * m44 - m43 * m14, b09 = m23 * m34 - m33 * m24, b10 = m23 * m44 - m43 * m24, b11 = m33 * m44 - m43 * m34);
	d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	if (d === 0) {
		return null;
	}
	invDet = 1 / d;
	$this.m11 = (m22 * b11 - m32 * b10 + m42 * b09) * invDet;
	$this.m21 = (- m21 * b11 + m31 * b10 - m41 * b09) * invDet;
	$this.m31 = (m24 * b05 - m34 * b04 + m44 * b03) * invDet;
	$this.m41 = (- m23 * b05 + m33 * b04 - m43 * b03) * invDet;
	$this.m12 = (- m12 * b11 + m32 * b08 - m42 * b07) * invDet;
	$this.m22 = (m11 * b11 - m31 * b08 + m41 * b07) * invDet;
	$this.m32 = (- m14 * b05 + m34 * b02 - m44 * b01) * invDet;
	$this.m42 = (m13 * b05 - m33 * b02 + m43 * b01) * invDet;
	$this.m13 = (m12 * b10 - m22 * b08 + m42 * b06) * invDet;
	$this.m23 = (- m11 * b10 + m21 * b08 - m41 * b06) * invDet;
	$this.m33 = (m14 * b04 - m24 * b02 + m44 * b00) * invDet;
	$this.m43 = (- m13 * b04 + m23 * b02 - m43 * b00) * invDet;
	$this.m14 = (- m12 * b09 + m22 * b07 - m32 * b06) * invDet;
	$this.m24 = (m11 * b09 - m21 * b07 + m31 * b06) * invDet;
	$this.m34 = (- m14 * b03 + m24 * b01 - m34 * b00) * invDet;
	$this.m44 = (m13 * b03 - m23 * b01 + m33 * b00) * invDet;
	return $this;
};

var M44$inverse$LM44$ = M44.inverse$LM44$;

/**
 * @param {M44} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M44}
 */
M44.setTranslation$LM44$NNN = function ($this, x, y, z) {
	M44$set$LM44$N($this, 1);
	$this.m14 = x;
	$this.m24 = y;
	$this.m34 = z;
	return $this;
};

var M44$setTranslation$LM44$NNN = M44.setTranslation$LM44$NNN;

/**
 * @param {M44} $this
 * @param {V3} v
 * @return {M44}
 */
M44.setTranslation$LM44$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	M44$set$LM44$N($this, 1);
	$this.m14 = x$0;
	$this.m24 = y$0;
	$this.m34 = z$0;
	return $this;
};

var M44$setTranslation$LM44$LV3$ = M44.setTranslation$LM44$LV3$;

/**
 * @param {M44} $this
 * @param {Array.<undefined|!number>} v
 * @return {M44}
 */
M44.setTranslation$LM44$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	M44$set$LM44$N($this, 1);
	$this.m14 = x$0;
	$this.m24 = y$0;
	$this.m34 = z$0;
	return $this;
};

var M44$setTranslation$LM44$AN = M44.setTranslation$LM44$AN;

/**
 * @param {M44} $this
 * @param {Float32Array} v
 * @return {M44}
 */
M44.setTranslation$LM44$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	M44$set$LM44$N($this, 1);
	$this.m14 = x$0;
	$this.m24 = y$0;
	$this.m34 = z$0;
	return $this;
};

var M44$setTranslation$LM44$LFloat32Array$ = M44.setTranslation$LM44$LFloat32Array$;

/**
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M44}
 */
M44.translation$NNN = function (x, y, z) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	M44$set$LM44$N($this$0, 1);
	$this$0.m14 = x;
	$this$0.m24 = y;
	$this$0.m34 = z;
	return $this$0;
};

var M44$translation$NNN = M44.translation$NNN;

/**
 * @param {V3} v
 * @return {M44}
 */
M44.translation$LV3$ = function (v) {
	return M44$setTranslation$LM44$LV3$(new M44$(), v);
};

var M44$translation$LV3$ = M44.translation$LV3$;

/**
 * @param {Array.<undefined|!number>} v
 * @return {M44}
 */
M44.translation$AN = function (v) {
	return M44$setTranslation$LM44$AN(new M44$(), v);
};

var M44$translation$AN = M44.translation$AN;

/**
 * @param {Float32Array} v
 * @return {M44}
 */
M44.translation$LFloat32Array$ = function (v) {
	return M44$setTranslation$LM44$LFloat32Array$(new M44$(), v);
};

var M44$translation$LFloat32Array$ = M44.translation$LFloat32Array$;

/**
 * @param {M44} $this
 * @param {!number} s
 * @return {M44}
 */
M44.setScale$LM44$N = function ($this, s) {
	M44$set$LM44$N($this, 0);
	$this.m11 = s;
	$this.m22 = s;
	$this.m33 = s;
	$this.m44 = 1;
	return $this;
};

var M44$setScale$LM44$N = M44.setScale$LM44$N;

/**
 * @param {M44} $this
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M44}
 */
M44.setScale$LM44$NNN = function ($this, x, y, z) {
	M44$set$LM44$N($this, 0);
	$this.m11 = x;
	$this.m22 = y;
	$this.m33 = z;
	$this.m44 = 1;
	return $this;
};

var M44$setScale$LM44$NNN = M44.setScale$LM44$NNN;

/**
 * @param {M44} $this
 * @param {V3} v
 * @return {M44}
 */
M44.setScale$LM44$LV3$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v.x;
	y$0 = v.y;
	z$0 = v.z;
	M44$set$LM44$N($this, 0);
	$this.m11 = x$0;
	$this.m22 = y$0;
	$this.m33 = z$0;
	$this.m44 = 1;
	return $this;
};

var M44$setScale$LM44$LV3$ = M44.setScale$LM44$LV3$;

/**
 * @param {M44} $this
 * @param {Array.<undefined|!number>} v
 * @return {M44}
 */
M44.setScale$LM44$AN = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	M44$set$LM44$N($this, 0);
	$this.m11 = x$0;
	$this.m22 = y$0;
	$this.m33 = z$0;
	$this.m44 = 1;
	return $this;
};

var M44$setScale$LM44$AN = M44.setScale$LM44$AN;

/**
 * @param {M44} $this
 * @param {Float32Array} v
 * @return {M44}
 */
M44.setScale$LM44$LFloat32Array$ = function ($this, v) {
	/** @type {!number} */
	var x$0;
	/** @type {!number} */
	var y$0;
	/** @type {!number} */
	var z$0;
	x$0 = v[0];
	y$0 = v[1];
	z$0 = v[2];
	M44$set$LM44$N($this, 0);
	$this.m11 = x$0;
	$this.m22 = y$0;
	$this.m33 = z$0;
	$this.m44 = 1;
	return $this;
};

var M44$setScale$LM44$LFloat32Array$ = M44.setScale$LM44$LFloat32Array$;

/**
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M44}
 */
M44.scale$NNN = function (x, y, z) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	M44$set$LM44$N($this$0, 0);
	$this$0.m11 = x;
	$this$0.m22 = y;
	$this$0.m33 = z;
	$this$0.m44 = 1;
	return $this$0;
};

var M44$scale$NNN = M44.scale$NNN;

/**
 * @param {V3} v
 * @return {M44}
 */
M44.scale$LV3$ = function (v) {
	return M44$setScale$LM44$LV3$(new M44$(), v);
};

var M44$scale$LV3$ = M44.scale$LV3$;

/**
 * @param {Array.<undefined|!number>} v
 * @return {M44}
 */
M44.scale$AN = function (v) {
	return M44$setScale$LM44$AN(new M44$(), v);
};

var M44$scale$AN = M44.scale$AN;

/**
 * @param {Float32Array} v
 * @return {M44}
 */
M44.scale$LFloat32Array$ = function (v) {
	return M44$setScale$LM44$LFloat32Array$(new M44$(), v);
};

var M44$scale$LFloat32Array$ = M44.scale$LFloat32Array$;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {M44}
 */
M44.setRotation$LM44$NNNN = function ($this, rad, x, y, z) {
	/** @type {!number} */
	var l;
	/** @type {!number} */
	var il;
	/** @type {!number} */
	var c;
	/** @type {!number} */
	var s;
	/** @type {!number} */
	var _c;
	l = Math.sqrt(x * x + y * y + z * z);
	if (l === 0) {
		return null;
	}
	il = 1 / l;
	x *= il;
	y *= il;
	z *= il;
	M44$array$LM44$($this);
	(c = Math.cos(rad), s = Math.sin(rad));
	_c = 1 - c;
	$this.m11 = x * x * _c + c;
	$this.m21 = y * x * _c + z * s;
	$this.m31 = x * z * _c - y * s;
	$this.m12 = x * y * _c - z * s;
	$this.m22 = y * y * _c + c;
	$this.m32 = y * z * _c + x * s;
	$this.m13 = x * z * _c + y * s;
	$this.m23 = y * z * _c - x * s;
	$this.m33 = z * z * _c + c;
	$this.m41 = $this.m42 = $this.m43 = $this.m14 = $this.m24 = $this.m34 = 0;
	$this.m44 = 1;
	return $this;
};

var M44$setRotation$LM44$NNNN = M44.setRotation$LM44$NNNN;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @param {V3} a
 * @return {M44}
 */
M44.setRotation$LM44$NLV3$ = function ($this, rad, a) {
	return M44$setRotation$LM44$NNNN($this, rad, a.x, a.y, a.z);
};

var M44$setRotation$LM44$NLV3$ = M44.setRotation$LM44$NLV3$;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @param {Array.<undefined|!number>} a
 * @return {M44}
 */
M44.setRotation$LM44$NAN = function ($this, rad, a) {
	return M44$setRotation$LM44$NNNN($this, rad, $this.m11, $this.m21, $this.m31);
};

var M44$setRotation$LM44$NAN = M44.setRotation$LM44$NAN;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @param {Float32Array} a
 * @return {M44}
 */
M44.setRotation$LM44$NLFloat32Array$ = function ($this, rad, a) {
	return M44$setRotation$LM44$NNNN($this, rad, $this.m11, $this.m21, $this.m31);
};

var M44$setRotation$LM44$NLFloat32Array$ = M44.setRotation$LM44$NLFloat32Array$;

/**
 * @param {!number} rad
 * @param {!number} ax
 * @param {!number} ay
 * @param {!number} az
 * @return {M44}
 */
M44.rotation$NNNN = function (rad, ax, ay, az) {
	return M44$setRotation$LM44$NNNN(new M44$(), rad, ax, ay, az);
};

var M44$rotation$NNNN = M44.rotation$NNNN;

/**
 * @param {!number} rad
 * @param {V3} axis
 * @return {M44}
 */
M44.rotation$NLV3$ = function (rad, axis) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$setRotation$LM44$NNNN($this$0, rad, axis.x, axis.y, axis.z);
};

var M44$rotation$NLV3$ = M44.rotation$NLV3$;

/**
 * @param {!number} rad
 * @param {Array.<undefined|!number>} axis
 * @return {M44}
 */
M44.rotation$NAN = function (rad, axis) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$setRotation$LM44$NNNN($this$0, rad, $this$0.m11, $this$0.m21, $this$0.m31);
};

var M44$rotation$NAN = M44.rotation$NAN;

/**
 * @param {!number} rad
 * @param {Float32Array} axis
 * @return {M44}
 */
M44.rotation$NLFloat32Array$ = function (rad, axis) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$setRotation$LM44$NNNN($this$0, rad, $this$0.m11, $this$0.m21, $this$0.m31);
};

var M44$rotation$NLFloat32Array$ = M44.rotation$NLFloat32Array$;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @return {M44}
 */
M44.setRotationX$LM44$N = function ($this, rad) {
	return M44$setRotation$LM44$NNNN($this, rad, 1, 0, 0);
};

var M44$setRotationX$LM44$N = M44.setRotationX$LM44$N;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @return {M44}
 */
M44.setRotationY$LM44$N = function ($this, rad) {
	return M44$setRotation$LM44$NNNN($this, rad, 0, 1, 0);
};

var M44$setRotationY$LM44$N = M44.setRotationY$LM44$N;

/**
 * @param {M44} $this
 * @param {!number} rad
 * @return {M44}
 */
M44.setRotationZ$LM44$N = function ($this, rad) {
	return M44$setRotation$LM44$NNNN($this, rad, 0, 0, 1);
};

var M44$setRotationZ$LM44$N = M44.setRotationZ$LM44$N;

/**
 * @param {!number} rad
 * @return {M44}
 */
M44.rotationX$N = function (rad) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$setRotation$LM44$NNNN($this$0, rad, 1, 0, 0);
};

var M44$rotationX$N = M44.rotationX$N;

/**
 * @param {!number} rad
 * @return {M44}
 */
M44.rotationY$N = function (rad) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$setRotation$LM44$NNNN($this$0, rad, 0, 1, 0);
};

var M44$rotationY$N = M44.rotationY$N;

/**
 * @param {!number} rad
 * @return {M44}
 */
M44.rotationZ$N = function (rad) {
	/** @type {M44} */
	var $this$0;
	$this$0 = new M44$();
	return M44$setRotation$LM44$NNNN($this$0, rad, 0, 0, 1);
};

var M44$rotationZ$N = M44.rotationZ$N;

/**
 * @param {M44} $this
 * @param {!number} l
 * @param {!number} r
 * @param {!number} b
 * @param {!number} t
 * @param {!number} n
 * @param {!number} f
 * @return {M44}
 */
M44.setFrustum$LM44$NNNNNN = function ($this, l, r, b, t, n, f) {
	/** @type {!number} */
	var rl;
	/** @type {!number} */
	var tb;
	/** @type {!number} */
	var fn;
	M44$array$LM44$($this);
	(rl = r - l, tb = t - b, fn = f - n);
	$this.m11 = 2 * n / rl;
	$this.m22 = 2 * n / tb;
	$this.m13 = (r + l) / rl;
	$this.m23 = (t + b) / tb;
	$this.m33 = - (f + n) / fn;
	$this.m43 = -1;
	$this.m34 = -2 * f * n / fn;
	$this.m21 = $this.m31 = $this.m41 = $this.m12 = $this.m32 = $this.m42 = $this.m14 = $this.m24 = $this.m44 = 0;
	return $this;
};

var M44$setFrustum$LM44$NNNNNN = M44.setFrustum$LM44$NNNNNN;

/**
 * @param {!number} l
 * @param {!number} r
 * @param {!number} b
 * @param {!number} t
 * @param {!number} n
 * @param {!number} f
 * @return {M44}
 */
M44.frustum$NNNNNN = function (l, r, b, t, n, f) {
	return M44$setFrustum$LM44$NNNNNN(new M44$(), l, r, b, t, n, f);
};

var M44$frustum$NNNNNN = M44.frustum$NNNNNN;

/**
 * @param {M44} $this
 * @param {!number} l
 * @param {!number} r
 * @param {!number} b
 * @param {!number} t
 * @param {!number} n
 * @param {!number} f
 * @return {M44}
 */
M44.setOrtho$LM44$NNNNNN = function ($this, l, r, b, t, n, f) {
	/** @type {!number} */
	var rl;
	/** @type {!number} */
	var tb;
	/** @type {!number} */
	var fn;
	M44$array$LM44$($this);
	(rl = r - l, tb = t - b, fn = f - n);
	$this.m11 = 2 / rl;
	$this.m22 = 2 / tb;
	$this.m33 = -2 / fn;
	$this.m14 = - (r + l) / rl;
	$this.m24 = - (t + b) / tb;
	$this.m34 = - (f + n) / fn;
	$this.m21 = $this.m31 = $this.m41 = $this.m12 = $this.m32 = $this.m42 = $this.m13 = $this.m23 = $this.m43 = 0;
	$this.m44 = 1;
	return $this;
};

var M44$setOrtho$LM44$NNNNNN = M44.setOrtho$LM44$NNNNNN;

/**
 * @param {!number} l
 * @param {!number} r
 * @param {!number} b
 * @param {!number} t
 * @param {!number} n
 * @param {!number} f
 * @return {M44}
 */
M44.ortho$NNNNNN = function (l, r, b, t, n, f) {
	return M44$setOrtho$LM44$NNNNNN(new M44$(), l, r, b, t, n, f);
};

var M44$ortho$NNNNNN = M44.ortho$NNNNNN;

/**
 * @return {!string}
 */
M44.prototype.toString = function () {
	return "M44" + JSON.stringify(M44$array$LM44$(this));
};

/**
 * class Quat extends Object
 * @constructor
 */
function Quat() {
}

/**
 * @constructor
 */
function Quat$() {
	this.w = 0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
};

Quat$.prototype = new Quat;

/**
 * @constructor
 * @param {Quat} q
 */
function Quat$LQuat$(q) {
	this.w = 0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = q.w;
	this.x = q.x;
	this.y = q.y;
	this.z = q.z;
};

Quat$LQuat$.prototype = new Quat;

/**
 * @constructor
 * @param {Array.<undefined|!number>} q
 */
function Quat$AN(q) {
	this.w = q[0];
	this.x = q[1];
	this.y = q[2];
	this.z = q[3];
};

Quat$AN.prototype = new Quat;

/**
 * @constructor
 * @param {Float32Array} q
 */
function Quat$LFloat32Array$(q) {
	this.w = q[0];
	this.x = q[1];
	this.y = q[2];
	this.z = q[3];
};

Quat$LFloat32Array$.prototype = new Quat;

/**
 * @constructor
 * @param {!number} w
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 */
function Quat$NNNN(w, x, y, z) {
	this.w = w;
	this.x = x;
	this.y = y;
	this.z = z;
};

Quat$NNNN.prototype = new Quat;

/**
 * @param {Quat} $this
 * @return {Array.<undefined|!number>}
 */
Quat.array$LQuat$ = function ($this) {
	return [ $this.w, $this.x, $this.y, $this.z ];
};

var Quat$array$LQuat$ = Quat.array$LQuat$;

/**
 * @param {Quat} $this
 * @return {Quat}
 */
Quat.clone$LQuat$ = function ($this) {
	return new Quat$LQuat$($this);
};

var Quat$clone$LQuat$ = Quat.clone$LQuat$;

/**
 * @param {Quat} $this
 * @return {Quat}
 */
Quat.setZero$LQuat$ = function ($this) {
	$this.w = 0;
	$this.x = 0;
	$this.y = 0;
	$this.z = 0;
	return $this;
};

var Quat$setZero$LQuat$ = Quat.setZero$LQuat$;

/**
 * @param {Quat} $this
 * @return {Quat}
 */
Quat.setIdentity$LQuat$ = function ($this) {
	$this.w = 1;
	$this.x = 0;
	$this.y = 0;
	$this.z = 0;
	return $this;
};

var Quat$setIdentity$LQuat$ = Quat.setIdentity$LQuat$;

/**
 * @return {Quat}
 */
Quat.zero$ = function () {
	/** @type {Quat} */
	var $this$0;
	$this$0 = new Quat$();
	$this$0.w = 0;
	$this$0.x = 0;
	$this$0.y = 0;
	$this$0.z = 0;
	return $this$0;
};

var Quat$zero$ = Quat.zero$;

/**
 * @return {Quat}
 */
Quat.identity$ = function () {
	/** @type {Quat} */
	var $this$0;
	$this$0 = new Quat$();
	$this$0.w = 1;
	$this$0.x = 0;
	$this$0.y = 0;
	$this$0.z = 0;
	return $this$0;
};

var Quat$identity$ = Quat.identity$;

/**
 * @param {Quat} $this
 * @param {!number} w
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 * @return {Quat}
 */
Quat.set$LQuat$NNNN = function ($this, w, x, y, z) {
	$this.w = w;
	$this.x = x;
	$this.y = y;
	$this.z = z;
	return $this;
};

var Quat$set$LQuat$NNNN = Quat.set$LQuat$NNNN;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @return {Quat}
 */
Quat.set$LQuat$LQuat$ = function ($this, q) {
	$this.w = q.w;
	$this.x = q.x;
	$this.y = q.y;
	$this.z = q.z;
	return $this;
};

var Quat$set$LQuat$LQuat$ = Quat.set$LQuat$LQuat$;

/**
 * @param {Quat} $this
 * @param {Array.<undefined|!number>} q
 * @return {Quat}
 */
Quat.set$LQuat$AN = function ($this, q) {
	$this.w = q[0];
	$this.x = q[1];
	$this.y = q[2];
	$this.z = q[3];
	return $this;
};

var Quat$set$LQuat$AN = Quat.set$LQuat$AN;

/**
 * @param {Quat} $this
 * @param {Float32Array} q
 * @return {Quat}
 */
Quat.set$LQuat$LFloat32Array$ = function ($this, q) {
	$this.w = q[0];
	$this.x = q[1];
	$this.y = q[2];
	$this.z = q[3];
	return $this;
};

var Quat$set$LQuat$LFloat32Array$ = Quat.set$LQuat$LFloat32Array$;

/**
 * @param {Quat} $this
 * @param {!number} w
 * @param {V3} v
 * @return {Quat}
 */
Quat.set$LQuat$NLV3$ = function ($this, w, v) {
	$this.w = w;
	$this.x = v.x;
	$this.y = v.y;
	$this.z = v.z;
	return $this;
};

var Quat$set$LQuat$NLV3$ = Quat.set$LQuat$NLV3$;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @return {!boolean}
 */
Quat.equals$LQuat$LQuat$ = function ($this, q) {
	return Quat$equals$LQuat$LQuat$N($this, q, 0.000001);
};

var Quat$equals$LQuat$LQuat$ = Quat.equals$LQuat$LQuat$;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @param {!number} eps
 * @return {!boolean}
 */
Quat.equals$LQuat$LQuat$N = function ($this, q, eps) {
	var $math_abs_t;
	return ((($math_abs_t = $this.w - q.w) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.x - q.x) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.y - q.y) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : (($math_abs_t = $this.z - q.z) >= 0 ? $math_abs_t : -$math_abs_t) >= eps ? false : true);
};

var Quat$equals$LQuat$LQuat$N = Quat.equals$LQuat$LQuat$N;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @return {!number}
 */
Quat.dot$LQuat$LQuat$ = function ($this, q) {
	return $this.w * q.w + $this.x * q.x + $this.y * q.y + $this.z * q.z;
};

var Quat$dot$LQuat$LQuat$ = Quat.dot$LQuat$LQuat$;

/**
 * @param {Quat} $this
 * @return {Quat}
 */
Quat.inverse$LQuat$ = function ($this) {
	/** @type {!number} */
	var q0;
	/** @type {!number} */
	var q1;
	/** @type {!number} */
	var q2;
	/** @type {!number} */
	var q3;
	/** @type {!number} */
	var dot;
	/** @type {!number} */
	var invDot;
	(q0 = $this.w, q1 = $this.x, q2 = $this.y, q3 = $this.z);
	dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3;
	if (dot === 0) {
		return null;
	}
	invDot = 1 / dot;
	$this.w *= invDot;
	$this.x *= - invDot;
	$this.y *= - invDot;
	$this.z *= - invDot;
	return $this;
};

var Quat$inverse$LQuat$ = Quat.inverse$LQuat$;

/**
 * @param {Quat} $this
 * @return {Quat}
 */
Quat.conjugate$LQuat$ = function ($this) {
	$this.x *= -1;
	$this.y *= -1;
	$this.z *= -1;
	return $this;
};

var Quat$conjugate$LQuat$ = Quat.conjugate$LQuat$;

/**
 * @param {Quat} $this
 * @return {!number}
 */
Quat.len$LQuat$ = function ($this) {
	return Math.sqrt(Quat$len2$LQuat$($this));
};

var Quat$len$LQuat$ = Quat.len$LQuat$;

/**
 * @param {Quat} $this
 * @return {!number}
 */
Quat.len2$LQuat$ = function ($this) {
	/** @type {!number} */
	var w;
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	(w = $this.w, x = $this.x, y = $this.y, z = $this.z);
	return w * w + x * x + y * y + z * z;
};

var Quat$len2$LQuat$ = Quat.len2$LQuat$;

/**
 * @param {Quat} $this
 * @return {Quat}
 */
Quat.normalize$LQuat$ = function ($this) {
	/** @type {!number} */
	var w;
	/** @type {!number} */
	var x;
	/** @type {!number} */
	var y;
	/** @type {!number} */
	var z;
	/** @type {!number} */
	var l;
	/** @type {!number} */
	var il;
	(w = $this.w, x = $this.x, y = $this.y, z = $this.z);
	l = Math.sqrt(x * x + y * y + z * z + w * w);
	if (l === 0) {
		return null;
	}
	il = 1 / l;
	$this.w *= il;
	$this.x *= il;
	$this.y *= il;
	$this.z *= il;
	return $this;
};

var Quat$normalize$LQuat$ = Quat.normalize$LQuat$;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @return {Quat}
 */
Quat.add$LQuat$LQuat$ = function ($this, q) {
	$this.w += q.w;
	$this.x += q.x;
	$this.y += q.y;
	$this.z += q.z;
	return $this;
};

var Quat$add$LQuat$LQuat$ = Quat.add$LQuat$LQuat$;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @return {Quat}
 */
Quat.sub$LQuat$LQuat$ = function ($this, q) {
	$this.w -= q.w;
	$this.x -= q.x;
	$this.y -= q.y;
	$this.z -= q.z;
	return $this;
};

var Quat$sub$LQuat$LQuat$ = Quat.sub$LQuat$LQuat$;

/**
 * @param {Quat} $this
 * @param {Quat} q
 * @return {Quat}
 */
Quat.mul$LQuat$LQuat$ = function ($this, q) {
	/** @type {!number} */
	var aw;
	/** @type {!number} */
	var ax;
	/** @type {!number} */
	var ay;
	/** @type {!number} */
	var az;
	/** @type {!number} */
	var bw;
	/** @type {!number} */
	var bx;
	/** @type {!number} */
	var by;
	/** @type {!number} */
	var bz;
	(aw = $this.w, ax = $this.x, ay = $this.y, az = $this.z);
	(bw = q.w, bx = q.x, by = q.y, bz = q.z);
	$this.w = aw * bw - ax * bx - ay * by - az * bz;
	$this.x = aw * bx + ax * bw + ay * bz - az * by;
	$this.y = aw * by - ax * bz + ay * bw + az * bx;
	$this.z = aw * bz + ax * by - ay * bx + az * bw;
	return $this;
};

var Quat$mul$LQuat$LQuat$ = Quat.mul$LQuat$LQuat$;

/**
 * @param {Quat} $this
 * @param {!number} s
 * @return {Quat}
 */
Quat.mul$LQuat$N = function ($this, s) {
	$this.w *= s;
	$this.x *= s;
	$this.y *= s;
	$this.z *= s;
	return $this;
};

var Quat$mul$LQuat$N = Quat.mul$LQuat$N;

/**
 * @param {Quat} $this
 * @param {Quat} q0
 * @param {Quat} q1
 * @param {!number} slerp
 * @return {Quat}
 */
Quat.slerp$LQuat$LQuat$LQuat$N = function ($this, q0, q1, slerp) {
	/** @type {!number} */
	var aw;
	/** @type {!number} */
	var ax;
	/** @type {!number} */
	var ay;
	/** @type {!number} */
	var az;
	/** @type {!number} */
	var bw;
	/** @type {!number} */
	var bx;
	/** @type {!number} */
	var by;
	/** @type {!number} */
	var bz;
	/** @type {!number} */
	var cosHalfTheta;
	/** @type {!number} */
	var halfTheta;
	/** @type {!number} */
	var sinHalfTheta;
	/** @type {!number} */
	var ratioA;
	/** @type {!number} */
	var ratioB;
	(aw = q0.w, ax = q0.x, ay = q0.y, az = q0.z);
	(bw = q1.w, bx = q1.x, by = q1.y, bz = q1.z);
	cosHalfTheta = aw * bw + ax * bx + ay * by + az * bz;
	if ((cosHalfTheta >= 0 ? cosHalfTheta : - cosHalfTheta) >= 1.0) {
		return $this;
	}
	halfTheta = Math.acos(cosHalfTheta);
	sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
	if ((sinHalfTheta >= 0 ? sinHalfTheta : - sinHalfTheta) < 0.001) {
		$this.w = (aw + bw) / 2;
		$this.x = (ax + bx) / 2;
		$this.y = (ay + by) / 2;
		$this.z = (az + bz) / 2;
		return $this;
	}
	ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
	ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;
	$this.w = aw * ratioA + bw * ratioB;
	$this.x = ax * ratioA + bx * ratioB;
	$this.y = ay * ratioA + by * ratioB;
	$this.z = az * ratioA + bz * ratioB;
	return $this;
};

var Quat$slerp$LQuat$LQuat$LQuat$N = Quat.slerp$LQuat$LQuat$LQuat$N;

/**
 * @return {!string}
 */
Quat.prototype.toString = function () {
	return "Quat" + JSON.stringify(Quat$array$LQuat$(this));
};

/**
 * class _Main$0 extends Object
 * @constructor
 */
function _Main$0() {
}

/**
 * @constructor
 */
function _Main$0$() {
};

_Main$0$.prototype = new _Main$0;

/**
 * @param {Array.<undefined|!string>} args
 */
_Main$0.main$AS = function (args) {
};

var _Main$0$main$AS = _Main$0.main$AS;

/**
 * class js extends Object
 * @constructor
 */
function js() {
}

/**
 * @constructor
 */
function js$() {
};

js$.prototype = new js;

/**
 * class ObjFile$CVTN extends Object
 * @constructor
 */
function ObjFile$CVTN() {
}

/**
 * @constructor
 */
function ObjFile$CVTN$() {
	this.vindex = 0;
	this.tindex = 0;
	this.nindex = 0;
};

ObjFile$CVTN$.prototype = new ObjFile$CVTN;

_Main.gl = null;
_Main.prog = null;
$__jsx_lazy_init(_Main, "objs", function () {
	return [];
});
$__jsx_lazy_init(dom, "window", function () {
	return js.global.window;
});
$__jsx_lazy_init(dom, "document", function () {
	return js.global.document;
});
MVQ.EQUAL_EPSILON = 0.000001;
js.global = (function () { return this; })();
var $__jsx_classMap = {
	"objview.jsx": {
		_Main: _Main,
		_Main$: _Main$
	},
	"system:lib/js/js/web.jsx": {
		dom: dom,
		dom$: dom$,
		EventInit: EventInit,
		EventInit$: EventInit$,
		CustomEventInit: CustomEventInit,
		CustomEventInit$: CustomEventInit$,
		MutationObserverInit: MutationObserverInit,
		MutationObserverInit$: MutationObserverInit$,
		UIEventInit: UIEventInit,
		UIEventInit$: UIEventInit$,
		FocusEventInit: FocusEventInit,
		FocusEventInit$: FocusEventInit$,
		MouseEventInit: MouseEventInit,
		MouseEventInit$: MouseEventInit$,
		WheelEventInit: WheelEventInit,
		WheelEventInit$: WheelEventInit$,
		KeyboardEventInit: KeyboardEventInit,
		KeyboardEventInit$: KeyboardEventInit$,
		CompositionEventInit: CompositionEventInit,
		CompositionEventInit$: CompositionEventInit$,
		ProgressEventInit: ProgressEventInit,
		ProgressEventInit$: ProgressEventInit$,
		XMLHttpRequestOptions: XMLHttpRequestOptions,
		XMLHttpRequestOptions$: XMLHttpRequestOptions$,
		TrackEventInit: TrackEventInit,
		TrackEventInit$: TrackEventInit$,
		PopStateEventInit: PopStateEventInit,
		PopStateEventInit$: PopStateEventInit$,
		HashChangeEventInit: HashChangeEventInit,
		HashChangeEventInit$: HashChangeEventInit$,
		PageTransitionEventInit: PageTransitionEventInit,
		PageTransitionEventInit$: PageTransitionEventInit$,
		DragEventInit: DragEventInit,
		DragEventInit$: DragEventInit$,
		CloseEventInit: CloseEventInit,
		CloseEventInit$: CloseEventInit$,
		StorageEventInit: StorageEventInit,
		StorageEventInit$: StorageEventInit$,
		MessageEventInit: MessageEventInit,
		MessageEventInit$: MessageEventInit$,
		ErrorEventInit: ErrorEventInit,
		ErrorEventInit$: ErrorEventInit$,
		EventSourceInit: EventSourceInit,
		EventSourceInit$: EventSourceInit$,
		IDBObjectStoreParameters: IDBObjectStoreParameters,
		IDBObjectStoreParameters$: IDBObjectStoreParameters$,
		IDBIndexParameters: IDBIndexParameters,
		IDBIndexParameters$: IDBIndexParameters$,
		IDBVersionChangeEventInit: IDBVersionChangeEventInit,
		IDBVersionChangeEventInit$: IDBVersionChangeEventInit$,
		NotificationOptions: NotificationOptions,
		NotificationOptions$: NotificationOptions$,
		RTCSessionDescriptionInit: RTCSessionDescriptionInit,
		RTCSessionDescriptionInit$: RTCSessionDescriptionInit$,
		RTCIceCandidateInit: RTCIceCandidateInit,
		RTCIceCandidateInit$: RTCIceCandidateInit$,
		RTCIceServer: RTCIceServer,
		RTCIceServer$: RTCIceServer$,
		RTCConfiguration: RTCConfiguration,
		RTCConfiguration$: RTCConfiguration$,
		DataChannelInit: DataChannelInit,
		DataChannelInit$: DataChannelInit$,
		RTCPeerConnectionIceEventInit: RTCPeerConnectionIceEventInit,
		RTCPeerConnectionIceEventInit$: RTCPeerConnectionIceEventInit$,
		MediaStreamEventInit: MediaStreamEventInit,
		MediaStreamEventInit$: MediaStreamEventInit$,
		DataChannelEventInit: DataChannelEventInit,
		DataChannelEventInit$: DataChannelEventInit$,
		MediaStreamConstraints: MediaStreamConstraints,
		MediaStreamConstraints$: MediaStreamConstraints$,
		MediaTrackConstraints: MediaTrackConstraints,
		MediaTrackConstraints$: MediaTrackConstraints$,
		HitRegionOptions: HitRegionOptions,
		HitRegionOptions$: HitRegionOptions$,
		WebGLContextAttributes: WebGLContextAttributes,
		WebGLContextAttributes$: WebGLContextAttributes$,
		WebGLContextEventInit: WebGLContextEventInit,
		WebGLContextEventInit$: WebGLContextEventInit$,
		DeviceOrientationEventInit: DeviceOrientationEventInit,
		DeviceOrientationEventInit$: DeviceOrientationEventInit$,
		DeviceMotionEventInit: DeviceMotionEventInit,
		DeviceMotionEventInit$: DeviceMotionEventInit$
	},
	"ObjFile.jsx": {
		ObjFile: ObjFile,
		ObjFile$: ObjFile$,
		VTN: ObjFile$CVTN,
		VTN$: ObjFile$CVTN$
	},
	"GLObject.jsx": {
		GLObject: GLObject,
		GLObject$LObjFile$: GLObject$LObjFile$
	},
	"mvq.jsx": {
		MVQ: MVQ,
		MVQ$: MVQ$,
		V2: V2,
		V2$: V2$,
		V2$LV2$: V2$LV2$,
		V2$AN: V2$AN,
		V2$LFloat32Array$: V2$LFloat32Array$,
		V2$NN: V2$NN,
		V2$LV3$: V2$LV3$,
		V2$LV4$: V2$LV4$,
		V3: V3,
		V3$: V3$,
		V3$LV3$: V3$LV3$,
		V3$AN: V3$AN,
		V3$LFloat32Array$: V3$LFloat32Array$,
		V3$NNN: V3$NNN,
		V3$LV2$N: V3$LV2$N,
		V3$LV4$: V3$LV4$,
		V4: V4,
		V4$: V4$,
		V4$LV4$: V4$LV4$,
		V4$AN: V4$AN,
		V4$LFloat32Array$: V4$LFloat32Array$,
		V4$NNNN: V4$NNNN,
		V4$LV2$NN: V4$LV2$NN,
		V4$LV3$N: V4$LV3$N,
		M22: M22,
		M22$: M22$,
		M22$LM22$: M22$LM22$,
		M22$AN: M22$AN,
		M22$LFloat32Array$: M22$LFloat32Array$,
		M22$NNNN: M22$NNNN,
		M22$LV2$LV2$: M22$LV2$LV2$,
		M22$N: M22$N,
		M22$LM33$: M22$LM33$,
		M22$LM44$: M22$LM44$,
		M33: M33,
		M33$: M33$,
		M33$LM33$: M33$LM33$,
		M33$AN: M33$AN,
		M33$LFloat32Array$: M33$LFloat32Array$,
		M33$NNNNNNNNN: M33$NNNNNNNNN,
		M33$LV3$LV3$LV3$: M33$LV3$LV3$LV3$,
		M33$N: M33$N,
		M33$LM22$N: M33$LM22$N,
		M33$LM44$: M33$LM44$,
		M44: M44,
		M44$: M44$,
		M44$LM44$: M44$LM44$,
		M44$AN: M44$AN,
		M44$LFloat32Array$: M44$LFloat32Array$,
		M44$NNNNNNNNNNNNNNNN: M44$NNNNNNNNNNNNNNNN,
		M44$LV4$LV4$LV4$LV4$: M44$LV4$LV4$LV4$LV4$,
		M44$N: M44$N,
		M44$LM22$NN: M44$LM22$NN,
		M44$LM33$N: M44$LM33$N,
		Quat: Quat,
		Quat$: Quat$,
		Quat$LQuat$: Quat$LQuat$,
		Quat$AN: Quat$AN,
		Quat$LFloat32Array$: Quat$LFloat32Array$,
		Quat$NNNN: Quat$NNNN,
		_Main: _Main$0,
		_Main$: _Main$0$
	},
	"system:lib/js/js.jsx": {
		js: js,
		js$: js$
	}
};


/**
 * launches _Main.main(:string[]):void invoked by jsx --run|--executable
 */
JSX.runMain = function (sourceFile, args) {
	var module = JSX.require(sourceFile);
	if (! module) {
		throw new ReferenceError("entry point module not found in " + sourceFile);
	}
	if (! module._Main) {
		throw new ReferenceError("entry point _Main not found in " + sourceFile);
	}
	if (! module._Main.main$AS) {
		throw new ReferenceError("entry point _Main.main(:string[]):void not found in " + sourceFile);
	}
	module._Main.main$AS(args);
};

/**
 * launches _Test#test*():void invoked by jsx --test
 */
JSX.runTests = function (sourceFile, tests) {
	var module = JSX.require(sourceFile);
	var testClass = module._Test$;

	if (!testClass) return; // skip if there's no test class

	if(tests.length === 0) {
		var p = testClass.prototype;
		for (var m in p) {
			if (p[m] instanceof Function
				&& /^test.*[$]$/.test(m)) {
				tests.push(m);
			}
		}
	}
	else { // set as process arguments
		tests = tests.map(function (name) {
			return name + "$"; // mangle for function test*():void
		});
	}

	var testCase = new testClass();

	if (testCase.beforeClass$AS != null)
		testCase.beforeClass$AS(tests);

	for (var i = 0; i < tests.length; ++i) {
		(function (method) {
			if (method in testCase) {
				testCase.run$SF$V$(method, function() { testCase[method](); });
			}
			else {
				throw new ReferenceError("No such test method: " + method);
			}
		}(tests[i]));
	}

	if (testCase.afterClass$ != null)
		testCase.afterClass$();
};
/**
 * call a function on load/DOMContentLoaded
 */
function $__jsx_onload (event) {
	window.removeEventListener("load", $__jsx_onload);
	document.removeEventListener("DOMContentLoaded", $__jsx_onload);
	JSX.runMain("objview.jsx", [])
}

window.addEventListener("load", $__jsx_onload);
document.addEventListener("DOMContentLoaded", $__jsx_onload);

})(JSX);

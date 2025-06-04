window.Profiler = {
	stackFrame: [],
	counters: {},
	listup: function(name, obj, parentName, parentObj, level) {
		if(level > 10) {
			return;
		}
		
		var fullName = parentName? parentName + "." + name: name;
		var hasFunc = false;
		
		if(typeof(obj) == "object") {
			var keys = Object.getOwnPropertyNames(obj);
			for(var i = 0; i < keys.length; i++) {
				var name = keys[i];
				if(name == "prototype") {
					continue;
				}
				if(name == "constructor") {
					continue;
				}
				var value = obj[name];
				if(typeof(value) == "function") {
					// listup functions recursively
					this.listup(name, obj[name], fullName, obj, level + 1);
					hasFunc = true;
				}
			}
		}
		
		if(typeof(obj.prototype) == "object") {
			var keys = Object.getOwnPropertyNames(obj.prototype);
			for(var i = 0; i < keys.length; i++) {
				var name = keys[i];
				if(name == "constructor") {
					continue;
				}
				var value = obj.prototype[name];
				if(typeof(value) == "function") {
					// listup prototype functions recursively
					this.listup(name, obj.prototype[name], fullName + ".prototype", obj.prototype, level + 1);
				}
			}
		}
		if(!hasFunc) {
			// this is function, not class
			this.profileFunction(name, parentName, parentObj);
		}
	},
	profileFunction: function(name, parentName, parentObj) {
		if(!parentObj) {
			return;
		}
		
		var fullName = parentName + "." + name;
		console.log(fullName);
		this.counters[fullName] = {};
		(function(that, name, fullName, parentObj, counter) {
			// save original function
			var originalFunction = parentObj[name];
			// replace function
			parentObj[name] = function() {
				var before = Date.now();
				var totalBefore = counter.total || 0;
				
				if(that.stackFrame.length) {
					// add self time of the function called just before
					var c = that.counters[that.stackFrame[that.stackFrame.length - 1]];
					c.self = (c.self || 0) + before - that.prev;
				}
				that.prev = before;
				that.stackFrame.push(fullName);
				
				// call original
				var result = originalFunction.apply(this, arguments);
				var after = Date.now();
				
				that.stackFrame.pop();
				// store profiled value
				counter.self = (counter.self || 0) + (after - that.prev);
				counter.total = totalBefore + (after - before);
				counter.count = (counter.count || 0) + 1;
				that.prev = after;
				return result;
			};
		})(this, name, fullName, parentObj, this.counters[fullName]);
	},
	start: function(nameList) {
		for(var i = 0; i < nameList.length; i++) {
			// send (actual name, object) pair to listup
			this.listup(nameList[i], eval(nameList[i]), null, null, 0);
		}
	},
	report: function() {
		var sortedCounters = [];
		for (var func in this.counters) {
			this.counters[func].name = func;
			this.counters[func].self = this.counters[func].self || 0; // remove undefined
			sortedCounters.push(this.counters[func]);
		}
		sortedCounters.sort(function(a,b){return b.self - a.self;});
		
		var result = "function, count, total(ms), self(ms)\n";
		for(var i = 0; i < sortedCounters.length; i++) {
			var counter = sortedCounters[i];
			if (counter.count) {
				result += counter.name + "," + counter.count + "," + counter.total + "," + counter.self + "\n";
			}
		}
		return result;
	}
};

var objNameList = ["CanvasRenderingContext2D", "Array"];
Profiler.start(objNameList);
setTimeout(function() {console.log(Profiler.report());}, 5000);

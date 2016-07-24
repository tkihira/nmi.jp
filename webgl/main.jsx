import 'js/web.jsx';
import 'timer.jsx';
import 'console.jsx';

import 'mvq.jsx';
import 'world.jsx';

import 'cloud.jsx';


class _Main {
	static function main(args:string[]) : void {
		var canvas = dom.id('webgl-canvas') as HTMLCanvasElement;
		var touchCanvas = dom.id('touchCanvas') as HTMLCanvasElement;
		var touch = dom.id('touch') as HTMLDivElement;
		var cloud = dom.id('cloud') as HTMLCanvasElement;
		//var ww = dom.window.innerWidth;
		//var wh = dom.window.innerHeight;
		//canvas.width = ww;
		//canvas.height = wh;
		var touchCtx = touchCanvas.getContext("2d") as CanvasRenderingContext2D;
		
		Cloud.make(cloud);

		var gl = canvas.getContext('experimental-webgl', {premultipliedAlpha:false}) as WebGLRenderingContext;
		gl.clearColor(0.32, 0.8, 0.99, 1.0);

		var getPoint = function(e:Event) : number[] {
			var px = 0;
			var py = 0;
			if(e instanceof MouseEvent) {
				var me = e as MouseEvent;
				px = me.clientX;
				py = me.clientY;
			}
			else if(e instanceof TouchEvent) {
				var te = e as TouchEvent;
				px = te.touches[0].pageX;
				py = te.touches[0].pageY;
			}
			return [ px, py ];
		};

		var mouseX = -1;
		var mouseY = -1;
		var touchStart = function(e:Event) : void {
			e.preventDefault();
			var pos = getPoint(e);
			// クリックorタッチ開始時の処理
			mouseX = pos[0];
			mouseY = pos[1];
			//console.log('start: ' + pos.toString());
		};
		var touchEnd = function(e:Event) : void {
			e.preventDefault();
			var pos = getPoint(e);
			// クリックorタッチが終わった時の処理
			//console.log('end: ' + pos.toString());
		};
		/*
		var touchMove = function(e:Event) : void {
			e.preventDefault();
			var pos = getPoint(e);
			// マウスorタッチが移動した時の処理
			console.log('move: ' + pos.toString());
		};
		canvas.onmouseout = function(e:Event) : void {
			// マウスカーソルが範囲外に出た時の処理
		};*/

		canvas.oncontextmenu = function(e:Event) : void {e.preventDefault();};
		//canvas.style.cursor = 'none'; // マウスカーソルを消す
		touch.addEventListener("mousedown",  touchStart);
		touch.addEventListener("touchstart", touchStart);
		touch.addEventListener("mouseup", touchEnd);
		touch.addEventListener("touchend", touchEnd);
		//canvas.addEventListener("mousemove", touchMove);
		//canvas.addEventListener("touchmove", touchMove);
		//*/

		var UPDATE_FPS = 50;
		
		// initialize
		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, (dom.id('vs') as HTMLScriptElement).text);
		gl.compileShader(vs);
		if(!(gl.getShaderParameter(vs, gl.COMPILE_STATUS) as boolean)) {
			dom.window.alert(gl.getShaderInfoLog(vs));
		}
		
		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs,(dom.id('fs') as HTMLScriptElement).text);
		gl.compileShader(fs);
		if(!(gl.getShaderParameter(fs, gl.COMPILE_STATUS) as boolean)) {
			dom.window.alert(gl.getShaderInfoLog(fs));
		}
		
		var prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.bindAttribLocation(prog, 0, "vertex");
		gl.linkProgram(prog);
		if(!(gl.getProgramParameter(prog, gl.LINK_STATUS) as boolean)) {
			dom.window.alert(gl.getProgramInfoLog(prog));
		}


		var world = new World(38);
		world.addForward(10);
		world.addRotate(false);
		world.addForward(5);
		world.addRotate(false);
		world.addForward(10);
		world.addRotate(true);
		world.addForward(10);
		world.addRotate(false);
		world.addForward(5);//*/
		world.addRotate(true);
		world.addRotate(true);
		world.addForward(7);
		world.addRotate(false);
		world.addForward(20);
		world.addDown();
		world.addForward(20);
		world.addRotate(true);
		world.addForward(5);//*/
		world.addRotate(true);
		world.addForward(5);//*/
		world.addRotate(true);
		world.addForward(11);//*/
		world.addRotate(false);
		world.addForward(14);//*/
		world.addDown();
		world.addForward(6);
		world.addRotate(true);
		world.addForward(5);
		world.addRotate(true);
		world.addForward(6);
		world.addDown();
		world.addForward(5);
		world.addRotate(false);
		world.addForward(10);
		world.addRotate(false);
		world.addForward(4);
		world.addDown();
		world.addForward(20);//*/
		
		var roadArray = world.makeRoad();
		var roadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, roadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roadArray), gl.STATIC_DRAW);

		var fieldArray = world.getField();
		var fieldBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, fieldBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fieldArray), gl.STATIC_DRAW);

		var coinArray = world.getCoins();
		var coinBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, coinBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coinArray), gl.STATIC_DRAW);
		
		var cloudArray = world.getCloud();
		var cloudBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloudArray), gl.STATIC_DRAW);

		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
		
		var transMatLocation = gl.getUniformLocation(prog, "transformMatrix");
		var lightColorLocation = gl.getUniformLocation(prog, "lightColor");
		var darkColorLocation = gl.getUniformLocation(prog, "darkColor");

		gl.useProgram(prog);

		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cloud);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		var textureLocation = gl.getUniformLocation(prog, "texture");
		gl.uniform1i(textureLocation, 0);


		function update() : void {
			//Timer.setTimeout(update, 1000 / UPDATE_FPS);
			// ここ以下で状態をアップデート
		}

		var frame_num = 1000 * -20;
		var grad = 0;
		var lastFrame = 0;
		var velocity = 0;
		var maxVelocity = 20;
		var score = 0;
		
		var state = "opening";
		
		function render() : void {
			//Timer.requestAnimationFrame(render);
			// ここ以下で描画
			var status = null: World.Status;
			if(frame_num >= 0) {
				if(state == "opening") {
					dom.getElementById("opening").style.display = "none";
					dom.getElementById("start").style.display = "block";
					state = "starting";
					Timer.setTimeout(() -> {
						dom.getElementById("start").style.display = "none";
						dom.getElementById("game").style.display = "block";
						state = "gaming";
					}, 2000);
				}
				var status = world.getStatus((frame_num / 1000) as int);
			}
			gl.enable(gl.DEPTH_TEST);
			
			if(status == null) {
				if(frame_num < 0) {
					var action = World.OPENING;
					var ratio =  frame_num / 1000;
					var matrix = world.getStatus(0).matrix;
				} else {
					var ratio =  (frame_num - lastFrame + 1000) / 1000;
					var action = World.CLEAR;
					var matrix = world.getStatus((lastFrame / 1000) as int).matrix;
					dom.getElementById("clear").style.display = "block";
				}
			} else {
				dom.getElementById("distance").innerHTML = (196 - (frame_num / 1000) as int) as string;
				var ratio = (frame_num % 1000) / 1000;
				var action = status.d;
				var matrix = status.matrix;
				lastFrame = frame_num;
			}
			if(action == World.STRAIGHT) {
				matrix = ((new M44).setTranslation(0, 0, world.width * ratio)).mul(matrix);
				grad *= 0.98;
			} else if(action == World.DOWN) {
				matrix = ((new M44).setTranslation(0, 2.5 * ratio, 2.5 * ratio)).mul(matrix);
				matrix = ((new M44).setRotation(Math.PI / 2 * ratio, 1, 0, 0)).mul(matrix);
				grad *= 0.98;
			} else if(action == World.RIGHT) {
				grad = Math.max(grad * 1, Math.sqrt(ratio / 3));
				if(grad > 1) {
					grad = 1;
				}
				matrix = ((new M44).setTranslation((new V3(0, 0, 1)).mul(world.width / 2 * ratio))).mul(matrix);
				matrix = ((new M44).setTranslation((new V3(-1, 0, 0)).mul(world.width / 2 * ratio))).mul(matrix);
				matrix = ((new M44).setRotation(Math.PI / 2 * ratio, new V3(0, 1, 0))).mul(matrix);
			} else if(action == World.LEFT) {
				grad = Math.min(grad * 1, -Math.sqrt(ratio / 3));
				if(grad < -1) {
					grad = -1;
				}
				matrix = ((new M44).setTranslation((new V3(0, 0, 1)).mul(world.width / 2 * ratio))).mul(matrix);
				matrix = ((new M44).setTranslation((new V3(1, 0, 0)).mul(world.width / 2 * ratio))).mul(matrix);
				matrix = ((new M44).setRotation(-Math.PI / 2 * ratio, new V3(0, 1, 0))).mul(matrix);
			} else if(action == World.CLEAR) {
				matrix = ((new M44).setTranslation(0, 0, world.width * ratio)).mul(matrix);
				grad += 0.01;
			} else if(action == World.OPENING) {
				matrix = ((new M44).setTranslation(0, 0, world.width * ratio)).mul(matrix);
				grad = frame_num / 1000 / 5;
			}
			
			if(state == "gaming" && mouseX != -1) {
				gl.clearColor(0, 0, 1.0, 1.0);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				var trans_mat = new M44;
				trans_mat.setIdentity();
				trans_mat.mul((new M44).setFrustum(-2, 2, -1.5, 1.5, 5, 1000));
				trans_mat.mul((new M44).setRotation(grad * -0.8, 0, 0, 1));
				trans_mat.mul(matrix);
				trans_mat.mul((new M44).setTranslation(-10, -2.5, 0));
				gl.uniformMatrix4fv(transMatLocation, false, trans_mat.array());
				
				gl.uniform4fv(lightColorLocation, [0, 0, 0, 1.0]);
				gl.uniform4fv(darkColorLocation, [0, 0, 0, 1.0]);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, roadBuffer);
				gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(0);
				gl.drawArrays(gl.TRIANGLES, 0, roadArray.length / 3);

				gl.uniform4fv(lightColorLocation, [0, 0, 0, 1.0]);
				gl.uniform4fv(darkColorLocation, [0, 0, 0, 1.0]);
				gl.bindBuffer(gl.ARRAY_BUFFER, fieldBuffer);
				gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(0);
				gl.drawArrays(gl.TRIANGLES, 0, fieldArray.length / 3);

				gl.uniform4fv(lightColorLocation, [1, 0, 0, 1.0]);
				gl.uniform4fv(darkColorLocation, [1, 0, 0, 1.0]);
				gl.bindBuffer(gl.ARRAY_BUFFER, coinBuffer);
				gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(0);
				gl.drawArrays(gl.TRIANGLES, 0, coinArray.length / 4);
				
				touchCtx.drawImage(canvas, 0, 0);
				var data = touchCtx.getImageData(mouseX, mouseY, 1, 1).data[0];
				if(data != 0) {
					world.removeCoin(data);
					coinArray = world.getCoins();
					gl.bindBuffer(gl.ARRAY_BUFFER, coinBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coinArray), gl.STATIC_DRAW);
					maxVelocity *= 1.1;
					score++;
					dom.getElementById("score").innerHTML = score as string;
					//console.log(maxVelocity);
				}
				mouseX = -1;
				//frame_num += 50;
				//Timer.setTimeout(render, 10);
				//return;
			}
			
			gl.clearColor(0.32, 0.8, 0.99, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			var trans_mat = new M44;
			trans_mat.setIdentity();
			trans_mat.mul((new M44).setFrustum(-2, 2, -1.5, 1.5, 5, 20000));
			//trans_mat.mul((new M44).setTranslation(0, 0, -10.0 + 0 * Math.sin(frame_num / 10.0)));
			trans_mat.mul((new M44).setRotation(grad * -0.8, 0, 0, 1));
			//trans_mat.mul((new M44).setRotation(frame_num / 100, 0, 0, 1));
		//trans_mat.mul((new M44).setRotation(frame_num / 100, 0, 1, 0));
			//trans_mat.mul((new M44).setTranslation(20, 0, 30));
			//trans_mat.mul((new M44).setTranslation(7.5, 0, frame_num));
			trans_mat.mul(matrix);
			trans_mat.mul((new M44).setTranslation(-10, -2.5, 0));
			gl.uniformMatrix4fv(transMatLocation, false, trans_mat.array());
			
			/*gl.uniform4fv(lightColorLocation, [0.6, 0.54, 0.54, 1.0]);
			gl.uniform4fv(darkColorLocation, [0.00, 0.67, 0.01, 1.0]);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, earthRightBuf);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, earthLeftBuf);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);*/
			
			gl.uniform4fv(lightColorLocation, [0.99, 0.46, 0.01, 1.0]);
			gl.uniform4fv(darkColorLocation, [0.80, 0.67, 0.67, 1.0]);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, roadBuffer);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
			gl.drawArrays(gl.TRIANGLES, 0, roadArray.length / 3);

			gl.uniform4fv(lightColorLocation, [0.60, 0.53, 0.53, 1.0]);
			gl.uniform4fv(darkColorLocation, [0.00, 0.67, 0.01, 1.0]);
			gl.bindBuffer(gl.ARRAY_BUFFER, fieldBuffer);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
			gl.drawArrays(gl.TRIANGLES, 0, fieldArray.length / 3);

			gl.uniform4fv(lightColorLocation, [1, 1, 0, 1.0]);
			gl.uniform4fv(darkColorLocation, [1, 1, 0, 1.0]);
			gl.bindBuffer(gl.ARRAY_BUFFER, coinBuffer);
			gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
			gl.drawArrays(gl.TRIANGLES, 0, coinArray.length / 4);
			
			gl.uniform4fv(lightColorLocation, [0, 1, 0, 1.0]);
			gl.uniform4fv(darkColorLocation, [0, 1, 0, 1.0]);
			gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
			gl.drawArrays(gl.TRIANGLES, 0, cloudArray.length / 3);
			
			if(frame_num < 0) {
				frame_num += 50;
			} else {
				if(state == "gaming") {
					var a = 1 - (0.6 / maxVelocity) * velocity;
					a -= 0.4;
					velocity += a;
					frame_num += velocity;
				}
			}
			
			Timer.setTimeout(render, 10);
		}

		var raf = (dom.window.location.hash == "#raf");
		log "use native RAF: " + raf as string;
		Timer.useNativeRAF(raf);

		update();
		render();
	}

}

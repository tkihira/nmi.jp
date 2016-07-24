import "js/web.jsx";
import "console.jsx";

class ClassicNoise {
	var perm: number[];
	var grad3: Array.<Array.<number>>;
	
	function constructor() {
		var random = Math.random;
		
		this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
						 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
						 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
		
		var _p = []: number[];
		for(var i = 0; i < 256; i++) {
			_p[i] = (random() * 256) | 0;
		}
		var perm = []: number[];
		for(var i = 0; i < 512; i++) {
			perm[i] = _p[i & 255];
		}
		this.perm = perm;
	}
	function dot(g: number[], x: number, y: number, z: number): number {
		return g[0] * x + g[1] * y + g[2] * z;
	}
	function mix(a: number, b: number, t: number): number {
		return (1 - t) * a + t * b;
	}
	function fade(t: number): number {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}
	function noise(x: number, y: number, z: number): number {
		var X = x as int;
		var Y = y as int;
		var Z = z as int;
		
		x = x - X;
		y = y - Y;
		z = z - Z;
		
		X = X & 255;
		Y = Y & 255;
		Z = Z & 255;
		
		var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; 
		var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; 
		var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; 
		var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; 
		var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; 
		var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; 
		var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; 
		var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; 

		var n000= this.dot(this.grad3[gi000], x, y, z); 
		var n100= this.dot(this.grad3[gi100], x-1, y, z); 
		var n010= this.dot(this.grad3[gi010], x, y-1, z); 
		var n110= this.dot(this.grad3[gi110], x-1, y-1, z); 
		var n001= this.dot(this.grad3[gi001], x, y, z-1); 
		var n101= this.dot(this.grad3[gi101], x-1, y, z-1); 
		var n011= this.dot(this.grad3[gi011], x, y-1, z-1); 
		var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1);

		var u = this.fade(x); 
		var v = this.fade(y); 
		var w = this.fade(z); 
		
		var nx00 = this.mix(n000, n100, u); 
		var nx01 = this.mix(n001, n101, u); 
		var nx10 = this.mix(n010, n110, u); 
		var nx11 = this.mix(n011, n111, u); 
		
		var nxy0 = this.mix(nx00, nx10, v); 
		var nxy1 = this.mix(nx01, nx11, v); 
		
		var nxyz = this.mix(nxy0, nxy1, w); 

		return nxyz; 
	}
}

class Cloud {
	
	static function make(canvas: HTMLCanvasElement): void {
		var width = canvas.width;
		var height = canvas.height;
		
		var limit = (v: number, min: number, max: number): number -> {
			return Math.min(max, Math.max(min, v));
		};
		var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		var data = ctx.getImageData(0, 0, width, height);
		
		var frequency = 10;
		var octaves = 5;
		var seed = 100;
		var noise = new ClassicNoise();
		
		var fx = width / frequency;
		var fy = height / frequency;
		
		var y = 0;
		for(var i = 0; i < data.data.length; i += 4) {
			var x = i / 4 % width;
			var y = (i / (width * 4)) as int;
			var n = noise.noise(x / fx, y / fy, octaves);
			var color = limit(218 * (1 + n * 0.5), 0, 255);
			
			data.data[i + 0] = color;
			data.data[i + 1] = 240;
			data.data[i + 2] = 255;
			data.data[i + 3] = 255;
		}
		ctx.putImageData(data, 0, 0);
	}
}

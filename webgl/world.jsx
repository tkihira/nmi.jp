import "mvq.jsx";
import "console.jsx";

class World {
	static var STRAIGHT: number = 0;
	static var RIGHT: number = 1;
	static var LEFT: number = 2;
	static var DOWN: number = 3;
	static var CLEAR: number = 4;
	static var OPENING: number = 5;
	
	var width = 20;
	var size: number;
	
	var road: Array.<number>;
	var field: Array.<Array.<boolean>>;
	var coins: Array.<V3>;
	
	static var seed = 0;
	static function random() : number {
		var x = 0;
		var n: int;
		n = World.seed;
		for (var i = 0; i < 4; ++i) {
			x = Math.pow(12.3, (n>>i*8&255)/256 + i + 2 + x) % 1;
		}
		World.seed = x * 65536;
		return x;
	}
	
	class Status {
		var matrix: M44;
		var r: V3;
		var f: V3;
		var d: number;
	}
	var statusArray: Array.<World.Status>;
	
	function constructor(size: number) {
		this.road = new Array.<number>;
		this.statusArray = new Array.<World.Status>;
		// TODO: create world(size x size)
		this.field = new Array.<Array.<boolean>>(size);
		this.coins = new Array.<V3>;
		size *= 2;
		for(var y = 0; y < size; y++) {
			this.field[y] = new Array.<boolean>(size);
			for(var x = 0; x < size; x++) {
				this.field[y][x] = false;
			}
		}
		this.size = size;
	}
	
	function addForward(n: number): void {
		for(var i = 0; i < n; i++) {
			this.road.push(World.STRAIGHT);
		}
	}
	
	function addRotate(right: boolean): void {
		this.road.push(right? World.RIGHT: World.LEFT);
	}
	
	function addDown(): void {
		this.road.push(World.DOWN);
	}
	
	function makeRoad(): Array.<number> {
		var count = 0;
		// 基点の位置
		var p = new V3(0, 0, 0);
		// 右側を示すベクトル
		var r = new V3(1, 0, 0);
		// 進行方向を示すベクトル
		var f = new V3(0, 0, -1);
		// 現在の変換行列
		var m = new M44;
		m.setIdentity();
		
		var ret = []: number[];
		
		var createTile = function(d: number): void {
			var status = new World.Status;
			status.matrix = m.clone();
			status.f = f.clone();
			status.r = r.clone();
			status.d = d;
			count++;
			this.statusArray.push(status);
			
			if(d == World.DOWN) {
				// マージンを消去＆新たなマージンを作成
				m = ((new M44).setTranslation((new V3(0, 2.5, 2.5)))).mul(m);
				// 軸を中心に90度傾ける
				m = ((new M44).setRotation(Math.PI / 2, new V3(1, 0, 0))).mul(m);
				// 進行方向のベクトルを変化（進行方向×右方向の外積方向）
				f.cross(f, r);
			} else {
				var p2 = p.clone().add(r.clone().mul(this.width));
				var p3 = p.clone().add(f.clone().mul(this.width));
				var p4 = p2.clone().add(f.clone().mul(this.width));
				
				var mid = p.clone().add(p2).add(p3).add(p4).mul(0.25);
				if(mid.y == 0) {
					this.field[this.size / 2 + (mid.z - this.width / 2) / this.width][this.size / 2 + (mid.x - this.width / 2) / this.width] = true;
				}
				
				ret = ret.concat(p.array());
				ret = ret.concat(p2.array());
				ret = ret.concat(p3.array());
				ret = ret.concat(p2.array());
				ret = ret.concat(p3.array());
				ret = ret.concat(p4.array());
				
				if(d == World.STRAIGHT) {
					// 進行方向に視点を移動
					m = ((new M44).setTranslation((new V3(0, 0, 1)).mul(this.width))).mul(m);
					// コインを設置
					var z = r.clone().cross(r, f).mul(this.width / 4);
					var c1 = p.clone().add(f.clone().mul(this.width / 4)).add(z);
					var c2 = p2.clone().add(f.clone().mul(this.width / 4)).add(z);
					if(count > 5 && World.random() < 0.1) {
						this.coins.push(c1);
					}
					if(count > 5 && World.random() < 0.1) {
						this.coins.push(c2);
					}
					
					// 基点はp3の位置（進行方向に移動）
					p = p3;
				} else if(d == World.RIGHT) {
					// 進行方向＋右に視点を移動
					m = ((new M44).setTranslation((new V3(0, 0, 1)).mul(this.width / 2))).mul(m);
					m = ((new M44).setTranslation((new V3(-1, 0, 0)).mul(this.width / 2))).mul(m);
					// 軸を中心に90度傾ける
					m = ((new M44).setRotation(Math.PI / 2, new V3(0, 1, 0))).mul(m);
					// 進行方向が右に、右方向が進行方向のマイナスに
					var nr = f.clone().mul(-1);
					f = r;
					r = nr;
					// 基点はp4の位置に変化
					p = p4;
				} else if (d == World.LEFT) {
					// 進行方向＋左に視点を移動
					m = ((new M44).setTranslation((new V3(0, 0, 1)).mul(this.width / 2))).mul(m);
					m = ((new M44).setTranslation((new V3(1, 0, 0)).mul(this.width / 2))).mul(m);
					// 軸を中心に90度傾ける
					m = ((new M44).setRotation(-Math.PI / 2, new V3(0, 1, 0))).mul(m);
					// 進行方向が右のマイナスに、右が進行方向に
					var nr = f.clone();
					f = r.mul(-1);
					r = nr;
					// 基点は変化なし
				}
			}
		};
		
		for(var i = 0; i < this.road.length; i++) {
			var next = this.road[i];
			createTile(next);
		}
		return ret;
	}
	
	function getField(): Array.<number> {
		var ret = []: number[];
		
		for(var y = 0; y < this.size; y++) {
			for(var x = 0; x < this.size; x++) {
				if(!this.field[y][x]) {
					var px = (-this.size / 2 + x) * this.width;
					var pz = (-this.size / 2 + y) * this.width;
					ret.push(px, 0, pz);
					ret.push(px, 0, pz + this.width);
					ret.push(px + this.width, 0, pz);
					ret.push(px, 0, pz + this.width);
					ret.push(px + this.width, 0, pz);
					ret.push(px + this.width, 0, pz + this.width);
				}
			}
		}
		return ret;
	}
	function removeCoin(index: number): void {
		this.coins[index - 1] = new V3(99999, 99999, 99999);
	}
	function getCoins(): Array.<number> {
		var ret = []: number[];
		var size = this.width / 15;
		for(var i = 0; i < this.coins.length; i++) {
			var coin = this.coins[i];
			var c = coin.array();
			
			ret.push(c[0] - size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] - size, c[2] + size, i + 1);

			ret.push(c[0] + size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] + size, i + 1);
			
			ret.push(c[0] - size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] - size, c[2] + size, i + 1);
			
			ret.push(c[0] - size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] + size, i + 1);

			ret.push(c[0] - size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] - size, c[1] - size, c[2] - size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] - size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] - size, i + 1);
			
			ret.push(c[0] - size, c[1] - size, c[2] + size, i + 1);
			ret.push(c[0] + size, c[1] - size, c[2] + size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] - size, c[2] + size, i + 1);
			ret.push(c[0] + size, c[1] + size, c[2] + size, i + 1);
			ret.push(c[0] - size, c[1] + size, c[2] + size, i + 1);
		}
		return ret;
	}
	
	function getCloud(): Array.<number> {
		var ret = []: number[];
		var size = 5000;
		
		ret.push(-size, -size, -size);
		ret.push(-size, +size, -size);
		ret.push(-size, +size, +size);
		ret.push(-size, -size, -size);
		ret.push(-size, +size, +size);
		ret.push(-size, -size, +size);

		ret.push(+size, -size, -size);
		ret.push(+size, +size, -size);
		ret.push(+size, +size, +size);
		ret.push(+size, -size, -size);
		ret.push(+size, +size, +size);
		ret.push(+size, -size, +size);
		
		ret.push(-size, -size, -size);
		ret.push(+size, -size, -size);
		ret.push(+size, -size, +size);
		ret.push(-size, -size, -size);
		ret.push(+size, -size, +size);
		ret.push(-size, -size, +size);
		
		ret.push(-size, +size, -size);
		ret.push(+size, +size, -size);
		ret.push(+size, +size, +size);
		ret.push(-size, +size, -size);
		ret.push(+size, +size, +size);
		ret.push(-size, +size, +size);

		ret.push(-size, -size, -size);
		ret.push(+size, -size, -size);
		ret.push(+size, +size, -size);
		ret.push(-size, -size, -size);
		ret.push(+size, +size, -size);
		ret.push(-size, +size, -size);
		
		ret.push(-size, -size, +size);
		ret.push(+size, -size, +size);
		ret.push(+size, +size, +size);
		ret.push(-size, -size, +size);
		ret.push(+size, +size, +size);
		ret.push(-size, +size, +size);
		
		return ret;
	}
	
	function getStatus(index: number): World.Status {
		return this.statusArray[index];
	}
}

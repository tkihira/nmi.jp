---
layout: post
title: JavaScript で CPU が Intel かどうかを判定する（ついでに JIT を検知する）
categories:
- JavaScript
---

先日、次のような Tweet を見かけました

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">TIL I discovered that TensorFlow.js uses an interesting trick to sniff your CPU architecture in WebAssembly. <a href="https://t.co/LVyywIM48I">pic.twitter.com/LVyywIM48I</a></p>&mdash; Robert Knight (@robknight_) <a href="https://twitter.com/robknight_/status/1610638557118349317?ref_src=twsrc%5Etfw">January 4, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

面白かったのでなぜこうなるのかの解説と、ついでにこのテクニックを使った JIT 検知方法などについて紹介します。




# JavaScript における低レイヤーの扱い

JavaScript においては、挙動が比較的しっかりと仕様に定められているために、環境による振る舞いの違いはあまり発生しません。しかし、<span style="color:blue">低レイヤーに降りるほど振る舞いは実装依存になり、環境差が発生する余地が出てきます</span>。

一番わかりやすいのは、リトルエンディアン・ビッグエンディアンです。例えば以下のようなコードを実行した場合、リトルエンディアンを採用しているアーキテクチャとビッグエンディアンを採用しているアーキテクチャでは結果が異なります。

```javascript
const w = new Uint32Array(1);
const b = new Uint8Array(w.buffer);
w[0] = 0x12345678;
console.log(b[0].toString(16)); // 78 or 12
```

上記のコードは、リトルエンディアンの場合は 0x78 が、ビッグエンディアンの場合は 0x12 が返ります。このように少し低レイヤーに入ると環境やアーキテクチャの差によって結果が変わり得ます。現在のほとんどの CPU アーキテクチャはリトルエンディアンを採用しているためにこの差が問題になることは少ないとは思いますが、意識しておく価値はあるでしょう。

例えば私が移植した [fdlibm の wasm 版](https://github.com/tkihira/fdlibm-wasm) はビット演算を多用しているのですが、それらのコードは CPU アーキテクチャがリトルエンディアンであることを前提にしています。もし将来、ビッグエンディアンのアーキテクチャのシェアが出てきた場合、これを使ったアプリ（[Block Pong とか](https://bp.game5.app)）は修正しないとまともに動かなくなります。

なお、この記事はリトルエンディアンを前提にしております。

# Intel Archtecture の検知コード

次のコードによって、Intel アーキテクチャかどうかを判定することが出来る、というのがツイートの主張でした。実際は wasm で書かれているようですが、以下の JavaScript でも判定出来ます。

```javascript
var f = new Float32Array(1);
var u8 = new Uint8Array(f.buffer);
f[0] = Infinity;
f[0] = f[0] - f[0];
console.log(u8[3]); // 255 if Intel, 127 otherwise
```

Intel アーキテクチャの場合は 255 が表示され、それ以外の場合は 127 が表示されます。Intel Mac と M1 Mac で確認したところ、それぞれ 255 と 127 が表示されていました。

## なぜ結果が変わるのか

### NaN のビット表現

この結果を理解するためには、まず NaN のビット表現についての理解が必要です。

近代のコンピュータの浮動小数点演算は、[IEEE754](https://ja.wikipedia.org/wiki/IEEE_754) と呼ばれる仕様に従います。IEEE754 において、浮動小数点数で表現可能なすべての数値において、NaN 以外の値においては数値とビット表現が 1 対 1 で対応しています。しかし NaN だけが複数のビット表現を持ちます。

例えば今回利用している 32 bit の浮動小数点の場合、浮動小数点のビット表現は以下のようになります。

![32bit 浮動小数点のビット表現](./img/floating-point-representation.png)

詳細は省きますが、例えば符号が 1、指数部が 01111101、仮数部が 11010001011011110100010 だとすると、全体のビット表現は 0b10110110111010001011011110100010 となり、その実態は -0.454526… となります。

さて、この仕様において、

- 指数部が 255（0xffff）
- 仮数部が 0 以外 （ゼロの時は ±Infinity）

を満たす場合に、その数は NaN になります。仮数部にデバッグ用等のデータを持たせることが出来る設計なのですが、実際にこの仮数部の情報を使用するコードはほとんどありません。普段は気にする必要がない情報です。

NaN のビット表現やそれにまつわる処理は結構複雑で、例外を飛ばす signaling NaN、例外を飛ばさない quiet NaN、演算途中で NaN が発生した場合に立つ INVALID flag などなど、実際の演算で NaN が絡む場合の仕様が細かく定められています。興味があれば、[wikipedia の NaN の項](https://ja.wikipedia.org/wiki/NaN)を参考にしてみてください。ただ、JavaScript においてはこれらの NaN の bit 表現の違いが挙動に変化を与えることはなく、NaN は区別なく同一の NaN という概念として扱われます。

今回重要なのは、<span style="font-weight: bold; color:red">NaN にはビット表現において正負の値を持てる</span>、ということです。

### Intel アーキテクチャの特殊挙動

さて、では具体的に上記コードでなぜ Intel アーキテクチャを判定出来るのかを解説します。この章の執筆には [@teehah さん](https://twitter.com/teehah)の多大なご協力を得ております。ありがとうございます！

Intel のページにある次の PDF シートを見てみてください。

[https://www.intel.com/content/dam/develop/external/us/en/documents/floating-point-reference-sheet-v2-13.pdf](https://www.intel.com/content/dam/develop/external/us/en/documents/floating-point-reference-sheet-v2-13.pdf)

この中の R Ind こと「Real Indefinite」が今回のポイントです。このシートでは、Intel の演算ではいくつかのパターンにおいて Real Indefinite になることが定義されており、そのパターンになった場合は特殊な値（R Ind）を取ることが示されています。その <span style="color:red">R Ind の表現が、ちょうど負の NaN の値になっており、上記のコードではその部分を判定して Intel アーキテクチャと判断しております</span>。

この Real Indefinite、すなわち不定数とは何ぞや、というのを調べると、次の資料がヒットしました。

[https://www.academia.edu/13572645/inter_basic_arsitecture](https://www.academia.edu/13572645/inter_basic_arsitecture)

```
7.2.4. Indefinite
For each FPU data type, one unique encoding is reserved for representing the special value indefinite. For example, when operating on real values, the real indefinite value is a QNaN (see Section 7.4.1., “Real Numbers”). The FPU produces indefinite values as responses to masked floating-point exceptions.
```

Intel 独特の文化だと思うのですが、qNaN の表現のうちの 1 つを「Real Indefinite」という特別な表現として扱い、いくつかの演算（上記シートの他、上の資料の TABLE 7-20 にも同様の内容が記載されています）の返り値としてその特殊な qNaN を返す実装になっているようです。

そのいくつかの演算の 1 つが無限大マイナス無限大であり、上のコードはその結果が R Ind であるかどうかをチェックするコードとなっております。Intel 以外のアーキテクチャではこのような特殊な NaN の処理をしていないため、結果としてこのチェックで Intel アーキテクチャであるかどうかがわかる、という話です。

## なぜわざわざ代入してから引き算しているのか

ひとつ気になるのが、チェックコードでは `f[0] = Infinity;` と代入してから `f[0] = f[0] - f[0]` を呼んでいます。実は、これにも意味があるのです。

`f[0]` に代入せず、普通に無限大同士の引き算をしてみましょう。次のようなコードになります。

```javascript
var f = new Float32Array(1);
var u8 = new Uint8Array(f.buffer);
f[0] = Infinity - Infinity;
console.log(u8[3]);
```

手元の Intel マシンで以下のコードを実行したところ、予想通り 255 が返ってきました。問題なく動作しているように思えるじゃないですか。ところがどっこい、罠があります。次のコードを Chrome もしくは Node.js 等の V8 環境で実行してみてください。

```javascript
const func = () => {
    var f = new Float32Array(1);
    var u8 = new Uint8Array(f.buffer);
    f[0] = Infinity - Infinity;
    return u8[3] === 255;
}

for (let i = 0; i < 100000; i++) {
    if (!func()) {
        console.log(i);
        break;
    }
}
```

手元の Intel マシンで実行したところ、3289 を表示してストップしました！実行するたびに違う値を表示します。

これは次のように説明出来ます。JIT がかかる前は `f[0] = Infinity - Infinity` というコードを逐次実行しているために、演算結果として毎回 R Ind の値が f[0] に代入されているのですが、JIT によって `Infinity - Infinity` が定数として事前に演算され、その結果である NaN に最適化で置き換わり、結果として `f[0] = NaN` というコードに最適化されてしまったせいで `R Ind` が発生しなくなった、と考えることが出来ます。

なので、<span style="color:red">Intel アーキテクチャかつ V8 エンジンの場合限定ですが、次のコードによって自分自身が JIT 化されているかどうかを確認出来ます</span>。

```javascript
function isInJIT() {
    var f = new Float32Array(1);
    var u8 = new Uint8Array(f.buffer);
    f[0] = Infinity - Infinity;
    return u8[3] == 127;
}
```

`f[0] = Infinity; f[0] = f[0] - f[0];` で最適化されていないのは、おそらくたまたまです。もし将来的にこれも JIT で最適化されるようになったら、もう少し複雑で最適化しにくいコードに変える必要があるのでしょう。

### ブラウザごとの挙動の違い

当然ながら、これらの挙動は JavaScript の実行エンジンによって左右されます。例えば、次のようなコードを見てみてください。

```javascript
const f = new Float32Array(1);
const u8 = new Uint8Array(f.buffer);
f[0] = 0;
f[0] = f[0] / f[0];
console.log(u8[3]); // ※1
f[0] = 0 / 0;
console.log(u8[3]); // ※2
```

まず、このコードは Intel 以外の環境だと、全て 127 を返します。R Ind の文化がないので当然ですね。

さて、では Intel だとどうなるでしょうか？本来であれば全部 255 が返ってくるはずなのですが、手元の Intel 環境で試したところ、

- Chrome: ※1 === 127, ※2 === 255
- Safari: ※1 === 255, ※2 === 255
- Firefox: ※1 === 127, ※2 === 127

となりました。

本来、Intel アーキテクチャにおいて `0/0` は R Ind を返さないといけないので、255 になるはずです。しかし内部で演算前に NaN になることがわかっている場合（もしくは NaN が返ってきた後に何らかの処理が挟まっている場合）には、JavaScript エンジンによってその値が R Ind ではない普通の NaN に変えられることもあるでしょう。

Safari は愚直に 255 を返してくれました。Firefox は 127 が返ってきました。Chrome は、変数同士を割り算したときは 255、リテラルで `0/0` を書いた場合には 127 を返すというトリッキーな結果になりました。おそらく Chrome では `0/0` を構文解析の段階で NaN に置換しているか、それに近い処理が入っているのでしょう。

# まとめ

結論として、現在は大体の環境において、以下のコードで Intel アーキテクチャであるかどうかの判断が可能です。

```javascript
function isX86() {
    var f = new Float32Array(1);
    var u8 = new Uint8Array(f.buffer);
    f[0] = Infinity;
    f[0] = f[0] - f[0];
    return u8[3] === 255;
}
```

このコードは、Intel の仕様に基づいたものであり、（false positive の可能性はあるものの）Intel アーキテクチャをほぼ確実に判定することが出来ます。ただし、ブラウザの JavaScript エンジンの最適化の変化などによって、将来機能しなくなる可能性は大いにある点には気をつけましょう。

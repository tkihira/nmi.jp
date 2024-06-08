---
layout: post
title: ARM に存在する JavaScript 専用命令「FJCVTZS」を追う（ついでに V8 をビルドする）
categories:
- JavaScript
---

[前回の記事](http://nmi.jp/2024-06-03-Exploring-V8-JIT-Outputs)では、JavaScript の実行エンジン V8 の JIT 出力コードを読んでみました。記事は M1 Mac 上で動かした結果でしたので、ARM アーキテクチャのアセンブラを読むことになりました。

さてそんな ARM アーキテクチャですが、最近の ARM には **FJCVTZS** という JavaScript 専用の機械語命令があるのをご存知でしょうか？CPU に、特定の言語（それもコンパイラを持たない JavaScript）専用の命令があると知ったとき、私は大いに驚きました（過去にも [Jazelle](https://en.wikipedia.org/wiki/Jazelle) みたいなものはありましたが）

今回は、この **FJCVTZS** 命令について、実際にどれだけ効果があるのか、<span style="color:blue">V8 をビルドしながら調べてみましょう</span>。




# FJCVTZS 命令とは？

FJCVTZS 命令は、Arm v8.3 から導入された JSCVT 命令の一つで、JavaScript の言語特有の型変換（コンバージョン）を処理します。今のところ JSCVT 命令は FJCVTZS しかないようです。

公式の資料はこちらです。

[https://developer.arm.com/documentation/dui0801/g/A64-Floating-point-Instructions/FJCVTZS](https://developer.arm.com/documentation/dui0801/g/A64-Floating-point-Instructions/FJCVTZS)

`Floating-point Javascript Convert to Signed fixed-point, rounding toward Zero.` と、公式の説明に思いっきり「Javascript」の文字がありますね。JavaScript（ECMAScript）の仕様にある [[[ToInt32]]](https://tc39.es/ecma262/#sec-toint32) という内部関数の挙動を、そのままチップ上で行うのを目的に設計されています。

**[[ToInt32]]** は内部の仮想関数であり JavaScript の関数として表に出てくることはないのですが、ビット演算系の数値処理をするとほぼ確実に呼ばれます。一言で説明すると、浮動小数点に対して小数点以下を切り捨てることで整数に変換する挙動です。

```js
const x = 1.23 >> 0;
const y = -45.6 | 0;
const z = ~~78.9;
console.log({x, y, z}); // x: 1, y: -45, z: 78
```

これだけの挙動であれば ARM に既に存在する [FCVTZS](https://developer.arm.com/documentation/dui0801/h/A64-Floating-point-Instructions/FCVTZS--scalar--integer-) 命令で問題なかったのですが、**[[ToInt32]]** は 2**31 (=== 2147483648) 以上の数値に対しての挙動が異なります。

```js
const x = 2147483648 | 0;
const y = 4294967296 | 0;
const z = 12345678901.234 | 0;
console.log({x, y, z}); // x: -2147483648, y: 0, z: -539222987
```

平たくいうと、整数化した時に 32bit に収まらなかったビットは捨てられ、その上でビットパターンを符号付き整数にそのまま変換しているので、このような挙動になります。数が大きい時にしか発覚しない面倒なバグになることがあるので、速度がクリティカルではない JavaScript を書かれる際には `Math.trunc` で整数化するようにしましょう。（[詳細は以前このブログで書きました](http://nmi.jp/2022-02-03-dont-use-parseInt)）。

一方で、速度がクリティカルな場面では、この整数化は重要なテクニックになります。32bit int に変数を収めると前回の記事で見たようにブラウザの最適化がかかりやすくなるため、積極的に [[ToInt32]] の整数化を活用することになります。

結果的に、[[ToInt32]] が活用されたコードではブラウザによる最適化がかかり、ネイティブコード（機械語）で上記の変換が行われます。機械語なので基本的に高速なのですが、上記の通り少し特殊な挙動であるため、FJCVTZS が存在しない CPU においては少し冗長な機械語が出力されていました。

一方 FJCVTZS の存在する CPU においては、単純にこの 1 命令を呼べば、上記の複雑な変換を全てチップ側で処理してくれます。結果的に機械語が短くなり、さらに高速に動作することが期待されます。<span style="color:red">JavaScript が世の中で広く使われているために、CPU に専用命令を用意することで高速化を後押しし、広い人々により良い体験を届けよう</span>、という意図で設計された命令なのだろうと思います。

しかしそうすると当然気になるのは、<span style="font-weight:bold"> **FJCVTZS** という JavaScript 専用命令が存在することで、具体的に JavaScript はどれほど速くなっているのでしょうか？</span>今回は、V8 をビルドすることで、**FJCVTZS** のある／なしそれぞれの状況における具体的な時間変化を計測してみようと思います。


# FJCVTZS 命令の存在確認

実は[前回の記事](http://nmi.jp/2024-06-03-Exploring-V8-JIT-Outputs)でも FJCVTZS 命令はちょっとだけ登場していたのですが、今回は改めてこの命令のための専用テストコードを用意します。

```js
const arr = [];
for (let i = 0; i < 1_000_000; i++) {
    arr.push(Math.random() * 2 ** 31);
}

const f = () => {
    let acc = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        acc ^= arr[i] | 0;
    }
};

for (let i = 0; i < 5000; i++) {
    f();
}
```

準備コードで 100 万個の小数を配列に準備し、その内容をひたすら [[ToInt32]] で整数化（ `arr[i] | 0` の部分がそれです）して、ついでに XOR するコードです。それを 5000 回呼ぶことで時間を測ります。ではこのコードを、まず手元の Node.js で最適化を確認してみましょう。Apple M1 Mac にて実行しました。

```
$ node --print-opt-code test.js
```

出力の中に **FJCVTZS** 命令が存在することを確認します。


```
0x109c48450    90  1e7e0007       fjcvtzs w7, d0
```

M1 以降の Mac であれば確認できると思います。確かに **FJCVTZS** 命令が使われているようですね！

というわけで、次の目的は、この **FJCVTZS** を使わない V8 を用意することです。

# V8 をビルドする

さて、では次に V8 をビルドしてみましょう。V8 のビルドはそんなに大変ではありません。ビルド方法は次のページに書いてあります。

- [https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)
- [https://v8.dev/docs/source-code](https://v8.dev/docs/source-code)
- [https://v8.dev/docs/build](https://v8.dev/docs/build)

今回は **FJCVTZS** 命令を対象にするため MacOS 向けに解説しますが、Windows でも基本は同じです。上記ページを参照してください。

## V8 のビルドステップ

V8 のソースは github に公式ミラーがありますが、**一般の github のプロジェクトのように clone してビルドしようとしてはいけません**（公式が「やるな！」と言っています）。その代わりに、専用のビルドシステムを利用してソースコードを取得しビルドします。

### `depot_tools` の準備

V8 に限らず Chromium 関係のビルドをする際には、Google の用意した `depot_tools` と呼ばれるツールを利用します。まず、この `depot_tools` をチェックアウトします。

```
$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

そして、そのフォルダにパスを通します

```
$ export PATH=/path/to/depot_tools:$PATH
```

Windows の場合はバイナリが配布されているので、それを展開してパスを通してください。

### v8 のソースコード取得

次に、`depot_tools` を利用して V8 のソースを取得します

```
$ mkdir ~/v8
$ cd ~/v8
$ fetch v8
$ cd v8
```

上記の様に実行すると、 `~/v8/v8` ディレクトリの下に V8 のソースコード一式が展開されるはずです。なお `~/v8` ディレクトリにも同期用のファイルがいくつか展開されるので注意してください。

なお、V8 ディレクトリ直下にある `BUILD.gn` ファイルを編集すると、V8 ビルドのフラグを色々と設定できます。今回はデフォルトの設定でビルドしますが、必要に応じて確認してみてください。

### ビルド

さて、これで準備が整いました。いざビルドしてみましょう。

今回は Apple Silicon の M1 Mac の PC を前提にしているので、CPU ターゲットは `arm64` になります。Intel Mac や Windows の場合は `x64` になるでしょう。

```
$ tools/dev/gm.py arm64.release
```

これでビルドが開始します。フルビルドでも 30 分ちょいくらいで終わるのではないかと思います。

ビルドが正常に終わると、

```
Done! - V8 compilation finished successfully.
```

という表示が出るはずです。これで準備が整いました！

### ビルドの成果物を確認する

ビルドの成果物として、 `d8` というコマンドが `out/arm64.release` ディレクトリの下に生成されます。これはデバッグやテストを目的とした V8 のコマンドラインインターフェイスです。起動してみましょう。

```
$ ./out/arm64.release/d8
V8 version 12.7.0 (candidate)
d8> print("hello")
hello
undefined
d8> 
```

まるで Node.js のような REPL 環境が起動します。


今回の記事では利用しませんが、例えば `d8` では `--allow-natives-syntax` オプションをつけることで V8 の内部状況にアクセスできる[専用の特殊命令](https://source.chromium.org/chromium/v8/v8.git/+/315c974477e8100b024b3d2894594b48e5b33008:src/runtime/runtime.h;l=20)を使えます。

```
% ./out/arm64.release/d8 --allow-natives-syntax
V8 version 12.7.0 (candidate)
d8> const a = [1, 2, 3, 4, 5]; %DebugPrint(a);
DebugPrint: 0x399100047fb1: [JSArray]
 - map: 0x39910018c7f1 <Map[16](PACKED_SMI_ELEMENTS)> [FastProperties]
（...以下略...）
```

完全に余談ですが、私は以前、この `%DebugPrint` の出力を見ることで `PACKED` ならびに `SMI` という概念を知り、[それを調査した記事](http://nmi.jp/2019-06-09-The-reason-you-should-avoid-new-array-100)」を書きました。`d8` をいじると V8 の内部知識に簡単に触れられるのでとても楽しいです。目的がなくても暇つぶしにビルドして遊びましょう。

この記事では、後に別のビルドを用意するので、この d8 を別名で保存しておきます。

```
$ cp ./out/arm64.release/d8 ./out/arm64.release/d8_with_fjcvtzs
```

### V8 で FJCVTZS を無効化するように書き換えてビルドする

さて、次に本命の **FJCVTZS** を無効化した d8 をビルドしましょう。grep すればわかるのですが、FJCVTZS を扱っているソースコードはわずかしかないので、無効化する部分を特定するのは簡単です。手元で pull したソースでは 2 箇所見つかりました

[src/codegen/arm64/macro-assembler-arm64.cc](https://github.com/v8/v8/blob/f0ada6d1dc6208472c1b736f82019e90edee29fb/src/codegen/arm64/macro-assembler-arm64.cc#L2932-L2935)

```cpp
void MacroAssembler::TruncateDoubleToI(Isolate* isolate, Zone* zone,
                                       Register result,
                                       DoubleRegister double_input,
                                       StubCallMode stub_mode,
                                       LinkRegisterStatus lr_status) {
  ASM_CODE_COMMENT(this);
  if (CpuFeatures::IsSupported(JSCVT)) {
    Fjcvtzs(result.W(), double_input);
    return;
  }

  Label done;
```

[src/maglev/arm64/maglev-assembler-arm64.cc](https://github.com/v8/v8/blob/f0ada6d1dc6208472c1b736f82019e90edee29fb/src/maglev/arm64/maglev-assembler-arm64.cc#L483-L485)

```cpp
void MaglevAssembler::TruncateDoubleToInt32(Register dst, DoubleRegister src) {
  if (CpuFeatures::IsSupported(JSCVT)) {
    Fjcvtzs(dst.W(), src);
    return;
  }

  ZoneLabelRef done(this);
```

このうち後者は `Maglev` という比較的最近導入された最適化エンジンなのですが、今回はその説明は端折ります。この両者をまるっとコメントアウトすれば **FJCVTZS** を完全に無効化した d8 をビルドすることが出来そうです。というわけでやってみましょう。

```cpp
void MacroAssembler::TruncateDoubleToI(Isolate* isolate, Zone* zone,
                                       Register result,
                                       DoubleRegister double_input,
                                       StubCallMode stub_mode,
                                       LinkRegisterStatus lr_status) {
  ASM_CODE_COMMENT(this);
  // if (CpuFeatures::IsSupported(JSCVT)) {
  //   Fjcvtzs(result.W(), double_input);
  //   return;
  // }

  Label done;
```


```cpp
void MaglevAssembler::TruncateDoubleToInt32(Register dst, DoubleRegister src) {
  // if (CpuFeatures::IsSupported(JSCVT)) {
  //   Fjcvtzs(dst.W(), src);
  //   return;
  // }

  ZoneLabelRef done(this);
```

これらの変更を保存した上で、再度 V8 をビルドします。差分ビルドになるので一瞬で終わるはずです。

```
$ tools/dev/gm.py arm64.release
# autoninja -C out/arm64.release d8
ninja: Entering directory `out/arm64.release'
[12/12] LINK ./d8
# out/arm64.release/mkgrokdump > tools/v8heapconst.py
/bin/sh: out/arm64.release/mkgrokdump: No such file or directory
Done! - V8 compilation finished successfully.
$
```

これで **FJCVTZS** を利用しない `d8` が出来ました！これも後で使うので、別名で保存しておきます。

```
$ cp ./out/arm64.release/d8 ./out/arm64.release/d8_without_fjcvtzs
```

### **FJCVTZS** を出力しないことを確認する

`d8` でも Node.js と同じように最適化された逆アセンブルコードを確認出来ます。ちょっとディレクトリを移動して、コードを確認してみましょう

```
$ ../../v8/out/arm64.release/d8_without_fjcvtzs --print-opt-code test.js > test_without_fjcvtzs.code
```

`test_without_fjcvtzs.code` を grep すると、**FJCVTZS** が一切存在しないことが確認できます。なお `d8_with_fjcvtzs` でも確認しておきましょう。

```
$ ../../v8/out/arm64.release/d8_with_fjcvtzs --print-opt-code test.js > test_with_fjcvtzs.code
```

`test_with_fjcvtzs.code` を grep すると、**FJCVTZS** がたくさん存在することがわかります。具体的なコードは最後の余談で紹介します。

### テストコードで実行時間の差を測る

では、実際に **FJCVTZS** のあるなしでどれだけ実行速度が変わるのか確認しましょう。

```
$ time ../../v8/out/arm64.release/d8_with_fjcvtzs test.js 

real	0m3.787s
user	0m3.764s
sys	0m0.021s
$ time ../../v8/out/arm64.release/d8_without_fjcvtzs test.js 

real	0m4.413s
user	0m4.379s
sys	0m0.035s
```

**FJCVTZS** のある d8 だと 3.764 秒だったのが、**FJCVTZS** のない d8 だと 4.379 秒になっています。4.379/3.764 = 1.163、<span style="color:blue">**16% もの高速化が達成されている**</span>と言えます！

# 現実のコードではどうなのか？

とはいえ、今回利用したテストコードは **FJCVTZS** を全面的に利用する **FJCVTZS** に有利なコードであり、実世界の JavaScript ではまず存在し得ないでしょう。<span style="color:red">私達が日々使っているような JavaScript のプログラムが、**FJCVTZS** の存在によってどれだけ速くなっているのだろうか</span>、というのが本来知りたい情報のはずです。

実世界の JavaScript に近い環境は、実際のブラウザ開発者にとっても興味の強い内容です。そのおかげで、いくつかの優秀なベンチマークが用意されています。今回はその中でも JetStream2 を利用してみましょう。

## JetStream2

JetStream2 は、ブラウザからでも実行できる JavaScript のベンチマークです。

[https://browserbench.org/JetStream2.2/](https://browserbench.org/JetStream2.2/)

私達の環境でもよく使われる様々な小さなベンチマークが多数あり、ブラウザの特性を把握するためにも有用なベンチマークです。このベンチマークのオリジナルがどこにあるのか私は把握していないのですが、おそらく [WebKit のリポジトリにあるもの](https://github.com/WebKit/WebKit/tree/main/Websites/browserbench.org/JetStream2.2)が正式版だろうと思うので、今回はこれを利用します。

ダウンロードして適当なフォルダに展開し、`cli.js` を `d8` で実行します（`cli.js` は最初から `d8` で実行できるように調整されています）

```
$ ../../v8/out/arm64.release/d8_with_fjcvtzs cli.js
Starting JetStream2
Running WSL:
    Stdlib: 2.485
    Tests: 1.247
    Score: 1.761
    Wall time: 0:06.028
Running UniPoker:
（...中略...）
Running 3d-cube-SP:
    Startup: 357.143
    Worst Case: 625
    Average: 744.681
    Score: 549.833
    Wall time: 0:00.814


Stdlib: 2.485
MainRun: 1.247
First: 255.953
Worst: 391.972
Average: 511.234
Startup: 1293.205
Runtime: 14.491

Total Score:  314.450 

$
```

実行すると、約 1 分ほどで全てのテストが完了します。スコアが表示されていますが、今回は純粋に時間を測りたいので、`Wall time` ならびに `Run time` を計測・比較することにします。

## ベンチマーク結果

手元のマシンで実行して計測したのですが、JavaScript はガベージコレクションなどの影響もあり、ベンチマークの実行結果があまり安定しませんでした。なので、15 回ずつベンチマークを回し、それぞれのベンチマークに対して上位 5 個と下位 5 個のデータを捨て、残りの 5 つのデータを平均した結果で比較することにしました（正確な測り方ではないと思うのですが、ご容赦ください）。

その結果がこちらになります。

|benchmark|with_fjcvtzs|without_fjcvtzs|diff|
|:--:|:--:|:--:|
|WSL|5.927|5.939|0.20%|
|UniPoker|0.812|0.816|0.49%|
|uglify-js-wtb|0.55|0.551|0.18%|
|typescript|1.745|1.751|0.34%|
|(*)tsf-wasm|6.01|6|-0.17%|
|tagcloud-SP|1.095|1.095|0.00%|
|string-unpack-code-SP|0.473|0.471|-0.42%|
|stanford-crypto-sha256|0.572|0.583|1.92%|
|stanford-crypto-pbkdf2|0.528|0.54|2.27%|
|stanford-crypto-aes|0.94|1.047|<span style="color:red">**11.38%**</span>|
|splay|0.783|0.778|-0.64%|
|(*)richards-wasm|9.774|9.755|-0.19%|
|richards|0.553|0.553|0.00%|
|regexp|0.878|0.877|-0.11%|
|regex-dna-SP|0.897|0.896|-0.11%|
|raytrace|0.402|0.401|-0.25%|
|(*)quicksort-wasm|200|210.29|<span style="color:red">**5.15%**</span>|
|prepack-wtb|0.458|0.459|0.22%|
|pdfjs|1.321|1.327|0.45%|
|OfflineAssembler|1.37|1.366|-0.29%|
|octane-zlib|1.802|1.802|0.00%|
|octane-code-load|0.331|0.333|0.60%|
|navier-stokes|0.454|0.458|0.88%|
|n-body-SP|0.304|0.304|0.00%|
|multi-inspector-code-load|0.366|0.366|0.00%|
|ML|2.145|2.142|-0.14%|
|mandreel|1.851|1.861|0.54%|
|lebab-wtb|0.299|0.296|-1.00%|
|json-stringify-inspector|0.323|0.323|0.00%|
|json-parse-inspector|0.387|0.387|0.00%|
|jshint-wtb|0.295|0.295|0.00%|
|(*)HashSet-wasm|20.781|20.764|-0.08%|
|hash-map|0.417|0.418|0.24%|
|(*)gcc-loops-wasm|2.722|2.722|0.00%|
|gbemu|2.061|2.056|-0.24%|
|gaussian-blur|0.996|1.026|<span style="color:red">**3.01%**</span>|
|float-mm.c|3.658|3.657|-0.03%|
|FlightPlanner|0.505|0.503|-0.40%|
|first-inspector-code-load|1.83|1.829|-0.05%|
|espree-wtb|0.397|0.398|0.25%|
|earley-boyer|0.411|0.412|0.24%|
|delta-blue|0.154|0.154|0.00%|
|date-format-xparb-SP|1.103|1.104|0.09%|
|date-format-tofte-SP|1.331|1.332|0.08%|
|crypto-sha1-SP|0.926|0.976|<span style="color:red">**5.40%**</span>|
|crypto-md5-SP|1.114|1.159|<span style="color:red">**4.04%**</span>|
|crypto-aes-SP|0.469|0.469|0.00%|
|crypto|0.226|0.226|0.00%|
|coffeescript-wtb|0.388|0.388|0.00%|
|chai-wtb|0.231|0.232|0.43%|
|cdjs|0.965|0.964|-0.10%|
|Box2D|0.457|0.457|0.00%|
|Basic|0.309|0.309|0.00%|
|base64-SP|0.662|0.663|0.15%|
|babylon-wtb|0.287|0.29|1.05%|
|Babylon|0.231|0.231|0.00%|
|async-fs|1.013|1.024|1.09%|
|Air|0.349|0.348|-0.29%|
|ai-astar|0.522|0.521|-0.19%|
|acorn-wtb|0.319|0.321|0.63%|
|3d-raytrace-SP|0.849|0.846|-0.35%|
|3d-cube-SP|0.774|0.773|-0.13%|
|TOTAL|51.054|51.353|0.58%|

各ベンチマークの詳細に関しては、[In-Depth Analysis](https://www.browserbench.org/JetStream/in-depth.html) のページを参考にしてください。

(*) のついているベンチマーク（全部 wasm）は単位がミリ秒で、他の単位は秒です。赤色は実行時間に 3% 以上の差分のあるベンチマークです。マイナスは `without_fjcvtzs` の方が結果が良かったベンチマークになります。後述する余談で紹介しますが、本来 `without_fjcvtzs` の方がスコアが良くなることはないはずなのですが、実行時の環境等によって安定しない結果になっていると思われます。

実行時間が短すぎて、あまり有意なデータではないベンチマークも多いのですが、暗号周りのベンチマークで良い結果が出ている傾向があるように見えますね。この結果だけから考えると、Arm が **FJCVTZS** 専用命令を導入した効果はあったと言って良いのではないか、と思います。

# まとめ

ARM の JavaScript 専用命令のパフォーマンスを確認するために V8 のビルドまでして追ってみましたが、思ったよりも簡単に深いところまで潜れたのではないでしょうか？

Chrome や V8 に限らず、Webkit や Firefox のブラウザのソースコードもほとんど全て公開されています。それらのプロジェクトは大多数の人が開発に参加するため、ビルドステップ等もしっかりと整備されており、ビルドしたりちょっと改造する程度であれば簡単に行えることが多いでしょう。

ARM の JavaScript 専用命令、みたいなニッチで特殊な内容が、実際のソースコードにどのような形で落とし込まれているのか、ソースを読むことで理解も深まります。また出力結果とソースコードを比較することで、内部で JIT がどのように行われているのかを実際に改造しながら学ぶこともできます。普段目にしている JavaScript のコードからは大きく外れたソースコードになるでしょうけれど、普段目にしないからこそ、そういったコードから学べる内容はより深いものになるかもしれません。

この記事が、皆さん好奇心に火を付けることが出来たならば何よりです。ぜひ皆さんもビルドして遊んでみてください。

# 余談: **FJCVTZS** の有無によって出力されるコード比較

テストコードを実行した JIT の出力結果から、**FJCVTZS** を使わない場合のコードを読み解いてみましょう。

まず **FJCVTZS** を使った場合の逆アセンブルの抜粋です。

```
0x16cc81978    f8  d37df12a       lsl x10, x9, #3
0x16cc8197c    fc  91001d4a       add x10, x10, #0x7 (7)
0x16cc81980   100  fc6a68a0       ldr d0, [x5, x10]
0x16cc81984   104  1e7e000a       fjcvtzs w10, d0
0x16cc81988   108  11000529       add w9, w9, #0x1 (1)
0x16cc8198c   10c  4a0a0108       eor w8, w8, w10
0x16cc81990   110  6b07013f       cmp w9, w7
0x16cc81994   114  54000202       b.hs #+0x40 (addr 0x16cc819d4)
```

これと同じ部分で、**FJCVTZS** を使わなかった場合の逆アセンブルの抜粋です。

```
0x150001be8   148  d37df12a       lsl x10, x9, #3
0x150001bec   14c  91001d4a       add x10, x10, #0x7 (7)
0x150001bf0   150  fc6a68a0       ldr d0, [x5, x10]
0x150001bf4   154  9e78000a       fcvtzs x10, d0
0x150001bf8   158  f100055f       cmp x10, #0x1 (1)
0x150001bfc   15c  ba417941       ccmn x10, #1, #nzcV, vc
0x150001c00   160  540000e7       b.vc #+0x1c (addr 0x150001c1c)
0x150001c04   164  fc1f0fe0       str d0, [sp, #-16]!
0x150001c08   168  f90007ff       str xzr, [sp, #8]
0x150001c0c   16c  58001370       ldr x16, pc+620 (addr 0x0000000150001e78)    ;; off heap target
0x150001c10   170  d63f0200       blr x16
0x150001c14   174  f94003ea       ldr x10, [sp]
0x150001c18   178  910043ff       add sp, sp, #0x10 (16)
0x150001c1c   17c  53007d4a       lsr w10, w10, #0
0x150001c20   180  11000529       add w9, w9, #0x1 (1)
0x150001c24   184  4a0a0108       eor w8, w8, w10
0x150001c28   188  6b07013f       cmp w9, w7
0x150001c2c   18c  54000482       b.hs #+0x90 (addr 0x150001cbc)
```

命令数的にはとても増えているように見えますが、条件分岐が入っているので実際には全て実行される訳ではありません。**FJCVTZS** と同等のコードだけ抜き出すとこうなります。

```
0x150001bf4   154  9e78000a       fcvtzs x10, d0
0x150001bf8   158  f100055f       cmp x10, #0x1 (1)
0x150001bfc   15c  ba417941       ccmn x10, #1, #nzcV, vc
0x150001c00   160  540000e7       b.vc #+0x1c (addr 0x150001c1c)
0x150001c04   164  fc1f0fe0       str d0, [sp, #-16]!
0x150001c08   168  f90007ff       str xzr, [sp, #8]
0x150001c0c   16c  58001370       ldr x16, pc+620 (addr 0x0000000150001e78)    ;; off heap target
0x150001c10   170  d63f0200       blr x16
0x150001c14   174  f94003ea       ldr x10, [sp]
0x150001c18   178  910043ff       add sp, sp, #0x10 (16)
0x150001c1c   17c  53007d4a       lsr w10, w10, #0
```

余談ですが、この **FJCVTZS** 命令の代替命令の配置のされ方は、[ソースコードで記述されている構造ものそのもの](https://github.com/v8/v8/blob/f0ada6d1dc6208472c1b736f82019e90edee29fb/src/codegen/arm64/macro-assembler-arm64.cc#L2926-L2975)なのが、当たり前とはいえ面白いですね。

2 行目 3 行目の`cmp` と　`ccmn` で 64bit のオーバーフローを判定し、64bit のオーバーフローが発生していなかったら一番最後の `lsr` まで飛びます。すなわち、オーバーフローしない場合は `fjcvtzs` の  1命令が `fcvtzs` + `cmp` + `ccmn` + `b.vc` + `lsr` の 5 命令に増えており、オーバーフローする場合は 11 命令に増えることになります。

なお、[Wikipedia の RISC](https://ja.wikipedia.org/wiki/RISC#%E7%89%B9%E5%BE%B4) の特徴の項に「全ての演算は 1 クロックで実行する」とありますが、RISC の思想を汲む ARM ですが実際のサイクル数（この場合はレイテンシ）は大きく異なります。こちらに [Apple M1 chip を対象にしたレイテンシ・スループットの野良ベンチマークがありますが](https://github.com/ocxtal/insn_bench_aarch64/blob/master/results/apple_m1_firestorm.md)、fjcvtzs は 10 clock と記載されています。スループット分の並列実行もあれば投機実行もあり、近年の CPU において命令数とサイクル数は必ずしも一致しないのは抑えておきましょう（とはいえ、大抵の場合は命令数と実効速度には相関関係が出ます）。この資料は [@teehah](https://x.com/teehah) さんに教えて頂きました。ありがとうございます！

さて、上で紹介したテストコードは決してオーバーフローを起こさないコードでした。実際に 64bit をオーバーフローさせるとさらに重くなることを確認してみましょう。

```js
const arr = [];
for (let i = 0; i < 1_000_000; i++) {
    arr.push(2 ** 64 + Math.random() * 2 ** 31);
}

const f = () => {
    let acc = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        acc ^= arr[i] | 0;
    }
};

for (let i = 0; i < 5000; i++) {
    f();
}
```

上のテストコードを `test_overflow.js` に保存して、`test.js` との差分を確認してみましょう。

```
$ time ../../v8/out/arm64.release/d8_without_fjcvtzs test.js 

real	0m4.554s
user	0m4.490s
sys	0m0.040s
$ time ../../v8/out/arm64.release/d8_without_fjcvtzs test_overflow.js 

real	0m11.920s
user	0m11.838s
sys	0m0.049s
```

オーバーフローなしだと 4.490s でしたが、オーバーフローありだと 11.838s と大幅に遅くなっているのが確認できます。 どちらのテストコードも **FJCVTZS** を使うと、当然ながら有意な差は出ません。

```
$ time ../../v8/out/arm64.release/d8_with_fjcvtzs test.js 

real	0m3.958s
user	0m3.893s
sys	0m0.040s
$ time ../../v8/out/arm64.release/d8_with_fjcvtzs test_overflow.js 

real	0m3.901s
user	0m3.867s
sys	0m0.035s
```

3.867s と 11.838s だと 3 倍超もの高速化が達成されていることになります。**FJCVTZS** は普段でも速いですが、オーバーフローが発生するタイミングだと断然速くなることがわかりました。**FJCVTZS** 命令は、JavaScript の JIT においてはデメリットなく高速化できるので、私は **FJCVTZS** は使えるのであれば絶対に使ったほうが良い命令であるという理解をしています。

これらの検証は [@hotpepsi](https://x.com/hotpepsi) さんにも手伝って頂きました。ありがとうございます！

そして、これが原因で、`JetStream2.2` の `stanford-crypto-aes` のベンチマークで大幅な速度改善につながっている可能性があります。`stanford-crypto-aes` のベンチマークの中で大量の **FJCVTZS** が使われているコードは、`sjcl.cipher.aes` 関数の中のこのコードです。

```js
(a){this.s[0][0][0]||this.O();var b,c,d,e,f=this.s[0][4],g=this.s[1];b=a.length;var h=1;if(4!==b&&6!==b&&8!==b)throw new sjcl.exception.invalid("invalid aes key size");this.b=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^g[3][f[c&255]]};
```

このコードの中で、特に `h<<1^283*(h>>7)` のところで 64 bit のオーバーフローが起きている可能性が高いです。JIT の出力を見ると他の部分でもふんだんに **FJCVTZS** を使っているので、この部分がなくても十分に高速化にはつながっているのですが、この部分でさらに大きな速度差が出て、結果として 11% を超える高速化が実現されたのではないかと推測しています。

このコードにおいて `b.vc` の分岐予測をミスって投機実行の速度ロスも出ているのではないかと少し考えたのですが、色々と検討した結果、このベンチマークに限っては分岐予測は関係なさそうと考えております。

ここの検証は [@kazuho](https://x.com/kazuho) さんにも手伝って頂きました。kazuho さんには他にも助言をいくつか頂きました。ありがとうございます！

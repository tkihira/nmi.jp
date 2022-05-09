---
layout: post
title: WebAssembly を動的生成した場合のパフォーマンスについて
categories:
- JavaScript
---

本日 TechFeed Conference 2022 で発表した「JavaScript による動的 WebAssembly 生成」についての詳解記事です。

JavaScript を動的に生成することで高速化を図るテクニックについては以前「[JavaScript における VM の高速化手法](http://nmi.jp/2020-12-20-Make_VM_faster)」でご紹介しましたが、その記事の最後で少しだけ言及した「WebAssembly の動的生成」についてこの記事で解説します。

[Java の Virtual Machine よりも Brainfuck の方が知名度が高い](https://twitter.com/tkihira/status/1511872190773280768)というアンケート結果が出ましたので、この記事では Brainfuck（以下 BF と略します）をターゲットとして解説します。

----

# BF とは何か

BF とは、8 つの記号のみで構成されるプログラミング言語です。

- 『`>`』: 現在のポインタを右に 1 つ移動する
- 『`<`』: 現在のポインタを左に 1 つ移動する
- 『`+`』: 現在のポインタの指すメモリの値を 1 つ増加させる
- 『`-`』: 現在のポインタの指すメモリの値を 1 つ減少させる
- 『`.`』: 現在のポインタの指すメモリの値をアスキーコードとして文字出力する
- 『`,`』: 現在のポインタの指すメモリに標準入力から 1 文字入力する（今回は不使用）
- 『`[`』: 現在のポインタの指すメモリの値が 0 ならば対応する括弧まで移動する
- 『`]`』: 現在のポインタの指すメモリの値が 0 以外ならば対応する括弧の次まで移動する

例えば、A を表示させるためには、A の ASCII CODE が 65 なので、`+++…（65個）…++++.` というコードで出力できます。もう少し簡単にすると、65 は 8 * 8 + 1 なので、`++++++++[>++++++++<-]>+.` という風にループを使って短く出来ます。

今回は、このような言語があるのだ、という程度に理解してもらえれば問題ありません。詳しい解説は [Wikipedia](https://ja.wikipedia.org/wiki/Brainfuck) を参考にしてみてください。[英語版の Wikipedia](https://en.wikipedia.org/wiki/Brainfuck#Hello_World!) には Hello World プログラムの解説もあります。

## マンデルブロ集合

今回実行するのは、[マンデルブロ集合を描画する BF のプログラム](https://github.com/erikdubbelboer/brainfuck-jit/blob/master/mandelbrot.bf)です。マンデルブロ集合と呼ばれるフラクタル図形の描画しますが、良い感じに重いためにベンチマーク用に採用しました。

<input id='startbutton' type="button" value="実行" onclick="start()"> 実行ボタンを押すと、以下にマンデルブロ集合の出力結果が得られます<br>
<script src='/js/bfCode.js'></script>
<script>
const start = function() {
    document.getElementById('startbutton').disabled = true;
    document.getElementById('startbutton').value = '実行中';
    window.worker = new Worker('/js/wasm-jit-multi-functions.js');
    worker.postMessage(bfCode);
    worker.onmessage = function (e) {
        if (e.data) {
            document.getElementById('bf_output').value += String.fromCharCode(e.data);
        } else {
            document.getElementById('startbutton').value = '終了';
            worker.terminate();
        }
    };
};
</script>
<textarea id="bf_output" rows='50' cols='160' style="font-size:8px"></textarea>

この記事の目的は、この<span style='color:#f00'>マンデルブロ集合の描画を行う BF のプログラムを、様々な JavaScript や WebAssembly のコードで実行し、そのベンチマークを取ること</span>です。BF の高速な実行が目的ではないのでご了承ください。

# 実装の紹介

今回の実装を簡単に紹介します。ソースコードは [github](https://github.com/tkihira/dynamic-wasm) にあるので参考にしてみてください。

- [JavaScript simple implementation](https://github.com/tkihira/dynamic-wasm/blob/main/js-simple.js): JavaScript で素直に実装したプログラム
- [JavaScript just-in-time implementation](https://github.com/tkihira/dynamic-wasm/blob/main/js-jit.js): JavaScript で動的に JavaScript を生成するプログラム
- [WebAssembly simple implementation](https://github.com/tkihira/dynamic-wasm/blob/main/wasm-simple.wat): WebAssembly で素直に実装したプログラム
- [WebAssembly just-in-time implementation: one function](https://github.com/tkihira/dynamic-wasm/blob/main/wasm-jit.js): JavaScript で WebAssembly を動的に生成するプログラム（単一関数）
- [WebAssembly just-in-time implementation: multiple functions](https://github.com/tkihira/dynamic-wasm/blob/main/wasm-jit-multi-functions.js): JavaScript で WebAssembly を動的に生成するプログラム（複数関数）

ポイントは、

- JavaScript で書かれているか、WebAssembly で書かれているか
- 単純な実装か、動的にプログラムを生成する実装か
- WebAssembly の場合、単一関数にまとめて出力するか、複数関数に分割して出力するか

の違いがあります。

## プロファイル結果

それぞれのコードは、[ここで実際に皆さんのブラウザで試していただくことが出来ます](https://dynamic-wasm.vercel.app/)。私の環境で実行した結果はこのようになりました。なお実行はすべて Worker で行われており、また一度実行が終わった後にページリロードして再度実行した時の結果を表示しております。あまり正確な計測ではなく、正しく最適化されていない可能性があるであろうことをご容赦ください。

|         プログラム          |   Chrome   | Mobile Chrome |  Firefox   |   Safari   | Mobile Safari |
|---------------------------|------------|---------------|------------|------------|---------------|
|1. js-simple               |172.057 sec.|367.725 sec.   |147.361 sec.|117.136 sec.|89.155 sec.    |
|2. js-jit                  |40.963 sec. |283.213 sec.   |47.105 sec. |4.698 sec.  |4.441 sec.     |
|3. js-jit-multi-functions  |9.988 sec.  |17.982 sec.    |17.002 sec. |6.79 sec.   |7.134 sec.     |
|4. wasm-simple             |61.784 sec. |300.845 sec.   |79.478 sec. |44.982 sec. |50.959 sec.    |
|5. wasm-jit                |4.474 sec.  |10.04 sec.     |2.489 sec.  |75.996 sec. |61.432 sec.    |
|6. wasm-jit-multi-functions|3.286 sec.  |9.427 sec.     |3.93 sec.   |2.725 sec.  |2.126 sec.     |

以下では、それぞれのプログラム実装について詳細を説明していきます。

## 1. JavaScript simple implementation（js-simple）

[ソースコード](https://github.com/tkihira/dynamic-wasm/blob/main/js-simple.js) / [実行結果](https://dynamic-wasm.vercel.app/js-simple.html)

このプログラムは、JavaScript で BF の文字を 1 文字ずつパースし実行していく、一番シンプルな実装です。対応する括弧のジャンプも、そのたびに愚直に計算して求めています。

一切最適化を施していないため、実行結果はその他のプログラムに比べて一番遅くなっており、<span style="color:blue">各プラットフォームで最も速い結果に比べて 30 倍〜50 倍ほど遅くなっています</span>。

## 2. JavaScript just-in-time implementation: single function (js-jit)

[ソースコード](https://github.com/tkihira/dynamic-wasm/blob/main/js-jit.js) / [実行結果](https://dynamic-wasm.vercel.app/js-jit.html)

このプログラムは、BF の各記号に対応する JavaScript を直接文字列として追記し、それを `new Function()` で関数化させています。無駄な whlie 文のコストを減らすのみならず、ブラウザの JavaScript の最適化の恩恵をそのまま受けられるなど数多くのメリットが受けられます。[以前のブログで紹介した方法](http://nmi.jp/2020-12-20-Make_VM_faster)もこのやり方です。

ちょっと詳しく解説しましょう。例えば BF で `++++++++[>++++++++<-]>+.` というプログラムがあった場合、

- まず `let pointer = 0;const memory = new Int32Array(30000);` を関数の先頭に置く
- BF コード中の `+` を `memory[pointer]++;` に、`[` を `while (memory[pointer]) {` に、`>` を `pointer++;` に、というようにそれぞれ変換していく
- 最後に `output(null);` を追加する（コードが終了したことを main thread に通知する）

という処理をすることにより、最終的に（少し整形しましたが）

```javascript
let pointer = 0;
const memory = new Int32Array(30000);
memory[pointer]++; memory[pointer]++; memory[pointer]++; memory[pointer]++;
memory[pointer]++; memory[pointer]++; memory[pointer]++; memory[pointer]++;
while (memory[pointer]) {
    pointer++;
    memory[pointer]++; memory[pointer]++; memory[pointer]++; memory[pointer]++;
    memory[pointer]++; memory[pointer]++; memory[pointer]++; memory[pointer]++;
    pointer--;
}
pointer++;
memory[pointer]++;
output(memory[pointer]);
output(null);
```

という文字列を作り出します。これを `new Function()` で関数化して実行することで、BF のコードが実行される仕組みです。

この方法は、シンプルな方法に比べると、数倍程度の大幅な高速化が期待出来ます（Mobile Chrome でも影響が小さいながらもしっかり効果は出ています）。特に Safari の場合は、巨大な関数でも問題なく最適化が適用されたようで、30 倍〜50 倍ほどの高速化が達成出来ました。

## 3. JavaScript just-in-time implementation: multiple functions (js-jit-multi-functions)

[ソースコード](https://github.com/tkihira/dynamic-wasm/blob/main/js-jit-multi-functions.js) / [実行結果](https://dynamic-wasm.vercel.app/js-jit-multi-functions.html)

このプログラムは、BF の各記号に対応する JavaScript を直接文字列として追記し、それを `new Function()` で関数化させているところまでは js-jit と同じなのですが、『`[`』と『`]`』が登場するたびに、その中身を別関数に分離して出力しています。今回のマンデルブロ集合のプログラムには 686 個の 『`[`』が存在するため、結果として 686 個 + 2 個（ベース関数）の計 688 個の関数に分割しています。

js-jit の場合は 129,014 byte もの巨大な単一関数であったのを複数の関数に分割したことで、ブラウザの JavaScript 最適化が効きやすくなっています。Safari の場合は単一関数で十分に最適化が効いていたので遅くなっていますが、Chrome においては js-jit に比べても 5 倍〜15 倍ほどの顕著な速度差が出ています。


## 4. WebAssembly simple implementation (wasm-simple)

[ソースコード](https://github.com/tkihira/dynamic-wasm/blob/main/wasm-simple.wat) / [実行結果](https://dynamic-wasm.vercel.app/wasm-simple.html)

このプログラムは、WebAssembly で BF の文字を 1 文字ずつパースし実行する実装で、js-simple とほぼ同じ構造を意識した wasm 移植です。wat と呼ばれる wasm のテキストフォーマットで記述し、[wabt の wat2wasm](https://github.com/WebAssembly/wabt) で wasm 化しています。いわばアセンブリ言語を直書きしているようなもので、正直この規模のプログラムでも結構きつかったです。人の手で書くものではないですね。

どのプラットフォームにおいても、<span style="color:blue">JavaScript の同様の実装（js-simple）と比べると 2 〜 3 倍程度速くなっています</span>（Mobiel Chrome を除く）が、一方で<span style="color:blue">工夫された JavaScript の実装（js-jit）よりは遅い</span>ことが読み取れます。今回の例は WebAssembly に有利なサンプルではありますが、<span style="color:red">JavaScript を単純に wasm に移植するだけでも数倍程度の高速化が期待出来る</span>かもしれません。

## 5. WebAssembly just-in-time implementation: single function (wasm-jit)

[ソースコード](https://github.com/tkihira/dynamic-wasm/blob/main/wasm-jit.js) / [実行結果](https://dynamic-wasm.vercel.app/wasm-jit.html)

このプログラムは、BF の各記号に対応する WebAssembly を直接<span style="color:blue">バイナリ</span>として生成し、それを `WebAssembly.instantiate()` で関数化させています。生成される関数は、1 つの巨大な wasm 関数になります。js-jit を純粋に WebAssembly に適用したものになります。まさか 2022 年にもなってハンドアセンブルすることになるとは思わず、新鮮な体験が出来ました。もしあなたが似たようなことをやりたいと思うならば、[binaryen.js](https://github.com/AssemblyScript/binaryen.js/) などを使うことを強くオススメします。

このプログラムの結果は、Chrome と Firefox では（Mobile Chrome を含めて）爆速であったのに引き換え、<span style="color:blue">Safari では単純な実装よりもむしろ大幅に遅くなってしまっています</span>。この結果から、Safari では最適化が効いていないであろうことが推測されます。この実装で出力される単一関数の Function Body は 88,566 bytes あり、これが最適化を阻害していることが予想されたため、別の実装を用意して比較してみました。

## 6. WebAssembly just-in-time implementation: multiple functions (wasm-jit-multi-functions)

[ソースコード](https://github.com/tkihira/dynamic-wasm/blob/main/wasm-jit-multi-functions.js) / [実行結果](https://dynamic-wasm.vercel.app/wasm-jit-multi-functions.html)

このプログラムは、BF の各記号に対応する WebAssembly を直接<span style="color:blue">バイナリ</span>として生成し、それを `WebAssembly.instantiate()` で関数化させている所までは wasm-jit と同じなのですが、『`[`』と『`]`』が登場するたびに、その中身を別関数に分離して出力しています。今回のマンデルブロ集合のプログラムには 686 個の 『`[`』が存在するため、結果として 686 個 + 2 個（ベース関数）の計 688 個の関数に分割しています。これもハンドアセンブルしましたが、このソースコードには各バイトがどういう意味を持つのかコメントをしっかり書いたので、wasm のバイナリ形式に興味のある方は是非目を通してみてください。

このプログラムは、<span style="color:red">ほぼすべてのプラットフォームにおいて最速の結果を達成しました</span>。wasm-jit で非常に遅かった Safari でもしっかり最適化が効いて爆速になっていることが確認出来ます。Firefox においては wasm-jit の段階で最適化が完全に適用されていたために遅くなりましたが、それでも他の実装に比べれば圧倒的なスピードを達成しています。

# 知見・ノウハウ

今回の wasm 動的生成で得られた知見やノウハウについて共有します。

## WebAssembly は、純粋な計算能力では JavaScript の数倍速い

WebAssembly を単純に導入するだけでも、それぞれ数倍程度の効果が上がっていることが確認出来ます。JavaScript で重い計算処理に WebAssembly を導入するのは、実行速度だけに注目すれば失敗しない可能性が高いでしょう。

## 最適化のかかり方によって結果は大きく異なる

今回のように JavaScript や WebAssembly のコードを自動生成するときには、出力されるコードは一般的なコードの特性と大きく違うことが多く、今回のように最適化がうまく適用されないことが多いです。自動生成の出力コードが普段我々が書くコードに近づくように意識すると良いかもしれません。自動生成された巨大な単一関数を複数の関数に分割するテクニックは、今回に限らず様々なトラブルで効果の期待できるテクニックですので、コードの自動生成で問題に直面した時のために記憶の片隅に置いておくと良いでしょう。

## WebAssembly の最適化は少し予測しづらい

JavaScript においてどのようなコードに最適化がかかりやすいかについてはある程度の勘所を持っている方も多いと思いますが、WebAssembly における最適化の勘所は中々難しそうだという認識を持っています（ここでいう最適化は WebAssembly のバイトコード自体にかかる最適化の話であり、その前のコンパイラのフロントエンド・バックエンドで入る最適化とは別の話であることにご注意ください）。Chrome や Safari といったプラットフォームによって最適化の傾向は大きく異なるので、その点もご注意ください。

## WebAssembly の実行は、Chrome において DevTools を開くだけで遅くなる

Chrome において、DevTools をただ開くと wasm の実行が極めて遅くなる現象が確認されております。これは[バグではなくて仕様](https://v8.dev/docs/wasm-compilation-pipeline#debugging)なのですが、結構複雑な仕様で、

- DevTools を開くと TurboFan の最適化がキャンセルされて遅くなる
- しかし Profile タブで Profile を取るときには再度 TurboFan の最適化が適用される

という挙動になっております。<span style="color:red">Chrome では、ただ DevTools を開いているだけで wasm の実行がかなり遅くなります。大変気づきにくいトリガーなので、wasm 系の開発をされる時にはお気をつけください</span>。

## Safari において Worker の GC 判定にバグがあり、たまに突然止まる

これは WebAssembly の話ではないのですが、今回の実装中に再現方法を見つけたバグであることと、今まで WebAssembly を利用しているときに頻繁に遭遇したバグであるということもあり、ここでも共有します。

現行の Safari では、Worker それ自体が起動し handler が設定されていたとしても、Worker の参照が root から辿れない場合には GC されてしまうバグがあります。実際に[こちらのページから試していただけます](https://dynamic-wasm-6128yfdg3-tkihira.vercel.app/worker-stall.html)が、PC もしくは iOS の Safari（15 以前）でアクセスすると一部の Worker が高確率で止まることが確認できるかと思います。タイミングバグでもあるので、発生しないこともあるかもしれません。

Worker がいきなり止まってしまうバグに遭遇された方は、とりあえずは window.worker みたいなプロパティに代入することで回避出来るかと思います。既に [WebKit の Bugzilla に報告しております](https://bugs.webkit.org/show_bug.cgi?id=240062)ので近々修正されると思いますが、現状で困っている方はこの workaround をご利用ください。

# まとめ

今回のような JavaScript / WebAssembly の動的生成技術は、言語のランタイムを JavaScript で実装する方にとっては有用な情報になり得ます。今回は触れませんでしたが、動的に生成する際にさらなる最適化が可能であることも多く（今回の場合は、例えば複数の記号をまとめるとか、`[-]` のような典型的な処理を専用出力に置換するとか（これらは既に最適化が十分効いているために実は効果が薄いのですが））、動的なコード生成は可能性の広い技術です。私も以前 Flash Player Runtime を JavaScript 上で実装した時に、この動的生成を利用することによって大幅な高速化を実現しました。今でも例えばゲーム等のスクリプトの高速処理などには、かなりの応用が出来るのではないかと思います。

WebAssembly は、ブラウザの API の中でも WebGL と並ぶ低レイヤーな技術であり、その適用範囲はまだまだ開拓しつくされたとは言い難いでしょう。皆さんも、是非とも色々なアイデアを wasm のバイナリに落とし込んで楽しんでみてください。

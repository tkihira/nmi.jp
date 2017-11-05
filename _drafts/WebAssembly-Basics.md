---
layout: post
title: WebAssembly の基礎
categories:
- HTML5
- JavaScript
- Emscripten
---

[WebAssembly](http://webassembly.org/) をご存知でしょうか？2年前に突然発表された新しい仕様です。まだ登場して間もないため、実際に本格的に利用しているサービスは数えるほどしかありませんが、Twitter 等を見ているとじわりじわりと評判になっており、技術としての勢いを感じます。

一方で、WebAssembly について言及された資料がまだまだ少なかったり、技術のレイヤーが一般的なフロントエンドエンジニアの技術セットとは大きくかけ離れているなどの理由により、WebAssembly について誤解されていることも多々あることを感じました。

そこで今回、あまり技術的に詳細な所まで深入りせず、「専門外の方でもこの程度知っておけば良い」よりちょっと詳しいくらいの内容を目標にして WebAssembly を解説してみたいと思います。



----

# WebAssembly とは

WebAssembly（wasmとも呼ばれます）とは、ざっくり言うと<span style="color:blue;font-weight:bold">ブラウザでプログラムを高速に動かすための規格</span>です。JavaScript で出来ることが複雑化してくるに従い、JavaScript の実行スピードの遅さが課題になることが増えてきました。WebAssembly はその課題の解決を目的にしています。

過去にも、実行スピードの改善を目的として ActiveX や Dart、PNaCl など色々な規格があったのですが、WebAssembly は<span style="color:red">主要なブラウザベンダーの合意のもと作成された仕様</span>であるのが特徴です。先月 Edge がデフォルトで動作するようになったので、現在はモバイルブラウザを含めた[ほとんど全てのブラウザで動作をします](http://caniuse.com/#feat=wasm)（ただしIEは除く）。

WebAssembly はバイナリ表現なので、プログラムのファイルサイズは JavaScript よりも小さく、読み込み（パース）にかかる時間も短いことが期待されます。また、あらかじめ高速に動作することを念頭に仕様が考えられているので、JavaScript よりは断然速く、ネイティブアプリの速度と比較しても遜色ない動作速度が期待されます。現在のところ大体ネイティブアプリの 60% 〜 80% くらいの速度ですが、[将来的には 90% 程度まで高速化することを目標にしている](https://www.youtube.com/watch?v=6v4E6oksar0)ようです。

まとめると、WebAssembly は

- 軽量（サイズが小さい）
- 高速起動（パース時間が短い）
- 高速動作（実行速度が速い）

という特徴を持っています。

----

# WebAssembly の内部動作

さて、WebAssembly はブラウザ内部でどのように動いているのでしょうか。

WebAssembly のバイナリファイルは、<span style="font-weight:bold">.wasm</span> という拡張子で用意されることが多いです。HTML ファイル側では、JavaScript で wasm ファイルをダウンロードし、そこから WebAssembly の関数を取り出して呼び出す、というのが基本になります。

実際のプログラムで具体的に説明しましょう。大変シンプルな WebAssembly のサンプルを用意しました。よくある足し算をするサンプルです。

[https://github.com/tkihira/wasm-simple-sample](https://github.com/tkihira/wasm-simple-sample)

HTML ファイルと wasm ファイルのみのシンプルな構成です。HTML の内容は次の通りです。<span style="color:#ccc">arrow functions を使っていないのは、WebAssembly よりも arrow functions のサポート時期が後のブラウザがあるためです。。。読みづらくてすみません。</span>

```html
<html><head><title>WebAssembly Simple Sample</title>
<script>
fetch("./simple.wasm").then(function(response) {
    return response.arrayBuffer();
}).then(function(bytes) {
    return WebAssembly.compile(bytes);
}).then(function(module) {
    return WebAssembly.instantiate(module);
}).then(function(instance) {
    console.log(instance.exports.add(7, 4));
});
</script>
</head><body></body></html>
```

上から見てみましょう。まずサーバから `simple.wasm` という、足し算をする `add` 関数を含んだ WebAssembly のバイナリファイルをダウンロードします。ダウンロードが終わったら、そのバイトコードを引数に `WebAssembly.compile` を呼びます。

勘違いをしている方が多いのですが、<span style="color:red">WebAssembly (wasm ファイル) 自体は機械語ではありません</span>。一般的にはアセンブリ言語＝機械語であることがほとんどなのですが、WebAssembly では<span style="color:red">バイナリファイルを再度ブラウザ内部でコンパイルする必要があります</span>。

WebAssembly は対応ブラウザが動く全てのコンピュータで動くことを期待されますが、コンピュータのアーキテクチャは様々です。Windows や Mac のように Intel プロセッサを使っているコンピュータもあれば、iPhone などの ARM プロセッサを使っているコンピュータもあります。全てのプロセッサに対応したバイナリを用意するのは非現実的ですので、<span style="color:red">wasm ファイルを受け取ったブラウザ側で改めてコンパイルをする</span>設計になっているのです。小さなプログラムだとコンパイルは一瞬です。大きなプログラムはコンパイルに時間がかかりますが、それでも同等の JavaScript よりも高速に起動することがほとんどです。

コンパイルが終わると、`Module` と呼ばれるコンパイル済コードが返されます。今はまだ Firefox しか対応していないのですが、仕様上このコンパイル済コードを IndexedDB などに保存することが出来ます。各ブラウザがこの仕様に対応すれば、重いコンパイルであっても初回だけですみます。

その `Module` を引数に指定して `WebAssembly.instantiate` を呼ぶと、実際に実行可能な関数を受け取ることが出来ます。あらかじめ wasm ファイルの中で export を指定していた `add` 関数を呼び、最終的に WebAssembly を使って `7 + 4` の足し算をすることが出来ます。

なお、`WebAssembly.instantiate` は `Module` ではなくバイトコードを引数に呼ぶことも出来て、その場合は内部で勝手にコンパイルしてくれますが、今回は説明のためにわざと `WebAssembly.compile` を呼んでみました。

----

# WebAssembly で何が出来るのか

WebAssembly が登場した時は、「<span style="color:blue;font-weight:bold">今後フロントエンドはすべてWebAssemblyでかける！JavaScriptは将来なくなる！</span>」という意見もちらほら見かけましたが、WebAssembly 自体はそこまで劇的な解決策ではありません。出来ることは限定的です。

WebAssembly のデモは大体かっこいいゲームや綺麗なフラクタル図形であることがほとんどなので誤解されがちなのですが、大前提として <span style="color:red">WebAssembly は計算することしか出来ません</span>。WebAssembly の機能として、画面に何かを描画したり、音楽を鳴らしたり、カメラを起動したりすることは出来ません。C 言語の `stdio.h` 程度の機能すらありません。

一方で、WebAssembly からは JavaScript の関数を呼び出すことが出来ます。たとえば DOM の操作をしたり WebGL で何かを描画したい場合は、WebAssembly のコードから JavaScript の関数を呼ぶことで実現出来ます。

また、WebAssembly と JavaScript の両方から参照出来て、両方から書き換えることの出来るメモリ空間を用意することが出来ます。例えば動画のエンコーディングやフィルター等でリアルタイムの処理を行いたい場合は、このメモリを通してお互いにデータのやり取りを行うことが出来ます。

WebAssembly の立ち位置としては、JavaScript と相性の良いプラグインみたいなものです。JavaApplet や Flash のように完全にブラウザの管理から独立することなく、ブラウザ内部で JavaScript と頻繁に通信をすることが出来るプラグイン、という感じです。

そういうわけで、JavaScript あっての WebAssembly であり、基本的に <span style="color:red">JavaScript なしで全て WebAssembly で完結させることは出来ません</span>。<span style="color:red">JavaScript で出来なかったことが WebAssembly で出来るようになることもありません</span>（ただ計算能力に関しては例外で、記事執筆時点では WebAssembly でなければ 64bit の整数を扱えませんし、将来的にも SIMD は WebAssembly でのみ使用可能になりそうです）。

----

# WebAssembly を実際に使うには

最後に、WebAssembly を実際に使うやり方を簡単にご紹介します。wasm ファイル自体は `wast` と呼ばれるテキストフォーマットからアセンブルして生成することが出来るのですが、基本的に wasm も wast も人間が手で書くものではありません。他の言語からコンパイルすることがほとんどです。

一番有名かつ簡単なのは、[Emscripten](http://kripken.github.io/emscripten-site/) を利用することです。Emscripten を利用すると C/C++ から wasm を出力することが出来ます。Emscripten は言語仕様を拡張して JavaScript との通信を非常に簡単にしているので、printf デバッグなどもしやすい印象があります。

他の選択肢としては、Clang を使うやり方、Rust からコンパイルするやり方、また最近発表された [AssemblyScript](https://github.com/AssemblyScript/assemblyscript) といって TypeScript のサブセットからコンパイルするやり方などがあります。この前の [Emscripten Night #5](https://emsn.connpass.com/event/66304/) で [@chikoski](https://twitter.com/chikoski) さんが[わかりやすいまとめ資料](https://speakerdeck.com/chikoski/20171018-wasm)を公開されているので、興味のある方は是非参考にされてみてください。

----

# 最後に

今回の記事で WebAssembly がどのようなものかについての大体の感覚を掴んで頂けたのではないかなと思いますが、いかがでしょうか。

WebAssembly が全てのモダンブラウザで使えるようになったのは、つい先月のことです。残念ながらまだ枯れた技術と言うには程遠く、ブラウザのバグや実装起因のトラブルなどが頻発しております。「WebAssembly って奴が話題みたいだから、うちのシステムを全部入れ替えてみよう！」みたいなチャレンジは、かなり大きなリスクがあることをご承知ください。それに関しては来月、[WebAssembly Advent Calendar 2017](https://qiita.com/advent-calendar/2017/webassembly) で再度書かせてもらおうと思います。

アセンブリ、の言葉からイメージが先行しがちな技術ではありますが、ブラウザアプリにとっては間違いなく革新的な技術です。今までブラウザ側で処理出来なかった重いタスクをクライアントに移譲出来るようになることで、サーバの負担を減らせる可能性もあります。C/C++ などで書かれた過去の資産を、ウェブアプリとして再利用出来る可能性もあります。夢のある技術なので、もし何らかの機会があれば是非触れてみてください。




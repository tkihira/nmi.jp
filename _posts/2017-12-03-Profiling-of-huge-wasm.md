---
layout: post
title: 巨大 WebAssembly ファイルのコンパイル時間
categories:
- HTML5
- JavaScript
- Emscripten
---
[WebAssembly Advent Calendar 2017](https://qiita.com/advent-calendar/2017/webassembly) のネタとして、巨大 WebAssembly のコンパイル時間のプロファイリング結果をご紹介します。



----

[前の記事](/2017-11-06-WebAssembly-Basics)でご紹介した通り、WebAssembly はそのまま実行出来ないので、ダウンロード後に再度コンパイルが必要になりますが、このコンパイル時間が意外と馬鹿にできません。今回は巨大な wasm ファイルのコンパイルにかかる時間を計測してみました。

巨大と言っても、たかが 25Mbyte の .wasm ファイルです。しかし、現在のブラウザではその程度ですらも相当時間がかかります。

計測に使ったスクリプトやファイルは [https://github.com/tkihira/hugewasm](https://github.com/tkihira/hugewasm) ここに入れておきました。


## 計測結果

以下、結果です。計測マシンは MacBook Pro (Retina, 15-inch, Mid 2015) です。

|             | Chrome  | Firefox | Safari  |
|-------------|--------:|--------:|--------:|
|1 func       |18997ms  |Crash    |37895ms  |
|100,000 funcs|23751ms  |8330ms   |4985ms   |
|500,000 funcs|76777ms  |4204ms   |11549ms  |

funcs というのは、wasm 内に何個関数が入っているか、です。1 func の場合は Function body が約 25Mb、100,000 funcs の場合は約 2.5kb、500,000 funcs の場合は約 0.5kb です。

Chrome では 20秒〜1分 ほどかかっています。なおこのコンパイル処理は現在の Chrome の実装だとページをロードする度に必ず発生するので、巨大 WebAssembly が存在するページを Chrome で開いた場合、キャッシュの有無等と関係なく相当待つ必要があります。

Firefox だと、Function Body のサイズによって処理時間が大きく変わります。1 つしか関数がないときはクラッシュしましたが、Function Body が小さくなるにつれて速度が向上しています。例えば Emscripten 等で出力される巨大な WebAssembly の場合、平均的な Function Body はもっと小さいので、Firefox であれば 25Mb のファイルでも 1 秒ほどで起動します。

Safariは、現在の実装だと実際のコンパイル処理を `WebAssembly.instantiate` の処理内で行っているようなので、そこの時間を記載しています。イマイチ何が支配的なのかわかりづらいのですが、何にせよそこそこ時間がかかります。


## 解決策

WebAssembly の仕様として `WebAssembly.Module` のインスタンスを IndexedDB に保存出来ることになっています。この仕様が実装されると、初回のコンパイルは必要ですが、二度目以降の起動時はキャッシュしたコンパイル結果を利用して起動することができます。

現在のところ、この仕様に対応しているブラウザは Firefox のみです。他のブラウザベンダーが精力的に実装してくれることを願うのみです。

数十 Mb の WebAssembly ファイルなんてのは、Unity などのゲームエンジンなどで普通に出力されるのですが、現在のブラウザだと起動までに大変時間がかかってしまい、Web ならではの「タップしてすぐに起動」という世界には遠いのが現状です。



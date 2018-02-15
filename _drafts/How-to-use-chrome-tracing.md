---
layout: post
title: chrome://tracing (about:tracing) の使い方
categories:
- JavaScript
---

こんにちは。仕事上で <span style="font-weight:bold">chrome://tracing (about:tracing)</span> を使う必要が出たので、私の知っている限りの情報をここでまとめることにしました。

chrome://tracing の情報は世の中にあまりありません。もし記事中に間違いを見つけられたり、より良い利用方法をご存知の方は、ぜひ [@tkihira](https://twitter.com/tkihira) まで教えてください。よろしくお願いします！

なお公式の情報は [https://www.chromium.org/developers/how-tos/trace-event-profiling-tool](https://www.chromium.org/developers/how-tos/trace-event-profiling-tool) ここから辿れると思います。



# どんな時に使うのか

Chrome には、皆さんご存知 DevTools があります。大変高機能で、Web の開発において頻繁に利用します。私が一番使うのは Console ですが、他にもネットワークのログを見たり、メモリのスナップショットを取ったり、DOMにアクセスして要素を変更したり、色々なことが可能です。

DevTools の中には Performance というタブがあり、ここでプロファイルを取ることが出来ます。瞬間瞬間のCPUの使用率、その時点で呼び出されている関数と消費時間、メモリ使用率、スクリーンショットなどなど、時系列でアプリケーションのいろいろな情報を記録することが出来て、それらの情報は問題の原因を探る上で貴重な手がかりになります。

しかし普通はこれらの情報で十分足りるのですが、巨大な asm.js や WebAssembly などとガッツリ取り組んでいる場合、時たまプロファイルが出力する情報では満足出来なくなることがあります。

例として、[WebAssembly の公式デモ](http://webassembly.org/demo/)のプロファイルを取ってみましょう。Unity から出力されたサンプルゲームのプロファイルです。

![WebAssembly Profiling Result](/img/wasm-profile.png)


私の環境ではダウンロード完了から起動までに10秒ほどかかっているのですが、そこに記録されているのは<span style="color:blue">Run Microtasks</span>という謎の処理です。また、それ以外の何も記録されていない白い部分で相当の時間がかかっており、一体内部でどのような処理を行っているのか（もしくは本当に何もしていないのか）をこのプロファイル結果から伺い知ることは出来ません。

<span style="color:#ccc">（こんなことは普通に開発している限り、滅多にないんですけどね…）</span>

このような場合に、C++ のソースコードレベルで何をしているのかチェックしたい場合に使うのが <span style="font-weight:bold;color:red">chrome://tracing (about:tracing)</span> です。たぶん。

# 使い方

chrome://tracing は、Chrome で動いているすべてのタスクのプロファイルを取ります。関係ないページを沢山開いていると、それらすべてのプロファイルも取ることになります。それは無駄なので、個人的に chrome://tracing を使う時にはそれ専用の Chrome インスタンスを立ち上げています。今回は Chrome Canary を使うことにしました。

まずはアドレスバーに about:tracing （もしくは chrome://tracing ）と打ち込みます。そうすると次の画面が出てきます。

![usage](/img/tracing-usage-0.png)

この画面を見るときは大体切羽詰まっているので、謎の顔文字にイラッとします。ここで左上の Record ボタンを押します。

![usage](/img/tracing-usage-1.png)

とりあえず今回はWebDeveloperを選んでおきましょう。さて、ここで Record を押す前に、別 Window でプロファイル対象の準備をしましょう。

![usage](/img/tracing-usage-2.jpg)

そして、chrome://tracing の Window に戻って、Record ボタンを押して、プロファイルの対象 Window に移動し、今回の場合は Play WebAssembly ボタンを押します。そしてプロファイルしたいところまでの動作が完了したら、Stop ボタンを押してプロファイルを止めます。

![usage](/img/tracing-usage-3.png)

色々と内部で処理が終わったら、プロファイルの結果が表示されます。このプロファイル結果画面は、DevTools みたいに優しくありません。マウスツールを駆使しながら時間軸の拡大縮小を行い、目的の部分を見つけ出す必要があります。大変面倒です。

とりあえずスクロールし、<span style="color:red">Unity WebGL Player</span> と書かれた Renderer を見つけ、そこの CrRendererMain に注目しましょう。

![usage](/img/tracing-usage-4.png)

上手く拡大して対象をダブルクリックすると、次のように具体的になにをやっているのか確認出来ます。

![usage](/img/tracing-usage-5.png)


疲れたのでここまで



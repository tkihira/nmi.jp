---
layout: post
title: Chrome の console.log でハマらないために
categories:
- JavaScript
---

JavaScript を書いたことがある人ならば一度は使うであろう `console.log` ですが、この関数は思ったよりも厄介な性質を持っています。その性質を知らずに `console.log` を使うと、デバッグ時に大ハマリしてしまうことがあります。この記事では `console.log` の落とし穴についてお話します。

今回は Chrome に特化して解説しますが、Firefox や Safari でも同じ落とし穴があります。




# `console.log` とは

まずはさらっと基本をおさらいしましょう。

大前提なのですが、`console.log` は <span style="color:blue">JavaScript の言語仕様（ECMAScript）で定義されていません</span>。ブラウザ向けには [whatwg の仕様](https://console.spec.whatwg.org/)がありますが、あくまでもそれはブラウザ向けの仕様であり、Node.js を含むほぼ全ての JavaScript 環境で使えるのは `console.log` がとても便利なので各環境で用意してくれているおかげです。似たような存在として `setTimeout` があります。

というわけで、`console.log` とは、大抵は<span style="color:red">どこかになにかを出力する関数</span>です。「どこ」に「何」を出力するか、というのは実装によって異なります。今回は Node.js と Chrome を比べて見てみましょう。

## Node.js

まず Node.js の場合ですが、標準出力に引数をそのまま表示します。最も直感に近い挙動であると言えるでしょう。

```
$ node
Welcome to Node.js v18.12.1.
Type ".help" for more information.
> const a = [1, 2, 3]; console.log(a);
[ 1, 2, 3 ]
undefined
> const b = { a: { a: { a: { a: { a: 0 } } } } }; console.log(b);
{ a: { a: { a: [Object] } } }
undefined
>
```

undefined は、最後の statement の値（この場合は console.log の返り値）です。オブジェクト等のネストが深くなると、全部は表示されなくなります。

## Chrome

Chrome は、DevTools の Console に引数の内容を表示します。DevTools は F12 などで呼び出すことが出来ます。

![Chrome DevTools Console](/img/console-log-1.png)

オブジェクト等は、クリックすると開いて中を確認出来るようになります。

# ハマりどころ

さて、ここまで見る限り何の問題もないように思えます。ではどこでハマるのでしょうか？

それは、Chrome において<span style="color:red">表示されている値が信用出来ない</span>点です。そんな馬鹿な、と思われるかも知れません。試してみましょう。まず直感的に理解しやすい Node.js の出力から見てみましょう。

```
$ node
Welcome to Node.js v18.12.1.
Type ".help" for more information.
> const a = [1, 2, 3]; console.log(a); a[1] = 100; console.log(a);
[ 1, 2, 3 ]
[ 1, 100, 3 ]
undefined
>
```

最初の `console.log` が `[1, 2, 3]` を、次の `console.log` が `[1, 100, 3]` を表示しています。問題なさそうですね！ではこれを Chrome で実行してみましょう。

![Chrome DevTools Console](/img/console-log-2.png)

おお、うまく表示されていますね、良かった良かった。では念のために最初の配列の中身を見てみましょうか。

![Chrome DevTools Console](/img/console-log-3.png)

なんと、中身が書き換わっています！

# どうしてこのような挙動になるのか

この挙動は次のように説明出来ます。オブジェクトや配列を `console.log` で表示する時、画面にはとりあえず `console.log` が呼ばれた時点の引数のオブジェクトの中身を確認し、その時の値を表示します。なので、最初に表示されているのは `[1, 2, 3]` になるわけです。

ただし、この時点で DevTools は表示しているオブジェクトのディープコピーを作成しておらず、ただ参照だけを保持していると想像されます。巨大な配列等を含むオブジェクトを `console.log` で表示するのは普通なので、これは理解出来る挙動です。もしディープコピーを作成していたら、`console.log(document);` とかしてしまうと大変なことになるでしょう。

しかし、それ故に、落とし穴が発生してしまいました。改めて配列の中身をチェックしようとしてドロップダウンのアイコンをクリックすると、クリックされた時点で再度参照を確認し、その時点におけるオブジェクトの内容を取得して表示しているのです。なので、最初に `console.log` が呼ばれた時はその時点の内容である `[1, 2, 3]` が表示され、ドロップダウンのアイコンがクリックされた時はその時点の内容である `[1, 100, 3]` が表示されました。

なので次のようなコードを実行すると、ドロップダウンをクリックするまで何が表示されるかわかりません。

```javascript
let a = {v: 0};
(function tick() {
    setTimeout(tick, 10);
    a.v++;
})();
console.log(a);
```

重要なポイントとして、リアルタイムで追随しているわけではない点に留意してください。上記コードを実行しても、DevTools のコンソールの値はオブジェクトの値をリアルタイムに反映しません。またドロップダウンを一度閉じて再度開いても、過去に開いた時にキャッシュした内容を表示しているようです。

また当然ながら、整数型や文字列型は参照ではなく値が表示されるので `console.log` で表示された値が変わることはありません。

余談ですが、昔のバージョンの Chrome では DevTools 上に表示されたオブジェクトにおける変更がリアルタイムに表示されていたこともありました。その仕様は値をコピーしようとした時などに結構不便だったので、個人的には今の仕様の方が好みではあります。

# さらなる落とし穴・メモリリーク

上記を理解すると、実行時に変更されうるオブジェクトや配列を `console.log` で表示する際に気をつけよう、という結論になると思います。基本的にはそれで良いのですが、<span style="color:blue">実はもう一段深い落とし穴</span>があるので、そちらも紹介させてください。

上記の仮説が正しければ、DevTools のコンソールは表示しているオブジェクトへの参照を持っていることになります。そして、参照を持っているということは、<span color="red">Chrome のコンソールに表示されているオブジェクトはガベージコレクションの対象になりません</span>。DevTools を開いている限り、そのオブジェクトは開放されないことになります（閉じると開放されます）。

これは、DevTools を使ってメモリリークの調査をしている時に、とんでもない落とし穴になります。どれだけ修正してもメモリリークが消えない・・・という時は、もしかしたらコンソールに出しているデバッグ用のメッセージが参照を握っているせいかもしれません。もしその状況に陥ったら、その `console.log` の出力を消さない限り、メモリリークの調査をしようとして DevTools を開いた時だけ発生し、DevTools を閉じている時には発生しないメモリリークになってしまいます。

私は過去にこれで何時間もロスしました・・・。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">結局、メモリリークの全ての原因は、デバッグ用に新規インスタンス生成時に毎回表示していた console.log(&quot;mainObject:&quot;, mainObject); だった。weak mapsもしくはconsole.logのスナップショット化を頼みたいところだ</p>&mdash; Takuo Kihira (@tkihira) <a href="https://twitter.com/tkihira/status/237759589058240512?ref_src=twsrc%5Etfw">August 21, 2012</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

なお、Chrome における `console.log` の挙動はバージョンによって変わってくることもあるので、今ここに書いてあることが将来的にもずっと正しい訳ではありません。その点はご留意ください。

# どうすればいいのか

まずは、ブラウザのコンソールはこのような挙動であることをしっかり理解しましょう。

その上でログとして出力したい場合には、参照ではなくて値で渡される数値なり文字列なりに変換する、もしくはオブジェクトのディープコーピーを作成して表示するのが望ましいでしょう。[MDN では、このような手法が紹介されています](https://developer.mozilla.org/en-US/docs/Web/API/Console/log#logging_objects)。

```javascript
console.log(JSON.parse(JSON.stringify(obj)))
```

ただしこの方法は、関数等の JSON 化出来ないオブジェクトであったり、循環参照が含まれていたりして `JSON.stringify` が利用できない場合は利用できません。ご注意ください。

# 余談その1: whatwg の仕様を確認

一番最初に書いた通り、そもそも `console.log` は ECMAScript の言語仕様にありません。（私の記憶が正しければ）Firebug が最初に実装し、その後各実装が勝手に作っていた記憶があります。少なくとも IE6 の時代には `console.log` などという便利な命令はなく、開発者は自前でコンソール用の DIV や TEXTAREA を用意して、そこにデバッグログを表示していました。

[whatwg で策定されている console.log の仕様があります](https://console.spec.whatwg.org/)。ただあまり有用なことは書かれておりません。「ああ、やっぱり実装依存だったんだなぁ」と確認する程度の役には立ちます。

```
2.3. Printer(logLevel, args[, options])
The printer operation is implementation-defined. 
```

[Node.js の実装](https://console.spec.whatwg.org/#nodejs-printer)が参考に書かれいるくらいが見どころでしょうか。

# 余談その2: ブラウザ `console.log` の装飾機能

ブラウザ `console.log` は、表示文字列に `%c` を埋め込み、対応する CSS を引数を与えることによって、DevTools のコンソールに表示される文字に装飾を加えることが出来ます。例えば、

```javascript
console.log("%cHello, %cWorld!", "color:red; font-weight: bold; font-size: 100px", "color:blue; font-weight: bold; font-size: 100px");
```

という風に書くと、次のように表示されます。

![Console Log DevTools](/img/console-log-4.png)

私はこれを利用して、スマートニュースの英語版のページにロゴを仕込みました。<span style="red">わずか 1554 byte でスマートニュースのロゴを表示しております</span>。色情報をハフマン符号化で圧縮しつつ、Base64 にランレングスも駆使してコードゴルフした自信作です。

![Console Log DevTools](/img/console-log-5.png)

[https://www.smartnews.com/en/](https://www.smartnews.com/en/)

ぜひ上記ページに行ってコンソールを開いてみてください。

余談の余談ですが、以前はこの機能を利用するとサーバ上の画像を表示出来たので、サーバ側でのアクセスログを見ることで DevTools のコンソールが開かれたことを検知出来ました。ぱっと試した感じだと、今は出来なくなってしまっているようですね。

# 余談その3: `console.log` のちょっと便利な小技

ブラウザ上などのデバッグで

```javascript
let x = 100, y = "str";
console.log(`x = ${x}, y = ${y}`);
```

みたいなログを書いている方に朗報です。

```javascript
let x = 100, y = "str";
console.log({x, y})
```

と書くと、こんな感じで表示されて超見やすいです。便利！！！

![Console Log DevTools](/img/console-log-6.png)

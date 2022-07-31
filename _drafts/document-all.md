---
layout: post
title: document.all の例外仕様を知っていますか
categories:
- JavaScript
---

昨日、ツイッターで次のような JavaScript クイズを出しました。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">久しぶりの JavaScript クイズ！<br><br>function hello(x) {<br> if(typeof x === &#39;undefined&#39;) {<br> alert(x.f());<br> }<br>}<br><br>この hello 関数で &quot;Hello, World!&quot; のアラートを表示させることが出来るか？</p>&mdash; Takuo Kihira (@tkihira) <a href="https://twitter.com/tkihira/status/1553597895244681217?ref_src=twsrc%5Etfw">July 31, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

このブログ記事では、この問題について解説します。




# 解答

答えは「出来る」です。出題者の意図としては `document.all` を想定しておりました。

`document.all` は、ブラウザに存在する、非常に特殊なオブジェクトです。

- `document.all` 自体は object 型である。`console.log(document.all)` とすると内容が確認出来る
- boolean 型に変換すると false になる。 `console.log(!!document.all)` は false になる
- null や undefined との `==` による比較は true になる。 `===` による比較は false になる
- `typeof document.all === 'undefined'` となる

JavaScript において、このようなオブジェクトはブラウザの `document.all` しかありません。よって、この `document.all` の特性を利用することで、alert を表示させることが出来ます。

```javascript
function hello(x) {
    if(typeof x === 'undefined') {
        alert(x.f());
    }
}

document.all.f = () => "Hello, World!";
hello(document.all);
```

なお [@kazuho](https://twitter.com/kazuho) さんに指摘された、<span style="color:red">原理上は Node.js でも可能な別解があります</span>。この記事の最後で紹介します。

# `document.all` の歴史

なぜこのような謎な振る舞いをする例外が発生してしまったのでしょうか。少し `document.all` にまつわる歴史を追ってみましょう。

`document.all` は、Internet Explorer(IE) 時代の遺物です。私の記憶が正しければ、IE 4 で導入されたプロパティで、id を付与した DOM への参照を all のプロパティアクセスによって得ることが出来ました。現代でいう `document.getElementById` の機能です。そして、これは IE の独自機能であり、当時ライバルであった Netscape Navigator(NN) は当然のごとくサポートしておりませんでした（確か NN には `document.layers` みたいなものがあったはず）。

それだけの話であれば良かったのですが、当時はブラウザ間の互換性などほどんどなく、我々プログラマーは IE と NN の両方で動くコードを書くのはほぼ不可能なレベルでした。そこで、JavaScript の中でブラウザを判断し、そのブラウザ用の処理を別々に書くことになります。正しくは `navigator.userAgent` を判断しなければいけないのですが、皆様ご存知の通り UserAgent の判断は非常にめんどくさいです。そこで手っ取り早く IE を判断するために、多くの人が「 `document.all` があれば IE」というようなコードを書いてしまったのです。

ブラウザ戦争は紆余曲折がありましたが、結果的に IE が絶大なシェアを持つことになりました。しかしそんな中でも新しいブラウザは登場しており、Opera や Firefox、それに Chrome などの今でも使われているブラウザが登場します。これらの新しいブラウザでは、Web の標準化を推し進め、それに準拠する形で機能が拡張されていきます。しかし新しいブラウザでも、その時に一番シェアを持っていた IE 用に作られたページはなるべく表示したいのです。

ブラウザの判別などせず `document.all` があるのが当たり前、という IE 前提な Web ページもきちんと表示出来るように、それらのブラウザでは `document.all` が実装されました。一方で `document.all` を利用して IE であるかどうかを判断しているコードでは「IE ではない」と伝えたいので、ただ `document.all` の存在をチェックしている場合に限っては「存在しない」という値を返すようになったのです。

IE は独自路線を走り、過去の互換性も保ちつつ、かつ Web の標準化も取り入れる、という戦略を取ることになり、結果としてその戦略を維持し続けることはできなくなってしまいました。しかし IE 用に作られた Web ページはまだたくさん残っており、Web 標準化の都合によって表示出来なくする判断をするには影響が大きすぎると判断されました。そんな経緯によって、この摩訶不思議な `document.all` の振る舞いがモダン・ブラウザでも残ってしまっているのです。

# `document.all` の仕様

この摩訶不思議な振る舞いは、きちんと仕様にも書かれております。

WHATWG の HTML Standard の仕様では、 `2.6.2.1 The HTMLAllCollection interface` の章に書かれています。

[https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#the-htmlallcollection-interface:dom-document-all](https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#the-htmlallcollection-interface:dom-document-all)

ECMAScript の仕様でも特別扱いされています。 `B.3.6 The [[IsHTMLDDA]] Internal Slot` の章です。

[https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot](https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot)

> implementations should not create any with the exception of document.all.

と、しっかり「document.all 以外に `[[IsHTMLDDA]]` を使うんじゃねぇぞ」と釘がさされています。DDA は document dot all の略で、 `document.all` 以外の例外を許さないという強い決意が名前からも伝わるようです。

ECMAScript の仕様に `document.all` の例外を追記するかどうかについてはひと悶着あったそうですが、私は詳しく調べていないので今回は言及しません。何にせよ、標準化の皆様の苦渋の決断があったことは間違いないでしょう。いつも本当にありがとうございます。

# Web を壊さない、という信念

よく "Don't break the web." という形で表現されるのですが、Web の標準化においては「既存のコンテンツに対する影響をなるべく小さくする」という前提が共有されています。今まで普通に見られていた Web ページが、標準化の変更によって突如壊れてしまうという可能性をなるべく小さくしよう、という考え方です。 `document.all` 周りの仕様はまさにこの考え方によって生まれてしまったものでしょう。

Python で顕著でしたが、メジャーバージョンが上がると過去の大抵のスクリプトは動かなくなります、というような変更は Web では出来ません。サーバサイドであれば、移植が終わるまでの間は Python 2 系列の環境を維持しておく、というような運用が可能なのですが、ブラウザの場合はユーザーがそれぞれ独自の環境でコンテンツにアクセスすることをコントロール出来ないので、破壊的な変更を行うことが出来ないのです。これはデメリットでもあるし、メリットでもあります。 `document.all` のような過去の遺物を切り捨てることが出来ない一方で、一度動いたプログラムは比較的長い間動き続ける事が期待できます。

また、あくまで「なるべく影響を小さくする」であって、絶対に互換性を維持しているわけではありません。例えば ECMAScript 3 では `undefined` への代入が可能だったのですが、 ECMAScript 5 で `undefined` は Read Only Property になりました。undefined に何らかの値を代入していたプログラムは動かなくなりますが、そんなプログラムは世の中にほとんどないので、影響は軽微と判断して変更が導入されました。どうせなら `undefined` を `null` と同じようにリテラルにしてほしいところでありますが、おそらくそれは影響が大きいので入れることが出来ないのでしょう。

どの程度のユーザーが影響を受けるのか、というのは Chrome などのブラウザで定常的に統計を取っており、そのデータが標準化での議論で活かされています。もし興味があれば標準化関連のディスカッションを覗いてみてください。

# 余談: kazuho さんに貰った別解

[@kazuho](https://twitter.com/kazuho/) さんから、別解として次のような解答をもらいました（一部変更しています）

```javascript
var origAlert = alert;
Object.defineProperty(window, "alert", {
  get: function () { origAlert("Hello, World!"); }
});

function hello(x) {
    if(typeof x === 'undefined') {
        alert(x.f());
    }
}
hello();
```

面白いです。`alert` がグローバルオブジェクトのプロパティであることを利用して、window の getter を使って<span style="color:red">関数の引数が評価される前に alert を呼び出す</span>という力技です。当然ながら、alert を表示した後に `x.f()` で TypeError が出てしまいますが、題意である「アラートを表示させることが出来るか」に関しては完璧に満たしています。

これなら、globalThis などを使えば Node.js でも動きますね（alert が存在しないけど）。満点です・・・

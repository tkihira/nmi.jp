---
layout: post
title: JavaScript の宇宙が、仕様書を元にどのようにパースされているのか
categories:
- JavaScript
---

始まりは、次の Tweet からでした。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">JavaScriptの勉強をちょっと進めて、宇宙を感じました😄<br><br>{ } + [ ] で 0 が出力され<br>[ ] + { } で &quot;[object Object]&quot; が出力されますが<br>それらを === で比較すると true で厳密に等しいです。 <a href="https://t.co/GT0tcCumO7">pic.twitter.com/GT0tcCumO7</a></p>&mdash; Lillian (@Lily0727K) <a href="https://twitter.com/Lily0727K/status/1195344555438002176?ref_src=twsrc%5Etfw">November 15, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

これ、追ってみると意外と深くて大変おもしろい題材だったので、ブログで解説を書こうと思います。



# ECMAScript とは

JavaScript は、正式には ECMAScript と呼ばれる仕様に基づいた言語です。なので JavaScript の挙動で疑問を感じたら、ECMAScript の仕様書を読むのが一番正確です。

とはいえ、「仕様書」と聞いただけで嫌悪感が出る人も多いでしょう。仕様書は基本的に人に読みやすく書くよりも正確性が要求されるので、慣れていない人が読もうとすると拒否反応が出てしまう気持ちはわかります。

しかし、仕様を理解することは、その言語の理解そのものと言っても良いです。理解出来るに越したことはありません。そしてなにより、ECMAScript の仕様書は、他の言語に比べてかなり読みやすいという印象を持っています。仕様書を読む入門に ECMAScript を選ぶのは結構オススメです。

というわけで、この記事では実際にどの仕様に基づいて上記の謎挙動が行われているのかを紹介したいと思います。

仕様書は、執筆時点で最新の [ECMA-262 edition 10](https://www.ecma-international.org/publications/standards/Ecma-262.htm) を使います。

# 仕様書の構成

上のリンクから Browsable URL をクリックすると、ブラウザ上で仕様書を読むことが出来ます。ぱっと見ただけで読む気を無くすかもしれませんが、
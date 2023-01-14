---
layout: post
title: async / await / Promise について簡単に理解する
categories:
- JavaScript
---

最近の JavaScript では当たり前のように使われている非同期処理の async や await ですが、感覚的に使っている人も結構多いのではないかなと思います。

実際の Promise 周りの非同期処理の仕様は中々に複雑で、完璧な理解は結構な負担になるでしょう。なので感覚的に使っていてもきちんと動くのであればそれで良いと思うのですが、この記事では実務上ここまで知っていれば安心かな、というレベルまで解説をしたいと思います。

この記事では async / await に加えて Promise の初歩も解説しますが、microtask や then、エラーハンドリングなどについてはほとんど解説しません。正確な理解のためには、たとえば [JavaScript Primer](https://jsprimer.net/basic/async/) など他のサイトを参照されることをお勧めします。




# async 関数とは？

async 関数は、関数宣言や関数式に `async` という修飾子をつけることで作成出来ます。

```javascript
async function func () {...}
const func2 = async () => {...}
```

**大前提として、返値もなく、関数内に `await` もなく、例外も投げない async 関数の場合、挙動は普通の関数と全く同じになります。**実際の実行ではオーバーヘッドがかかる可能性があるので実行速度は落ちることが多いでしょうが、少なくとも<span style="color:red">実行順序は普通の同期関数と完全に同じ</span>です。環境の差みたいなものは発生し得ません。


下記の JavaScript には async 関数がありますが、返値も無ければ await も無いので、普通の関数と全く同じ挙動になります。実行すると `1` `2` `3` の順に出力します。

```javascript
console.log("1");
(async () => {
    console.log("2");
})();
console.log("3");
```

先に例外の話をしておくと、async 関数の中で例外が起こった場合、そこからの処理は同期関数とは異なります。以下の JavaScript は、`1` `2` `3` を表示し、その後に例外を投げます。

```javascript
console.log("1");
(async () => {
    console.log("2");
    throw "Exception";
})();
console.log("3");
```

以下の JavaScript は、`1` `2` を表示した後に例外が投げられ、`3` は表示されません。

```javascript
console.log("1");
(() => {
    console.log("2");
    throw "Exception";
})();
console.log("3");
```

この記事では例外が発生した場合の挙動については深く扱いません。ご容赦下さい。では、

- async 関数の返値はどう扱われるのか
- async 関数内に `await` があった場合にどういう挙動になるのか

について順に解説します。

## async 関数内の返値の扱い

**async 関数の返値は、必ず Promise に包まれて返ってきます**。返値は必ず Promise オブジェクトになり、そのままでは本来の値を使うことが出来ません。

```javascript
async function f() {
    return 3;
}
const ret = f();
console.log(ret); // Promise object
```

Promise オブジェクトからは、基本的に `await` を使わないと値を取得出来ません。`then` を使っても取得出来るのですが、この記事では `then` を扱わずに説明します（最近では、実際のコードで `then` を使う機会はそこまでないだろうと個人的に考えております）。

ただし、<span style="color:red">基本的に `await` を使えるのは async 関数の中だけです</span>。普通の関数の中で `await` を使うと構文エラーになります（これも Top Level Await という例外があるのですが、この記事ではその解説は省略します）。

```javascript
(async () => { // await を使うために全体を async 関数で包む
    async function f() {
        return 3;
    }
    const ret = await f();
    console.log(ret); // 3
})();
```

Promise オブジェクトに対して `await` することで、その Promise オブジェクトに包まれた値を得ることが出来ます。なお `await` は Promise オブジェクトでない値に対しても利用出来ますが、その場合はただその値を返すだけです。

## async 関数内の `await` の存在による挙動の差

では、次に async 関数内に `await` があった場合の挙動について解説します。<span style="color:red">`await` が存在したら、必ずそこで async 関数の処理が一旦止まります。**必ず**です</span>。

以下のコードを見て下さい。async 関数内に、特に意味のない `await` を挟んであります。

```javascript
console.log("1");
(async () => {
    console.log("2");
    await 0;
    console.log("4");
})();
console.log("3");
```

上記のコードは、まず `1` が表示され、その後 `await` が登場するまでは普通の（同期）関数と同じように `2` が表示されます。そこで await が登場したので、ここで処理が一旦止まります。そして一旦関数から抜け出して、先に `3` が表示されます。その後、止まった関数が再開され、`4` が表示されます。

**`await` が登場したら関数の実行が一旦そこで止まり、関数を抜け出して残りの処理が始まる、**ということを覚えておいて下さい。

## `await` が即座に実行されない場合

今までの例では、`await` は 0 や 3 などの即値ばかり扱っていました。`await 0` のような即値の場合、`await` は一旦止まった後に即座に関数の実行を再開します。ただ、一般的に `await` を使う場合、即座に実行されることはありません。`await` では非同期処理を含む Promise を処理することが一般的で、その非同期処理が終わるまでは実行されないことが多いでしょう。

例えば次のコードを見て下さい。

```javascript
(async () => {
    const startTime = Date.now();
    await fetch('./');
    console.log(Date.now() - startTime);
})();
```

これは、`fetch` を利用して URL `./` を取得し、その取得に何秒かかったかを表示するプログラムです。`./` を取得するためにはネットワークアクセスが必要になり、実際に取得が終わるまで `await` の先に進むことはありません。このように、非同期処理にも関わらず、それを手続き型で上から下に書けるのが async/await の強みです。

# new Promise(...)

このように、async と await を組み合わせることによって非同期処理を読みやすく書けるのですが、非同期処理そのものを書きたくなった場合には async/await 構文のみでは不十分です。そういう場合には、`new Promise` で Promise を自分自身で作って処理します。

## new Promise の引数の関数は即時実行される

`new Promise` は、関数を引数に取ります。その関数は、resolve（と reject、今回は解説しません）の引数を持つことが期待されています。そして、<span style="color:red">**Promise の引数に渡した関数はその場で実行されます**</span>。

```javascript
console.log("1");
new Promise(() => { console.log("2"); });
console.log("3");
```

上記のコードを実行すると、`1` `2` `3` と表示されます。

## await new Promise(...) が処理を続けるためには、resolve に値を渡す必要がある

`new Promise(...)` は Promise を返します。そして、この Promise から値を取るには `await` を使う必要があるのは上記と同じです。しかし、Promise の引数に渡した関数の返値は使用されないので、`resolve` を呼ばない Promise は永遠に値を返しません。そんな Promise を `await` すると、async 関数のそれ以降の処理は実行されません。

```javascript
(async () => {
    await new Promise(() => { return 3; }); // return による返値は無意味、無視される
    console.log("この行は絶対に呼ばれない");
})();
```

`new Promise(...)` が await に対して値を返すためには、Promise の引数に渡した関数の第 1 引数（[resolver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise#resolver_function) と呼ばれます）の関数に対して値を渡す必要があります。引数名は何でもよいのですが、`resolve` もしくは `r` がよく使われます。

```javascript
(async () => {
    const ret = await new Promise((resolve) => { resolve(3); });
    console.log(ret); // 3
})();
```

resolver を複数回呼ぶことも出来ますが、2 回目以降の呼び出しは無視されます。

```javascript
(async () => {
    const ret = await new Promise((resolve) => {
        resolve(3);
        resolve(1);
        resolve(4);
    });
    console.log(ret); // 3
})();
```

## resolver を利用して非同期処理を書く

非同期処理は、この resolve の呼び出しを利用して作られます。例えば 1 秒後に 3 を返す非同期処理は、次のように書くことが出来ます。

```javascript
(async () => {
    const ret = await new Promise((resolve) => {
        setTimeout(() => {
            resolve(3);
        }, 1000);
    });
    console.log(ret); // 1 秒後に 3 が出力される
})();
```

よくある `sleep` 関数は次のように書かれます。10 から 1 までのカウントダウンを表示するプログラムです。

```javascript
const sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
};

// const sleep = (duration) => new Promise(r => setTimeout(r, duration));
// と 1 行で書けます

(async () => {
    for(let i = 10; i > 0; i--) {
        console.log(i);
        await sleep(1000);
    }
})();
```

ポイントとして、resolver はどこで呼ばれても問題ありません。なので、次のように書くことも出来ます。

```javascript
let clickResolver = null;
document.addEventListener("pointerdown", () => {
    if(clickResolver) {
        clickResolver();
    }
});
(async () => {
    console.log("wait for click...");
    await new Promise(resolve => {
        clickResolver = resolve;
    });
    console.log("clicked!");
})();
```

これは、resolver を `clickResolver` というグローバル変数に保存して、`pointerdown` イベントでその resolver を呼び出すことにより、画面のどこかがクリックされるまで処理を止める非同期処理を実現しています。

# まとめ

この記事では、

- async 関数
- await 構文
- new Promise による Promise オブジェクトの生成

について簡単に説明しました。だいたいの実務においては、この記事に書かれていた async 関数 await による挙動、また Promise の引数の関数などの実行順序について理解していれば、大体問題ないのではないかなと思います。ここからさらに正確に理解をされたい方は、Promise の 3 つの状態（fulfilled, rejected, pending）、then や catch チェーンならびに thenable、例外処理、タスクキューの内部実装と実行順序、などについて理解を深めていけば良いのではないかと思います。

以前、Twitter に以下のような Promise クイズを発表したことがあります。驚きの正答率の低さでしたが、この記事をここまで読まれた方は、きっと正解を導けるのではないかと思います！

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">// どういう順番で表示されるでしょうか？<br>console.log(1);<br>(async () =&gt; {<br> console.log(2);<br> await new Promise(r =&gt; {<br> setTimeout(r, 1000);<br> console.log(3);<br> });<br> console.log(4);<br>})();<br>console.log(5);</p>&mdash; Takuo Kihira (@tkihira) <a href="https://twitter.com/tkihira/status/1429061261895946240?ref_src=twsrc%5Etfw">August 21, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

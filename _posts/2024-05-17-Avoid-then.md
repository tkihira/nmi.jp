---
layout: post
title: JavaScript で then を使うのは避けよう（await / async の初級者まとめ）
categories:
- JavaScript
---

JavaScript において、特に苦手とする人が多い印象のある Promise ですが、`await` と `async` の文法が導入されたことで、Promise の仕様を深く理解しなくても非同期処理を自然に書けるようになってきたのではないかと思います。

極論ですが、JavaScript の非同期処理は

- `async`
- `await`
- `new Promise`

のみで、（ほぼ）全て表現可能です。特別な理由がない限り `then` を使わないようにしましょう、ということを周知するのがこの記事の目的です。

なお本記事では Promise の `rejected` の状態についてほとんど解説しておりません。基本を理解したら、別記事でぜひ学んでみてください。





# Promise とは？

Promise は、少し乱暴に説明すると「実行が終わっていないかもしれない何らかの関数」を包んだオブジェクトです。

普通の関数とは違って、Promise は

- 関数が正常に終了した（ `fulfilled` ）
- 例外などで異常終了した（ `rejected` ）
- まだ実行が終わっていない（ `pending` ）

の 3 つの状態を持ちます。そして、正常に終了した場合は、返り値を持っていることがあります。

Promise は、即座に実行が終了しないような処理（非同期処理、と呼ばれます）の際に返されることが多いです。例えば、次のコードを見てください。

```js
const r = fetch('https://wttr.in/');
```

`fetch` はネットワークのアクセスが終了するまで実行が終わりません。なので、`fetch` はとりあえず Promise を返します。その Promise の中に、（イメージとしては）ネットワークにアクセスしてデータを取ってくる関数が収納されており、その関数の実行が終了すると、晴れて `fetch` の返り値を得ることが出来るようになります。

なので、この変数 `r` には Promise のオブジェクトが入っています。

さて普通に考えると、次は Promise がどのような状態なのかをチェックして、正常に終了しているなら（ `fulfilled` なら）データを取得したい、と考えると思います。<span style="color:red"> **しかし Promise は、外部から状態を確認することが出来ません** </span>（正確に言うと方法があるので、余談で紹介します）。

基本的に、Promise オブジェクトの状態を外部から操作・参照することは出来ないと考えてください。


# `then` について簡単に説明

ではどのようにして `fetch` の結果を利用するのでしょうか？そこで登場するのが `then` です。`then` は Promise と同時に ES2015 で仕様に登場しました。

上記で `r` について考えてみましょう。この Promise の中の関数の終了が完了すると、ネットワークからデータが取得出来たということなので、そのデータを取りたくなります。ただ、前述の通り、Promise はその状態を確認出来ません。

そこで `then` が使われていました。Promise に対して「正常に終了したら、次はこの関数を実行してください」と関数を登録するのが `then` 関数です。

```js
const r = fetch('https://wttr.in/');
const f = (response) => console.log(response.status);
r.then(f);
```

`r` の Promise は、`fetch` の処理が無事に終了すると、次に `then` で登録された関数 `f` を呼び出します。このような形で、 `fetch` の返り値を参照して処理することが可能になるのです。

なお、`then` は返り値として Promise を返します。関数 `f` の返り値を、 `then` で次々に先の関数に送ることも出来ます。

```js
const r = fetch('https://wttr.in/');
const f1 = a => a;
const f2 = (response) => console.log(response.status);
r.then(f1).then(f1).then(f1).then(f1).then(f1).then(f1).then(f1).then(f2);
```

また、`f` の返り値が Promise の場合、 `then` はその Promise の関数が終わるまで待ってから次の関数を呼びます。

```js
const r = fetch('https://wttr.in/');
const f1 = (response) => {
    console.log("First fetch's status:", response.status);
    return fetch('https://wttr.in/');
}
const f2 = (response) => console.log("Second fetch's status", response.status);
r.then(f1).then(f2);
```

なお、一般的に `then` には関数本体を放り込む書き方をされることが多いです。上のコードは大抵、次のように書かれます。

```js
fetch('https://wttr.in/')
    .then((response) => {
        console.log("First fetch's status:", response.status);
        return fetch('https://wttr.in/');
    })
    .then(((response) => console.log("Second fetch's status", response.status)));
```


率直に行って、それ以前の callback hell と呼ばれる状態よりはマシとはいえ、 `then` は読みにくいです。

今は `async` と `await` があります。こちらを `then` の代わりに使ってみましょう。

# `async` と `await` で書き直す

`async` と `await` は ES2017 で仕様に登場しました。まず、上記のコードを `async` / `await` で書きなおしてみます。

```js
(async() => {
    const response1 = await fetch('https://wttr.in/');
    console.log("First fetch's status:", response1.status);
    const response2 = await fetch('https://wttr.in/');
    console.log("Second fetch's status:", response2.status);
})();
```

すっきり読みやすくなりました。

- まず `async` 関数を作って、即時実行しています
- その関数内部で `fetch` を `await` 付きで呼んでいます
- 関数内部は上から下に逐次実行されています

では、`async` と `await` について説明しましょう


# `async` とは？

`async` は一般的に「エイシンク」と読まれます（英語ネイティブでも一部の人は「アシンク」と読むようです）。

`async` は関数宣言の時につける修飾子で、これがつくとその関数は `async` 関数になります。

<span style="color:blue">`async` 関数は、関数内部で何をやろうとも、必ず返り値として Promise を返します。</span>

上の方で Promise を `「実行が終わっていないかもしれない何らかの関数」を包んだオブジェクト` と説明しましたが、この `async` 関数がその包まれた「何らかの関数」となり、`async` 関数は「その関数を包んだ Promise」を返します。

`async` 関数の返り値は Promise なので `then` を使えば、その返り値の内容を参照することができます。こんな感じになります。

```js
const f = async (x) => x * 10;
const ret = f(5);
ret.then(result => console.log(result));
```

（ただ、普通は `async` と `then` を一緒に使いません。これはあくまでサンプルです）

さて、なんのために `async` 関数が存在するか、というと、次に紹介する `await` のためです。`await` は `async` 関数の中でしか使えないのです。

# `await` とは？

`await` は「アウェイト」と読まれます。

`async` 関数の中でしか使えず、`async` 関数でない場所で使おうとすると Syntax Error が発生します。

```js
()=>{ await 3; } // Syntax Error
async ()=>{ await 3; } // OK
```

`await` は演算子で、何らかの値を受け取ります。Promise でなくても受け取るので、上にあるような `await 3` のような式も問題ありません。

`await` の効果を説明すると、 `await` は、そこで一旦処理を打ち切って `async` 関数から脱出し、引数にある Promise 内にある関数が終了するまで待ちます。Promise 内の関数が終了したり、Promise 内の関数が既に終了していた場合は、その Promise オブジェクトから値を取り出し、それを返します（引数に Promise 以外の値が指定されていた場合、大抵はそれをそのまま返します）。そして先ほど中断した場所から処理を再開します。

次のコードを考えてみましょう。

```js
(async() => {
    const response = await fetch('https://wttr.in/');
    console.log(response.status);
})();
```

`fetch` が Promise を返し、それを `await` で受け取っています。よって処理は一旦ここで中断します。その後、 `fetch` の実行が完了した（ネットワークアクセスが終わった）タイミングで `fetch` は `response` を返しますが、 `await` はそのタイミングで Promise から返り値を取り出し、処理を再開します。

そして次の行で、console.log が呼ばれて status コードが表示されます。

`await` の処理はこれだけです。しかし、 `await` と `async` のおかげで、ぐっとソースコードが読みやすくなりました。

# `new Promise` を書かざるを得ない状況とは

`async` と `await` だけで全ての非同期処理を記述出来れば最高だったのですが、残念ながらどうしても `new Promise` を書かざるを得ない局面があります。

例えば、3 秒たったら再開する関数を時前で書く場合、 `async` のみではどうしても書くことができません。次のようになります。

```js
const wait3sec = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve("3 seconds"), 3000);
    });
};
```

`wait3sec` 関数は、 `new Promise` で新しい Promise オブジェクトを作成し、それを返します。Promise は関数を引数に取りますが、そこで渡される関数が上で説明した `「実行が終わっていないかもしれない何らかの関数」` となります。今回は new Promise に `(resolve) => { setTimeout(() => resolve("3 seconds"), 3000); }` という関数を渡しました。

さて、この `resolve` というのは、「関数が終わったよ」ということを Promise に伝えるためのインターフェース用の関数になります。この `resolve` 関数（名前は何でもよいのですが）を呼び出さないと、Promise はずっと「まだ実行が終わっていない（ `pending` ）」状態のままになってしまいます。

`wait3sec` 関数では、3 秒経ったら `resolve` を呼んで、Promise に「もう終わったよ！」と伝えてあげています。その `resolve` の引数に、この関数全体の返り値である `"3 seconds"` を指定しています。これが Promise の返り値になり、 `await` などで取得され参照されるものになります。例えば次のようになりますね。

```js
const wait3sec = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve("3 seconds"), 3000);
    });
};

(async() => {
    const result = await wait3sec(); // wait 3 seconds
    console.log(result); // 3 seconds
})();
```

なお `new Promise` の引数で渡した関数は、その場で即座に実行されます。

```js
console.log("1");
new Promise(() => {
    console.log("2");
});
console.log("3");
// 1, 2, 3
```

# まとめ

`await` `async` `new Promise` さえ完全に理解すれば、JavaScript で可能な非同期処理は全て表現出来ます。 `then` は可読性に劣る上に特に大きなメリットもないので、理由がない限り使わない方が良いでしょう。

今回の記事では、わかりやすさを優先するために `rejected` の状態や `thenable` オブジェクトなどの話を意図的に省いています。 `thenable` はともかく `rejected` は Promise における必須の知識となりますので、もし自信のない方は別に調べてみてください。

乱暴に言ってしまうと、`await` `async` は非同期処理の可読性を大きくあげるための記法で、 `then` は内部的にそれを支える仕様です。もちろん `then` をしっかり理解していることはとても大切ですが、あくまでも内部仕様としての知識に留め、実際のコードでは `then` をあまり書かず、 `await` と `async` で書くようにしましょう。

ただ `then` を使った方が綺麗にかける状況もありますので、そういう場合は固執せずに `then` を書くほうが良いと思います。

## 余談 1: ES2024 の新機能 `Promise.withResolvers`

上で「残念ながらどうしても `new Promise` を書かざるを得ない局面があります」と書きましたが、実は書かなくてもよい記法が登場しております。

ES2024 から登場した [Promise.withResolvers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) という API を利用すると、今まで煩雑だった `new Promise` を書かずに、すっきりと新しい Promise が作れます。

上の、 3 秒待つコードを再掲します。

```js
const wait3sec = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve("3 seconds"), 3000);
    });
};

(async() => {
    const result = await wait3sec(); // wait 3 seconds
    console.log(result); // 3 seconds
})();
```

これを `Promise.withResolvers` で書くと次のようになります。

```js
const wait3sec = () => {
    const { promise, resolve, reject } = Promise.withResolvers();
    setTimeout(() => resolve("3 seconds"), 3000);
    return promise;
};

(async() => {
    const result = await wait3sec(); // wait 3 seconds
    console.log(result); // 3 seconds
})();
```

すっきりして素晴らしいですね。モダンブラウザや Node.js 22 では使用可能ですが、古い Android WebView や古い Node.js などでは使えないので、使用には注意をしてください。

この情報は [渋川よしき](https://twitter.com/shibu_jp) さんに教えていただきました。ありがとうございます！

# 余談 2: `then` を使う状況

例えば次のように、配列に複数の Promise が入っている状況を考えてみてください。

```js
const a = [];
for(let i = 0; i < 10; i++) {
    a.push(async() => {
        await new Promise(r => setTimeout(r, 1000));
        console.log(i);
    });
}
```

for 文を使って順次実行する時は、以下のように書きます。10 秒で 0 〜 9 が表示されます。

```js
for(const p of a) {
    await p();
}
```

これを for 文を使わずに処理したい時、 `reduce` と `then` を使うと次のように書けます。

```js
a.reduce((acc, cur) => acc.then(cur), Promise.resolve());
```

正直読みやすさだと for 文かもしれませんが、メソッドチェーンを維持したい場合などに `then` が効果を発揮するでしょう。この用例は [hiroppy](https://twitter.com/about_hiroppy) さんに教えて頂きました。ありがとうございました！

# 余談 3: 意外と知られていない実行順

```js
console.log(1);
(async () => {
    console.log(2);
    await new Promise(r => {
        setTimeout(r, 1000);
        console.log(3);
    });
    console.log(4);
})();
console.log(5);
```

これの実行順を正確に答えられるでしょうか？私が以前 [Twitter でクイズとして出した](https://twitter.com/tkihira/status/1429061261895946240)時の正答率はとても低かったです。

解答を記します。自分で考えたい人は以下は読まないでください。

まず、 `1` はまっさきに表示されますね。次に `async` で修飾された即時関数が実行されます。 `async` 関数が実行される時、それ自体は実は普通の関数と全く同じです。なので普通に関数が呼ばれ、 `2` が表示されます。

そして次、`await new Promise(f)` において、まず `f` が評価されます。`f` の中身は `setTimeout` で resolve を呼び、そして `3` を表示しています。上記で「`new Promise` の引数で渡した関数は、その場で即座に実行されます」と書いた通り、これはここで即座に実行されます。なので `3` が表示されます。

さて、ここで `await` が評価されました。上記に書いた通り `await` が登場すると、そこで **必ず** 処理が打ち切られます。なのでここで一旦 `async` 関数は止まり、関数の続きから実行されます。そうすると `5` が表示されることになりますね。

そして 1 秒間経つと、ここで改めて resolve 関数が呼ばれ、 `await` の直後から処理が再開します。最後に `4` が表示されるわけです。

すなわち答えは、1→2→3→5→4 となります！

<span style="color:red">特に `async` 関数が実行されたら即座に処理が打ち切られてコンテキストが変わる、と誤解している方が多い</span>のですが、 `await` が登場するまでは普通の関数と同じように実行されます。逆に `await` が登場したら、そこで必ず処理が止まります。例えば、

```js
console.log("1");
(async () => {
    console.log("2");
    await 9;
    console.log("3");
})();
console.log("4");
```

これの実行結果は `1→2→4→3` となります。 `await 9` と意味のない `await` を呼んだとしても、 `async` 中に `await` が登場すると必ずそこで処理が一旦止まります。処理が止まるタイミングは `async` ではなくて `await` であるということを意識しておきましょう。

# 余談 4: Promise 状態確認

本文中で「Promise は、外部から状態を確認することが出来ません」と書きましたが、少しトリックを使うことで可能です。[Stack Overflow](https://stackoverflow.com/questions/30564053/how-can-i-synchronously-determine-a-javascript-promises-state) で貼られているコードを、await/async で書き直しました。

```js
async function promiseState(p) {
    const t = {};
    try {
        const r = await Promise.race([p, t]);
        return (r === t)? "pending" : "fulfilled";
    } catch(e) {
        return "rejected";
    }
}


const a = Promise.resolve();
const b = Promise.reject();
const c = new Promise(() => {});

(async() => {
    console.log(await promiseState(a)); // fulfilled
    console.log(await promiseState(b)); // rejected
    console.log(await promiseState(c)); // pending
})();
```

簡単に言うと、

- Promise.race は両方とも `fulfilled` の場合は前の値を返すので、 t が返ってきたら `pending`、そうでなければ `fulfilled` を返す
- p を評価したときに `rejected` だと例外を飛ばすので、それをキャッチして `rejected` を返す

という動作になります。稀に必要な場合があるので、記憶の片隅に置いておくと良いかもしれません。

なお、この `promiseState` は、 `then` を使った[オリジナルの書き方](https://stackoverflow.com/questions/30564053/how-can-i-synchronously-determine-a-javascript-promises-state)の方がすっきりして見やすいかもしれません。そういう時は `then` を使ってよいと思います。

# 余談 5: then を多用している中上級者の皆様へ

特に歴史的経緯から、JavaScript に詳しい方ほど `await`/`async` と `then` をあまり意識することなく混在させる傾向があると観測しています。 `then` はメソッドチェーンの様に書けるので、むしろ好んで `then` を多用されている方も多いかもしれません。

ただ、これらの記法の混在は、入門者や初級者にとって理解するのにかなり時間がかかってしまうため、大きなハードルとなっております。私が「可能な限り `then` を使わないのが良い」という立場をとるのは、これが理由です。

もちろん両方をしっかり理解することがベストだとは思います。しかし例えば `class` と `prototype` の両方を考えた場合、まず `class` の読み書きがしっかり出来ることが大切だと思うのです。中上級者としても、現状 `class` で書けるものを、わざわざ `prototype` を書くことはあまりないでしょう。

`then` と `async`/`await` も、所詮はシンタックスシュガーではあるのですが、両者の記法の混在が初学者に与えるコストは無視できないものだと考えております。もはや JavaScript 非同期処理の過渡期という暗黒時代は終わった、と言えるでしょう。中上級者の皆さまも `async`/`await` に記法を寄せていくメリットに目を向ける価値は大きいと思います。ぜひご一考をお願いします。

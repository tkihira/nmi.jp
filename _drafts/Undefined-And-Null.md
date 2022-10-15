---
layout: post
title: undefined と null の違い
categories:
- JavaScript
---

JavaScript で頻出する `undefined` と `null` について語ります。


# 言語仕様上の違い

JavaScript (ECMAScript) において、仕様上 `undefined` と `null` は当然ながら明確に区別されています。いくつか言語仕様上の扱いについて挙げてみます。

## 比較

厳密な比較演算子 === において `undefined` と `null` は区別されます。ゆるい比較演算子 == においては両者は区別されません（[仕様 7.2.14](https://tc39.es/ecma262/#sec-islooselyequal)）。

```javascript
console.log(undefined !== null); // true
console.log(undefined == null); // true
```

この「ゆるい比較演算子による `null` と `undefined` の比較」は、広く使われています。

```javascript
function checkValue(value) {
    if (!value) {
        console.log("value is falsy.");
    }
    if (value == null) {
        console.log("value is null or undefined.");
    }
}

checkValue(); // value is falsy & value is null or undefined
checkValue(""); // value is falsy
checkValue(0); // value is falsy
```

0 や 空文字列のような falsy な値は受け付けつつ、`null` と `undefined` を弾きたい、という場面において、「`null` とのゆるい比較演算子による比較」は歴史的にもよく使われています。覚えておくと良いでしょう。

私の個人的な意見では、`null` と `undefined` の仕様上の違いにおいて、<span style="color:blue">実務上覚えておく必要があるのはここまで</span>です。ここから下は「意味上の違い」まで読み飛ばしても大丈夫だと思います。

余談ですが、少し特殊な例として、ブラウザにおいてゆるい比較演算子は `document.all` と `undefined` ならびに `null` を区別しません（[仕様 B.3.6.2](https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec)）。詳細については[以前のブログ記事](http://nmi.jp/2022-08-01-Document-Dot-All)にまとめましたので、興味のある方は読んでみてください。

```javascript
console.log(document.all); // [HTMLAllCollection]
console.log(document.all == undefined); // true
console.log(document.all === undefined); // false
console.log(document.all == null); // true
console.log(document.all === null); // false
const dda = document.all;
console.log(dda == undefined); // true
```

## 型

ECMAScript において、`undefined` は Undefined 型、`null` は Null 型になります（[仕様 6.1.1 ならびに 6.1.2](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)）。なお、この型は内部的なもので、実際のコードには登場しません。

`typeof` 演算子の返す結果も違います。`typeof undefined` は `undefined` を返し、`typeof null` は `object` を返します（[仕様 13.5.3](https://tc39.es/ecma262/#sec-typeof-operator)）。`typeof null` の結果に納得がいかない方もいらっしゃるかと思いますが、仕様に書いてあるので仕方ありません。

```javascript
console.log(typeof undefined === 'undefined'); // true
console.log(typeof null === 'object'); // true
```

余談ですが、`typeof` 演算子は右辺の値が宣言されていなくても例外を飛ばさず `undefined` を返す（[仕様 13.5.3.1](https://tc39.es/ecma262/#sec-typeof-operator) の 2 項目）ため、グローバルオブジェクトの存在を確認する時に使われることもあります。ECMAScript 3 から 5 への移行期では、`JSON` オブジェクトの存在確認によく使われていました。

```javascript
if (typeof LOVE === "undefined") {
    console.log("typeof LOVE doesn't throw any exceptions");
}
if (LOVE === undefined) {
    // ReferenceError: LOVE is not defined
}
```

## 変換

Boolean 型に変換すると、両者とも `false` に変換されます（[仕様 7.1.2](https://tc39.es/ecma262/#sec-toboolean)）。

```javascript
console.log(Boolean(undefined)); // false
console.log(Boolean(null)); // false
```

Number 型に変換すると、`undefined` は `NaN` に、`null` は `0` に変換されます（[仕様 7.1.4](https://tc39.es/ecma262/#sec-tonumber)）。この仕様に納得のいかない方もいらっしゃるかと思いますが、仕様に書いてあるので仕方ありません。

```javascript
console.log(Number(undefined)); // NaN
console.log(Number(null)); // 0
```

String 型に変換すると、`undefined` は `"undefined"` という文字列に、`null` は `"null"` という文字列に変換されます。

```javascript
console.log(String(undefined)); // "undefined"
console.log(String(null)); // "null"
```

## リテラル

`null` は予約語であり、`null` と書くと `null` が返ります。`null` リテラルは[仕様 12.9.1](https://tc39.es/ecma262/#prod-NullLiteral) に、その実行時の挙動は[仕様 13.2.3.1](https://tc39.es/ecma262/#sec-literals-runtime-semantics-evaluation) に書かれています。

`undefined` は予約語<span style="color:red;font-weight:bold">ではなく</span>、グローバルオブジェクトのプロパティとして定義されています（[仕様 19.1.4](https://tc39.es/ecma262/#sec-undefined)）。ECMAScript 5 より上書きが出来ない設定に変更されておりますが、上書きが出来ないだけで代入は可能ですし、スコープを用意すればそのスコープ内では `undefined` に別の値を代入することも出来ます。もちろんそんなコードを書くメリットは皆無です。

```javascript
undefined = 7;
console.log(undefined); // undefined
{
    const undefind = 7;
    console.log(undefined); // 7
}
```

なぜこのような仕様になっているのか納得のいかない方もいらっしゃるかと思いますが、仕様に書いてあるので仕方ありません。

なお 100% 確実に `undefined` 値を取得したい場合は `void` 演算子を使います（[仕様 13.5.2](https://tc39.es/ecma262/#sec-void-operator)）。これは単項演算子であり、右側に引数を取りますが、しかしその引数は一切使われません。これも完全に意味不明な挙動だと思う方もいらっしゃるかと思いますが、仕様に書いてあるので仕方ありません。`void` 演算子の引数は使用されませんが、引数の評価はされます。

```javascript
console.log(void 0); // undefined
console.log(void "Hello, world!"); // undefined
console.log(void (() => console.log("abc"))()); // abc, undefined
```

なお余談になりますが、ECMAScript 3 時代（IE 6 の時代）はグローバルオブジェクトの `undefined` プロパティを書き換えることが可能でしたので、一部のコードでは以下のようなコードを書いて `undefined` 上書き対策を行うテクニックもありました。jQuery などで使われていた記憶があります。今はもうグローバルオブジェクトの `undefined` プロパティが上書きされる心配はないので、このようなテクニックは必要ありません。

```javascript
(function (undefined) {
    // この関数は引数なしで呼ばれるので、引数 undefined には undefined が代入される
    // よって、この関数内においては必ず undefined を参照すると undefined が入っていることが保障される
})();
```

そしてこのように `undefined` という引数名や変数名に `undefined` を代入するテクニックがあるせいで、もし仕様で `undefined` を予約語に変更すると、jQuery を含む過去のコードで動かないものが多数出てしまいます。そのため、今から `undefined` を予約語にしたくともすることが出来なくなっているのです。悲しい歴史です。

# 意味上の違い

<span style="font-weight: bold">ここまでは事実ベースで書いてきましたが、ここからは私見が入ります</span>。ご注意ください。

## `undefined`

`undefined` は、文字通り「定義されていない」ことを意味する場面で使われます。定義されない変数や、指定されなかった引数、値を指定しなかった関数の返り値などでよく登場します。

```javascript
let value;
console.log(value); // undefined
((arg) => {
    console.log(arg); // undefined
})();
const f = () => {};
console.log(f()); // undefined
```

また、配列の range 外アクセスをしたり、オブジェクトの存在しないプロパティを参照した場合にも登場します。

```javascript
const arr = [0, 1, 2];
console.log(arr[3]); // undefined
const obj = {};
console.log(obj.foo); // undefined
```

これらの `undefined` は、`undefined` を代入した配列、もしくは `undefined` を代入したオブジェクトのプロパティとは意味的に異なるものです。

```javascript
const arr = [0, 1, 2];
console.log(arr[3]); // undefined
console.log(arr.length); // 3
arr[3] = undefined;
console.log(arr[3]); // undefined
console.log(arr.length); // 4
arr.splice(3, 1);
console.log(arr[3]); // undefined
console.log(arr.length); // 3

const obj = {};
console.log(obj.foo); // undefined
console.log(obj.hasOwnProperty("foo")); // false
obj.foo = undefined;
console.log(obj.foo); // undefined
console.log(obj.hasOwnProperty("foo")); // true
delete obj.foo;
console.log(obj.foo); // undefined
console.log(obj.hasOwnProperty("foo")); // false
```

## `null`

`null` は「存在しない」ことを表したい場面で使われる値です。関数の返り値などで、返り値が存在しなかったことを示すために使われます。

```javascript
console.log(document.getElementById("")); // null
```

`null` は `undefined` と違って、明示的に指定しない限り、滅多に登場しません。<span style="color:blue">ECMAScript の範囲で `null` リテラルを参照せずに `null` を作り出すのは至難の業です</span>。これは良い JavaScript クイズになると思います。[私の思いついた・教えてもらった作り出し方（ネタバレ注意）](https://gist.github.com/tkihira/808ca736e6ff289844c65bbfd3ce5fe5)以外にもし別解がある方は是非 [@tkihira](https://twitter.com/tkihira) まで教えて下さい。

ECMAScript では `typeof null === "object"` の仕様から想像するに、`null` を「インスタンスのないオブジェクト」という意味で捉えているのかな、と個人的に考えております。なので、数値型を返す関数で 0 が false を意味したり、文字列型を返す関数で空文字列 "" が false を意味するのと同じように、オブジェクト型を返す関数において false の意味を返したい時に `null` を利用するのが良いのではないだろうか、と考えております。

（`Number(null) === 0` であるのも、多分 `null` は値としては `NaN` を与えるほどの例外的な値ではないという主張なのでしょうか・・・。`typeof null === "object"` なのであれば他のオブジェクト型と同じく `Number(Null)` を `NaN` に変換するほうが筋が通っていて好みなのですが）

# `undefined` と `null` の使い分けの考え方

<span style="color:red">ここからは完全に個人の見解となります</span>のでご注意ください。

## 変数への代入

個人的には「変数、配列の要素、オブジェクトのプロパティに、`undefined` が代入されうるコードは良くない」と考えています。

前述したように `undefined` は突然登場するタイミングが多くある一方で `null` は予期せぬタイミングで登場することはほとんどありません。一切 `undefined` を変数などに代入しないコーディングスタイルを利用していると、もし実行時に何らかの変数やプロパティに `undefined` が入っていた場合、それは即座にバグであることが確定します。そしてそれは大抵の場合、配列外アクセスや存在しないプロパティへのアクセスによって生み出されているはずなので、デバッグも容易です。

もしコードで `undefined` を明示的に代入していたり、もしくは変数やプロパティの中に `undefined` が入りうるパスを許している場合、その `undefined` が実行時エラーによって発生したのか、意図的に代入しているのかを即座に判断することが出来なくなります。JavaScript はスクリプト言語であり、いかに TypeScript を使ってガチガチに型を定義していようとも、実行時に `undefined` が入ることを 100% 防ぐことは出来ません。

全ての変数やプロパティに `undefined` を入れないか、許容するにしても引数のみにし、それも絶対に他の変数等に伝搬させない形を徹底することで、実行時に `undefined` が発生するバグが出た場合の調査を楽にすることが出来ます。<span style="color:red">一般的に `undefined` と `NaN` は根本原因の場所とは全然関係のない場所で顕在化することが多く</span>、問題が発生した際に少しでもトラッキングを楽にするという意味で効果的だと思います。

また意味的にも、`undefined` は定義されていないもののみに紐づくべきであり、変数やプロパティなどの明確に「定義」されている要素に紐づくべきではないという考え方もあります。返り値でも、明示的に `return undefined;` とするのは間違っていると考えております。値を返すべき関数であれば `null` を返すべきでしょうし、そうでない場合は `return;` とのみ書いて明示的に `undefined` を返すべきではないです。

## `undefined` との比較

一方で、`undefined` を比較等に使用するのには寛容です。オブジェクトのプロパティの存在確認などで `undefined` と比較するのは、本来は `hasOwnProperty` 等を使うべきであり、意味的にはあまり良くないかもしれません。ただ実務上そこの違いがバグにつながることはまずないため、良いのではないかと思います。

前述の通り ECMAScript 3 においては `undefined` に別の数値を代入可能であったために `undefined` という名前への参照の利用を厭う方も多いですが、今の御時世 ECMAScript 3 を考慮しなければいけない環境は絶滅危惧種ですし、現実的に考える必要はないと思います。逆にお行儀よく `void 0` のような形で `undefined` を取り出しても、むしろそれが可読性を落としてしまうデメリットの方が大きい可能性まであります。

自分の場合、プロパティや引数などを `undefined` であるかどうか確認する必要がある時は、ゆるい比較演算子を用いて `value == null` と比較することがほとんどです。ただ稀に本当に `undefined` のみと比較しなければいけないことがある場合は、躊躇なく厳密な比較演算子 === を用いて `value === undefined` と比較しています。

まとめると、`undefined` を代入等で変数やプロパティに入れることには反対だが、`undefined` と比較するのは寛容である、ということです。

# まとめ

JavaScript において `undefined` 値は頻出しますので、その取り扱いについては慣れておく必要があります。しかし残念ながら、仕様上 `undefined` や `null` は一貫しない振る舞いをしているように感じることも多く、直感的に扱いづらい値です。

`null` と `undefined` の違いによる問題に直面する機会はそこまでないと思いますが、もしどちらの値を使うのが望ましいか悩むことなどがあった際に、この記事が解決の手助けになると幸いです。

最後に、記事中に書きました「ECMAScript の範囲で `null` リテラルを参照せずに `null` を作り出す」JavaScript クイズの別解、もし思いついた方がいらっしゃれば是非 Twitter で [@tkihira](https://twitter.com/tkihira) 宛に教えて下さい。最近追加された Module 絡みの仕様のどこかで出来るんじゃないのかなという直感があります。こういう問題を仕様書から眺めると勉強にもなって面白いのでオススメです。
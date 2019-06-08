---
layout: post
title: 高速化の観点から new Array(100) を使わない方が良い理由
categories:
- JavaScript
---

別件で V8 の JIT コードの逆アセンブルを眺めている時に気づいたのですが、JavaScriptで `new Array(100)` という形で配列を作るのは、高速化の観点から言うと V8 においては避けるべき書き方です。

高速化を求める方は、 `new Array()` や `[]` で作成して `Array#push` で追加していくのが良いでしょう。この記事では、その理由を説明します。



今回の記事は、以下の V8 のブログ記事を参考にしております。

[https://v8.dev/blog/elements-kinds](https://v8.dev/blog/elements-kinds)

----

## 「詰まった配列(Packed Array)」と「穴あき配列(Holey Array)」

v8 は内部的に、その配列がどういうタイプの配列であるかの状態を記録しており、それを利用して最適化を適用しています。[内部的には21個ある](https://cs.chromium.org/chromium/src/v8/src/elements-kind.h?l=14&rcl=ec37390b2ba2b4051f46f153a8cc179ed4656f5d)のですが、その中で「詰まっている」か「穴があいている」かの状態が、速度に影響を与えます。

「詰まった配列」とは、以下のように間に空白のない配列です。V8 では `Packed Array` と呼んでいます。

```javascript
const array = [1, 2, 3];
array.push(4);
```

一方、「穴あき配列」とは、以下のように間に空白のある配列です。V8 では `Holey Array` と呼んでいます。

```javascript
const array = [1, 2, 3];
array[9] = 8;
```

## `new Array(100)` の問題

<span style="color:blue">「普通にコードを書いていたら、穴あき配列なんてまず登場しないよね」</span>と思われる方がほとんどだと思います。自分もそう思いますが、ここに一つだけ落とし穴があるのです。それが `new Array(100)` のような形による配列の初期化です。

```javascript
const array = new Array(100);
```

このコードは、当たり前ですが初期化されたばかりで要素が一つもないので、間に空白のある穴あき配列（Holey Array）になります。普通はこの後に要素を追加していくことになるでしょう。

```javascript
const array = new Array(100);
for(let i = 0; i < array.length; i++) {
  array[i] = i;
}
```

これで無事全ての要素が埋まりましたので、詰まった配列（Packed Array）になりました…と思いきや、実は、内部ではこれは穴あき配列（Holey Array）なのです！v8 のデバッグツール d8 で `--allow-natives-syntax` を追加することで、実際に確認することが出来ます。

```
$ ~/v8/v8/out/x64.debug/d8 --allow-natives-syntax
V8 version 7.4.288.28
d8> const array = new Array(100);
undefined
d8> %DebugPrint(array);
DebugPrint: 0xaa0a418da81: [JSArray]
 - map: 0x0aa08b482e89 <Map(HOLEY_SMI_ELEMENTS)> [FastProperties]
 - prototype: 0x0aa0fc510ff1 <JSArray[0]>
 - elements: 0x0aa0a418dab1 <FixedArray[100]> [HOLEY_SMI_ELEMENTS]
 - length: 100
 （略）
d8> for(let i = 0; i < array.length; i++) { array[i] = i; }
99
d8> %DebugPrint(array);
DebugPrint: 0xaa0a418da81: [JSArray]
 - map: 0x0aa08b482e89 <Map(HOLEY_SMI_ELEMENTS)> [FastProperties]
 - prototype: 0x0aa0fc510ff1 <JSArray[0]>
 - elements: 0x0aa0a418dab1 <FixedArray[100]> [HOLEY_SMI_ELEMENTS]
 - length: 100
 （略）
d8>
```

`%DebugPrint(array)` の出力で `HOLEY_SMI_ELEMENTS` と出ていることが確認出来ると思います（SMIというのは *SMall Integer* の略で、整数配列だよという情報で、これも最適化に利用されております）。

ここで重要なのは、<span style="color:red">一度穴あき配列（Holey Array）の状態になってしまうと、その後二度と詰まった配列（Packed Array）に戻らない</span>ということです。

恐ろしいことに `new Array(100)` のように、`Array` オブジェクトの引数で要素数を指定して配列を生成した瞬間に、その配列は穴あき配列（Holey Array）扱いされてしまい、二度と詰まった配列（Packed Array）には戻れず、結果として最適化の恩恵を受けることができなくなります。

先程の例でいうと、次のようなコードを書けば、詰まった配列（Packed Array）にすることができます。

```javascript
const array = new Array();
for(let i = 0; i < array.length; i++) {
  array.push(i);
}
```

余談ですが、今の V8 の実装だと `new Array(0)` で長さゼロの配列を作っても、なぜか穴あき配列（Holey Array）扱いされてしまうようです。もちろん `new Array(1, 2, 3)` のように初期化すると、詰まった配列（Packed Array）扱いされるので安心してください。なお `[...new Array(100)]` でも詰まった配列（Packed Array）でした。

## パフォーマンスの差

では実際にどの程度の差が出るのでしょうか。jsperf で確認用のページを作成しました。

[https://jsperf.com/packed-vs-holey](https://jsperf.com/packed-vs-holey)

Preparation code の初期配列の作り方だけが異なっていて、各テストケースの内容は完全に同じです。holey が穴あき配列、packed が詰まった配列、between がどちらに判断されるかコードから推測するのが難しい配列です。

Chrome ユーザーの方は実際にご確認頂けます。私の環境だと、holey が 1428 ops/sec、packed と between が 1731 ops/sec となり、<span style="color:red">穴あき配列（Holey Array）が 17% も遅い</span>結果になりました。between は詰まった配列扱いされたようです。

配列の作り方がほんの僅かに違うだけで、意外と大きな差がついたと思いませんか？

## 配列における、その他の最適化を阻害する要因

今回、詰まった配列（Packed Array）から穴あき配列（Holey Array）には二度と復帰しないことを説明しましたが、ついでに他にも最適化を阻害する要因をご説明します。

Packed Array から Holey Array に変わるタイミングは、`delete`で要素を消す、`length` の長さをいじる、`length` より大きな添字に代入する、などの動作によって発生します。Array の build-in functions でも起こりうるかもしれません。なお undefined を代入してもそれ自体が理由で Holey にはなりません。

他に、配列の状態として、「整数」「数字」「それ以外」の3つの状態があります。先程ちらっと出てきた SMI が整数、DOUBLE が数字（浮動小数点）、それ以外の場合は特に記載が無くなります。 `PACKED_DOUBLE_ELEMENTS` とか `HOLEY_ELEMENTS` のように表され、[PACKED と HOLEY の2つの状態]×[SMI/DOUBLE/何もなしの3つの状態] の6種類の状態が存在します。

そして、Packed > Holey だったのと同じように、SMI > Double > (none) の順に最適化によって速度が出ます。

[https://jsperf.com/smi-vs-double-vs-none](https://jsperf.com/smi-vs-double-vs-none)

上の jsperf で確認すると、なぜか SMI > (none) > Double の順のスピードになっていますが、これはおそらく Double の配列は最適化時に強制的に浮動小数点扱いされてしまっている可能性が高いですね。(none) は毎回型チェックしているのでしょう。

そして Packed と Holey の関係と同じように、SMI から一度 Double や (none) に状態が変わったり、Double から (none) に状態が変わると、二度と再度 SMI や Double の状態に戻ることがありません。<span style="color:red">整数配列や数字配列に余計なものを一度代入するだけで、その後の最適化がすべて失われてしまいます<span>。気をつけましょう。

`var array = [];` もしくは `var array = new Array();` のような、何も代入していない状態の配列は、`SMI_PACKED_ELEMENTS` になっています。一番最適化の効く状態ですね。逆に一番最適化の効かない状態は、`HOLEY_ELEMENTS` です。`var a = []; a[1] = "";` みたいにしちゃったら出来ます。

気をつけないといけないのは、`SMI_ELEMENTS` は `Infinity` や `NaN` などを代入すると `DOUBLE_ELEMENTS` に変わってしまいます。またあくまでも Small Integer のみ対象で、正確には 32bit 整数に限られます。`var a = [2147483647, -2147483648];` は SMI ですが、`var a = [2147483648]; var b = [-2147483649]` は Double になります。あと、普通のコードではまず登場することがありえないのですが `var a = [-0];` は Double になります。`+0` は SMI です。ここらへんは浮動小数点絡みですね。

## まとめ

極限まで高速化を考える時は、

* `new Array(100)` のように配列を初期化するのをやめましょう
* 整数の配列は整数のみ、数字の配列は数字のみを代入するようにしましょう

ということでした！間違いなどありましたら、気軽に [@tkihira](https://twitter.com/tkihira) までご連絡ください！






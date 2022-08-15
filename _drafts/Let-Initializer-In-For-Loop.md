---
layout: post
title: JavaScript のクロージャーと for 文の let 初期化の例外
categories:
- JavaScript
---

先日、次のような JavaScript クイズを Twitter で出しました。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">// JavaScript quiz: 出力は？<br>const a = [];<br>{<br> for(let i = 0; i &lt; 10; i++) {<br> a[i] = () =&gt; console.log(i);<br> }<br>}<br>a[3]();<br>{<br> let i;<br> for(i = 0; i &lt; 10; i++) {<br> a[i] = () =&gt; console.log(i);<br> }<br>}<br>a[3]();<br>{<br> for(let i = 0; i &lt; 10;) {<br> a[i] = () =&gt; console.log(i);<br> i++;<br> }<br>}<br>a[3]();</p>&mdash; Takuo Kihira (@tkihira) <a href="https://twitter.com/tkihira/status/1559013385148452864?ref_src=twsrc%5Etfw">August 15, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

答えとしては 3, 10, 4 なのですが、for 文の let 初期化専用の例外処理がない場合は 10, 10, 10 になるべき問題です。<span style="color:blue">クロージャーをしっかり理解していれば（そして例外処理を知らなければ）、答えは全部 10 になるはずなのです</span>。今回この記事では、なぜ 10 になるべきなのか、そしてなぜ 10 にならないのか、について解説します。




解説はいらん、仕様を確認させろ！という方は、記事最後の余談まで飛ばしてください。

# クロージャーとは

クロージャーの説明は [MDN のクロージャーの解説](https://developer.mozilla.org/ja/docs/Web/JavaScript/Closures)にとてもよくまとまっています。ここでは、実例を元に解説をしてみましょう。

## var の時代の話

let や const が登場する前は、JavaScript の変数 (var) のスコープは関数単位でしか存在しませんでした。次のような関数を考えてみましょう（時代に合わせて arrow function を使っていません）。

```javascript
(function() {
    var a = [];
    for(var i = 0; i < 10; i++) {
        a[i] = function() {
            console.log(i);
        };
    };
    a[3](); // => 10
})();
```

変数 a も i も、大外の関数内で定義されています。大外の関数は即時関数として 1 回起動されているだけですので、変数 i のインスタンスも 1 個しか存在しません。そして、当たり前ですが、関数は実行されるまで実行されません。<span style="color:blue">すなわち、`console.log(i);` が実行される時に変数 i の値が改めて参照されるのです</span>。よって、console.log が呼び出されるのはループが終わった後であり、その時の i は 10 になっているため、結果として `a[3]();` を呼び出しても 10 が表示されます。

もし 3 を表示したければ、当時は次のようにコードを変える必要がありました。

```javascript
(function() {
    var a = [];
    for(var i = 0; i < 10; i++) {
        a[i] = (function() {
            var _i = i;
            return function() {
                console.log(_i);
            }
        })();
    };
    a[3](); // => 3
})();
```

新しい変数 `_i` のスコープを新設するために、ループごとに新しい関数が作られます。そしてその関数を即時実行し、`_i` に現在の `i` の値をコピーします。そして返り値としてまた新しい関数を用意して返すのですが、その関数の console.log で参照している変数はループごとに新たに宣言された `_i` であり、この `_i` はループごとにその時点の `i` がコピーされて以降一切変更されないので、結果として `a[3]();` を呼び出した時には 3 が表示されます。

このように、関数がそこから参照できる変数と結びついている関係をクロージャーと呼びます。仮にその関数の呼び出し時には既に参照している変数のスコープの外であったとしても、関数自体に変数にアクセスする環境（レキシカル環境と呼ばれます）が結びついているため、関数が存在する限りその内部からは変数にアクセス出来ます。

## let と const の登場

その後登場した let と const は、var のように関数単位のスコープではなく、ブロック単位のスコープを持ちます。簡単に言うと、{} の括弧で囲まれた範囲でのみ生存します。

まずは前と同じような結果になるように書いてみましょう。

```javascript
(() => {
    const a = [];
    let i = 0;
    while(i < 10) {
        a[i] = () => {
            console.log(i);
        };
        i++;
    }
    a[3](); // => 10
})();
```

`let i` は大外の括弧の中で一度だけ宣言されており、実体は 1 つだけです。そして console.log から参照されている i は while 文が終わった段階で 10 になっております。なので、 `a[3]();` は 10 を表示します。

3 を表示したければ、次のように変更します。

```javascript
(() => {
    const a = [];
    let i = 0;
    while(i < 10) {
        const _i = i;
        a[i] = () => {
            console.log(_i);
        };
        i++;
    }
    a[3](); // => 3
})();
```

新しく定義された変数 `_i` は、while の中のブロックでしか生存しません。そして console.log から参照している `_i` は <span style="color:blue">while ループで毎回新しく作られている変数 `_i` を参照</span>しており、そこには毎回実行時に `i` の値がコピーされています。そして console.log を含む関数がループごとに生成された `_i` 変数の環境と結びついているため、結果として `a[3]();` が 3 を表示します。

このように let や const の登場によって、クロージャー（レキシカル環境）を作成するのに一時関数を作らなくて済むようになり、より軽量で読みやすいコードを書けるようになりました。

# for 文の let 初期化時の例外

さて本題の for ループについて考えてみましょう。文法的には、次の 3 つの for 文は本来同じ処理を行うはずです。

```javascript
(() => {
    const a = [];
    {
        for(let i = 0; i < 10; i++) {
            a[i] = () => {
                console.log(i);
            };
        }
    }
    a[3](); // => 3
    {
        let i;
        for(i = 0; i < 10; i++) {
            a[i] = () => {
                console.log(i);
            };
        }
    }
    a[3](); // => 10
    {
        for(let i = 0; i < 10;) {
            a[i] = () => {
                console.log(i);
            };
            i++;
        }
    }
    a[3](); // => 4
})();
```

今までの説明に照らし合わせれば、console.log の参照する変数 `i` は一度しか宣言されていない変数であり、その変数はループが終わった後で 10 になっているため、その参照を握っている console.log はすべてのケースにおいて 10 を表示するのが正しい挙動になるはずです。しかし、実際にはこのようにバラバラの値を表示しております。なぜでしょうか？

<span style="color:red; font-weight:bold">これは、JavaScript(ECMAScript) がわざわざ for 文にのみ入れた例外的な挙動のためです</span>。この例外は、for 文の中で let で初期化した変数にしか発生しません。

JavaScript では **`for(let ...;...;...)` の形で for 文を作った場合に限り**、<span style="color:blue">例外的に for 文でループのたびに新しい変数のスコープ（正確には「レキシカル環境: lexical environment」）を生成し、そのレキシカル環境に for の中で **let 宣言された変数に限って**ループのたびに状態をコピーします</span>。具体的な仕様は後で余談として解説します。

実際に追ってみましょう。まず一番上の例ですが、for 文の各ループにおいて新しいスコープが作成されています。<span style="color:blue">よって for 文のブロック内の i は別々の変数定義になります</span>。いわば、for 文のループごとに変数 i の名前が内部的に変わっているような状態です。よって、console.log の指す変数 i はそのループごとに独立した変数になり、よって `a[3]();` の出力は 3 になります。

2 つ目の例は、for 文の中で i を宣言していないので、その特例が適用されません。スコープとしてはほぼ同じなのに、<span style="color:blue">for 文のなかで i が宣言されなかった</span>という理由により、console.log の指す変数 i はループ内において常に同一の変数を指し続けます。i はループが終わった後に 10 になるので、 `a[3]();` で出力される数字も 10 になります。

最後の例も、for 文の中で i を宣言しているので、1 番目の例と同じように毎回同じように新しいスコープ（レキシカル環境）が新規生成され、そこに i の情報がコピーされます。ただし、<span style="color:red">console.log はそのループにおける i への参照を持つので、ループの内部で i が変更された場合は、そのループブロックにおける最終的な i の値を出力します</span>。今回はブロックの最後で `i++;` で i に 1 を足しているので、ブロックが終わった時の i の値が表示されることになり、結果として 4 が表示されます。

# まとめ

for 文中で let で初期化した場合、ループごとにレキシカル環境が別途構築され、let で初期化した変数に限って値がコピーされます。これによって、別途スコープを用意することなく、ループ変数を利用して、その時々のループ変数の値を用いたクロージャーを構築することが出来ます。そもそも for 文において、ループ変数をいじったり、ループ変数をそのままクロージャーで関連付ける必要性があることは滅多にないため、この特例の存在で不便を強いられることはまず無いと思います。

この挙動は理解さえしてしまえば便利ではあるのですが、本来のクロージャーのあるべき挙動とは異なるために、クロージャーを理解していればいるほど例外の存在を知らないと面食らうかと思います。またクロージャーに不慣れな人にとっては、この存在を知ってしまうことでクロージャーの原理を誤解しかねない挙動でもあると思います。言語の一貫性を犠牲にして便利さを優先した仕様ですね。

この挙動をカジュアルに利用したプログラムも多く存在するので、**JavaScript において知っておくべき挙動だと思います**。色々な意味で、ぜひ頭の片隅に置いておいてください。

# 余談: 仕様で挙動を確認する

例によって長い余談です。

さて、この例外的な挙動は仕様でどのように定義されているのか、ECMAScript の仕様を紐解いてみましょう。なお、仕様の中に出てくる ? は「ここでは例外とか起こるかも」、! は「絶対に例外とか起こらん」という意味だとざっくり思っておいてください。詳しくは [5.2 Algorithm Conventions](https://262.ecma-international.org/13.0/#sec-algorithm-conventions) を読んでみてください。

## 14.7.4.2 ForLoopEvaluation

まずは ForLoop の処理から追ってみましょう。仕様の以下の部分です。

[https://262.ecma-international.org/13.0/#sec-runtime-semantics-forloopevaluation](https://262.ecma-international.org/13.0/#sec-runtime-semantics-forloopevaluation)

これの `for ( LexicalDeclaration Expression^opt ; Expression^opt ) Statement` の部分が、今回の処理に当たります。 `LexicalDeclaration` には let もしくは const で変数が宣言されます。では処理を見てみましょう。

```
1. Let oldEnv be the running execution context's LexicalEnvironment.
2. Let loopEnv be NewDeclarativeEnvironment(oldEnv).
3. Let isConst be IsConstantDeclaration of LexicalDeclaration.
4. Let boundNames be the BoundNames of LexicalDeclaration.
5. For each element dn of boundNames, do
  a. If isConst is true, then
    i. Perform ! loopEnv.CreateImmutableBinding(dn, true).
  b. Else,
    i. Perform ! loopEnv.CreateMutableBinding(dn, false).
6. Set the running execution context's LexicalEnvironment to loopEnv.
7. Let forDcl be the result of evaluating LexicalDeclaration.
8. If forDcl is an abrupt completion, then
  a. Set the running execution context's LexicalEnvironment to oldEnv.
  b. Return ? forDcl.
9. If isConst is false, let perIterationLets be boundNames; otherwise let perIterationLets be a new empty List.
10. Let bodyResult be Completion(ForBodyEvaluation(the first Expression, the second Expression, Statement, perIterationLets, labelSet)).
11. Set the running execution context's LexicalEnvironment to oldEnv.
12. Return ? bodyResult.
```

まず (1) で `oldEnv` に現在のレキシカル環境を退避して、(2) で新しいレキシカル環境 `loopEnv` を `oldEnv` を元に作ります（レキシカル環境の作成時は外側のレキシカル環境を保持します）。そして (3) で `isConst` に `LexicalDeclaration` が const であるかどうか、すなわち `for(const ...;;)` であるか `for(let ...;;)` であるかのフラグをセットします。(4) で `boundNames` という変数に宣言された変数名のリストを保存しておきます。そして (5) で `loopEnv` にその変数名を追加します。(6) で現在のレキシカル環境を、その `loopEnv` にセットします。

(7) で、let や const の初期化部分を評価します。そこでもし例外が発生したら (8) で例外用の処理をやって for 文から抜けます。

さて、(9) で今回の例外処理の準備が始まります。もし `isConst` が false、すなわち let で初期化されていた場合は `perIterationLets` にその変数名一覧を保存します。const で初期化されていた場合は空リストにしておきます。

そして (10) で `ForBodyEvaluation` という抽象関数を、 `the first Expression` (=> i < 10 の部分), `the second Expression` (=> i++ の部分）, `statement`（ループコード）, `perIterationLets` (let で宣言された変数名一覧), `labelSet` (ラベル付き break とかでループを抜けるための情報一覧) を引数として呼びます。なお `Completion` は仕様を読みやすくするアサートみたいなものです。<span style="color:blue">ここで `perIterationLets`、すなわち let で宣言された変数名リストを `ForBodyEvaluation` に引き渡している点に注目です</span>。

ループ本体の処理が終わったら、(11) で (1) で退避していたレキシカル環境に戻して、(10) の返り値をそのまま返して終了です。

これが `ForLoopEvaluation` の処理です。実際のループ内部の処理は `ForBodyEvaluation` に引き継がれています。

## 14.7.4.3 ForBodyEvaluation

では次は ForBodyEvaluation の処理を追います。

[https://262.ecma-international.org/13.0/#sec-forbodyevaluation](https://262.ecma-international.org/13.0/#sec-forbodyevaluation)

```
1. Let V be undefined.
2. Perform ? CreatePerIterationEnvironment(perIterationBindings).
3. Repeat,
  a. If test is not [empty], then
    i. Let testRef be the result of evaluating test.
    ii. Let testValue be ? GetValue(testRef).
    iii. If ToBoolean(testValue) is false, return V.
  b. Let result be the result of evaluating stmt.
  c. If LoopContinues(result, labelSet) is false, return ? UpdateEmpty(result, V).
  d. If result.[[Value]] is not empty, set V to result.[[Value]].
  e. Perform ? CreatePerIterationEnvironment(perIterationBindings).
  f. If increment is not [empty], then
    i. Let incRef be the result of evaluating increment.
    ii. Perform ? GetValue(incRef).
```

(1) で作られている V は、ループの評価の返り値になります（今回は無視して良いです）。 (2) の `CreatePerIterationEnvironment(perIterationBindings)` の呼び出しが今回の本題になりますが、とりあえず先にループの処理を見てみましょう。

ループ自体は (3) の Repeat で実行されます。まず (a) で `test` (=> i < 10 の部分) が空でなければ、実際に `test` を評価して、それが false になっていれば (iii) の return でループから抜けます。もし `test` が空であれば、ここではループからは抜けません（ `for(;;)` みたいな無限ループです）。

(b) で `stmt` を評価し、実際のループの内容を実行します。ここで、もし stmt が括弧で包まれていた場合、すなわち仕様的に [Block](https://262.ecma-international.org/13.0/#prod-Block) であれば、ここでさらに新たなレキシカル環境が作成されます。上の例で登場した `const _i` はここの Block の中で作られたレキシカル環境に紐付いた変数ということになります。詳しくは、[14.2.2 Runtime Semantics: Evaluation](https://262.ecma-international.org/13.0/#sec-block-runtime-semantics-evaluation) を見てください。

さて、(b) の評価をした結果を (c) の `LoopContinues` で評価します。break、return、もしくはラベル付き continue などが出てきた場合はループから抜けます。(d) では実行結果を V に保存しておきます。

さて (e) で、再度 `CreatePerIterationEnvironment(perIterationBindings)` の評価をしています。後で解説しますが、この位置で呼び出しているのが重要です。

最後に (f) で `increment` (=> i++ の部分) の評価をします。そして (3) の先頭に戻ります。

ここまで読んできて、ループ自体の仕様は極めて普通で、特殊なのは `CreatePerIterationEnvironment` という抽象関数を呼んでいるところのみです。次はこれを追いましょう。

## 14.7.4.4 CreatePerIterationEnvironment

最後に `CreatePerIterationEnvironment` の処理を追っていきます。ここに例外処理のすべてが詰まっています。

[https://262.ecma-international.org/13.0/#sec-createperiterationenvironment](https://262.ecma-international.org/13.0/#sec-createperiterationenvironment)

```
1. If perIterationBindings has any elements, then
  a. Let lastIterationEnv be the running execution context's LexicalEnvironment.
  b. Let outer be lastIterationEnv.[[OuterEnv]].
  c. Assert: outer is not null.
  d. Let thisIterationEnv be NewDeclarativeEnvironment(outer).
  e. For each element bn of perIterationBindings, do
    i. Perform ! thisIterationEnv.CreateMutableBinding(bn, false).
    ii. Let lastValue be ? lastIterationEnv.GetBindingValue(bn, true).
    iii. Perform ! thisIterationEnv.InitializeBinding(bn, lastValue).
  f. Set the running execution context's LexicalEnvironment to thisIterationEnv.
2. Return unused.
```

まず (1) で `perIterationBindings` の中身の確認をしています。ここは for 文で let 初期化された変数の一覧（もし `for(let i = 0;...;...)` ならば `i` ）が入っています。const で初期化されている場合は空になります。

もし中身があれば、(a) で `lastIterationEnv` に現在のレキシカル環境を退避します。そして (b) で、その一つ外側のレキシカル環境（すなわち for 実行直前のレキシカル環境）を `outer` に保存します。(c) である通り、for でレキシカル環境を新たに作り出しているのでここでは null にはなりません。

(d) で、新たに `thisIterationEnv` というレキシカル環境を `outer` を元にして生成します。ここで作られたレキシカル環境は for 文の実行直前のレキシカル環境と同じであるため、まだ中には let で初期化される変数（ `i` など）が登録されておりません。

よって、(e) で `perIterationBindings` の中身一つずつ、すなわち let で初期化される変数名一つずつにおいて処理を開始します。まずその変数名を `bn` とします（例えば `i` のような名前が入っています）。そして、(i) で新しく作ったレキシカル環境 `thisIterationEnv` に `bn` 変数を追加し、(ii) で退避したレキシカル環境 `lastIterationEnv` から変数名 `bn` の値を `lastValue` に取り出し、それを新しく作ったレキシカル環境 `thisIterationEnv` の `bn` に保存しています。

**すなわち、ここで古いレキシカル環境 `lastIterationEnv` の変数名 `bn` を新しいレキシカル環境 `thisIterationEnv` の変数名 `bn` にコピーしているのです！**

そして (f) で、現在のレキシカル環境を新しく作った `thisIterationEnv` に設定して終了します。これにて、次のループで参照されるレキシカル環境は以前のループとは別の環境に変わります。

このように `CreatePerIterationEnvironment` 抽象関数では、レキシカル環境を新たに構築し、そこで for 文の let で宣言された変数名のみコピーしています。そして `ForBodyEvaluation` ではこの関数をループの先頭、ならびに `increment` (i++ などの部分) の直前に呼んでいるため、 `for(let i = 0; i < 10; i++)` 構文によって新しく作られたレキシカル環境では i++ によって i に 1 が加算された状態でループブロックが開始するのです。

今回の例のように、ループのブロックの最後で `i++;` を自分で呼ぶようにしていると、そのループで利用されているレキシカル環境の i が変更されるため、console.log が参照していた i も変更されてしまうことになります。よって `a[3]();` において 4 が出力されるという結果に繋がるわけです。


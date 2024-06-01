---
layout: post
title: JavaScript 実行エンジン V8 の JIT 出力コードを読んでみよう
categories:
- JavaScript
---

Chrome の JavaScript はとても高速なことでも有名ですが、その実行エンジンは V8 と呼ばれます。V8 自体は独立したモジュールであり、Node.js 等にも使われております。

V8 が JavaScript を高速に実行する技術の一つが JIT (Just In Time) コンパイルです（一般的に JIT と呼ばれます）。これは、そのまま実行すると遅い JavaScript を実行中にリアルタイムに直接マシンコードに変換し（これが Just In Time と呼ばれる所以です）、途中からそのコードに入れ替えて実行することで高速化を達成しています。特に何度も実行される関数で効力を発揮します。

JIT という名前は聞いたことがあろうとも、実際に JIT がどのようなコードを実行しているのかを確認する機会は滅多にないでしょう。この記事では、実際に V8 の JIT の出力を確認してみます。




# 不思議な挙動

先日、このようなツイートをしました。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">// JavaScript クイズ！<br><br>// Preparation<br>const a=[];<br>for(let i=0; i&lt;1_000_000; i++)<br> a.push((Math.random()*100)|0);<br><br>// Test 1<br>let s=0;<br>for(let i=0; i&lt;a.length; i++) s+=a[i];<br><br>// Test 2<br>let s=0;<br>for(let i=0; i&lt;1_000_000; i++) s+=a[i];<br><br>// Chrome で 1 と 2 どちらが速いでしょうか？</p>&mdash; Takuo Kihira (@tkihira) <a href="https://twitter.com/tkihira/status/1795268244678513001?ref_src=twsrc%5Etfw">May 28, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

直感的に「Test 2 の方が速い」もしくは「どちらも大体同じ程度」を選ばえる方が多いと思うのですが、答えは直感とは反した「Test 1 の方が速い」になります。面白いですね。皆さんも手元に Chrome があれば、[是非ご自身の環境で試してみてください](https://perf.link/#eyJpZCI6InQ3M3d6MHR6ajB5IiwidGl0bGUiOiJhcnIubGVuZ3RoIHZzIGNvbnN0YW50IiwiYmVmb3JlIjoiY29uc3QgYSA9IG5ldyBBcnJheSgpO1xuZm9yKGxldCBpID0gMDsgaSA8IDFfMDAwXzAwMDsgaSsrKVxuICBhLnB1c2goKE1hdGgucmFuZG9tKCkgKiAxMDApIHwgMCk7XG4iLCJ0ZXN0cyI6W3sibmFtZSI6ImEubGVuZ3RoIiwiY29kZSI6ImxldCBzID0gMDtcbmZvcihsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSBzICs9IGFbaV07IiwicnVucyI6WzEwMDAsMTAwMCwxMDAwLDEwNjIsMTAwMCwxMDAwLDEwNjIsMTAwMCwxMDAwLDEwNjIsMTA2MiwxMDYyLDEwMDAsMTAwMCwxMDAwLDEwMDAsMTA2MiwxMDAwLDEwMDAsMTA2MiwxMDAwLDEwNjIsMTA2MiwxMDYyLDEwNjIsMTAwMCwxMDAwLDEwNjIsMTAwMCwxMDAwLDEwNjIsMTAwMCwxMDYyLDEwNjIsMTAwMCwxMDYyLDEwNjIsMTAwMCwxMDYyLDEwNjIsMTAwMCwxMDYyLDEwMDAsMTA2MiwxMDYyLDEwMDAsMTA2MiwxMDAwLDEwMDAsMTA2MiwxMDYyLDEwMDAsMTA2MiwxMDAwLDEwMDAsODc1LDgxMiw5MzcsNTYyLDgxMiwxMDYyLDEwMDAsMTAwMCwxMDYyLDEwMDAsMTA2MiwxMDAwLDEwNjIsMTA2MiwxMDYyLDEwMDAsMTA2MiwxMDYyLDEwNjIsMTA2MiwxMDYyLDEwMDAsMTAwMCwxMDYyLDEwMDAsMTAwMCwxMDAwLDEwNjIsMTA2MiwxMDAwLDEwMDAsMTA2MiwxMDYyLDEwNjIsMTAwMCwxMDAwLDEwMDAsMTA2MiwxMDAwLDEwNjIsMTAwMCwxMDAwLDEwNjIsMTA2MiwxMTI1XSwib3BzIjoxMDIwfSx7Im5hbWUiOiIxXzAwMF8wMDAiLCJjb2RlIjoibGV0IHMgPSAwO1xuZm9yKGxldCBpID0gMDsgaSA8IDFfMDAwXzAwMDsgaSsrKSBzICs9IGFbaV07IiwicnVucyI6WzY4Nyw2MjUsNjI1LDY4Nyw2ODcsNjI1LDYyNSw2MjUsNjI1LDYyNSw2MjUsNjg3LDYyNSw2MjUsNjI1LDYyNSw2ODcsNjI1LDYyNSw2ODcsNjI1LDY4Nyw2ODcsNjg3LDY4Nyw2MjUsNjI1LDY4Nyw2ODcsNjI1LDYyNSw2MjUsNjg3LDY4Nyw2ODcsNjg3LDY4Nyw2MjUsNjg3LDY4Nyw2MjUsNjg3LDYyNSw2ODcsNjI1LDYyNSw2MjUsNjg3LDYyNSw2MjUsNjg3LDYyNSw2MjUsNjI1LDYyNSw1NjIsNjI1LDYyNSw2MjUsNjI1LDY4Nyw2MjUsNjI1LDY4Nyw2MjUsNjg3LDYyNSw2MjUsNjg3LDY4Nyw2MjUsNjg3LDY4Nyw2ODcsNjI1LDY4Nyw2ODcsNjI1LDYyNSw2MjUsNjg3LDYyNSw2ODcsNjg3LDY4Nyw2MjUsNjI1LDY4Nyw2ODcsNjI1LDYyNSw2ODcsNjg3LDYyNSw2ODcsNjI1LDYyNSw2ODcsNjg3LDY4N10sIm9wcyI6NjUyfV0sInVwZGF0ZWQiOiIyMDI0LTA1LTI3VDE2OjAyOjExLjI5NVoifQ%3D%3D)。

さて、なぜこのような不思議な挙動が起こるのでしょうか？先に結論を書いてしまうと、これは「境界値チェック」の必要がなくなるためです。少し乱暴なまとめになりますが、以下のような最適化が順次入っていきます。

- 最適化されずに実行されると、Test1 だとループ毎に `a.length` の評価が発生し、Test2 の `1_000_000` の評価より遅くなる
- for で毎回比較される `a.length` は、最適化によってループの外側に出される
    - `for(let len = a.length, i = 0; i < len; i++) ...` といったコードになる
    - この段階の最適化で、両者のコードはほぼ同等のスピードになる
- `a.length` と指定されているコードだと、ループの中で確実に配列にアクセス可能であることが保証されるため、境界値チェック（配列の境界を超えてアクセスしたかどうかのチェック）の必要がない。最適化によって、境界値チェックのコードがなくなる
    - このおかげで Test1 の方が Test 2 よりも速くなる

なお、おそらくこの最適化が入っていないため、Safari や Firefox ではほぼ同等の結果になります。なお、これだけの結果をもって Safari や Firefox の最適化が Chrome より劣っているという結論には全くなりませんので、その点は注意してください（この最適化の導入コストが高くて、結果として遅くなる可能性もありますし、速度以外にもメモリ使用量等、優劣のポイントは単純ではありません）。

とはいえ、上記は「おそらくそうだろう」という推測の域を出ておりません。実際に何が原因で速度の差が発生しているのか、確かめてみたくなりますよね。そのためには、実際に JIT で生成されたコードを比較するしかありません。幸いにも、V8 では JIT のコードを比較的簡単に確認出来るので、せっかくなので上記の現象を確かめてみましょう。

ではここから、実際に V8 の JIT 出力を確認して、どのようなコードの違いが発生しているのか見ていきます！

# JIT コードの出力

上述したように、Chrome の JavaScript エンジン V8 は Node.js でも使われています。なので、今回は Node.js で JIT コードの確認をしてみましょう。今回は Node.js のバージョン 20.14.0 で動作確認をしております。

Node.js で JIT コードを確認するには、 `--print-opt-code` オプションを使います。JIT の最適化が発生し完了したタイミングで標準出力にネイティブコードが出力されます。今回はこのオプションのみで調査をしていきましょう。

他にも、JIT 関連で便利なオプションがいくつかあります。 `--trace-opt` と `--trace-deopt` で、最適化の各イベントのタイミング、ならびに最適化コードが効力を失うタイミングを確認出来ます。自分の関数が本当にきちんと最適化されているのか？どのタイミングで最適化されているのか？といったことを確認できます。後 `--print-code` で最適化される前の中間コード（V8 の場合、構文解析の結果 V8 の独自の形式でバイナリ化したコード）を確認することもできます。

## コードの準備

さて、ここでテストコードを確実にコンパイルさせるために、次のようなコードを用意します。

`test1.js`:

```js
const a = [];
for (let i = 0; i < 1_000_000; i++)
    a.push((Math.random() * 100) | 0);


const f = () => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i];
};

for (let i = 0; i < 10000; i++) {
    f();
}
```

`test2.js`:

```js
const a = [];
for (let i = 0; i < 1_000_000; i++)
    a.push((Math.random() * 100) | 0);

const f = () => {
    let s = 0;
    for (let i = 0; i < 1_000_000; i++) s += a[i];
};

for (let i = 0; i < 10000; i++) {
    f();
}
```

違いは、 `f` 関数の中の for 文の条件のみです。Twitter のテストコードを忠実に持ってきました。

## ARM の場合

さて、手元の Apple M1 チップで確認します。とりあえず時間を計ってみました。

```
$ time node test1.js 

real	0m7.851s
user	0m7.683s
sys	0m0.084s
$ time node test2.js

real	0m8.623s
user	0m8.485s
sys	0m0.071s
```

とりあえず、Node.js でも実行時間の差が出ているようですね。では次のコードを実行して、最適化コードを表示してみましょう。

```
$ node --print-opt-code test1.js > test1.code
```

M1 は ARM アーキテクチャなので、当然ながら JIT は ARM のアセンブラで出力されます。適当に一部を抜粋します。

```
0x12a00c77c    dc  9360fc08       asr x8, x0, #32
0x12a00c780    e0  1e620100       scvtf d0, w8
0x12a00c784    e4  9360fce7       asr x7, x7, #32
0x12a00c788    e8  9360fc84       asr x4, x4, #32
0x12a00c78c    ec  6b07009f       cmp w4, w7
0x12a00c790    f0  54000c82       b.hs #+0x190 (addr 0x12a00c920)
0x12a00c794    f4  11000487       add w7, w4, #0x1 (1)
0x12a00c798    f8  d2e80b30       movz x16, #0x4059000000000000
0x12a00c79c    fc  9e670201       fmov d1, x16
0x12a00c7a0   100  1e610800       fmul d0, d0, d1
0x12a00c7a4   104  1e7e0008       fjcvtzs w8, d0
0x12a00c7a8   108  2a0403e4       mov w4, w4
0x12a00c7ac   10c  f94033e9       ldr x9, [sp, #96]
0x12a00c7b0   110  9360fd2a       asr x10, x9, #32
0x12a00c7b4   114  d3607ce7       lsl x7, x7, #32
0x12a00c7b8   118  d37df084       lsl x4, x4, #3
0x12a00c7bc   11c  f8017047       stur x7, [x2, #23]
0x12a00c7c0   120  d3607d02       lsl x2, x8, #32
0x12a00c7c4   124  91003c84       add x4, x4, #0xf (15)
0x12a00c7c8   128  f82468c2       str x2, [x6, x4]
0x12a00c7cc   12c  31000542       adds w2, w10, #0x1 (1)
0x12a00c7d0   130  54001646       b.vs #+0x2c8 (addr 0x12a00ca98)
```

ありがたいことに、きちんと逆アセンブルされた状態で出てきますね！

読めますか？読めませんよね。大丈夫、それが普通です。

JIT に限らずなのですが、アセンブラを読む場合は背後にある考え方を理解していないと、かなり厳しいです。そのコードでは何をしようとしているのか、メモリの中にデータがどのように配置されているのか、そういった前情報がないと極めて読むのが難しくなります。また、アーキテクチャがどのように関数を扱うのか、命令でどのようなフラグが変わるのか、みたいな知識も必要になります。そういった幅広い知識のもとで、やっと逆アセンブルのコードが読めるようになってきます。

私はアセンブラにある程度慣れているので、時間をかければなんとなく意味がわかる程度には読めます。今回は、幸いにも「足し算をしているだけ」というヒントがあるので、それを手がかりとして追ってみましょう。

## 該当のコードを確認

まず最初に、どの部分が最適化された出力なのかを確認します。今回は、以下の関数の最適化を探します。

```
--- Raw source ---
() => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i];
};
```

気をつけないといけないのは、 **V8 は同じ関数を 2 回最適化することがあります** 。今回はまさにそれが発生しているので、上記の関数が 2 回最適化されています。なので、2 個目の最適化（後ろの方）を参照しましょう。

次に、 `s += a[i];` をヒントに該当のコードを探します。足し算のニーモニックは `add` ならびに `adds` です。検索すると 5 つ存在し、そのうち 2 つが ret 直前（そこから分岐なし）なので除外、残りの 3 つのうち 2 つが定数の足し算なので除外です。結果として、以下のコードが `s += a[i];` の足し算であることが（私の中で）確定しました。

```
0x12a00d104    a4  2b060066       adds w6, w3, w6
```

その周りのコードを読んで、ループの部分を抜き出しました。

```
0x12a00d0d0    70  aa0603e3       mov x3, x6
0x12a00d0d4    74  f85ff046       ldur x6, [x2, #-1]
0x12a00d0d8    78  eb0400df       cmp x6, x4
0x12a00d0dc    7c  54000a41       b.ne #+0x148 (addr 0x12a00d224)
0x12a00d0e0    80  b881b046       ldursw x6, [x2, #27]
0x12a00d0e4    84  6b0600bf       cmp w5, w6
0x12a00d0e8    88  540001c2       b.hs #+0x38 (addr 0x12a00d120)
0x12a00d0ec    8c  2a0503e6       mov w6, w5
0x12a00d0f0    90  d37df0c6       lsl x6, x6, #3
0x12a00d0f4    94  f840f047       ldur x7, [x2, #15]
0x12a00d0f8    98  91003cc6       add x6, x6, #0xf (15)
0x12a00d0fc    9c  f86668e6       ldr x6, [x7, x6]
0x12a00d100    a0  9360fcc6       asr x6, x6, #32
0x12a00d104    a4  2b060066       adds w6, w3, w6
0x12a00d108    a8  54000906       b.vs #+0x120 (addr 0x12a00d228)
0x12a00d10c    ac  110004a5       add w5, w5, #0x1 (1)
0x12a00d110    b0  f8520343       ldur x3, [x26, #-224]
0x12a00d114    b4  eb2363ff       cmp sp, x3
0x12a00d118    b8  54fffdc8       b.hi #-0x48 (addr 0x12a00d0d0)
0x12a00d11c    bc  14000021       b #+0x84 (addr 0x12a00d1a0)
```

こちらが Test1 のコードになります。

## Test1 と Test2 のコードの比較

では同様に Test2 のコードも抜き出してみましょう。以下のようになりました。

```
0x13000d098    78  aa0603e3       mov x3, x6
0x13000d09c    7c  6b05001f       cmp w0, w5
0x13000d0a0    80  54000282       b.hs #+0x50 (addr 0x13000d0f0)
0x13000d0a4    84  f85ff046       ldur x6, [x2, #-1]
0x13000d0a8    88  eb0400df       cmp x6, x4
0x13000d0ac    8c  54000aa1       b.ne #+0x154 (addr 0x13000d200)
0x13000d0b0    90  f840f046       ldur x6, [x2, #15]
0x13000d0b4    94  b881b047       ldursw x7, [x2, #27]
0x13000d0b8    98  2a0003e8       mov w8, w0
0x13000d0bc    9c  d37df108       lsl x8, x8, #3
0x13000d0c0    a0  6b07001f       cmp w0, w7
0x13000d0c4    a4  54000a02       b.hs #+0x140 (addr 0x13000d204)
0x13000d0c8    a8  91003d07       add x7, x8, #0xf (15)
0x13000d0cc    ac  f86768c6       ldr x6, [x6, x7]
0x13000d0d0    b0  9360fcc6       asr x6, x6, #32
0x13000d0d4    b4  2b060066       adds w6, w3, w6
0x13000d0d8    b8  54000986       b.vs #+0x130 (addr 0x13000d208)
0x13000d0dc    bc  11000400       add w0, w0, #0x1 (1)
0x13000d0e0    c0  f8520343       ldur x3, [x26, #-224]
0x13000d0e4    c4  eb2363ff       cmp sp, x3
0x13000d0e8    c8  54fffd88       b.hi #-0x50 (addr 0x13000d098)
0x13000d0ec    cc  14000021       b #+0x84 (addr 0x13000d170)
```

コードの配置は両者で微妙に違うのですが、明確に Test1 に入っていないコードが 2 行入っています。それがこちらです。

```
0x13000d0c0    a0  6b07001f       cmp w0, w7
0x13000d0c4    a4  54000a02       b.hs #+0x140 (addr 0x13000d204)
```

ちなみに、このジャンプ先のコードを見ると、次のように書かれています。

```
0x13000d204   1e4  97fffff9       bl #-0x1c (addr 0x13000d1e8)    ;; debug: deopt position, script offset 'a9'
                                                             ;; debug: deopt position, inlining id 'ffffffff'
                                                             ;; debug: deopt reason 'out of bounds'
                                                             ;; debug: deopt index 3
```

ビンゴ！境界値を超えたタイミングで deopt するコード、すなわちまさに境界値チェックをしているコードがループの中の差であることが突き止められました！この cmp 文が性能に影響をしたわけです。

なお、V8 のバージョンによって最適化のかかり具合は大きく異なります。最新版の V8 をビルドして計測したら、ループの中身を 4 並列にインライン展開しており、メモリの消費量を犠牲にしてより高速に実行されるようになっていました。

## 実行時間とインストラクション数

実行時間はインストラクション数と比例するわけではないのですが、RISC は各インストラクションの実行時間（サイクル数と呼ばれます；正確にはサイクル数×クロックが実行時間になります）が近い傾向があるので、参考までに比較してみましょう。

Test1 のインストラクション数は 20 で、Test2 は 22 でした。Test1 の命令数は Test2 の 20/22 = 90.9% と言えます。

上で私の手元で実行した時の実行時間 (user) は、test1.js が 7.683s、test2.js が 8.485s でした。7.683/8.485 = 90.5%、なかなか良い数字ですね。

# まとめ

実際にデータを目の当たりにして、なぜその現象が起こるのか、説得力の高い仮説を出せる能力は大切です。一方で、本当に仮説が正しいかどうかを確認する能力も、仮説立案と同じくらい大切な能力です。

今回は、実際の最適化されたコードの出力を追う形での仮説検証の方法を提示しました。実際の業務において、ここまでする必要は、まずありません。しかし、ここまでするやり方を知っていると、本当に困った時にどこまでも潜っていける自信になるのではないかと思います。

幸いにも V8 はソースが公開されており、また今回紹介したように、パフォーマンス・チューニングのために様々なオプションが用意されています。今回は Node.js 経由で追いましたが、V8 自体を自前でビルドするともっともっと様々な検証が可能になります。今回の記事が、皆さんのそういった方向の興味を掻き立てるものになれば幸いです。


## おまけ: x86 アーキテクチャの場合

せっかくなので x86 アーキテクチャでも見てみましょう。手元の Windows マシンで、Node v20.14.0 で確認しました。

`test1.code`(抜粋): 

```
00007FF6D9E88A00    80  498bf9               REX.W movq rdi,r9
00007FF6D9E88A03    83  48394aff             REX.W cmpq [rdx-0x1],rcx
00007FF6D9E88A07    87  0f85ff000000         jnz 00007FF6D9E88B0C  <+0x18c>
00007FF6D9E88A0D    8d  4c634a1b             REX.W movsxlq r9,[rdx+0x1b]
00007FF6D9E88A11    91  453bc1               cmpl r8,r9
00007FF6D9E88A14    94  0f8321000000         jnc 00007FF6D9E88A3B  <+0xbb>
00007FF6D9E88A1A    9a  4c8b4a0f             REX.W movq r9,[rdx+0xf]
00007FF6D9E88A1E    9e  4f634cc113           REX.W movsxlq r9,[r9+r8*8+0x13]
00007FF6D9E88A23    a3  4403cf               addl r9,rdi
00007FF6D9E88A26    a6  0f80e4000000         jo 00007FF6D9E88B10  <+0x190>
00007FF6D9E88A2C    ac  4183c001             addl r8,0x1
00007FF6D9E88A30    b0  493b65a0             REX.W cmpq rsp,[r13-0x60] (external value (StackGuard::address_of_jslimit()))
00007FF6D9E88A34    b4  77ca                 ja 00007FF6D9E88A00  <+0x80>
00007FF6D9E88A36    b6  e98b000000           jmp 00007FF6D9E88AC6  <+0x146>
```

`test2.code`(抜粋):

```
00007FF6D9E889C0    80  498bf8               REX.W movq rdi,r8
00007FF6D9E889C3    83  3d40420f00           cmp rax,0xf4240
00007FF6D9E889C8    88  0f8337000000         jnc 00007FF6D9E88A05  <+0xc5>
00007FF6D9E889CE    8e  48394aff             REX.W cmpq [rdx-0x1],rcx
00007FF6D9E889D2    92  0f8501010000         jnz 00007FF6D9E88AD9  <+0x199>
00007FF6D9E889D8    98  4c8b420f             REX.W movq r8,[rdx+0xf]
00007FF6D9E889DC    9c  4c634a1b             REX.W movsxlq r9,[rdx+0x1b]
00007FF6D9E889E0    a0  413bc1               cmpl rax,r9
00007FF6D9E889E3    a3  0f83f4000000         jnc 00007FF6D9E88ADD  <+0x19d>
00007FF6D9E889E9    a9  4d6344c013           REX.W movsxlq r8,[r8+rax*8+0x13]
00007FF6D9E889EE    ae  4403c7               addl r8,rdi
00007FF6D9E889F1    b1  0f80ea000000         jo 00007FF6D9E88AE1  <+0x1a1>
00007FF6D9E889F7    b7  83c001               addl rax,0x1
00007FF6D9E889FA    ba  493b65a0             REX.W cmpq rsp,[r13-0x60] (external value (StackGuard::address_of_jslimit()))
00007FF6D9E889FE    be  77c0                 ja 00007FF6D9E889C0  <+0x80>
00007FF6D9E88A00    c0  e98b000000           jmp 00007FF6D9E88A90  <+0x150>
```

差はここでした

```
00007FF6D9E889E0    a0  413bc1               cmpl rax,r9
00007FF6D9E889E3    a3  0f83f4000000         jnc 00007FF6D9E88ADD  <+0x19d>
```

この飛び先はここです

```
00007FF6D9E88ADD   19d  41ff55c8             call [r13-0x38]    ;; debug: deopt position, script offset 'af'
                                                             ;; debug: deopt position, inlining id 'ffffffff'
                                                             ;; debug: deopt reason 'out of bounds'
                                                             ;; debug: deopt index 3
```

やはり同じように境界値チェックですね。
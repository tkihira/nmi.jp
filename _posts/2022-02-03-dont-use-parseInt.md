---
layout: post
title: JavaScript で parseInt / parseFloat を使わない方が良い理由
categories:
- JavaScript
---

先日、Twitter のタイムライン上で JavaScript における `parseInt` 関数の不可解な挙動に関するネタがバズっていました。

```javascript
console.log(parseInt(0.000005)); // → 0
console.log(parseInt(0.0000005)); // → 5 !!!!!
```

この記事では、JavaScript における文字列から数値への変換について簡単に説明します。



# `parseInt(0.0000005) === 5` になる理由

結論から書くと、

```javascript
console.log(String(0.000005)); // → "0.000005"
console.log(String(0.0000005)); // → "5e-7"
```

となるのが原因です。`parseInt` というのは、文字列を解析して整数値（int）を返すグローバル関数であり、<span style='color:blue'>引数をまず文字列に変換する</span>仕様となっております。その段階で `0.0000005` が `"5e-7"` という文字列に変換されてしまい、その文字列の先頭の `5` だけが数字として解析されてしまったため、結果として `parseInt(0.0000005) === 5` となりました。

なぜ `String(0.000005) === "0.000005"` に、`String(0.0000005) === "5e-7"` になるのかについては、この記事の最後で余談として説明します。

# 整数化には Math.trunc を使おう

このように、`parseInt` は<span style='color:blue'>文字列を引数にすることを前提にしている</span>ため、速度の面でも可読性の面でも「小数値を整数値に変換したい」という場合に使うのは望ましくありません。最も望ましいのは、`Math.trunc` を使う方法でしょう。意図もはっきりして大変に良いです。

```javascript
const positive = 3.141592;
console.log(Math.trunc(positive)); // → 3
const negative = -2.718281;
console.log(Math.trunc(negative)); // → -2
const large = 12345678901.234;
console.log(Math.trunc(large)); // → 12345678901
```

`Math.floor` も使えそうに見えますが、<span style='color:red'>floor は整数化ではなく、その数値を超えない一番大きな整数を返す関数</span>です。マイナスの値における挙動が違うので、整数化したい場合には仮にプラスの値のみであることが保障されていても `Math.trunc` を使う方が望ましいです。

```javascript
const positive = 3.141592;
console.log(Math.floor(positive)); // → 3
const negative = -2.718281;
console.log(Math.floor(negative)); // → -3 !!!!!
```

`Math.trunc` が使えなかった時代は、同じ挙動のためにビット演算(`v >> 0` や `v | 0` や `~~v` など）を利用して整数化するのが一般的でした。しかし、これらの方法は可読性が悪い上に 32bit の範囲を超える整数値に関しては予期しない挙動となるので、速度が相当にクリティカルでない限り使わないようにしましょう。

```javascript
const positive = 3.141592;
console.log(positive | 0); // → 3
const negative = -2.718281;
console.log(negative | 0); // → -2
const large = 12345678901.234;
console.log(large | 0); // → -539222987 !!!!!
```

# parseInt も parseFloat も使うべきではない

「とはいっても、文字列から数値にする場合には `parseInt` / `parseFloat` を使っても良いでしょ？」

と思われるかもしれませんが、<span style='color:red'>使うべきではありません</span>。

## parseInt の場合

まず[parseIntの仕様](https://262.ecma-international.org/12.0/#sec-parseint-string-radix)は、完全に対象を数値文字の羅列と仮定した処理が定義されています。本来数値として何ら問題のない `1e3 === 1000` のような表現であっても、

```javascript
console.log(parseInt("1e3")); // → 1 !!!!!
```

と意図した表現になりません。次のように `Number` を使って数値に変換して書くようにしましょう。

```javascript
console.log(Math.trunc(Number("1e3"))); // → 1000
```

なお、<span style='color:blue'>例外として 16 進数文字列（もしくは 2 進数文字列など）を数値に変換する場合は積極的に使って良い</span>です。`0x` のプリフィクスを付けると自動的に 16 進数でパースしてくれます。

```javascript
console.log(parseInt("0x1234")); // → 4660
console.log(parseInt("7fff", 16)); // → 32767
console.log(parseInt("01101101", 2)); // → 109
```

## parseFloat の場合

さて、`parseFloat` はどうでしょうか。`parseFloat` と `Number` の違いはごくわずかです。まず一致する表現を見てみましょう。

```javascript
function convert(str) {
    return {parseFloat: parseFloat(str), Number: Number(str)};
}
console.log(convert("   1234.567    ")); // {parseFloat: 1234.567, Number: 1234.567}
console.log(convert("1e3")); // {parseFloat: 1000, Number: 1000}
console.log(convert("abcde")); // {parseFloat: NaN, Number: NaN}
console.log(convert("n111111")); // {parseFloat: NaN, Number: NaN}
console.log(convert("-Infinity")); // {parseFloat: -Infinity, Number: -Infinity}
```

次に一致しない表現です。

```javascript
function convert(str) {
    return {parseFloat: parseFloat(str), Number: Number(str)};
}
console.log(convert("   1234.567x   ")); // {parseFloat: 1234.567, Number: NaN}
console.log(convert("1e3x")); // {parseFloat: 1000, Number: NaN}
console.log(convert("11111n")); // {parseFloat: 11111, Number: NaN}
console.log(convert("123a45")); // {parseFloat: 123, Number: NaN}
console.log(convert("0x1234")); // {parseFloat: 0, Number: 4660}
```

簡単にまとめると、`parseFloat` は<span style='color:blue'>文字列の先頭からとにかく数字であると判断出来るところまで数値化する（ただし 16 進数、8 進数、2 進数は扱えない）</span> のに対して、`Number` は<span style='color:blue'>文字列全体が数値であれば数値化し、そうでなければ NaN を返す（16 進数、8 進数、2 進数も扱える）</span>という違いがあります。

[parseFloatの仕様](https://262.ecma-international.org/12.0/#sec-parsefloat-string)としては、

- まず文字列化し、前後の空白をトリミングする
- 文字列全体、もしくは先頭からの部分文字列が [StrDecimalLiteral](https://262.ecma-international.org/12.0/#sec-tonumber-applied-to-the-string-type) の構文を満たさないなら NaN を返す
- 先頭から StrDecimalLiteral を満たす最も長い部分文字列を numberString とする
- numberString を[この仕様（MV 仕様）にそって](https://262.ecma-international.org/12.0/#sec-runtime-semantics-mv-s)数値化する

という処理になるのですが、一方で [Number による文字列の数値化の仕様](https://262.ecma-international.org/12.0/#sec-tonumber)は

- 文字列全体が [StringNumericLiteral](https://262.ecma-international.org/12.0/#prod-StringNumericLiteral) 構文を満たさなければ NaN を返す
- 文字列全体を [この仕様（MV 仕様）にそって](https://262.ecma-international.org/12.0/#sec-runtime-semantics-mv-s)数値化する

という処理になります。違いは「文字列全体のみを対象とするか（Number）、それとも先頭からの部分文字列も対象とするか（parseFloat）」という点と、「StringNumericLiteral 構文を対象とするか（Number）、もしくは StrDecimalLiteral 構文を対象とするか（parseFloat）」の違いです。<span style='color:blue'>parseFloat は先頭からの部分文字列が数値として認識出来れば無理やり数値化します</span>が、一方で StrDecimalLiteral 構文には含まれていない<span style='color:blue'>16進数(0x)、8進数(0o)、2進数(0b)の prefix を受け付けません</span>。

全体が数値でない場合は NaN が返ってくるべきなので、<span style='color:red'>変換の意図を正確に表現するためにも、文字列からの数値化は Number を使うべき</span>です。<span style='color:red'>全体が数値でなくても、先頭からの部分文字列が数値であれば無理やり数値にすることに意味があるシチュエーションに限って parseFloat を使ってもよい</span>と思います。例えば、[petamoriken さんに指摘されたような](https://twitter.com/petamoriken/status/1489094105439162373)、以下のような例ですね。

```javascript
const widthString = "120px"; // document.getElementById('element').style.width のような形で取得
const width = parseFloat(widthString); // 120;
```

## 余談: 数値変換のイディオム

なお、JavaScript で文字列を数値に変換するイディオムとして、Number 以外にも `+str` もしくは `str - 0` のような書き方があります。可読性に劣るので使わない方が良いですが、使っているプロジェクトは結構多いので読めるようにはなっておきましょう。内部動作は全て同じです。

```javascript
const str = "123";
console.log(+str, str - 0, Number(str)); // 123, 123, 123
```

また、間違って `new Number` としないようにしましょう。一見正しく動いているように見えますが、実際には Primitive Object が作成されており、もしそれがどこかで悪さをすると発見するのが大変困難なバグに繋がります。

```javascript
const str = "123";
const num = new Number(str); // よろしくない！！！！！！！
console.log(num + num); // 246 一見正しく動いているように見えるが…
console.log(typeof num); // object
console.log(typeof Number(str)); // number 本来はこうあるべき
```

# まとめ

以上が、JavaScript で parseInt / parseFloat を使わない方が良い理由です。JavaScript において、グローバル空間に生えている関数は基本ろくなものではない（暴論）ので、どうしても使わなければいけない理由がなければ別の手段にするのが良いと思います。グローバル空間の関数は `parseFloat`, `parseInt`, `isNaN`, `isFinite`, `eval` などがありますが、

- `parseFloat(str)` を使う場面では `Number(str)` を検討しよう
- `parseInt(num)` を使う場面では `Math.trunc(num)` を検討しよう
- 今回は説明していませんが、`isNaN(num)` を使う場面では `Number.isNaN(num)` を検討しよう
- 今回は説明していませんが、`isFinite(num)` を使う場面では `Number.isFinite(num)` を検討しよう
- 今回は説明していませんが、`eval` を使おうと思ったら[悔い改めよう](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!)

というように対処が可能です。グローバル空間の関数を使いたくなったら思い出してください。

----


## 余談: なぜ `String(0.0000005) === "5e-7"` になるのか（読み飛ばし可）

`parseInt` は引数に数値ではなくて文字列を取ります。正確には[仕様にある](https://262.ecma-international.org/12.0/#sec-parseint-string-radix)通り、まず引数を `ToString` によって文字列に変換します。これはいわゆる `toString` ではなく、[仕様のみに存在する抽象関数](https://262.ecma-international.org/12.0/#sec-tostring)で、[数値型の場合の処理](https://262.ecma-international.org/12.0/#sec-numeric-types-number-tostring)はここに記されています。

仕様にある `n k s` あたりの説明がわかりにくいかと思うのですが、簡単に解説すると x という数に対して小数点を無視した数字全体を s とし、その s の桁数 を k（最低でも 1）として、n は `x = s * 10^(n - k)` が成り立つ整数 n を用意する感じです。ただし s の最後が `0` になる場合は 10 で割ります。

- たとえば `1234.56789` の場合、s は `123456789`、k は `9`（123456789 が 9 桁なので）、1234.56789 === 123456789 * 10^(-5) を満たすように n が `4` となります。
- `0.01234` の場合は s は `1234`、k は `4`、0.01234 === 1234 * (10^-5) なので、n は `-1` になります
- `12345000` の場合は、s は `12345`、k は `5`、12345000 === 12345 * 10^3 なので n は `8` になります

これにより、`k <= n` が成立するのは小数点がない場合のみになります。n がマイナスの場合、n の絶対値には小数点以下に 0 がいくつ続くかが入ります。その前提で再度 `Number::toString` の仕様を見ると、8 番目の処理で n が -5 以上であればゼロを続けることが明示されています。すなわち、小数点以下に 0 が 5 つまでであれば

```
String(0.000005) === '0.000005'
```

となるわけです。一方、小数点以下に 0 が 6 つ以上続く場合は 9 番、10 番の処理に入ります。`0.0000005` の場合は k === 1 ですので 9 番の処理に入ります。すなわち、s（この場合は `'5'`）を追加し、0x65の文字コードすなわち `'e'` を追加し、n === -6 ですので `'-'` 記号を追加した上で `abs(n - 1)` すなわち `'7'` を追加します。このような処理を経て、最終的に

```
String(0.0000005) === '5e-7'
```

が出力されるのです。
---
layout: post
title: Rust で WebAssembly を出力する
categories:
- HTML5
- JavaScript
- Canvas
- Emscripten
---

もう結構前になりますが、Rust で Emscripten を利用することなく WebAssembly の出力ができるようになりました。それにより、Rust を使った WebAssembly の開発が現実的な選択肢としてさらに力を帯びてきました。

自分の勉強で Rust から WebAssembly に出力するプログラムを書いてみたので、その道筋をご紹介することで自分のような Rust 初心者の方々の WebAssembly 開発の助けになればと思い、この記事を投稿しました。



もし記事中に間違い等がありましたら、是非 [@tkihira](https://twitter.com/tkihira) までご連絡ください。

----

## Emscripten との依存関係を切った Rust

つい最近まで、WebAssembly の出力は Emscripten を使うことがほとんどでした。Emscripten は、元々は他言語のプログラムを JavaScript に変換することを目的に開発されていましたが、高速化のために asm.js に対応し、その流れで WebAssembly にいち早く対応し、今でも幅広く利用されています。

LLVM 上の言語は Emscripten で JavaScript に変換するのが楽で、ガベージコレクションのない言語であれば特に相性が良いです。Rust は Emscritpen と相性が良く、当初は Emscripten を利用して WebAssembly を出力していました。

Emscripten は信頼性のあるフロントエンドに加えて豊富な機能、強力な各種バインディングがあるので、過去の資産を JavaScript に変換する際には大変便利です。一方で、ランタイムが大きくなりがちでどうしてもファイルサイズが大きくなるデメリットもありました（今はそれも結構解消されています）。

Rust が Emscripten を経由せずに WebAssembly を出力できるようになったので、Emscripten の特性に左右されない出力ファイルを手にすることが出来るようになりました。

----

## 今回の作品

有名な JavaScript のデモを移植してみました。クリックすると動きます。

<script>
function minecraftStart() {
    var d = document.getElementById('minecraft_preview');
    d.innerHTML = '<iframe style="position:relative" width="400" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" allowtransparency="true" src="https://tkihira.github.io/Minecraft4kRust/"></iframe><div style="position:absolute;left:0;top:0;width:400px;height:400px;cursor:pointer;background-color:rgba(0,0,0,0);" onclick="minecraftStop()"></div>';
};
function minecraftStop() {
    var d = document.getElementById('minecraft_preview');
    d.innerHTML = '<a href="#" style="text-decoration:none" onclick="minecraftStart();return false;"><img width="400" height="400" src="./img/minecraft.png"></a>';
}
</script>
<div style="position:relative" id="minecraft_preview"><a href="#" style="text-decoration:none" onclick="minecraftStart();return false;"><img width="400" height="400" src="./img/minecraft.png"></a></div>

ソースコードは [https://github.com/tkihira/Minecraft4kRust](https://github.com/tkihira/Minecraft4kRust) こちらです。HTMLは [https://tkihira.github.io/Minecraft4kRust/](https://tkihira.github.io/Minecraft4kRust/) こちらに用意しました。移植元は [http://jsdo.it/notch/dB1E](http://jsdo.it/notch/dB1E) こちらの JavaScript 作品です。

----

## 準備

私は最初、直接コマンドラインからコンパイラの `rustc` を呼んでいましたが、それは標準のやり方から大きく外れています。普通は Cargo というビルドシステム＆パッケージマネージャを利用するので、その準備を説明します。

基本は [https://www.hellorust.com/setup/wasm-target/](https://www.hellorust.com/setup/wasm-target/) このサイトのやり方に沿って作業しました。当時は nightly の導入が必要だったようですが、今は nightly を入れなくても動いています。

自分は brew で Rust をインストールしていたので、`rustup` を使うために一旦 brew からアンインストールしました。入っていない方は不要です。

```
$ brew uninstall rust
```

そして [rustup](https://www.rustup.rs/) をインストールし、target に `wasm32-unknown-unknown` を追加します。ついでに [wasm-gc](https://github.com/alexcrichton/wasm-gc) も入れました。

```
$ curl https://sh.rustup.rs -sSf | sh
$ source ~/.cargo/env
$ rustup update
$ rustup target add wasm32-unknown-unknown
$ cargo install --git https://github.com/alexcrichton/wasm-gc
```

環境設定は以上です。実際にプロジェクトを作ってみましょう。まず

```
$ cargo new --lib project_name
```

で Rust のプロジェクトを作ります（`project_name` はプロジェクト名）。Rust の main 関数から実行されるプロジェクトの場合は `--bin project_name` としますが、今回は JavaScript から呼ばれるライブラリのような形の WebAssembly を作りたかったので、`--lib` を指定しました。

これで、カレントディレクトリに `project_name` フォルダが出来ています。中には Cargo の設定ファイル `Cargo.toml` と、スタブのソースコード `src/lib.rs` が生成されています。

WebAssembly に対応するために、`Cargo.toml` を編集して下記を追記します。別言語から呼ばれるライブラリであることを指定します。

```
[lib]
crate-type = ["cdylib"]
```

スタブのソースコードがあるので、一度ビルドしてみましょう。ビルド時にターゲット `wasm32-unknown-unknown` を指定します。

```
$ cargo build --target=wasm32-unknown-unknown
```

これで `./target/wasm32-unknown-unknown/debug/project_name.wasm` がビルドされていることが確認出来ると思います。リリースビルドを作りたい時は `--release` オプションを追加するだけです。

さて、ついでに [rustfmt](https://github.com/rust-lang-nursery/rustfmt) を導入しましょう。

```
$ rustup component add rustfmt-preview
$ cargo fmt
```

これで `cargo fmt` だけで src 以下のファイルを整形してくれるようになります。今回自分が書いたコードだと、[こんな感じで整形されました](https://github.com/tkihira/Minecraft4kRust/commit/5474cc9af97edb3e91bddc87bd76c8abb3237b51)。

----

## Rust で WebAssembly を扱う

準備が整ったので、JavaScript から Rust にガリガリ移植します。文法などは以下のサイトが役に立ちました。

- [プログラミング言語Rust](https://rust-lang-ja.github.io/the-rust-programming-language-ja/1.6/book/README.html)
- [C++erのためのRust入門](https://qiita.com/EqualL2/items/a232ab0855f145bd5997#%E9%85%8D%E5%88%97)

JavaScript はすべての数値型が `f64` 型ですが、移植に合わせて整数型と浮動小数点型を区別しました。そのため型変換が多く、`let mut initial = ox - ox as i32 as f64;` などというコードを書かざるを得なかったところもありました（元のコードは `var initial = ox - (ox | 0);`）。

私は Rust 言語自体はド素人ですので、コードにおかしい点があれば[是非ご連絡ください](https://twitter.com/tkihira)。ここでは WebAssembly 独特の話に絞って書きたいと思います。

### JavaScript から Rust の呼び出し

JavaScript から Rust の関数を呼び出すためには、次のような関数の宣言が必要です。

```rust

#[no_mangle]
pub extern "C" fn hoge(v: f64) -> f64 {
    v + 1.0
}
```

`#[no_mangle]` と `pub extern "C"` によって、この関数がマングリングされずに出力されるようになります。この `hoge` 関数を JavaScript から呼ぶには次のようにします。

```javascript
fetch('hoge.wasm').then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {}))
    .then(results => {
        console.log(results.instance.exports.hoge(41));
    });
```

### Rust から JavaScript の呼び出し

JavaScript から WebAssembly を呼び出すコストと同様に、<span style="color:blue">WebAssembly から JavaScript 関数を呼び出すコストも通常は極めて低い</span>ので、必要に応じてガンガン呼び出しちゃいましょう。今回の移植では、`Math.random`、`Math.sqrt`、`Math.sin`、`Math.cos`、`Date.now` を Rust 側から呼び出しています。

Rust 側では次のように書きます。

```rust
extern "C" {
    fn hoge1() -> f64;
    fn hoge2(_: f64) -> f64;
    fn hoge3(_: f64) -> f64;
}
```

この関数を Rust 内で使う時は、次のように unsafe ブロックで囲う必要がある点に注意してください。

```rust
fn test() {
    unsafe {
        hoge1();
    }
}

fn unsafe test2() {
    hoge2(2.0);
    hoge3(3.0);
}
```

JavaScript 側は次のような形になります。

```javascript
const imports = {
    env: {
        hoge1: function() { return 3.14 },
        hoge2: Math.sqrt,
        hoge3: hoge3
    }
};
fetch('hoge.wasm').then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, imports))
    .then(results => start(results.instance.exports));
```

`WebAssembly.instantiate` の第2引数でインポートする関数を指定することで Rust から呼び出すことが可能になります。

### JavaScript と Rust の間でのメモリの共有

数値のやり取りの仕方は上記で良いとして、配列や文字列などはどうやってやり取りすればよいのでしょうか？一般的に WebAssembly と JavaScript がメモリのやり取りをするのは結構たいへんなのですが、Rust の場合も例外ではありません。

Rust の WebAssembly 出力では、すべてのデータを一つのメモリ上に格納します。巨大な配列にプログラム上で使われるすべてのデータが格納されている、みたいな感じです。JavaScript 側からはそのメモリにアクセスすることが出来るので、Rust からメモリのアドレス（巨大な配列のオフセット）を JavaScript に渡すことで両者間のデータのやり取りが可能になります。

実例で見てみましょう。Rust から JavaScript に配列を渡してみましょう。

```rust
static ARRAY_SHARE: [i8; 5] = [1, 2, 3, 4, 5];

#[no_mangle]
pub extern "C" fn get_address() -> *const i8 {
   &ARRAY_SHARE[0]
}
```

Rust では static 宣言された配列はアドレスが変わらないことが保証されます。`get_address` 関数で、メモリ上の配列のアドレスを JavaScript に渡します。

JavaScript 側は次のようになります。

```javascript
fetch('array.wasm').then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {}))
    .then(results => {
        const offset = results.instance.exports.get_address();
        console.log(results.instance.exports.memory);
        console.log(offset);
        const array = new Uint8Array(results.instance.exports.memory.buffer, offset, 5);
        console.log(array);
    });
```

メモリは Rust により `exports.memory` にエクスポートされています。JavaScript 上での実態は TypedArray (ArrayBuffer) で実装されております。`get_address` でメモリ上のアドレス（TypedArray のオフセット）を取得し、それを `Uint8Array` の形で 5 サイズ分取得します。これで晴れて、Rust 上の配列 `[1, 2, 3, 4, 5]` を JavaScript 側で受け取ることが出来るようになりました。

文字列も全く同じような形になります。Stack Overflow に[良い質問](https://stackoverflow.com/questions/47529643/how-to-return-a-string-or-similar-from-rust-in-webassembly)があるので参照してみてください。コードだけ書くと次のような形です。


```rust
use std::ffi::CString;
use std::os::raw::c_char;

static HELLO: &'static str = "hello from rust";

#[no_mangle]
pub fn get_hello() -> *mut c_char {
    let s = CString::new(HELLO).unwrap();
    s.into_raw()
}

#[no_mangle]
pub fn get_hello_len() -> usize {
    HELLO.len()
}
```


```javascript
fetch('hello.wasm').then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {}))
    .then(results => {
        const offset = results.instance.exports.get_hello();
        const len = results.instance.exports.get_hello_len();
        const stringBuffer = new Uint8Array(results.instance.exports.memory.buffer, offset, len);
        let str = '';
        for (let i = 0; i < stringBuffer.length; i++) {
            str += String.fromCharCode(stringBuffer[i]);
        }
        console.log(str);
    });
```

なお補足ですが、Rust 側で static 配列をミュータブルにすると unsafe になるのにご注意ください。

```rust
static mut MEMORY: &'static mut [i32] = &mut [0; 5];

fn hoge {
    unsafe {
        MEMORY[0] = 1;
    }
}
```

今回の実装では、`CanvasRenderingContext2D#putImageData` を使って、Rust 側で用意したメモリをそっくりそのまま Canvas に挿入することで高速化をしています。TypedArray はそもそも WebGL の採用に従って導入されたもので、WebAssembly も絡めて正しく実装すると、従来の JavaScript に比べて極めて高速な描画が期待できるようになります。

----

## Rust 出力の性能

### 速度

せっかく JavaScript と WebAssembly の両方で同じコードを書いたので、いろいろとプロファイルを取ってみました。まずはなんと言ってもスピードです。両者の `clock` 関数を for ループで 1000 回呼んで計測してみました。

|           | 経過秒数| 秒間実行回数|
|-----------|--------:|------------:|
|WebAssembly|7391ms   |135.29回/s   |
|JavaScript |10801ms  |92.58回/s    |

<span style="color:red">WebAssembly の方が 46% ほど性能が良い</span>ことがわかります。今回の JavaScript はブラウザの JIT 等の最適化が効きやすい形である上に、Canvas に出力する API の処理時間もそこそこあるという悪条件にも関わらず、これだけの差がでたのは驚きでした。<span style="font-weight:bold">やはり WebAssembly は速い</span>ですね。Rust の出力と、ガチガチに C で実装してコンパイラで最適化をかけた出力との速度差が気になります。

### ファイルサイズ

ファイルサイズを測る前にひとつ、Rust の WebAssembly 出力は、リリースビルドであっても一切呼ばれない無駄な関数がいくつか入ってしまっています。それを除去するために `wasm-gc` を使います。

```
$ wasm-gc hoge.wasm -o hoge.min.wasm
```

普段はこれで一気に小さくなるのですが、今回は `wasm-gc` 前で 60KB、後で 40KB となり、なぜか全然効果がありませんでした。

不思議に思って wat（WebAssembly のテキスト表現、wast とも呼ばれます）に変換して調べてみた所、例外発生時に呼ばれるであろう関数やメッセージが大量に入っていて、そこでほとんどの容量を使っていました。しかし、そもそもフロー的にそこには絶対に行かないことがわかっていたので、手動で wat の中から不要部分をまるっと削除して再度 wasm に変換してみた所、3KB まで小さくなりました。github 上に [`mine.min.wat`](https://github.com/tkihira/Minecraft4kRust/blob/master/mine.min.wat) という名前で用意したので、興味のある方は確認してみてください。

まとめると、次のようになります。

| 対象                   |ファイル容量|
|------------------------|-----------:|
| Rust（リリースビルド） | 59695 byte |
| Rust with wasm-gc      | 39705 byte |
| Rust with 手作業で除去 |  3174 byte |
| JavaScript (minified)  |  <span style="color:red">2283</span> byte |

…なんということでしょう。JavaScript の方が小さい、という極めて珍しい結果になってしまいました。なぜこうなったのか正確な検証はしていないのですが、

- コード内から API 等を含む関数をほとんど呼んでいないので、JavaScript の文字数が少ない
- 型変換や分岐が多い上に四則演算が多いため、JavaScript の方が少ないバイト数で表現できる
- 元々デモとして作られているので、アルゴリズムレベルでコードが圧縮されている

といったことが挙げられるかな、と思います。今回のように JavaScript の方が小さくなることは滅多にないことで、大抵の場合は WebAssembly の方が大幅に小さくなります。

----

## 終わりに

これで、Rust から WebAssembly を使おうと思う時に必要な話は大体網羅出来たのではないかと思うのですが、いかがでしたでしょうか？

今まで、WebAssembly といえば Emscripten しか選択肢がない時代が長く続いていました。Emscripten は当初、既存の OpenGL ゲーム等を低コストで JavaScript に移植することを目標にしていました。私も以前 [Bonanza を Web に移植する時はとても簡単に出来ました](http://nmi.jp/archives/763)。一方で WebAssembly で何かを新しく作ろうという時に、どうしても問題を抱えやすい傾向がありました。

しかし WebAssembly の登場から時間がたち、いろいろな新技術が登場してきました。ブラウザの対応も進み、一から新しく WebAssembly でプロダクトを作る時代にまさに突入しつつあると言ってよいでしょう。

そんな中で、Rust は軽量・安全であり、かつ C 言語並に細いところまで手が届くので、基本的には低レベル技術である WebAssembly との相性は大変良いのではないかと感じています。この記事が、皆さんの Rust による WebAssembly 開発の助けになれば幸いです。

重ねてになりますが、もし記事やソースコードにミスなどありましたら是非 [@tkihira](https://twitter.com/tkihira) までご連絡ください。私は Rust ド素人なので、今回は特に問題がありそうです。皆さんのフィードバックお待ちしております。


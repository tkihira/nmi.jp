---
layout: post
title: 都会の星の撮り方本を出版しました。WebAssembly を使っています
categories:
- JavaScript
---

先日、<a target="_blank" href="https://www.amazon.co.jp/gp/product/4297126036/ref=as_li_tl?ie=UTF8&camp=247&creative=1211&creativeASIN=4297126036&linkCode=as2&tag=tkihira0e-22&linkId=9c6da6869d5777f1745cdd5a7d3b6de0">都会で撮る 星の軌跡の撮影術 〜はじめて撮る人から上級者まで比較明合成による撮影の完全ガイド</a>という本を出版しました。<br>
<a target="_blank"  href="https://www.amazon.co.jp/gp/product/4297126036/ref=as_li_tl?ie=UTF8&camp=247&creative=1211&creativeASIN=4297126036&linkCode=as2&tag=tkihira0e-22&linkId=b24a90cded2ddec8a76476c04a06e987"><img border="0" src="//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=JP&ASIN=4297126036&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL250_&tag=tkihira0e-22" ></a><br>
この本は、比較明合成という画像処理によって都会の星の軌跡の撮り方を紹介している本ですが、それを **WebAssembly を用いてブラウザ内で実現する Web アプリ** を作りました（そしてその使い方を本の中で解説しました）ので、この記事では WebAssembly による移植周りについて少し解説したいと思います。




# なぜ WebAssembly が必要だったか

今回 WebAssembly を、[LibRaw](https://www.libraw.org/) というオープンソースソフトウェアをブラウザ上で利用するために使いまいた。

比較明合成をわかりやすく説明すると、<span style="color:blue">複数の画像を比較して、最も明るい点を選択する合成方法</span>です。星は日周運動により地上からは動いているように見えますが、カメラを固定して連写で何百枚と写真を撮り、それを全部比較明合成すると星の明るい点が炙り出されて星の軌跡が表れます。明るさは輝度（Luminance）で判断され、一般的に

```
Luminance = (0.298912 * r + 0.586611 * g + 0.114478 * b)
```

という式で計算されます。同じ位置のピクセルを比較し、この輝度の高いピクセルを採用するのが比較明合成です。比較明合成自体は極めて単純な計算式なので、実装自体は全然難しくありません。そして、今回はそこに WebAssembly は使っていません。

WebAssembly を使ったのは、 **RAW ファイル** と呼ばれるカメラ独特のファイルを扱うためです。RAW ファイルはカメラのセンサーで受けたデータを（ほぼ）そのまま使うことの出来るファイル形式で、JPEG では各 RGB に対して 8bit しか記録されないのに比べ、12bit〜14bit まであるセンサーの性能全てのデータを記録することが出来ます。ただし、統一された RAW 形式はメジャーではなく、各カメラメーカーがそれぞれ独自の RAW ファイルフォーマットを編み出しております。

RAW ファイルは何十種類もあり自前で対応することは現実的ではありませんでした。そこで OSS で展開されている [LibRaw](https://www.libraw.org/) を利用することにしました。LibRaw は [github 上のLibRaw のソースコード](https://github.com/LibRaw/LibRaw)を見れば分かる通り C/C++ で書かれていますので、これを wasm に Porting する必要がありました。

# Emscripten による LibRaw Porting の流れ

以前私が wasm に移植した [fdlibm](https://github.com/tkihira/fdlibm-wasm) は、`malloc` などの標準 C ライブラリを一切使っていない珍しいプロジェクトでしたので、clang でランタイムなしの wasm を出力することが出来ました。しかしこの LibRaw は言うまでもなく標準ライブラリを使いまくっています。そこで今回は、王道の Emscripten を使って wasm を利用することにしました。

[Emscripten](https://emscripten.org/) は LLVM を利用した wasm 出力のためのツールチェーンで、標準 C ライブラリのみならず、OpenGL や pthreads などの変換も対応してくれているので、既存プロジェクトの wasm への出力に関してはものすごく強力なツールです。

LibRaw の移植で助かった点としては、標準ライブラリ以外の他のライブラリへの依存がなかった点です。もし libpng や zlib などの他のライブラリへの依存があれば、それらも wasm 移植していかねばならず、手間はかなり増えてしまいます。標準ライブラリの対応は Emscripten が自動的に処理してくれますので、今回はやりやすくて助かりました。

Emscripten を用いて移植する場合、最初のゴールは `emcc / em++` を使ってコンパイルを成功させることになります。大抵は自前で Makefile を書くことになり、ここが一番大変なところだと思います。 今回は [既存の Makefile を書きかえました](https://github.com/tkihira/LibRaw/commit/e3743d91c5341ce702bf675fe1a1422b50514d8c#diff-76ed074a9305c04054cdebb9e9aad2d818052b07091de1f20cad0bbac34ffb52R190)。[改変元の Makefile はこちらです](https://github.com/tkihira/LibRaw/blob/master/Makefile.dist)。

[Emscripten は出力ターゲットの拡張子によって出力内容を変える](https://emscripten.org/docs/tools_reference/emcc.html#:~:text=When%20linking%20an%20executable)のですが、`.wasm` ではなく `.js` を指定することで JavaScript から wasm のコードを呼び出すサポートコードの出力も指示できます。今回はスタンドアロンの wasm ではなく JavaScript からの呼び出しが必要なので、[拡張子を .js に変更しました](https://github.com/tkihira/LibRaw/commit/f92bb83707ad56176fd81a002325d86a677562bb#diff-76ed074a9305c04054cdebb9e9aad2d818052b07091de1f20cad0bbac34ffb52R190)。ここで `ALLOW_MEMORY_GROWTH=1` も一緒に指定していますが、これは[wasm 内部でメモリ不足になった時に自動的に拡張してくれるオプション](https://emscripten.org/docs/optimizing/Optimizing-Code.html#memory-growth)です。今回はメモリ使用量が画像ファイルサイズに左右され、事前にどれだけメモリを使用するか全くわからないので必須でした。

オプションで `-s LINKABLE=1 -s EXPORT_ALL=1` を入れていますが、これはとりあえず JavaScript で実行を確認するまでの暫定的なオプションです。このオプションにより、LibRaw 内の全ての関数が JavaScript からアクセス可能になるので、グルーコードの容量は爆発し、最適化もほとんど出来なくなります。初回はとりあえず動くことを確認するために付けましたが、最終的には [LINKABLE オプションを外し、EXPORTED_FUNCTIONS オプションで JavaScript から呼び出す必要のある関数を全部指定しています](https://github.com/tkihira/LibRaw/commit/a0a0ba6d39b1aee490096dd390ac4878b02b4517#diff-76ed074a9305c04054cdebb9e9aad2d818052b07091de1f20cad0bbac34ffb52R190)。

JavaScript のサポートコードも含めて WebPack で処理したくなったため、`MODULARIZE=1` オプションを[指定しました](https://github.com/tkihira/LibRaw/commit/046d712900aafe8798717911d0f25d7a34a0c2f2#diff-76ed074a9305c04054cdebb9e9aad2d818052b07091de1f20cad0bbac34ffb52R190)。これによりモジュール化されて出力ファイルを require 等で読み込むことが出来ます。今回 `-s 'EXPORT_NAME="createLibRaw"'` を付けてビルドしたので、JavaScript 側では次のようなコードで初期化されます。

```javascript
import createLibRaw from './libraw';

(async () => {
    const libRaw = await createLibRaw();
    const id = libRaw._libraw_init(0);
    // ...
})();
```

ここで呼んでいる `libRaw._libraw_init` は[ここで定義されている C の関数の呼び出しです](https://github.com/tkihira/LibRaw/blob/master/src/libraw_c_api.cpp#L30)。 `EXPORTED_FUNCTIONS` で指定した C の関数は、Emscripten のサポートコードによって自動的に export され、アンダースコアをつけて JavaScript 側から呼び出すことが可能になります。C++ の呼び出しは複雑になるので、今回は全て C の API を export することで対応しました。また必要に応じ、[自分で使うための API を追加](https://github.com/tkihira/LibRaw/blob/master/src/libraw_c_api.cpp#L430)しています。

LibRaw は、ファイルからでなくメモリ上からデータを読み込む `libraw_open_buffer` という [API があった](https://github.com/tkihira/LibRaw/blob/master/src/libraw_c_api.cpp#L123)ので、JavaScript 側でメモリにデータを書き込んでから API を呼ぶことが出来ました。コードは以下のような形になります。

```javascript
const openBuffer = async (arrayBuffer) => {
    // alloc memory
    const dataPtr = libRaw._malloc(arrayBuffer.byteLength);
    const dataHeap = new Uint8Array(libRaw.HEAPU8.buffer, dataPtr, arrayBuffer.byteLength);
    dataHeap.set(new Uint8Array(arrayBuffer));
    // open buffer
    const ret = libRaw._libraw_open_buffer(id, dataHeap.byteOffset, arrayBuffer.byteLength);
    if(ret) {
        console.log(`Failed to _libraw_open_buffer, return code = ${ret}`);
        return null;
    }
    // ...
};
```

Emscripten が管理する（＝LibRaw が動いている）ヒープ上でメモリを確保するためには、Export されたモジュールにある `_malloc` 関数を利用します（[公式ドキュメントはこちら](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#:~:text=For%20example%2C%20the%20following%20code%20allocates%20a%20buffer%2C%20copies%20in%20some%20data%2C%20calls%20a%20C%20function%20to%20process%20the%20data%2C%20and%20finally%20frees%20the%20buffer.)）。`_malloc` 関数はメモリポインタを返すので、それを利用して TypedArray 上にデータを流し込んでいます。

大体このようなやり方で、LibRaw を wasm に Porting しました。

# Emscripten の強み

今回は JavaScript ファイルが 114KB、wasm ファイルが 619KB とかなり大きくなりましたが、起動時間が重要になるタイプのアプリケーションではないので良しとしました。

Emscripten を用いることで、オリジナルのソースコードに全く手を入れることなく Web で利用可能になりました。Emscripten にはファイルサイズ等の欠点はあるものの、標準ライブラリなどのサポートが充実しており既存プロジェクトのビルドを補佐する機能が手厚く、このような大型な移植に関して極めて強力なツールです。Makefile 等の C 言語の知識が若干必要になりますが、その前提条件を突破すれば広大な世界が待っています。

WebAssembly は「速度が速い」というメリットもあるのですが、それよりも<span style='color:red'> **「過去の資産がブラウザで利用可能になる」** </span>メリットの方がより魅力的であると自分は考えています。今回のような既存の OSS をブラウザ上に移植することで、今まではネイティブ・アプリケーションでないと実現が難しかった様々な新しい Web アプリケーションの可能性が生まれたことこそ、wasm の大きなメリットだと思っております。

私は次は LibTiff を移植して、このアプリケーションで欠けている様々な TIFF ファイル対応を入れたいな、と目論んでいます。みなさんも wasm を利用して、今までブラウザでは無かったようなアプリケーションの開発を是非目指してみてください。

# 完成した Web アプリケーション の紹介

この wasm に移植した LibRaw を使って完成した Web アプリケーションはこちらになります。

[スターペンギン: ブラウザ比較明合成ツール](https://www.star-penguin.net/)

この Web アプリケーションを使うと、下記のような星の軌跡の写真を作ることが出来ます。

<iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="https://www.instagram.com/p/BwXJxMgjBOE/embed/?cr=1&amp;v=12&amp;wp=1080&amp;rd=https%3A%2F%2Fwww.tech-camera.com&amp;rp=%2Fpreview%2Findex_design#%7B%22ci%22%3A0%2C%22os%22%3A637.4649996869266%7D" allowtransparency="true" allowfullscreen="true" frameborder="0" height="697" data-instgrm-payload-id="instagram-media-payload-0" scrolling="no" style="background: white;/* max-width: 540px; */width: calc(100% - 2px);border-radius: 3px;border: 1px solid rgb(219, 219, 219);box-shadow: none;display: block;margin: 0px 0px 12px;/* min-width: 326px; */padding: 0px;"></iframe>
<script async="" src="//www.instagram.com/embed.js"></script>

このアプリケーションは、既存の比較明合成のツールだと自分で欲しい表現を得ることが出来なかったために自作したという経緯があります。私が何かアプリを作るとは大抵 Web アプリで作るのですが、ブラウザで動くように開発すると気軽に他人と共有出来て良いですよね。今回、最終的に書籍化に至った一因は Web アプリとしての開発も大きかったと思います。

再掲になりますが、このような写真を一眼カメラでどのように撮影するか、そして[スターペンギン](https://www.star-penguin.net/)を利用してどのように合成するかを解説した本がこちらです。興味のある方は、ぜひご購入をご検討ください！

<a target="_blank" href="https://www.amazon.co.jp/gp/product/4297126036/ref=as_li_tl?ie=UTF8&camp=247&creative=1211&creativeASIN=4297126036&linkCode=as2&tag=tkihira0e-22&linkId=9c6da6869d5777f1745cdd5a7d3b6de0">都会で撮る 星の軌跡の撮影術 〜はじめて撮る人から上級者まで比較明合成による撮影の完全ガイド</a><br>
<a target="_blank"  href="https://www.amazon.co.jp/gp/product/4297126036/ref=as_li_tl?ie=UTF8&camp=247&creative=1211&creativeASIN=4297126036&linkCode=as2&tag=tkihira0e-22&linkId=b24a90cded2ddec8a76476c04a06e987"><img border="0" src="//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=JP&ASIN=4297126036&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL250_&tag=tkihira0e-22" ></a><br>

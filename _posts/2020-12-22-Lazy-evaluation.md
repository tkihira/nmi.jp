---
layout: post
title: JavaScript で遅延評価を導入して起動を高速化した話
categories:
- JavaScript
---

この記事は、JavaScript で Flash Player の実現を頑張った（もしくは現在進行系で頑張っている）人たちの集う [Flash Advent Calendar 2020](https://qiita.com/advent-calendar/2020/flash) に参加しております。

Flash Player を JavaScript で実装していた際に、現場から「起動の高速化」という難しい要求をもらった際、「遅延評価」を導入したところ大変効果がありました。今回、その遅延評価について簡単なご紹介をしたいと思います。



# Flash Player 起動までのステップ

当時 Flash Player を JavaScript で提供していた際、当時のスマートフォン端末においてロード完了から最初の画面が出るまで大体 150ms くらいかかっていました。普通の Web ページであれば 150ms はロード時間の中に吸収され許容範囲になる可能性が高いのですが、当時 Flash Player はほぼ全てのゲーム画面で使用されており、結果的に全ての画面遷移において 150ms の遅延が発生する状況となっておりました。これはユーザー体験を激しく損なっており、緩和が必要でした。

Flash Player の起動までには次のようなステップがあります

1. Flash Player JavaScript のダウンロード
2. Flash Player JavaScript のパース＆実行開始
3. Flash Player JavaScript が swf ファイルを読み込む
4. 読み込んだ swf バイナリのパース
5. 読み込んだ情報を元に最初のフレームを表示

このうち、(1) と (3) は http キャッシュが効いてほぼゼロ、(2) も圧縮前で 150kb 以下なので無視できる範囲でした。なので現実的に時間を短縮出来るのは、(4) のバイナリのパース時間だけだったのです。

swf は、タグという形で綺麗に構造化されたバイナリファイルです。バイナリの構造は本題とは離れるのでここでは解説しませんが、興味のある方は [Yoya さんの書かれた資料](https://labs.gree.jp/blog/2010/08/631/)などに詳しく解説されているので参照してみてください。

当時はパース自体の高速化を図ることのできる選択肢はあまり多くなく（今なら TypedArray などを使うと効率があがりそうです）、パース自体の高速化はあまり現実的ではないと結論づけました。そこで考えたのが、タグの遅延評価です。

# そもそも遅延評価とは？

遅延評価それ自体は、プログラミング言語の基本機能として導入されていることも多い、一般的な概念です。Haskell 使いの方なら当然、Scala を使っていらっしゃる方でも馴染みの深い方は多かろうと思います。

遅延評価というのは、<span style="color:blue">本当に値が必要とされるまで計算をするのを抑える</span>という機能です。一般的なプログラミング言語では、式や関数の値はその場で計算され、戻り値がすぐに得られます。しかし遅延評価の場合、例えば関数呼び出しの戻り値に実際にアクセスしたタイミングで初めて関数呼び出しが行われます。関数の戻り値にアクセスしない場合には無駄な計算をせずに済むメリットがあり、計算量の最適化に役立ちます。

今回の場合の目的は計算量の最適化というよりは、<span style="color:red">遅延評価することで起動時に集中していた swf ファイルのパースの時間を実行時間にバラけてしまおう</span>、というのが根底にあるアイデアです。起動時にどのようなタグがあるかのパースだけは一瞬で終えてしまい、そのタグに実際のアクセスがあったタイミングで改めてバイナリをパースすることで起動時にかかる時間を肩代わりします。

# JavaScript による遅延評価の実装

では実際のサンプルコードを元に説明しましょう

```javascript
const input = '6[String]4[Test]2[Do]3[You]4[Like]3[JS?]1[I]4[Hate]4[That]8[Language]';

function parse(input) {
    let data = [];
    let offset = 0;
    while(offset < input.length) {
        const len = Number(input.charAt(offset));
        const str = input.substring(offset + 2, offset + 2 + len);
        data.push({len, str});
        offset += len + 3;
    }
    return data;
}

const data = parse(input);
const neededInfo = data[4];
console.log(neededInfo.str);
```

これは適当な構造のデータをパースして配列に変換するプログラムです。出力は `Like` になります。

このプログラムで注目してもらいたいのは、<span style="color:red">欲しいデータは配列の 4 番目のデータのみであるにも関わらず、parse 関数が全ての構造をパースしている</span>という点です。この程度のパースであればたいした負荷ではないですが、もしこの文字列が画像ファイルのバイナリであったりすれば、パースにはそこそこ時間がかかることが想定されるでしょう。

これを遅延評価で書き直すと、次のような形になります。

```javascript
const input = '6[String]4[Test]2[Do]3[You]4[Like]3[JS?]1[I]4[Hate]4[That]8[Language]';

function parse(input) {
    let data = [];
    let offset = 0;
    while(offset < input.length) {
        const len = Number(input.charAt(offset));
        const _offset = offset;
        let str;
        const item = {
            len,
            get str() {
                return str || (str = input.substring(_offset + 2, _offset + 2 + len));
            }
        };
        data.push(item);
        offset += len + 3;
    }
    return data;
}

const data = parse(input);
const neededInfo = data[4];
console.log(neededInfo.str);
```

Object の getter を使って `str` を定義しています。初回の `str` のアクセスの際に初めて `substring` でデータの中身を取り出しており、2 回目以降はキャッシュされたデータを返しているのが見て取れると思います。`data[4]` のみならず、他のデータもアクセスされるまで中身は取り出されません。

重ねて言いますが、このサンプル程度だとパースはたいした手間ではないのですが、データの中身が複雑かつ大量になればどんどん時間がかかるようになってきます。

# 効果

当時、これは大きな効果をあげました。Flash Player の起動時間がほぼ 1〜2 frame 程度（33ms 以下）になったため、ほぼ起動の問題がなくなり、ユーザーが短時間に多量の画面遷移をしてもストレスを感じることがなくなりました。

遅延評価にはデメリットもあります。実際の評価のタイミングがいつ起こるか読めなくなるので、Flash Player のプチフリーズ（プチフリ）が起こる可能性があります。幸いなことに実際の運用ではプチフリが問題になって報告されたことは一度もありませんでしたが、事前に評価するのが難しいので実装を終えてみるまでデメリットを評価しづらいのが難点でした。一方で実装の負荷はほとんどなかったので、そういう意味では投資対効果（ROI）の良い技術と言えますね。

[GitHub にて実際のコード](https://github.com/PexJS/PexJS/blob/master/src/parser/utils_tag.js#L16)をご確認いただけます。当時は ECMAScript 5 の仕様がまだ固まっておらず、`__defineGetter__` という謎のビルトイン関数で getter を定義しておりました。これは今でも使えるのですが当然 deprecated ですし、そもそも機能的に使う意味もないので新しいプロジェクトではきちんと [modern な getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) を使いましょう。

今回ご紹介した内容は遅延評価の初歩の初歩ではあるのですが、手軽に導入出来る割には大きな効果が期待できることが多いので、パーサーなどを設計されている方や起動時間で悩まれている方は、解決可能性のある選択肢の一つとして遅延評価を念頭に置いてみてください。今回の記事がみなさんの新しい高速化のアイデアの源になれば幸いです。

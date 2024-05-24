---
layout: post
title: Stable Diffusion を API で使って塗り絵を自動生成する
categories:
- JavaScript
---

Stable Diffusion は、GPU を利用した画像生成 AI の中でも最も有名なプロダクトだと思います。Stable Diffusion の利用者は一般的にまず GPU を準備し、そこで環境を構築してから画像生成を行うのですが、今回は Stability AI（Stable Diffusion の開発元）の用意している API を利用して、塗り絵の自動生成を作ってみました。

[https://color-painting.vercel.app/](https://color-painting.vercel.app/)

子どもたちのために、塗り絵を自動生成するサービスです。この記事では、どのようにこのアプリを作ったのか簡単に紹介しております。コードは全て JavaScript です。

なお免責事項ですが、このブログを公開するにあたり、Stability AI 社からの金銭授与ならびにクレジット授与は一切ありません。ただ Stablity AI Japan 社には仲の良い友人が多くおり、事前に記載が間違いがないかの確認をお願いしております。




# なぜ Stability AI の API を利用するのか

Stable Diffusion は、一般に「オープンな AI」と呼ばれており、モデルを手元に用意することが出来ます。一般的には、まず自分の家やクラウドサービス上で GPU を用意して、そこで環境を準備してから画像生成を行うのが一般的な使われ方です。自分のコンピュータでいろいろな画像生成を経験された方も多いと思います。

それと比較して、「クローズドな AI」と呼ばれるモデルもあります。クローズドなモデルは公開されておりません。画像生成系 AI ならば、例えば DALL･E や Midjourney、NovelAI などが有名です。クローズドな AI は手元に環境を用意することができず、API や bot コマンドなど、提供されているサービスを通じて絵を生成します。

今回利用するのは、Stable Diffusion の開発元である Stability AI が提供している API です。「オープンな AI」を API で利用する珍しい形になりますが、これにはメリットが多数あります。

- 生成系の AI は、一般的に環境の準備に最低でも数分程度の時間がかかります。クラウドサービスで実現しようと思っても、ユーザーのアクセスのたびに毎回数分待ってもらうのは現実的ではありません
- GPU を準備するのも高コストです。ひっきりなしにアクセスのあるサービスであればよいのですが、そうでなければ遊んでいる間の GPU の維持にもコストがかかります。多重化などを考えた場合、そのコストはさらに高くなります

サービスを提供するための体験としては API を利用する方が断然良いのですが、今度はサービスが大きくヒットした時に API の利用料金が高くなってしまう問題があります。API が料金改定で急に値上がりする可能性もあります。これはクローズドな AI の大きな問題点です。しかし Stable Diffusion は珍しい「オープンな AI」の API 提供ですので、簡単ではないものの、利用料金が高くなれば自前のホスティングなど、別の手段での解決策を探ることが出来ます。サービスにロックインされてしまうクローズドな AI と比較すると、オープンな AI の大きな強みです。

まずはスモールスタートして、サービスのスケールに従ってより優れた構成を探っていける、そういったメリットを「オープンな AI」の API サービスは持っています。


# Stability AI Developer Platform

今回利用するのは [Stability AI Developer Platform](https://platform.stability.ai/) の提供している API 群のうち、 *Image Generate* を利用します。記事執筆時点では、

- Stable Diffusion 3 
- Stable Diffusion 3 Turbo 
- Stable Image Core 
- SDXL 1.0, SD 1.6 

の 4 つの分類があります。それぞれ、API の利用 1 回につき利用料金がかかります。Stability AI Platform では、それを「クレジット」という形で表現しています。

現在、アカウントを作ると最初からある程度のクレジットが付与されています。$10 で 1000 クレジットを購入出来て、各 API を呼び出すと、そのクレジットを消費します。

[https://platform.stability.ai/pricing](https://platform.stability.ai/pricing)

| サービス (モデル名)| 説明                                    | 価格 (1回あたりの消費クレジット) |
|-----------------|-----------------------------------------|-----------------------------|
| SD3             | Stability AIの最新かつ最先端の画像生成モデル  | 6.5                        |
| SD3 Turbo       | 最先端で高速なモデル                        | 4                          |
| Core            | マーケットで最高レベルの画像生成サービス       | 3                           | 
| SDXL 1.0        | 画像生成のための標準ベースモデル              | 0.2-0.6                     |
| SD 1.6          | 解像度が調整可能なベースモデル                | 0.2-1.0                    |

**この表は記事執筆時点での情報です。最新情報は上記リンクからご確認ください** 。1 ドル 150 円換算すると、大体 1 クレジットが 1.5 円になります。SD3 だと 1 枚で約 10 円弱かかる計算ですね。

どのエンジンを利用するかによって大きく金額が変わります。良いモデルは高額な分、良いクオリティの出力を出す傾向があります。サービス設計の肝になるので、それぞれのエンジンを試してみて、ベストなエンジンを探しましょう。

[https://platform.stability.ai/docs/getting-started/stable-image](https://platform.stability.ai/docs/getting-started/stable-image)

こちらのページに Google Colab 上で API を叩くための Notebook が公開されていますので、手軽に試したい場合は利用してみてください。

今回は、子どものために無限に塗り絵を作りたかったので、安いモデルを使うことにしました。SD 1.6 はローカルで使ったこともあり慣れていたので、これを選びました。1 枚 1 円前後ですね。


# 開発の話

今回のソースコードはこちらで公開しています。

[https://github.com/tkihira/color_painting](https://github.com/tkihira/color_painting)

全体のビルドやデプロイ方法も README に書いておりますので、参照してください。

ここでは大まかな解説をします。

## Stability AI Developer Platform で API Key を発行

Stable Diffusion の API を利用するためには、まず Stability AI の Developer Platform でアカウントを作成する必要があります。

[https://platform.stability.ai/account/keys](https://platform.stability.ai/account/keys)

作成後、上記のページから `API Key` を発行します。

## 実際にローカルで画像を作ってみる

発行した API Key を使って、Node.js で絵を書いてみましょう。<span style="color:red">API は v1 系列と v2beta 系列で違うので注意しましょう。</span>今回利用するのは [Version 1 の Text-to-image API](https://platform.stability.ai/docs/api-reference#tag/Text-to-Image) になります。

API を利用して絵を描くコードは以下のようになります。

[https://github.com/tkihira/color_painting/blob/main/misc/text2image.mjs](https://github.com/tkihira/color_painting/blob/main/misc/text2image.mjs)
```js
import fs from 'node:fs';

const engineId = 'stable-diffusion-v1-6';
const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
const apiKey = process.env.STABILITY_API_KEY;

if (!apiKey) {
    throw new Error('Missing Stability API key.');
}

const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
        text_prompts: [
            { text: 'an electric sheep, electric, sheep, blue and yellow, night city, illustration', },
        ],
        cfg_scale: 7, height: 1024, width: 1024, steps: 30, samples: 1,
    }),
});

if (!response.ok) {
    throw new Error(`${response.status} response: ${await response.text()}`);
}

const responseJSON = await response.json();

if (!fs.existsSync('./out')) {
    fs.mkdirSync('./out');
}

responseJSON.artifacts.forEach((image, index) => {
    fs.writeFileSync(`./out/v1_txt2img_${index}.png`, Buffer.from(image.base64, 'base64'));
});
```

実行前に環境変数に `STABILITY_API_KEY` を保存しておきましょう。

```
$ export STABILITY_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

API に投げている body に入っている `text_prompt` が、いわゆるプロンプトです。試しに「電気羊」を描いてみました。これをローカルで実行してみると、十分に良い絵が描けました。

![Electric Sheep◊](./img/electric_sheep.png)

実行時間は平均して 7.5 秒前後でした。

## プロンプトのチューニング

今回は塗り絵風の絵を描くために、次のようなプロンプトを用意しました。

```
a cute rabbit in a field of flowers, white and black, coloring book for kids, simple, adult coloring book, no detail, outline no color, fill frame, edge to edge, clipart white background
```

先頭の `a cute rabbit in a field of flowers` が描きたい絵で、それ以降はスタイルの指定です。いわゆる呪文と呼ばれる内容ですね。[このページ](https://www.instantaiprompt.com/ja/prompts/midjourney/coloring-book/)を参考にしました。これで描いてみた絵がこちらです。

![a cute rabbit in a field of flowers](./img/rabbit.png)

プロンプトを変えて他にも何枚か色々と出力してみたところ、このプロンプトは大変よい品質の塗り絵を出力することがわかって満足しました。<span style="color:blue">本番サービスにこれを使うことを決めました</span>。

試行錯誤でお金がかかるのが気になりますか？ **AI を使った開発やサービスは、今までの開発と比べて、よりコスト（原価）が高くなることに留意する必要があります** 。とはいえ今回は 100 回試行錯誤しても 100 円程度、まだまだ安いものです。

他のパラメータの説明を簡単にすると、

- `cfg_scale`: プロンプトにどの程度寄せるかを指定します。高すぎると破綻することが多く、7 前後がおすすめです
- `width`/`height`: 画像の大きさです。[モデルによって制限がある](https://platform.stability.ai/docs/api-reference#tag/Text-to-Image)ので気をつけましょう
- `steps`: 何度描き直すかを指定します。小さいと破綻しますが大きすぎても破綻します。大きくすると時間がかかります。20〜30 が良いでしょう
- `samples`: 一度に何枚生成するか指定します。生成された画像は配列で返ってきます

という感じです。

## サーバーレス上で画像生成

API を使うメリットを享受するためにも、今回の絵の生成は全てクラウドのサーバーレス上で完結させました。Vercel の [Serverless Functions](https://vercel.com/docs/functions) を利用しています。Vercel は無料プランでも十分に使えるのでお勧めです。

[https://github.com/tkihira/color_painting/blob/main/api/generate.js](https://github.com/tkihira/color_painting/blob/main/api/generate.js)
```js
const generate = async (text) => {
    // call SAI's API to generate an image from text
    const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            text_prompts: [{ text: text + ', white and black, coloring book for kids, simple, adult coloring book, no detail, outline no color, fill frame, edge to edge, clipart white background' }],
            cfg_scale: 7, height: 1024, width: 1024, steps: 30, samples: 1,
        }),
    });

    if (!response.ok) {
        const json = await response.json();
        throw `${json.name}: ${json.message}`;
    }

    const responseJSON = await response.json();

    const image = responseJSON.artifacts[0];
    return Buffer.from(image.base64, 'base64');
};
```

生成部分の抜粋ですが、コードはローカルで動かしていたものからほとんど変更がありません。Vercel のサーバーレスは無料プランだと最大 60 秒でタイムアウトしますが、絵の生成は大体 10 秒弱で終わるので、余裕をもって制限時間内に終了するでしょう。

## いたずら防止に reCAPTCHA v2 を導入

先述した通り、AI を使ったサービスは高コストになりがちです。今回、悪意をもった人から API を外部から叩かれたりしないように、Google の reCAPTCHA v2 を導入しました。いわゆる「私はロボットではありません」というアレですね。

[https://www.google.com/recaptcha](https://www.google.com/recaptcha)

AI の API を利用したサービス提供では、コストが高い分、悪意をもった攻撃への対策が大切になります。次のような対策をしましょう

- 想定外の利用を弾く: DoS 攻撃や愉快犯などの悪意を想定し、何らかの防御策を最初から導入しておきましょう
- 利用金額にキャップを設定する: 突破された場合の被害額が無制限にならないように、利用金額に必ずキャップを設定しましょう
- モニタリング: おかしな挙動をなるべく早く察知するため、各種のモニタリングを導入して定期的に監視しましょう

今回のようなサービスでは、絵を描くたびに Captcha を要求するのはそこまでユーザー体験を悪くしないと思いますが、例えばゲームのキャラクターに LLM で会話させる、といった利用の場合、ユーザー体験とセキュリティのトレードオフの設計は非常に難しいものとなります。AI を（無料で公開する）サービスに導入する際の大きなハードルになることが多いでしょう。


# 感想

このように Stability AI の API を利用することで、相当短いソースコードにもかかわらず、しっかりしたサービスを開発出来ました。API の利点ですね。

製作において、いくつか気になった点についてまとめます。

## 性能

Stability AI Developer Platform を使うのは初めてでしたが、性能には満足しています。高価なモデルも試しましたが、適当なプロンプトでもかなり綺麗な画像を生成してくれるので、プロンプトをひたすら極める作業（呪文とよばれることがあります）はそこまで必要なさそうに思えました。そういう意味で生産性は高そうです。

また、今回のサービスでは Text-to-image の API を利用しましたが、画像生成に限っても Image-to-image や Inpaint の API も公開されており、他の画像生成系 AI のサービスでは出来ないようなサービスを作る余地があるのが魅力でした。特に Inpaint は個人的に大好きな機能なので、これが API で利用できるのは嬉しいです。

Image Generate 以外にも、[Upscale や Edit](https://platform.stability.ai/docs/getting-started/stable-image) などの機能があるのも良いですね。これらの機能単体でサービスになってしまう程です。有料でユーザーに付加価値を提供するような設計で効力を発揮しそうです。Coming Soon になっている Control にも期待ですね

Google の Colab の Notebook を見ると、その色々な API を実際の呼び出しコード付きで確認出来ます。ぜひ見てみてください。

[https://colab.research.google.com/github/stability-ai/stability-sdk/blob/main/nbs/Stable_Image_API_Public.ipynb?hl=ja](https://colab.research.google.com/github/stability-ai/stability-sdk/blob/main/nbs/Stable_Image_API_Public.ipynb?hl=ja)

一方で、私の想像だと、提供されているモデルは相当にチューニングされている気がします。仮に API からオンプレミスに移行しようと思った場合に、同じ Stable Diffusion だとしてもはたして同等の出力を得ることが簡単に出来るのだろうか、そのリスクが高いかもしれない、と考えております。

## 価格

今回の SD1.6 は、1 枚 1 円程度で非常に良いクオリティでした。競合他社と比較しても安いと思います。DALL･E で同じ 1024x1024 の絵を書こうとすると、DALL･E 3 だと 1 枚 6 円、DALL･E 2 を利用しても 1 枚 3 円ほどかかってしまいます。

1 枚 1 円程度とはいえ、ユーザー 1,000 人が 10 枚作成すると 10,000 円になるわけで、馬鹿に出来る金額ではありません。サービス設計時に、いかにコストを抑えるデザインにするかがとても大切になります。例えば、

- 過去に生成した絵をキャッシュして利用する
- 1 日に一定枚数をバッチで作成し、それを使い回す

といったような対策が考えられます。ゲームなどでは、あらかじめバッチで処理するような設計が良い効果を発揮しそうな印象があります。

ただ、個人的には<span style="color:red">バッチで処理するならば、API を使うべきではない</span>と考えています。API のメリットは、

- 安定して運用出来る
- 事前の環境構築の時間が必要なく、いつでも即座に使える
- アクセスのない時間のコストはかからない

といったところにあると思いますが、バッチ処理においてはこれらのメリットは必要なくなります。GPU インスタンスをクラウドで借りて、スタートアップに数分かけて、一気に必要枚数を生成して、インスタンスを落とす、というような運用をするほうが間違いなく安上がりでしょう。もちろん最初のプロトタイピングに API を利用するのは良いと思うのですが、バッチ処理がメインになりそうであれば、最初から GPU を自前で確保して一括生成する設計を考えておくことをオススメします。

## モデレーション

<span style="color:red;font-weight:bold">自動生成系のサービスを提供する時に非常に大きな問題になるのは、卑猥な絵を生成するような倫理に反する指示をユーザーがした場合に、それを検知して弾く必要がある</span>点です。自社のサービスを利用してそのような画像を大量に生成されるのは、サービス自体の評判を落とすことにも繋がりかねない大きなリスクです。

その点、Stability AI の API は標準で非常に強いモデレーション・システムを持っていて、そう簡単に卑猥な絵を出力出来ません。私が試した限りでは（私は卑猥な絵を出力させる才能がそんなにないと思うのですが）全く出力させることが出来ませんでした。これは、 **実サービスに画像生成 AI を投入する場合に、大きな大きなメリットになります** 。

例えば、今回の[塗り絵 自動生成](https://color-painting.vercel.app/)サービスで、`naked girl` といったプロンプトを入れると、次のようなエラーメッセージが出て失敗します。

```
Your request was flagged by our content moderation system, as a result your request was denied and you were not charged.
```

（モデレーションで弾かれた時に料金が請求されないのは地味に嬉しくて、絵を生成せずにデバッグしたい場合（reCAPTCHA のテストとか）にはこれを利用しておりました…ｗ）

これはサービス提供者としては本当に安心です。私はこのメリットを非常に高く評価しております。

ただ一方で、Stable Diffusion はオープンである故、歴史的にアダルトコンテンツにも広く使われている現実があります。そういったサービスを提供している人にとっては、自分の責任で自分専用のモデレーションシステムを注入するようなオプションがあると喜ぶのかもしれないな、とは思いました。言うまでもなく、一般的な利用方法においては Stablity AI のモデレーションは全く問題がないでしょう。

# まとめ

以上、[塗り絵 自動生成](https://color-painting.vercel.app/)のサービスの開発記録になります。再度ソースコードを掲示します。非常に短いコードなので、ぜひ見てみてください。

[https://github.com/tkihira/color_painting](https://github.com/tkihira/color_painting)

OpenAI の API も驚くほど利用が簡単でしたが、Stability AI の API も大きなトラブルなく利用出来ました。そんなに画像生成 AI を追っているわけではないのですが、最近の AI のレベルの進化は著しく、その高い品質にびっくりします。

ブログのサムネイルの自動生成、広告のクリエイティブの自動生成、ゲームの素材の自動生成などなど、画像生成はひときわ応用範囲の広い技術です。Stable Diffusion はそのオープンさ、クオリティ、ならびにカスタマイズ性の高さから爆発的な勢いで世界中で普及し、今やオープンな画像生成 AI のデファクトスタンダードになった感があります。一方で、今や Stable Diffusion をまっさらな素人が触ってきれいな絵を生成するにはハードルが高い側面も生まれていました。

本当に簡単に作れるので、ちょっと興味のある人はぜひ試してみてください。手元でちょっと実行するだけでも楽しいと思いますし、きっと創造力を刺激されることでしょう。そしてぜひ、AI を組み込んだクオリティの高いサービスを世の中に提供してください！
---
layout: post
title: 知られざる globalCompositeOperation テクニック
categories:
- HTML5
- Canvas
- JavaScript
---

この記事は、JavaScript で Flash Player の実現を頑張った（もしくは現在進行系で頑張っている）人たちの集う [Flash Advent Calendar 2020](https://qiita.com/advent-calendar/2020/flash) に参加しております。

HTML5 の Canvas はかなりの機能を有しております。Flash Player の実装にあたってこれらの豊富な Canvas の機能は大変有用なのですが、そんな中でも `globalCompositeOperation` というマイナー機能の活用方法は、今の時代でも十分に応用が効く知識です。Flash 終了への手向けとして、ここにその機能の素晴らしさと有効利用の方法を改めて紹介致します。



# HTML5 (canvas) の globalCompositeOperation とは

一言で言うと、`globalCompositeOperation` は `Composite` すなわち合成方法の指定になります。

Canvas に何かを描画する時、デフォルトでは普通に上書きされるのですが、`globalCompositeOperation` を指定している時はその効果が適用されます。 `globalCompositeOperation` は `globalAlpha` と同じように、Canvas におけるすべての描画命令に対して強制的に適用される効果を持ちます。たとえば

```javascript
ctx.globalAlpha = 0.3;
```

と書くと全ての描画において alpha 値 0.3 が強制的に適用されるのですが、同じ様に例えば

```javascript
ctx.globalCompositeOperation = 'source-atop';
```

と指定すると、「既に描画されている場所にのみ上書きされる」という効果を得ることが出来ます。

![globalCompositeOperation の例](/img/globalCompositeOperation.png)

MDN の [CanvasRenderingContext2D.globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) を見ると、具体的な利用方法が描画結果つきで確認出来ます。もしご存知なければ、軽く目を通してみてください。

これだけを見ると、これがいかに強力な機能なのかがおわかりにはならないと思います。強いてあげれば「Flash でクリッピングマスクを行う時に、`source-atop` などを使うと便利そうだね」程度でしょうか（実際の Flash の clipping は非常に複雑で、`source-atop` でカバーするにはあまりに大変ですし、そもそも Canvas には [clip](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip) というそのものズバリの機能があるのでこれを使いますが）。

# Flash Player の addColor

さて、Flash Player には Canvas 泣かせの機能が山程あるのですが、その中で最も使用頻度が高い機能のひとつが `addColor` もしくは `subColor` です。何かシェイプ（もしくはムービークリップ）を描画する時に、RGB の足し算をして描画する、という機能です。例えば `addColor` が (60,30,0) が指定されている場合、そのシェイプの元々の色が (90, 150, 80) であった場合、期待される出力は (150, 180, 80) になるわけです。（本質ではないので、この記事では 255 を超えた場合は 255 みたいな境界条件はとりあえず無視します）

さてこれを Canvas で実装しようとすると、恐ろしく難しいことがわかります。シェイプの色が全体で一律に決まっていればいいのですが、実際はグラデーションあり、画像あり、半透明あり、と一律な色を想定することは全く出来ません。なので、素直に実現しようとすると、`addColor` が指定されている場合はピクセルデータを [getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData) で取得し、ピクセルごとに足し算引き算を行い、その結果を [putImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData) で描画することになるでしょう。

しかしご存知の通り、`getImageData` ならびに `putImageData` は物凄く重いのです。そして不幸なことに、`addColor` は使用頻度が高く、ここの処理が重いと全体のパフォーマンスに大きな影響を与えてしまいます。私が HTML5 の Flash Player エンジン「ExGame」の最初のバージョンを作成したのはちょうど 10 年前、2010 年の 11 月でした。当時は iPhone 3GS が最先端であり、Canvas の描画速度も物凄く遅かったのです。当時、ここは何としても高速化が必要でした。

ちなみに当時、当然ながら WebGL は使えませんでした。

# globalCompositeOperation の仕様

結論から言うと、`lighter` と `difference`（当時は `darker` という名前でした）を使うことによって<span style='color:red'>この処理を超高速に実現することが可能になり、それにより数多くの Flash が爆速で動くようになりました</span>。具体的にどのように色の足し算・引き算を実現したか、ここで解説します。

W3C の [Compositeing and Blending Level 1](https://www.w3.org/TR/compositing-1/) という仕様書がキーになります（余談ですが開発当時はこんな便利な資料がなかったので、ブラウザのソースコードを読んで実装を学んでいました。[当時の同僚の資料](http://blog.fchiba.net/archives/172477.html)が全部リンク切れなのが切ない）。知識がないと読むのが大変だと思いますので、簡単にキーポイントをご説明します。

まず [9.1章](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators) で説明されているように、`globalCompositeOperation` の各オペレーションの内容は数式にて定義することが可能です。

- 最終的なアウトプットの色を `co` (Color Output)
- 最終的なアウトプットのα値を `αo` (Alpha Output)
- 今から描画する色を `Cs` (Color Source)
- 今から描画するα値を `αs` (Alpha Source)
- 既に描画されている色を `Cb` (Color Background)
- 既に描画されているα値を `αb` (Alpha Background)
- 描画の割合を示す定数 `Fa` と `Fb`

これらのうち、`Cs`, `αs`, `Cb`, `αb` は描画時の Canvas に描かれているデータが入力となり、`Fa` `Fb` はオペレーションによって定義されます。アウトプットの `co` `αo` については、

```
co = αs * Fa * Cs + αb * Fb * Cb
αo = αs * Fa + αb * Fb
```

で決まります。要するに、 `Fa` `Fb` が各オペレーションの実際の処理を内包します。

デフォルトの [Source Over](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators_srcover) を見てみましょう。

```
Fa = 1; Fb = 1 – αs
```

これを上記の式に代入して、

```
co = αs * Cs + αb * Cb * (1 – αs)
αo = αs + αb * (1 – αs)
```

が得られます。これが、実際に `globalCompositeOperation` で実現されている効果として表れてくるのです。

# globalCompositeOperation を使った色の足し算

やっと本題に入りますが、（とりあえず α を無視して）`globalCompositeOperation` で色の足し算をしたい場合、

```
co = Cs + Cb
```

にて得ることが出来ます。なんと標準の仕様では、これが [Lighter](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators_plus) として定義されています。

```
Fa = 1; Fb = 1
co = αs * Cs + αb * Cb;
αo = αs + αb
```

これで αs と αb が共に 1 であれば、`globalCompositeOperation` を使って色の足し算が出来るのです！

例えばとあるシェイプ（もしくはムービークリップ）をある canvas に書いているとして、その canvas に `addColor(10,50,100)` という描画をしたい場合、

```javascript
const canvas = getShapeOrMovieClipCanvas(id);
const ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'lighter';
ctx.fillStyle = 'rgb(10,50,100)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

という形で実現することが出来るのです。

色の引き算は `difference` を利用して実現するのですが、少し複雑になるのでここでは説明を省略します。ExGame の後継である [Pex.js の実際のソースコードを](https://github.com/PexJS/PexJS/blob/master/src/renderer/util_render.js#L313-L370) github にて見ることが出来るので、興味のある方はご参照ください。

# 現代の応用方法

近年は WebGL が使えるようになったので、このような処理は自分でシェーダーを書いて簡単に実現出来るようになりました。素晴らしい…。しかしそれでもなお、これらの技術は利用価値があります。

私が今年作った [Block Pong](https://bp.game5.app/) というゲームがあるのですが、このゲーム内部でも `globalCompositeOperation` を使ったテクニックを活用しています。実際にゲームを遊んで頂ければおわかりになると思いますが、このゲームの画面全体には blur 効果（いわゆるフィードバックブラー）をかけており、それが球の軌跡を綺麗に見せてくれております。

![Block Pong のスクショ](/img/block_pong.png)

これを実現するのは簡単で、レンダリングの先頭で

- 現在の Canvas の内容を保存する
- 現在の Canvas をクリアする
- 先程保存した内容を Canvas に `globalAlpha = 0.9` くらいで描画する
- 残りのレンダリング処理をする

という処理を入れるだけです。

しかしこれをやると、

- Canvas を毎回メモリに退避する必要があるが、最近は devicePixelRatio >= 3 の端末も増えてきて、結構メモリを圧迫するので出来ればやりたくない
- その巨大な Canvas を毎フレーム `drawImage` してやらないといけないが、端末によってはその処理が結構重い

という問題がありました。

そこで、`globalCompositeOperation` の登場です。上記の処理は、結局の所「ピクセル全体の色を 0.9 で掛けたい」というだけの話なのです。既存の Canvas の API を使うと、どうしても α 値だけを書き換えることは出来ないのですが、`globalCompositeOperation` を使えば可能です。この場合は `destination-in` を利用します。

```javascript
ctx.globalCompositeOperation = 'destination-in';
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

[Destination In の仕様](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators_dstin) を確認すると、

```
Fa = 0; Fb = αs
co = αb * Cb * αs 
αo = αb * αs
```

となっております。全体を `rgb(255, 255, 255, 0.9)` で描画することにより、全体を一律薄くすることが可能になります。これにより、かなり重い `drawImage` に頼ること無く blur 効果を得ることが出来るようになっています。これを WebGL で実現しようとすると WebGL 専用の Canvas が必要になってしまうため、HTML5 ではこのやり方にまさる方法はないでしょう。

Canvas の API では α 値だけを書き換えることが（`getImageData` 等を使わない限り）出来ないのですが、`globalCompositeOperation` を使うことでその制限を取り払い、α 値の一括処理が可能になります。使い所は限られますが、Canvas を多用する方にとってはとても有用なテクニックだと思います。

# おわりに

ExGame のリリースは 2011 年でした。Canvas や HTML5 の機能が大幅に制限されている中で「（当時の）iPhone でまともに動作する Flash Player を HTML5 で作る」というのは極めて負荷の高いプロジェクトであり、その実現のために様々な高速化を実現すべく頭をフル回転していたことを、Flash のサポートが切れる 2020 年末である今、とても懐かしく思い起こしております。

今回ご紹介した `globalCompositeOperation` の話は、現代の開発でも有用になることがあろうと思います（実際私は今年使いました）。Canvas を使われる方は、何か少し特殊な処理が必要な時に、そういえばあんなテクニックがあったなぁ…、と思い出せるように頭の片隅に置いておくと良いかも知れません。

---
layout: post
title: 書評 "Binary Hacks Rebooted"
---

先日、「Binary Hacks Rebooted」をご恵贈賜りました。通して読んでみたところ、私の心の琴線に触れる内容が多くあり、ブログ記事で紹介させてもらいます。

**[Binary Hacks Rebooted —低レイヤの世界を探検するテクニック89](https://amzn.to/3ADKFAi)**




### 免責事項

- 私は一部の著者の方々とはとても親しく、本ブログの記述が客観的ではないかもしれません
- 私は前作の「Binary Hacks」を読んでおりません
- 私は低レイヤーが好きですが精通しているわけではなく、内容の間違った理解をしている可能性が十分にあります

# バイナリ、というよりは低レイヤーをトピックとした内容

タイトルには Binary Hacks とバイナリを強調していますが、どちらかといえばバイナリー周りというよりは低レイヤー全般に関する内容を扱っています。Hack #66 などでは Row Hammer 攻撃など、メモリの物理的な特性を利用した話などにまで及んでおります。

また、全体的に Linux を中心に書かれている内容が多いです。2 章の ELF Hack は当然のこと、3 章の OS Hack や 4 章のコンテナ Hack も基本は Linux です。ただ Linux について理解するというよりは、さまざまな低レイヤーの挙動に関して Linux を通じて理解しよう、という形なので、Linux を熟知していなくても読む価値は十分に高いでしょう。また Linux はカーネルに手を入れやすいこともあり、実際に本書においても Linux をビルドして実験したところ、みたいな表現が当たり前に出てきてワクワクさせられます。

念の為に補足すると、もちろん Linux 外の言及もあります。マイクロソフトの PE に関しても度々触れられていますし、MS-DOS の COM ファイルの作り方みたいな hack もありました。INT 21H 懐かしすぎる。

# 内容は広く深く

本書の扱っている内容は非常に広い一方で、それぞれについてはかなり深めの解説をしているため、全力で読もうとすると読み進めるのに非常に長い時間を必要とするでしょう。個人的には、それぞれの Hack について、どのようなことをやろうとしていて、そのためにどのレイヤーのどのような機能を利用しているのか、を理解しておく程度で良いと考えています。

個人的には、比較的新しい概念を多数紹介しているのがとても役立ちました。rr の仕組み解説とか非常に参考になりましたし、名前だけ知っていたファジングが具体的にどの程度の性能なのかを実験する項は想像以上の性能に驚かされました。Chromebook というハードウェアを固定することでファームウェアを書き換える内容など痺れましたし、コンテナをベースにサンドボックス環境について列挙してもらったところは教養としてためになりました。wasm をマジックナンバーを利用して直接実行させることが出来るのに驚いたり、浮動小数点周りで x87 と SSE2 の言及にニンマリしたり、ROP 攻撃に対する歴史的な防衛方式とその課題に現在のデフォルト設定の紹介に感謝したり、BadUSB でさらっと「Type-C で充電する種類のコンピュータでは充電器も BadUSB の攻撃元になりえる」というのに衝撃を受けたり、今まで「何か大変らしい」という認識しかしていなかったサイドチャネル攻撃（Meltdown）の非常にわかりやすい解説と共に示された具体的な攻撃コードに感銘を受けたり、この調子で行くと止まらなくなりそうですが、とにかく、私には刺さりまくりました。

本書は、これを元に実際に何かを作ってみようというような本ではなく、低レイヤーにおける様々なトピックの百科事典的な内容という理解をしております。深く理解せずとも、軽く一通り読んでおくことで、将来低レイヤーの分野で「なぜこんな挙動になってしまうのか」と悩んだり、「ちょっとだけ挙動を変えたいんだけれど良い方法はないものか」と思ったときに、それを解決する糸口となってくれるでしょう。

内容は深いとはいえ、あくまで概念の詳解と調べるとっかかりにとどまることにも注意は必要です。さらに具体的な話に踏み込んでいく場合は、「[実践バイナリ解析](https://amzn.to/4dXlpDn)」のような本に進んでゆくと良いでしょう。

# 対象読者はニッチかも

一方で、この本の内容をある程度理解するためには、読者側にも高い知識が要求されることは間違いありません。例えばアセンブラに関して、Hack #2 で一応アセンブラの簡易的な説明があるにはあるんですが、Hack #3 でいきなり call 命令で積んだ IP を pop するみたいなことを平気でやっていたりして（一応本文で解説していますが）、ある程度の素養がないと完全に理解することはできないでしょう。

とはいえ、上述しましたが、本書を完全に理解するのはそもそも正しい読み方ではないと思います。あくまで膨大なニッチ知識をつまみ食い的に理解しておき、必要になったときに脳内からインデックスとしてサッと引き出せる、そういった形で自分の技術力の底上げに使うのが正しいでしょう。そういう意味では、読者側にある程度高い知識を要求するとはいえ、内容が広いために概念理解の本として見ると幅広い読者の方の役に立つ可能性は高いと思われます。

何より、多くの Hack には実際に自分で実証するためのサンプルコードが記載されています。自分の手元の環境で実験することが出来るので、新しい概念を学ぶという前提に立つと、大変良い本になるのではないでしょうか。

普段から低レイヤーなことを扱っていらっしゃる方はもちろんとして、低レイヤーな分野に興味を持っている方であれば十分に楽しめる一冊だと思います。

# まとめ

再度リンクを貼っておきます。

**[Binary Hacks Rebooted —低レイヤの世界を探検するテクニック89](https://amzn.to/3ADKFAi)**

読後感として、今まで概念だけ理解して深入りしていなかった数多くの分野について、具体的な理解が深まったのに大変感謝しています。JavaScript を専門としている私であっても、JIT のメモリ展開の問題やサンドボックスのオーバーヘッドなどは今すぐ役に立つ話でした。低レイヤーに興味を持つ皆様にとって、お勧め出来る一冊になります。

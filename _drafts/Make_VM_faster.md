---
layout: post
title: JavaScript における VM の高速化手法
categories:
- JavaScript
---

この記事は、JavaScript で Flash Player の実現を頑張った（もしくは現在進行系で頑張っている）人たちの集う [Flash Advent Calendar 2020](https://qiita.com/advent-calendar/2020/flash) に参加しております。

皆さん、JavaScript で VM を実装する経験をお持ちでしょうか？私は過去に Java VM と ActionScript VM を実装したことがあります。Flash Player において VM は最も重い場所になることが多く、ここの高速化は Engine 全体の性能に大きく寄与します。この記事では、私が [Pex.js](https://github.com/PexJS/PexJS) にて導入し、素晴らしい成果をあげた VM の高速化手法をご紹介しましょう。

とはいえ今更 ActionScript の VM の話をされても困ると思うので、この記事では簡単な Java VM のサブセットをターゲットにして説明をします。



# VM (Virtual Machine) とは

VM (Virtual Machine) という単語は様々なコンテキストで使われます。特にインフラ周りでは仮想化技術の文脈で使われ、そちらの利用例が一般的だと思いますが、プログラミング言語の文脈で VM という場合は「言語の出力を実行可能な仮想的な機械」を指すことが多いです。たとえば Java VM は、Java をコンパイルしたバイトコードを実行出来ますし、ActionScript の VM は同じ様にコンパイルされた ActionScript を実行します。

言語の VM（たとえば Java VM）自体をそれぞれの CPU プラットフォーム（例えば Intel であったり ARM であったり）で実装することで、プラットフォーム間の互換性を高い水準で維持することが出来るようになるのが特徴です。一方で、最初から特定の CPU プラットフォームをターゲットにしたコンパイラに比べると、実行速度の面で不利があることが多いです。

その不利を減らすべく、色々な VM 実装においては JIT (Just In Time compiler) などの技術を駆使して高速化を頑張っています。

# JVM のバイトコードを見てみる

実物を元にご説明しましょう。こちら、10000 までの整数を足し算する Java のプログラムです。

```java
class Test {
    public int test() {
        int a = 0;
        for(int i = 0; i < 10000; i++) {
            a += i;
        }
        return a;
    }
}
```

これを javac でコンパイルすると、次のような class ファイルを得られました。

```
$ javac Test.java
$ xxd Test.class 
00000000: cafe babe 0000 0034 0010 0a00 0300 0d07  .......4........
00000010: 000e 0700 0f01 0006 3c69 6e69 743e 0100  ........<init>..
00000020: 0328 2956 0100 0443 6f64 6501 000f 4c69  .()V...Code...Li
00000030: 6e65 4e75 6d62 6572 5461 626c 6501 0004  neNumberTable...
00000040: 7465 7374 0100 0328 2949 0100 0d53 7461  test...()I...Sta
00000050: 636b 4d61 7054 6162 6c65 0100 0a53 6f75  ckMapTable...Sou
00000060: 7263 6546 696c 6501 0009 5465 7374 2e6a  rceFile...Test.j
00000070: 6176 610c 0004 0005 0100 0454 6573 7401  ava........Test.
00000080: 0010 6a61 7661 2f6c 616e 672f 4f62 6a65  ..java/lang/Obje
00000090: 6374 0020 0002 0003 0000 0000 0002 0000  ct. ............
000000a0: 0004 0005 0001 0006 0000 001d 0001 0001  ................
000000b0: 0000 0005 2ab7 0001 b100 0000 0100 0700  ....*...........
000000c0: 0000 0600 0100 0000 0100 0100 0800 0900  ................
000000d0: 0100 0600 0000 4f00 0200 0300 0000 1703  ......O.........
000000e0: 3c03 3d1c 1127 10a2 000d 1b1c 603c 8402  <.=..'......`<..
000000f0: 01a7 fff2 1bac 0000 0002 0007 0000 0016  ................
00000100: 0005 0000 0003 0002 0004 000b 0005 000f  ................
00000110: 0004 0015 0007 000a 0000 000a 0002 fd00  ................
00000120: 0401 01fa 0010 0001 000b 0000 0002 000c  ................
```

この中で、

```
03 3c03 3d1c 1127 10a2 000d 1b1c 603c 8402 01a7 fff2 1bac
```

これが test のバイトコードになります。javap でインストラクションを確認してみましょう。

```
$ javap -c Test.class
(...抜粋...)
    Code:
       0: iconst_0
       1: istore_1
       2: iconst_0
       3: istore_2
       4: iload_2
       5: sipush        10000
       8: if_icmpge     21
      11: iload_1
      12: iload_2
      13: iadd
      14: istore_1
      15: iinc          2, 1
      18: goto          4
      21: iload_1
      22: ireturn
```

これらのインストラクションはバイトコードと 1 対 1 に対応しております。例えば `iconst_0` は `0x03`、`sipush 10000` はオペコードが `0x11`、オペランドが `0x27 0x10` (0x2710 == 10000) になります。<span style='color:#dedede'>リトルエンディアンめ…。</span>

VM は、これを逐次実行していくことで、最終的に Java のプログラムが実行出来るようになるわけです。

# VM を作ってみよう

では、上記のプログラムを実行するだけの簡単な VM を実際に JavaScript で作ってみましょう！

```javascript
const bytecode = 
    [0x03, 0x3c, 0x03, 0x3d, 0x1c ,0x11, 0x27 ,0x10,
     0xa2 ,0x00, 0x0d, 0x1b, 0x1c, 0x60, 0x3c, 0x84,
     0x02, 0x01, 0xa7, 0xff, 0xf2, 0x1b, 0xac];

function vm(bytecode) {
    let programCounter = 0;
    const variableTable = [null, 0, 0];
    const stack = [];

    while(true) {
        switch(bytecode[programCounter]) {
            case 0x03: // iconst_0
                stack.push(0); programCounter++; break;
            case 0x3c: // istore_1
                variableTable[1] = stack.pop(); programCounter++; break;
            case 0x3d: // istore_2
                variableTable[2] = stack.pop(); programCounter++; break;
            case 0x1b: // iload_1
                stack.push(variableTable[1]); programCounter++; break;
            case 0x1c: // iload_2
                stack.push(variableTable[2]); programCounter++; break;
            case 0x11: // sipush
                stack.push(bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]);
                programCounter += 3; break;
            case 0xa2: // if_icmpge
                if(stack.pop() <= stack.pop()) {
                    if(bytecode[programCounter + 1] & 0x80) {
                        programCounter += (0xffff0000 | bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]) >> 0;
                    } else {
                        programCounter += bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2];
                    }
                    break;
                }
                programCounter += 3; break;
            case 0x60: // iadd
                stack.push(stack.pop() + stack.pop()); programCounter++; break;
            case 0x84: // iinc
                variableTable[bytecode[programCounter + 1]] += bytecode[programCounter + 2];
                programCounter += 3; break;
            case 0xa7: // goto
                if(bytecode[programCounter + 1] & 0x80) {
                    programCounter += (0xffff0000 | bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]) >> 0; break;
                } else {
                    programCounter += bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2];
                }
                break;
            case 0xac: // ireturn
                return stack.pop();
        }
    }
}
console.log(vm(bytecode));
```

簡単ですね！Wikipedia の [Java bytecode instruction listings](https://en.wikipedia.org/wiki/Java_bytecode_instruction_listings) を見ながら作りました。

- programCounter は、今動かしているバイトコードのオフセットを記録しています
- 通常は programCounter は 1 つだけ動きますが、オペランドのあるオペコード（`sipush`, `if_icmpge`, `iinc`）の場合はオペコード分も移動します
- `if_icmpge` で条件を満たした場合と `goto` ではジャンプします。一番上のビットが立っている場合はマイナス方向へのジャンプなので、32bit 化して対応しています（`>> 0` によって JavaScript の浮動小数点を int32 に変換出来ます）

これを実行すると、以下のように 0〜9999 を加算する Java のプログラムが実行されているのが確認出来ますね！

```
$ node vm.js
49995000
```

# VM のパフォーマンス

さて、パフォーマンスを見てみましょう。次のようなコードを書きました

```javascript
function native() {
    let a = 0;
    for(let i = 0; i < 10000; i++) {
        a += i;
    }
    return a;
}

const count = 10000;
var startTime = Date.now();
for(var i = 0; i < count; i++) vm(bytecode);
console.log(`VM: ${Date.now() - startTime}ms`);

var startTime = Date.now();
for(var i = 0; i < count; i++) native();
console.log(`Native: ${Date.now() - startTime}ms`);
```

純粋なパフォーマンスを計るためにはかなり不適当なコードですが、とりあえず目をつぶってこれを実行すると、出力は以下の通りでした

```
VM: 4877ms
Native: 78ms
```

VM の方が 60 倍くらい遅いです。関数呼び出しのコストも計測しているので、実際はもっともっと遅いと思います（そもそも native 関数のループが定数に置換されてそうですし）。まあ「ものすごく遅い」ということが確認出来たので良いでしょう。

# VM の高速化アイデア

さて、これをどのように高速化すればいいでしょうか。ここで一つ、次のプログラムを考えてみましょう。

```java
public class Test2 {
    public int test2() {
        int a = 0;
        a += 1;
        a += 2;
        a += 3;
        return a;
    }
}
```

インストラクションは以下の通りです

```
bytecode: 03 3c 84 01 01 84 01 02 84 01 03 1b ac
    Code:
       0: iconst_0
       1: istore_1
       2: iinc          1, 1
       5: iinc          1, 2
       8: iinc          1, 3
      11: iload_1
      12: ireturn
```

今は switch 文でループしながら各インストラクションを評価しているのですが、<span style="color:red">bytecode から JavaScript の関数を直接作ってしまうことが出来そう</span>ではないでしょうか？これが VM の高速化の基本的なアイデアとなります。具体的には次のようなコードです。

```javascript
const bytecode = 
    [0x03, 0x3c, 0x84, 0x01, 0x01, 0x84, 0x01, 0x02,
     0x84, 0x01, 0x03, 0x1b, 0xac];

function makeFunctionStringFromBytecode(bytecode) {
    let programCounter = 0;
    let funcStr = `
const variableTable = [null, 0, 0];
const stack = [];
`;

    while(programCounter < bytecode.length) {
        switch(bytecode[programCounter]) {
            case 0x03: // iconst_0
                funcStr += `stack.push(0);\n`; programCounter++; break;
            case 0x3c: // istore_1
                funcStr += `variableTable[1] = stack.pop();\n`; programCounter++; break;
            case 0x1b: // iload_1
                funcStr += `stack.push(variableTable[1]);\n`; programCounter++; break;
            case 0x84: // iinc
                funcStr += `variableTable[${bytecode[programCounter + 1]}] += ${bytecode[programCounter + 2]};\n`;
                programCounter += 3; break;
            case 0xac: // ireturn
                funcStr += `return stack.pop();\n`; programCounter++; break;
        }
    }
    return funcStr;
}

const funcStr = makeFunctionStringFromBytecode(bytecode);
console.log(funcStr);
console.log("Result: " + new Function(funcStr)())
```

この `makeFunctionStringFromBytecode` を実行すると、bytecode から直接 JavaScript の関数を生成してくれます。あとはこれを `new Function` で関数化して実行すれば、switch 文のループを必要としない高速な動作が期待できる関数を得ることが出来ます。このコードの出力は次の通りです。

```javascript
const variableTable = [null, 0, 0];
const stack = [];
stack.push(0);
variableTable[1] = stack.pop();
variableTable[1] += 1;
variableTable[1] += 2;
variableTable[1] += 3;
stack.push(variableTable[1]);
return stack.pop();

Result: 6
```

switch 文で実行していた時よりも、圧倒的に速そうですね！

# Jump 命令

しかしここで一つ壁があります。インストラクションの中に、`if_icmpge` と `goto` というジャンプ命令がありました。しかし JavaScript は goto 文を持っておりません。ジャンプ命令に対応するためには、どうすればよいでしょうか？

最も簡単なやり方は、switch 文を使うことです。switch 文発祥の地の C 言語において、switch 文のラベルは goto とほぼ同じ機能を持ちます。同じ構文を持つ JavaScript においても、switch 文を活用することで<span style='color:red'>疑似 goto 文<span>を作り出すことが出来ます。

具体的には、全体を switch 文で囲み、それぞれのインストラクションの場所に label を用意しておきます。そして goto の必要があるところで、一旦 switch 文から離脱し、改めて label の位置から switch 文を開始するやり方になります。

実際にコードを書いてみましょう。

```javascript
const bytecode = 
    [0x03, 0x3c, 0x03, 0x3d, 0x1c ,0x11, 0x27 ,0x10,
     0xa2 ,0x00, 0x0d, 0x1b, 0x1c, 0x60, 0x3c, 0x84,
     0x02, 0x01, 0xa7, 0xff, 0xf2, 0x1b, 0xac];

function makeFunctionStringFromBytecode(bytecode) {
    let programCounter = 0;
    let funcStr = `
const variableTable = [null, 0, 0];
const stack = [];
let gotoLable = 'label0';
while(true) {
  switch(gotoLable) {
`;

    while(programCounter < bytecode.length) {
        funcStr += `  case 'label${programCounter}':\n`;
        switch(bytecode[programCounter]) {
            case 0x03: // iconst_0
                funcStr += `    stack.push(0);\n`; programCounter++; break;
            case 0x3c: // istore_1
                funcStr += `    variableTable[1] = stack.pop();\n`; programCounter++; break;
            case 0x3d: // istore_2
                funcStr += `    variableTable[2] = stack.pop();\n`; programCounter++; break;
            case 0x1b: // iload_1
                funcStr += `    stack.push(variableTable[1]);\n`; programCounter++; break;
            case 0x1c: // iload_2
                funcStr += `    stack.push(variableTable[2]);\n`; programCounter++; break;
            case 0x11: // sipush
                funcStr += `    stack.push(${bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]});\n`;
                programCounter += 3; break;
            case 0xa2: // if_icmpge
                {
                    let gotoAddress;
                    if(bytecode[programCounter + 1] & 0x80) {
                        gotoAddress = programCounter + ((0xffff0000 | bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]) >> 0);
                    } else {
                        gotoAddress = programCounter + (bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]);
                    }
                    funcStr += `    if(stack.pop() <= stack.pop()) {\n`;
                    funcStr += `      gotoLable = 'label${gotoAddress}';\n`;
                    funcStr += `      break;\n`;
                    funcStr += `    }\n`;
                    programCounter += 3; break;
                }
            case 0x60: // iadd
                funcStr += `    stack.push(stack.pop() + stack.pop());\n`; programCounter++; break;
            case 0x84: // iinc
                funcStr += `    variableTable[${bytecode[programCounter + 1]}] += ${bytecode[programCounter + 2]};\n`;
                programCounter += 3; break;
            case 0xa7: // goto
                {
                    let gotoAddress;
                    if(bytecode[programCounter + 1] & 0x80) {
                        gotoAddress = programCounter + ((0xffff0000 | bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]) >> 0);
                    } else {
                        gotoAddress = programCounter + (bytecode[programCounter + 1] << 8 | bytecode[programCounter + 2]);
                    }
                    funcStr += `    gotoLable = 'label${gotoAddress}';\n`;
                    funcStr += `    break;\n`;
                    programCounter += 3; break;
                }
            case 0xac: // ireturn
                funcStr += `    return stack.pop();\n`; programCounter++; break;
        }
    }
    funcStr += `  }\n}`;
    return funcStr;
}

const funcStr = makeFunctionStringFromBytecode(bytecode)
console.log(funcStr);
console.log("Result: " + new Function(funcStr)())
```

`if_icmpge` と `goto` において、`gotoLabel` に適切な分岐先を代入した上で break しているのがご確認いただけると思います。これによって分岐命令が来たタイミングで一旦 switch 文の外にでて、再び `while(true)` によって switch 文により適切な場所から実行が開始される仕組みです。

このコードの実行結果は以下の通りです。

```javascript
const variableTable = [null, 0, 0];
const stack = [];
let gotoLable = 'label0';
while(true) {
  switch(gotoLable) {
  case 'label0':
    stack.push(0);
  case 'label1':
    variableTable[1] = stack.pop();
  case 'label2':
    stack.push(0);
  case 'label3':
    variableTable[2] = stack.pop();
  case 'label4':
    stack.push(variableTable[2]);
  case 'label5':
    stack.push(10000);
  case 'label8':
    if(stack.pop() <= stack.pop()) {
      gotoLable = 'label21';
      break;
    }
  case 'label11':
    stack.push(variableTable[1]);
  case 'label12':
    stack.push(variableTable[2]);
  case 'label13':
    stack.push(stack.pop() + stack.pop());
  case 'label14':
    variableTable[1] = stack.pop();
  case 'label15':
    variableTable[2] += 1;
  case 'label18':
    gotoLable = 'label4';
    break;
  case 'label21':
    stack.push(variableTable[1]);
  case 'label22':
    return stack.pop();
  }
}
Result: 49995000
```

このように、実行時にバイトコードから JavaScript の関数を直接出力する、いわば JIT のような機能を持たせることによって、大幅な高速化が可能になります

# パフォーマンス

前回の結果は 1 万回の実行に 4877ms かかっていましたが、さーて、どれくらい速くなっているでしょうか。検証用のコードを書いてみましょう。

```javascript
const funcStr = makeFunctionStringFromBytecode(bytecode)
const func = new Function(funcStr);

const count = 10000;
var startTime = Date.now();
for(var i = 0; i < count; i++) func();
console.log(`New VM: ${Date.now() - startTime}`);
```

実行結果はこちら

```
New VM: 2041
```

<span style='color:red'>なんと 2.4 倍もの速度を達成しました！</span>なお実運用においては、実際の ActionScript はもっと複雑なものが多いので、大体 5 倍くらいの速度を実現出来ていました。素晴らしいですね！

# なお、今なら…

しかし、これは 10 年前から 7 年前の話です。もし今同じ実装をやるならば、絶対に WebAssembly(wasm) の動的生成を開発すべきでしょう。WebAssembly にも goto そのものの命令はないのですが、上記 switch と同じような手法で出来るでしょう。ActionScript もスタックマシンで wasm と同じですし、実装はかなり簡単だと思います。

とはいえ、switch 文を使った goto テクニックなどは、このようなコード自動生成においては有用なテクニックではあります。wasm の bytecode を動的に生成する場合にも参考になるでしょう。このブログ記事が皆さんの刺激になり、新しい高速化のアイデアの源になれば幸いです。

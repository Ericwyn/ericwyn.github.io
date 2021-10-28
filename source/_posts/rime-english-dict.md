---
layout: post
title: 让 RIME 支持中英混合输入
tags: [且听秋谷]
date: 2021-09-25 20:01
updated: 2021-09-25 20:01
---

## 前言
ubuntu 18.04 下面, 手贱升级了一下搜狗输入法, 然后就翻车了, 总是出现输入不了的问题,
所以决定将输入法从 fcitx 换成 ibus 的 rime, 换成 rime 之后, 换成了明月中文简体输入,
但是发现 rime 并不支持中英文联合输入, 这对于我来说还是不太方便, 所以决定基于 RIME 的拓展词库功能来增加一个英文输入词库,
由此实现中英文混合输入的功能

## 单词选择
github 上面找到了 CET4 + CET6 单词, 7000 个左右, 看起来应该是够了的

## 词库制作
在词库制作上面, 由于一般比较长的单词才需要联想输入, 所以只将长度大于 3 的单词列入到词库里面, 
默认的触发阈值是当我们输入 3 个开头字母. 比如当我们输入 app 的时候, 将会联想出来 apple.

而针对长度大于 8 位的单词, 我将输入阈值设置成 4 个, 也就是只有 4 个的时候才会触发

所有单词的排序优先级都为 3

由此我得到了第一版的词库规则, 规则类似于

```
abandon	a b a	3
abbreviation	a b b r	3
abide	a b i	3
ability	a b i	3
abnormal	a b n o	3
apple	a p p	3
```

但是这样输入的时候会出现一个问题, 但我输入 a p p l 的时候, 联想的单词并不是 `apple`, 而是 `app了`

因为在词典看来, `a p p` 的输入联想得到 `apple`, 而 `l` 的输入则是一个新单词

## 改进
那怎么改进这个问题呢?

很简单, 我们给每个单词加多几行规则就好了, 比如 apple, 我们可以用 3 行规则来定义
```
apple	a p p	3
apple	a p p l	3
apple	a p p l e	3
```

这种处理的话, 我们简单写一个脚本来完成就可以了

最终我们就可以得到一个支持中英混合输入的词典, 把这个字典加到 RIME 的配置里面就可以了


## 最终效果

![输入效果](https://github.com/Ericwyn/RimeDict/raw/main/screenshot/english.dict.png)

## 下载

 - 字典文件: [luna_pinyin_simp.english.dict.yaml](https://github.com/Ericwyn/RimeDict/blob/main/luna_pinyin_simp.english.dict.yaml)
 - 处理脚本: [ gist ](https://gist.github.com/Ericwyn/ec860c388279cefabfa543e85cf25368 )
 - 词典来源: [mahavivo/english-wordlists](https://github.com/mahavivo/english-wordlists )

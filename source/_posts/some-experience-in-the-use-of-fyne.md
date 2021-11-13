---
layout: post
title: fyne 框架的一些使用经验
tags: [且听秋谷]
date: 2021-11-13 09:49
updated: 2021-11-13 09:49
---

fyne 是 go 里面一个支持多平台的 GUI 库, 很早之前就已听说过．
最近在尝试实现一个支持 windows 和 ubuntu 的划词翻译工具 (英语不够,工具来凑).
于是便希望用 fyne 来试试

当前我使用到的 fyne 版本是

```
require (
    fyne.io/fyne/v2 v2.1.1
    ...
)
```

## 中文字体

fyne 安装和使用其实挺简单的, 直接 go get 然后照着文档来就可以了.
但是在写出来 demo 之后我就遇到了第一个问题

中文乱码

翻看了官方的介绍和前辈的经验, 最终从

> https://www.wangfeng.me/article/Go-fyne-ui-kuang-jia-she-zhi-zhong-wen-bing-da-bao-dao-er-jin-zhi-wen-jian

这里看到了解决的方案, 总的来说, 一般有两种方案

### 设置 FYNE_FONT 环境参数

我们可以在程序启动的时候设置一个 FYNE_FONT 参数, 由此来定义使用的字体文件


```go
os.Setenv("FYNE_FONT", fontFile.AbsPath())
```

我试了一下这种方法, 感觉不错. Entry 文本框里面的中文终于不会是框框了

但是 button 的文字仍然会乱码...

而且 log 里面会有关于这个文件路径的报错 (看起来似乎是默认主题无法通过路径印用这个字体文件之类的)

### 自定义主题

这个方法的思路是使用 fyne cmd 将字体文件直接变成一个 .go 文件
然后我们配置一个新的自定义主题, 之后重写这个主题的 `Font(s fyne.TextStyle)` 方法, 由此让我们用上加载自定义字体的主题

除了参考上面提到的 blog, 也可以参考下面这个

> https://github.com/lusingander/fyne-font-example


首先第一步是把 ttf 文件变成 .go 文件, 我们需要先安装 fyne cmd
```shell
$ go get fyne.io/fyne/v2/cmd/fyne

$ fyne
Usage: fyne [command] [parameters], where command is one of:
...
```

之后编译本地的字体文件到 `.go` 里面

```shell
$ fyne bundle xxxxxx.ttf > bundle.go
```

运行完之后就会看到一个 bundle.go 文件 

~~但是大小居然高达 20M+ ..... Goland 表示我无法编辑....~~

在这个 go 文件里面定义了一个 resourceXXXX

```go

package main

import "fyne.io/fyne/v2"

var resourceXxxxxxTtf = &fyne.StaticResource{
	StaticName: "xxxxxx.ttf",
	StaticContent: []byte{
...
```

我们改改 package 之后就可以直接引用了

然后再新建一个主题就可以了
```go
package resource

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/theme"
	"image/color"
)

type CustomerTheme struct{}

func (t *CustomerTheme) Color(name fyne.ThemeColorName, variant fyne.ThemeVariant) color.Color {
	return theme.DefaultTheme().Color(name, variant)
}

func (t *CustomerTheme) Icon(name fyne.ThemeIconName) fyne.Resource {
	return theme.DefaultTheme().Icon(name)
}

func (t *CustomerTheme) Size(name fyne.ThemeSizeName) float32 {
	return theme.DefaultTheme().Size(name)
}

func (*CustomerTheme) Font(s fyne.TextStyle) fyne.Resource {
	if s.Monospace {
		return theme.DefaultTheme().Font(s)
	}
	// 此处可以根据不同字重返回不同的字体, 但是我用的都是同样的字体
	if s.Bold {
		if s.Italic {
			return theme.DefaultTheme().Font(s)
		}
		// 返回自定义字体
		return resourceXxxxxxTtf
	}
	if s.Italic {
		return theme.DefaultTheme().Font(s)
	}
	// 返回自定义字体
	return resourceXxxxxxTtf
}
```

之后我们在创建 GUI 的时候, 用上我们自己自定义的主题就 ok 了

```go
a := app.New()
a.Settings().SetTheme(&resource.CustomerTheme{})
```

经过测试, Entry 文本输入框和 Button 里面的中文都能正常显示了

## 设置程序 ICON

设置程序图标的方法也和上面的差不多, 我们需要用 fyne 将 icon.png 编译成一个 bundle.go 文件, 以便我们可以直接引用

之后就是创建 GUI 的时候调用接口设置一下就可以了

图标的资源文件如下
```go
package resource

import "fyne.io/fyne"

var ResourceIconPng = &fyne.StaticResource{
	StaticName: "icon.png",
	StaticContent: []byte{
	......
```

创建 GUI 的代码如下
```go
	a := app.New()
	a.Settings().SetTheme(&resource.CustomerTheme{})
    a.SetIcon(resource.ResourceIconPng)
```

## 一种更通用引入静态资源的方法

观察 fyne cmd 编译静态资源得到的 go 文件, 会发现其实就是直接把文件变成 byte 数组而已

既然这样我们也可以自己实现一个 loader, 然后让程序运行的时候再去加载本地路径下面的静态资源文件

对吧~

fyne 的静态资源定义如下
```go
type StaticResource struct {
	StaticName    string // 资源名字(好像没用到)
	StaticContent []byte // 资源的 []byte 表示
}
```

很简单的, 我们直接写一个 io 读取就可以了

```
func GetResource(resourcePath string) *fyne.StaticResource {
	finalByte := make([]byte, 0)

	fi, err := os.Open(resourcePath)

	if err != nil {
		panic(err)
	}

	defer fi.Close()
	r := bufio.NewReader(fi)

	readBuf := make([]byte, 1024)
	for {
		n, err := r.Read(readBuf)
		if err != nil && err != io.EOF {
			panic(err)
			//return
		}
		if 0 == n {
			break
		} else {
			finalByte = append(finalByte, readBuf[:n]...)
		}
	}
	log.D("load resource :" + resourcePath + " success !")

	return &fyne.StaticResource{
		StaticName:    fi.Name(),
		StaticContent: finalByte,
	}
}
```

更进一步, 我们可以再加点 map 啊之类的做 buf, 以便每一个资源只加载一次...

然后在一个 go 文件里面, 一次性加载多个静态资源

```
var ResourceIcon = GetResource("./resource/icon/icon.png")
var ResourceFont = GetResource("./resource/fonts/Alibaba-PuHuiTi-Regular.ttf")
```

之后我们可以就像上面设置主题字体, ICON 一样, 引用这里的 `ResourceIcon` 和 `ResourceFont` 就可以了

经过测试, 这种方法能行得通

对比起编译成 go 的方式, 这里的一大好处是我们不需要再提前处理了, 也不会收获一个超过 20M, 连 IDE 都无法编辑的 `.go` 文件
但是问题则在于后续打包的时候可能会有点麻烦
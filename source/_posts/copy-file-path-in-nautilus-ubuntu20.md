---
layout: post
title: 解决 ubuntu 20.04 里 nautilus 无法复制文件地址的问题
tags: [且听秋谷,ubuntu,Ubuntu 使用日常]
date: 2021-10-28 10:38
updated: 2021-10-28 10:38
---

## 问题

公司电脑加装了一个固态，将之前的 ubuntu18.04 升级到了 ubuntu 20.04

使用的时候发现了个小问题，之前再 nautilus 文件夹里面，可以通过选中某个文件或文件夹，直接 `ctrl + c` 就复制文件地址了

ubuntu 20.04 上面，这么做的话确会复制到一些奇怪的东西，如下

```
x-special/nautilus-clipboard
copy
file:///home/ericwyn/dev/StaticDev/ericwyn.github.io
```

没错，上面这一整段都是你在 ctrl + v 的之后得到的东西

## 解决方法

google 了一下， 发现我们可以使用 nautilus 的自定义脚本来实现这个原本复制的功能，相当于在右键菜单里面加一个 "复制文件路径" 选项

我们在 `~/.local/share/nautilus/scripts` 路径添加这样一个 `copyPath.sh` 文件就好了

```shell
#!/bin/bash
echo  ${NAUTILUS_SCRIPT_SELECTED_FILE_PATHS} | tr -d '\n'| xclip -selection clipboard
```

**注意： 你可能还得使用 `apt install xclip` 安装一下 xclip 工具才可以**

tr 命令是为了把 echo 命令结果末尾的回车给去掉

之后重启 nautlius，不出意外的话，你应该可以在右键里面看到 “脚本” 选项，里面会有一个 copyPath.sh 了

## 更多脚本
基于上面这个，我又写了其他一些脚本， 也一起分享一下，比如

### 使用 vs code 打开路径
```shell
#!/bin/bash
code -n ${NAUTILUS_SCRIPT_SELECTED_FILE_PATHS}
```

### 使用 Android Studio 打开路径
```shell
#!/bin/bash
/opt/android-studio/lasted/bin/studio.sh ${NAUTILUS_SCRIPT_SELECTED_FILE_PATHS}
```

### 使用 IDEA 打开路径

```shell
#!/bin/bash
/opt/idea/idea/bin/idea.sh ${NAUTILUS_SCRIPT_SELECTED_FILE_PATHS}
```

### 使用 Terminal 打开路径
```shell
#!/bin/bash
gnome-terminal --working-directory=${NAUTILUS_SCRIPT_SELECTED_FILE_PATHS}
```
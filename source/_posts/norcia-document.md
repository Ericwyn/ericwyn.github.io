---
layout: post
title: Norcia文档
tags: [且听秋谷,Norcia]
date: 2018-05-22 20:00
updated: 2018-11-20 23:00
---
# Norcia
一个简单的静态博客框架

## 项目结构
 - 根目录下的 HTML \ CSS \ JavaScript 文件
 - `document` 文件夹用来存放博文 markdown 文件
 - config.json 作为静态博客的配置文件以及博客文章索引,该文件在初次设定好个人信息后可由 Norcia 程序自动更新与维护, 详情请看下文介绍
 
## config.json 自动更新
### 更新
运行 Norcia 程序就可以自动依照 document 文件夹里面的 markdown 文件的修改, 而自动维护更新 config.json 索引了

Norcia 为以下三个平台提供打包好的二进制程序

 - `Norcia_win_amd64` 适用于 64 位 windows 系统
 - `Norcia_drawin_amd64` 适用于 64 位 Mac OS 系统
 - `Norcia_linux_amd64` 适用于 64 位 linux 系统

### 格式和说明

	{
		"head": "博客名称",
		"introduce": "博客介绍",
		"github": "github地址",
		"weibo": "weibo地址",
		"articles": [
			{
				"title": "文章标题",
				"tag": "文章标签",
				"create": "创作日期",
				"update": "更新日期"
				"mini": "文章缩略前300个字"
			},
			{
				"title": "文章标题",
				"tag": "文章标签",
				"create": "创作日期",
				"update": "更新日期"
				"mini": "文章缩略前300个字"
			}
		]
	}

### 使用示例

在工程目录根目录下运行下面命令就可以了
 - `Linux` 平台

        ./Norcia_linux_amd64

 - `Mac OS` 平台

        ./Norcia_drawin_amd64
        
 - `Windows` 平台
 
        ./Norcia_win_amd64.exe
        

如果运行正确的话, 会看到下面提示

    update 0 document(s), and create 0 documents(s)

### Norcia.js
`Norcia.js` 是　`Norcia`的　js 工具包，封装好了 Norcia 一些前端需要用到的函数，使用示例如下
    
    // 新建一个 config 对象
    let config = new NorciaConfig();
    
    // 使用回调函数来处理相关事务
    // 回调函数会在 config.json 数据被读取之后调用
    config.load([
        function loadHead(config) {
            console.log(config.head);
        },
        function loadTitle(config) {
            console.log(config.introduce);
        },
        function loadArticle(configTemp) {
            console.log(configTemp.articles[0].title);
        }
    ]);

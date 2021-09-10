---
layout: post
title: leanote server 源码运行
tags: [且听秋谷,leanote]
date: 2021-09-08 23:31
updated: 2021-09-11 00:56
---
## 前言

letanote 是一个我用了非常久的的在线文档, 大概是 16, 17 年的时候就开始用了, 一直部署在自己的腾讯云服务器上.

## 源码获取
 参照 [官方教程](https://github.com/leanote/leanote/wiki/Leanote-%E6%BA%90%E7%A0%81%E7%89%88%E8%AF%A6%E7%BB%86%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B----Mac-and-Linux), 使用 git clone 直接拉取 leanote-server 源码

 ```
 git clone https://github.com/leanote/leanote.git
 ```

## 源码运行
### mongodb 并初始化
leanote 的数据库是 mongodb, 所以我们需要先在系统上面安装好
之后按照官方的教程, 导入默认的数据, 做好配置才可以
之后让 mongodb 先跑起来

使用的命令可以参考下面这个

```shell
mongod --dbpath /root/drive/opt/leanote/leanoteData/Data/ --auth --bind_ip=127.0.0.1
```

## go 依赖安装
直接在目录下运行 go mod tidy 就可以了, 没什么好说的

## leanote config 配置
参考官方的配置文件说明, 修改 config/app.conf 文件, 主要修改下面几个点
 - adminUsername 超级管理员用户
 - db.username
 - db.password 数据库的用户名和密码
 - app.secret session 的密钥(吧?)

此外我还修改了网站默认的语言( i18n 配置默认是英语....)
 - i18n.default_language 改为 zh-cn

因为此前我一直在云服务器上面跑编译好的文件, 所以我的数据库\配置文件等都是从服务器上面复制下来的

### revel 安装
leanote 的 server 虽然是用 go 语言写的, 但是因为时间比较早, 那时候估计 gin 之类的框架还没出来
所以 leanote 这边用了 revel 框架来实现了后端

跟我们使用 gin 之类的框架不一样, leanote server 并不能直接编译出来一个二进制文件运行, leanote 的运行还需要安装 revel, 由 revel 来完成页面渲染之类的工作 ~~有 tomcat + servlet 那味儿了!~~

官方教程写的是, 使用如下命令生成revel二进制命令

```shell
$> go get -u github.com/revel/cmd/revel
$> revel version # 看是否是1.0.0 如果低于1.0.0 则无法运行Leanote
```

之后使用 `revel run -a .` 来运行 leanote-server

但是我运行的时候出错了, 提示

```
Unable to execute error="Revel paths[error Failed to load module.  Import of path failed modulePath:github.com/revel/modules/static error:No files found in import path github.com/revel/modules/static ]"
```

参考 github issue [https://github.com/revel/revel/issues/1531](https://github.com/revel/revel/issues/1528) , 发现还需要安装一些依赖, 使用下面的命令就可以了

```
go get github.com/revel/modules/static
go get github.com/garyburd/redigo/redis
go get github.com/patrickmn/go-cache
go get github.com/bradfitz/gomemcache/memcache
```

之后就可以使用 `revel run -a .` 运行了

## 修改 route 去除首页
leanote 默认的首页是一个介绍页面, 但是自己用的服务的话其实并不需要这个页面, 所以我们可以通过修改路由的方式, 让首页变成登录页面
revel 框架的路由配置全部都在 conf/routes 框架里面, 我们只需要修改第 8 行就可以了, 把下面这一行

```
Get 	/											Note.Default
```

改成 

```
Get 	/											Note.Index
```

之后当我们打开 localhost:9000/ 的时候, 就会默认进入登录页面

## 编译及用命令行运行
TODO

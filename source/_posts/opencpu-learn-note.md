---
layout: post
title: OpenCpu使用笔记
tags: [且听秋谷,R语言]
date: 2017-06-08 10:00
updated: 2018-11-20 23:00
---
## 前言
Opencpu 能够将 R package 变成 Web API，以此供其他语言的程序调用

## 安装

    # Requires Ubuntu 16.04 (Xenial)
    sudo add-apt-repository -y ppa:opencpu/opencpu-2.0
    sudo apt-get update 
    sudo apt-get upgrade
    # Installs OpenCPU server
    sudo apt-get install -y opencpu-server
    # Done! Open http://yourhost/ocpu in your browser
    # Optional: installs rstudio in http://yourhost/rstudio
    sudo apt-get install -y rstudio-server 

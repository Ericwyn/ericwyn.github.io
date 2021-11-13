---
layout: post
title: Java-JNI简单教程
tags: [且听秋谷,java,AndroidFramework]
date: 2018-11-03 21:00
updated: 2018-11-20 23:00
---
## 前言
最近决定入坑 Android Framework 了，这样的话，JNI 就一定是需要了解和会使用的，毕竟 Android Framework 就是各种 JNI 调用 c 和 c++ 的驱动然后提供给上层的 Android APP

## JNI
JNI 就是 Java Native Interface 的缩写，Java 通过 JNI 来调用 C 的程序和库，这些动态库在 windows 上面以 `.dll` 的形式存在，在 Unix 世界里以 `.so` 的形式存在，Android 基于 Linux ，所以实际上 Android Framework 当中调用的各种驱动就是 .so，我在 Linux 上面，尝试使用 Java 调用 c 写的一个方法，输出 Hello World！

## Java 的准备
Java 这边我们先要声明一个 native 方法，具体的代码如下

    public class HelloWorld {
    
        static {
            // 这里导入 hello.dll(windows 下面) 或者 libhello.so (Unixes) 下面
            System.loadLibrary("HelloWorld");
        }
        
        // 声明一个 native 方法
        private native void sayHello();
    
        public static void main(String[] args) {
            // 调用 native 方法
            new HelloWorld().sayHello();
        }
    }
    
## 生成 Native 的头文件
Native 的头文件，类似于 Java 的接口规范（大概理解，尚不清楚这样到底对不对），java 提供了一个 javah 的工具，帮助我们直接生成 native 头文件 `.h` 这样的文件，但是使用 javah 之前，要先将 `.java` 文件编译成 `.class` 文件，因为 javah 的话是对着 `class` 文件进行的

所以我们先使用

    javac HelloWorld.java
    
然后使用 javah 

    ${JAVA_HOME}/bin/javah -jni -classpath ${ClassOutputPath} -d ./jni com.ericwyn.jni.HelloWorld

其中 `${JAVA_HOME}`是你 Java 的目录。 `${ClassOutputPath}`是你 Class 文件的输出所在目录，这个在 Intellij 的话一般是 `out` 目录下

然后一般就会生成一个 `com_ericwyn_jni_HelloWorld.h` 的文件，因为我的类的名字是 
`com.ericwyn.jni.HelloWorld`，头文件的命名就是将这个类的全名当中的点全部变为下划线这样

这个 `.h` 文件具体代码如下

    /* DO NOT EDIT THIS FILE - it is machine generated */
    #include <jni.h>
    /* Header for class com_ericwyn_jni_HelloWorld */
    
    #ifndef _Included_com_ericwyn_jni_HelloWorld
    #define _Included_com_ericwyn_jni_HelloWorld
    #ifdef __cplusplus
    extern "C" {
    #endif
    /*
     * Class:     com_ericwyn_jni_HelloWorld
     * Method:    sayHello
     * Signature: ()V
     */
    JNIEXPORT void JNICALL Java_com_ericwyn_jni_HelloWorld_sayHello
      (JNIEnv *, jobject);
    
    #ifdef __cplusplus
    }
    #endif
    #endif


里面就是规定了一个 `JNIEXPORT void JNICALL Java_com_ericwyn_jni_HelloWorld_sayHello (JNIEnv *, jobject);`


## 调用头文件编写 c 代码
我们编写一个 c 语言文件，具体代码如下

    #include<jni.h>
    #include <stdio.h>
    #include "com_ericwyn_jni_HelloWorld.h"
    
    JNIEXPORT void JNICALL Java_com_ericwyn_jni_HelloWorld_sayHello(JNIEnv *env, jobject thisObj)
    {
        printf("Hello World!\n");
        return ;
    }

头部引入了 `jni.h` ，另外再引入我们之前生成的头文件

## 编译 c 代码成为 so
使用下面的代码来将 c 语言文件编译成 .so 库

    gcc -fPIC -I "/usr/lib/jvm/java-8-oracle/include/" -I "/usr/lib/jvm/java-8-oracle/include/linux/" -shared -o ./lib/libHelloWorld.so  ./jni/HelloWorld.c
    
其中 
 - `-fPIC` 是产生位置无关代码，就是可以不固定的内存位置执行代码（就是可以动态链接的意思了），动态链接库必须添加。
 - `-I` 引入了 Java 的 `jni.h` 和 不同平台下面的一些头文件
 - `-share` 代表这是一个编译成动态链接库而非可执行文件
 - `-o` 设置了输出的文件位置
 
## 运行
首先我们要先在 Intellij 里面设置运行时候，native 库的位置，其实就是运行 java 的时候增加一个 `-Djava.library.path=`，设置为你的 .so 文件所在的文件夹路径

直接设置 Intellij 的 Run Configurations ，在 VM options 里面添加 
    
     -Djava.library.path=/work/JNITest/lib
     
然后运行就可以了

## 后记

写 JNI 的时候，特别是编译 c 语言文件的时候，真的感受到了作为初级 Java 程序员的我，对编译链的无知。毕竟 Java 平台无关，对开发者屏蔽了平台差异，这样确确实实便利了开发，但是对我们这些刚刚踏入计算机领域的人来说，又是福兮祸兮呢？
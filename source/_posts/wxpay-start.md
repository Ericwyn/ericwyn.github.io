---
layout: post
title: 从零开始的微信支付接入（一）用户认证
tags: [且听秋谷,微信开发]
date: 2019-02-24 12:00
updated: 2019-02-24 12:00
---
# 一，前言
最近接到项目需要，需要接入微信支付。微信支付的麻烦早有耳闻，所以之前也一直不敢接这样的项目，但是没办法为了生计，还是要学习。本篇教程主要讲述如何接入微信支付，分为微信浏览器内h5网页调起支付，以及小程序内调起支付。

其实微信支付出来这么久了，各种教程基本 Google 就都会有，但是自己在写的时候却好像没有特别完整的，再加上微信官网文档不知道为什么总有一种让人觉得很难看懂的感觉（对不起是我太菜了 _(:з」∠)_

所以在对接成功了之后决定写下这么一篇教程，来完整的记录自己的对接过程，既是教程，也是我自己的备忘录。

## 1.1 开发参考

整个对接过程，参考的最多的东西，主要是下面几个

 - [WxJava - 微信开发 Java SDK（开发工具包）](https://github.com/Wechat-Group/WxJava) 的文档
 - [微信支付官方文档-JSAPI支付](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_1)
 - [微信支付官方文档-小程序支付](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_1)

## 1.2 到底微信支付是个啥子流程
其实微信支付的流程那里，官网的示例图已经表达的很清楚了，花点心思看一下大概就懂了

![](https://ws1.sinaimg.cn/large/ae1a7c45gy1g0gnu1vne9j20ot0rzt9d.jpg)

其中最主要就是三步

 - 【业务服务器】 通过接受前端用户的消息（例如商品 id 啊什么的），向【微信支付服务器】发出请求，来创建一个预付订单
 - 【业务服务器】 获得【微信支付服务器】返回的预付订单信息返回给前端用户
 - 前端用户通过预付订单信息，调起手机端app的支付操作，并进行支付

<br>

所以整个对接的流程我会分成这几块过来讲

 - （一）用户认证
    如何在微信浏览器内的网页中、小程序中，获取用户的 OpenId 标识
 - （二）支付订单发起
    如何在我们的服务器服务器里面，创建一个预付订单，并且返回给前端用户
 - （三）用户端发起支付
    用户在网页、小程序里面，如何通过已有的预付订单信息，来调起支付，

<br>

## 1.3 开始之前
而在开始之前呢，你需要以下东西

 - 一个认证了的公众号
 - 一个认证了的小程序
 - 一个商户号
 
<br>

如果你没有以上的条件呢，2333 就只能出门左转（划掉），其实也是可以继续看教程的~只是没法实操而已~

# 二，用户认证
## 2.1 为什么需要做用户认证

我们作为商家，在收钱的时候，肯定是需要知道是谁发钱过来的。微信支付也是这样的，在微信支付的预付订单创建接口，一个比需要传递的参数就是用户的 openid

因此在支付之前，我们需要先进行用户认证，获取用户的openid 。所以实际上，对用户的认证，也就是获取用户的 openid。关于 openid 的介绍可以看这里

 > 小程序账户系统（openid和unionid）简介 https://zhuanlan.zhihu.com/p/34032336 

小程序和网页里，获取 openid 的操作是不一样的，网页获取 openid 比起网页更加困难

## 2.2 在微信网页当中获取用户 openid
### 2.2.1 业务流程
官方文档地址：[微信网页授权](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)

微信服务器有个专门认证的网址，当用户在微信浏览器当中访问这个网址的时候就可以获得一个 code，当然为了后续方便的操作，这个网址非常复杂，其中包含了获得 code 之后跳转的网址等。而业务服务器可以通过这个获得的 code 来向微信服务器换取用户的 openid，具体的流程如下

<br>

 - 我们有个接口 `URI_A`，该接口不返回任何信息，而只是做一个 redirect 而已，让用户跳转过去访问微信服务器地址，而具体的这个微信服务器地址的拼接，就在 `URI_A` 里面完成
        
        // 微信公众号的 id 和 secret
        private static final String appid="wxad92dbbbcfehuxAfe";
        private static final String secret="a7df6e8b55feffeufexhufidaslkf442";
        //    //正式部署时候的域名,关系到用户获取了登录的 code 能否跳转回来
        private static final String runDomain = "https://wx.meetwhy.com";
    
        // 一个中途转跳的 URI，用户在允许微信鉴权之后，跳转到 URI_REDIRECT?code=CODE
        private static final String URI_REDIRECT = "/user/wx/code";
        
        /**
         * 通过这个地址转跳去微信官方地址，以获取微信登录的 code
         * 并在之后跳转到正式登录接口
         *
         * @return
         */
        @RequestMapping("/user/wx/login")
        public String redirectToWechat(){
            return "redirect:https://open.weixin.qq.com/connect/oauth2/authorize?appid="+appid+"&redirect_uri="+ URLEncoder.encode(runDomain+ URI_REDIRECT)+"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
        }
 
 - 我们有个 `URI_REDIRECT`,这个 URI 用户是不会自己访问的，而是由微信服务器在发给用户 code 之后跳转过来，在获得 code 之后会跳转到 `URI_REDIRECT?code=USER_CODE`, 所以在 `URI_REDIRECT` 里面我们就要对 USER_CODE 进行获取，有了这个 `code` ，加上我们的 `appid` 和 `appsecrect` 就可以向微信服务器兑换用户的 openid，兑换了 openid 之后，我们就让用户返回业务页面，比如业务主页等。

        /**
         * 获取 Code 之后用户就访问这个地址，URI里面会带上一个 code 参数
         *
         * @param request
         * @return
         * @throws HttpException
         * @throws IOException
         */
        @RequestMapping(value = URI_REDIRECT)
        public String wexinRegister(HttpServletRequest request) throws IOException {
            String openid ;
            //用户微信登录获取openid
            String code = (String) request.getParameter("code");
            System.out.println(" code 是 " + code);
            if(code == null){
                return "redirect:ErrorPageInWechatLogin.html";
            }
            // 这里用了 Okhttp3
            Request wxRequest = new Request.Builder()
                    .url(String.format("https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code", appid,secret,code))
                    .get()
                    .build();
    
            Response response = httpClient.newCall(wxRequest).execute();
            if (response.isSuccessful()){
                String respText = response.body().string();
                JSONObject json = JSONObject.parseObject(respText);
                openid = json.getString("openid");
                // 成功之后就跳转回一个页面，带上 openid，当业务中应该是用户的 token，openid 应当保存在服务器
                return ("redirect:"+runDomain+"/wx.html?openid="+ openid);
            }else {
                return ("redirect:"+runDomain+"/wx.html?openid=获取id失败");
            }
        }

 - 至此，当用户跳转到 `wx.html` 的时候，就是已经获得自己的 openid （或者是服务器分发的 token 的了）

<br>

这部分的更加详细代码可以在 [这个 gist ](https://gist.github.com/Ericwyn/03eda7c3b8da0625c3eaad596345a39c) 里面看到

## 2.3 在微信小程序当中获取 openid
小程序的 openid 获取大致流程和网页获取差不多，只是后台这边获取 openid 有点修改而已（小程序传参的时候会用 json 格式，所以需要加上 JSON 解析类）

<br>

 - 小程序获取 code ，直接调用 wx.login 就可以了
    
        wx.login({
          success: res => {
            console.log("登录数据")
            console.log(res.code)
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            wx.request({  
              url: "https://wx.meetwhy.com/api/wx/login",  
              data: {
                "code":res.code,
                "errMsg":res.errMsg
              },  
              method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
              // header: {}, // 设置请求的 header  
              success: function(res){ 
                console.log(res)
                if (res.data.code === 1000){
                  console.log("获取 openid 成功 " + res.data.data.openid)
                  wx.setStorageSync('openid', res.data.data.openid);//存储openid  
                } else {
                  console.log("获取 openid 失败" + res.data.msg)
                }
              }  
            });
          }
        })

 - 后台对应的接口，这里使用 FastJson 来解析小程序的 http 请求参数

        /**
         * 微信用户登录
         * <p>
         * POST
         * code        前台调用微信接口返回
         * errMsg      同上
         *
         * @param jsonParam
         * @return
         */
        @RequestMapping(value = "/api/wx/login", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
        public ResJson wechatLogin(@RequestBody JSONObject jsonParam) {
            String code = jsonParam.getString("code");
            String errMsg = jsonParam.getString("errMsg");
            String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + properties.getAppId() + "&secret=" + properties.getAppSecret() + "&grant_type=authorization_code&js_code=" + code;
            Request request = new Request.Builder()
                    .url(url)
                    .header("content-type", "application/json")
                    .build();
            Response response = null;
            try {
                response = client.newCall(request).execute();
                if (response.isSuccessful()) {
                    String resp = response.body().string();
                    if (resp.contains("session_key") && resp.contains("openid")) {
                        JSONObject obj = JSON.parseObject(resp);
                        HashMap<String, String> resMap = new HashMap<>();
                        resMap.put("openid", obj.getString("openid"));
                        return ResJson.successJson("login Success", resMap);
                    } else {
                        return ResJson.failJson(-1, "获取 openid 失败", null);
                    }
                } else {
                    return ResJson.failJson(-1, "获取 openid 失败", null);
                }
            } catch (IOException e) {
                e.printStackTrace();
                return ResJson.serverErrorJson("无法请求远程 openid");
            }
        }
 
同样，这里也会有安全问题，openid 不应该直接传给客户端，而是因为保存在服务端（例如 session 里），这里只是个测试，正式写项目的时候要修改鸭~

# 三，总结
至此我们就完成了微信用户的认证了，下一篇就到了核心的操作——我们如何去对接微信服务器，创建一个预付订单。恭喜你学会了百分之30的微信支付技能鸭~


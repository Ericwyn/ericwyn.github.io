---
layout: post
title: 在 KML 中画圆
tags: [且听秋谷]
date: 2021-09-09 20:21
updated: 2021-09-09 20:21
---

### KML 中圆形的实现

原先我以为，KML 应该是有一些什么方法或者标记，可以让我们通过设置一个圆形和半径来画出一个园

但是当我在 Google Earth 随便画了一个圆，导出成 kml ，并用 vs code 打开之后发现，并不是这样的。在 KML 里面，圆形定义如下

```xml
<LineString>
    <tessellate>1</tessellate>
    <coordinates>
        113.10147288586933,22.714294933272082,0 
113.10164312458863,22.71428807687225,0 
113.10181206768848,22.714267559854086,0 
113.10197842940988,22.714233538364496,0 
113.1021409436397,22.714186271327552,0 
113.10229837354649,22.714126118473953,0 
113.1024495209936,22.714053537603228,0 
113.10259323565772,22.71396908109963,0 
113.10272842378347,22.713873391728153,0 
113.10285405650757,22.71376719774269,0......
    </coordinates>
</LineString>
```



在关键的 coordinates 里面，有 70 多个坐标点

所以事实上，我们在 Google Earth 里面看到的圆，是一个多边形



### 那我们要怎么画多边形呢

这个问题可以简化成，我们要怎么求出来相对于某一个点，特定方向特定距离的另一个点。

假如我们可以求出来距离某个经纬度 20 m，且与点所在水平线方向角为 0°， 60°，120°，180°，240°，300°，360° 的点，那么就可以围绕这个经纬度的位置画一个六边形了

而这个需求可以使用以下的代码来实现



```javascript
/**
 *
 * 获取距离 (latitude, longtitude) distance，角度为 angle 的点的坐标
 *
 * @param {number} distance 单位 km
 * @param {float} longitude
 * @param {float} latitude
 * @param {number} angle 与 (latitude, longtitude) 水平线的夹角
 * @returns
 */
function getLongLat(distance, longitude, latitude, angle) {
    let newLng = longitude + (distance * Math.sin(angle * Math.PI / 180))
        / (111 * Math.cos(latitude * Math.PI / 180));
    let newLat = latitude + (distance * Math.cos(angle * Math.PI / 180)) / 111;
    return {
        "lat": newLat,
        "lng": newLng,
    };
}
```



当我们调用以上函数 6 次，就可以得到 6 个经纬度了

而当我们调用次数越多，形成的多边形就越趋近于圆



我这里取了一个 72 次，相当于 72 边形，每 5° 就画一个点



### KML 模板

有了这一堆的经纬度之后，我们要基于这一堆的经纬度来生成一个 kml 文件，下面这份是我自己从 Google Earth 自己绘制的图形导出得到的 kml 模板

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
<Document>
    <name>Test.kml</name>
    <Style id="inline">
        <LineStyle>
            <color>ff0000ff</color>
            <width>5</width>
        </LineStyle>
    </Style>
    <StyleMap id="inline0">
        <Pair>
            <key>normal</key>
            <styleUrl>#inline</styleUrl>
        </Pair>
        <Pair>
            <key>highlight</key>
            <styleUrl>#inline1</styleUrl>
        </Pair>
    </StyleMap>
    <Style id="inline1">
        <LineStyle>
            <color>ff0000ff</color>
            <width>5</width>
        </LineStyle>
    </Style>
    
    <Folder id="{fenceName}">
        <name>围栏 {fenceName}</name>
        <Snippet></Snippet>
        <description></description>
        <Placemark>
            <name>{fenceName}_point</name>
            <Snippet></Snippet>
            <description> {fenceLog} </description>
            <Style>
                <IconStyle>
                    <color> FFFFFFFF </color>
                </IconStyle>
                <LabelStyle>
                    <color> FFFFFFFF </color>
                </LabelStyle>
            </Style>
            <Point>
                <altitudeMode>clampToGround</altitudeMode>
                <coordinates> {fenceCenterLngLat} </coordinates>
            </Point>
        </Placemark>
        <Placemark>
            <name>{fenceName}_cycle</name>
            <styleUrl>#inline0</styleUrl>
            <LineString>
                <tessellate>1</tessellate>
                <coordinates>
                    {fenceCycleList}
                </coordinates>
            </LineString>
        </Placemark>
    </Folder>
 
</Document>
</kml>
```



xml 里面，我用 Folder 来括组一组围栏的信息，其中包含了一个多边形（其实就是圆）以及点（圆心）

当我们需要绘制多个围栏的时候，只需要在 Document 标签里面多加几个 Folder 就可以了

模板文件里面有一些待填充的数据，其含义如下



{fenceName} 围栏的名字：随意字符串

{fenceLog} 围栏的描述，会显示在围栏中心点的描述位置

{fenceCenterLngLat} 经纬度："longute, latute", 比如 113.1100, 22.2200

{fenceCycleList} 组成圆（多边形）的点的经纬度每一组由 "纬度, 经度, 高度" 组成，每组之间用空格隔开

​    如 113.90767872659711,22.517658949676875,0 113.9078474283604,22.51763843265871,0 113.90801355243275,22.51760441116912,0





### 最终的 JS 代码

最终实现的 JavaScript 代码如下

```javascript
const fenceKmlModel = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:kml=\"http://www.opengis.net/kml/2.2\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n" +
    "<Document>\n" +
    "    <name>FencesExport</name>\n" +
    "    <Style id=\"inline\">\n" +
    "        <LineStyle>\n" +
    "            <color>ff0000ff</color>\n" +
    "            <width>5</width>\n" +
    "        </LineStyle>\n" +
    "    </Style>\n" +
    "    <StyleMap id=\"inline0\">\n" +
    "        <Pair>\n" +
    "            <key>normal</key>\n" +
    "            <styleUrl>#inline</styleUrl>\n" +
    "        </Pair>\n" +
    "        <Pair>\n" +
    "            <key>highlight</key>\n" +
    "            <styleUrl>#inline1</styleUrl>\n" +
    "        </Pair>\n" +
    "    </StyleMap>\n" +
    "    <Style id=\"inline1\">\n" +
    "        <LineStyle>\n" +
    "            <color>ff0000ff</color>\n" +
    "            <width>5</width>\n" +
    "        </LineStyle>\n" +
    "    </Style>\n" +
    "   \n" +
    "   {folderList}\n" +
    "</Document>\n" +
    "</kml>"
 
let fenceFolderModel = "    <Folder id=\"{fenceName}\">\n" +
    "        <name>围栏 {fenceName}</name>\n" +
    "        <Snippet></Snippet>\n" +
    "        <description></description>\n" +
    "        <Placemark>\n" +
    "            <name>{fenceName}_point</name>\n" +
    "            <Snippet></Snippet>\n" +
    "            <description> {fenceLog} </description>\n" +
    "            <Style>\n" +
    "                <IconStyle>\n" +
    "                    <color> FFFFFFFF </color>\n" +
    "                </IconStyle>\n" +
    "                <LabelStyle>\n" +
    "                    <color> FFFFFFFF </color>\n" +
    "                </LabelStyle>\n" +
    "            </Style>\n" +
    "            <Point>\n" +
    "                <altitudeMode>clampToGround</altitudeMode>\n" +
    "                <coordinates> {fenceCenterLngLat} </coordinates>\n" +
    "            </Point>\n" +
    "        </Placemark>\n" +
    "        <Placemark>\n" +
    "            <name>{fenceName}_cycle</name>\n" +
    "            <styleUrl>#inline0</styleUrl>\n" +
    "            <LineString>\n" +
    "                <tessellate>1</tessellate>\n" +
    "                <coordinates>\n" +
    "                    {fenceCycleList}\n" +
    "                </coordinates>\n" +
    "            </LineString>\n" +
    "        </Placemark>\n" +
    "    </Folder>"
 
 
if(String.prototype.replaceAll == undefined) {
    console.log("注入 replaceAll 方法")
    String.prototype.replaceAll = function(s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    }
}
 
/**
 *
 * 获取距离 (latitude, longtitude) distance，角度为 angle 的点的坐标
 *
 * @param {number} distance 单位 km
 * @param {float} longitude
 * @param {float} latitude
 * @param {number} angle 与 (latitude, longtitude) 水平线的夹角
 * @returns
 */
function getLongLat(distance, longitude, latitude, angle) {
    let newLng = longitude + (distance * Math.sin(angle * Math.PI / 180))
        / (111 * Math.cos(latitude * Math.PI / 180));
    let newLat = latitude + (distance * Math.cos(angle * Math.PI / 180)) / 111;
    return {
        "lat": newLat,
        "lng": newLng,
    };
}
 
// 圆圈由多少个点组成
const cyclePointCount = 72;
/**
 *
 * 解析下面这个格式的 list，导出成 kml，方便查看各个围栏
 *
 * {
 *      lat: locLat, 围栏中心的经纬度
 *      lng: locLng,
 *      id: id,
 *      radius: radius, 围栏的半径， 单位米
 *      log: log, 围栏的原始 log
 *  }
 *
 * @param fenceList
 */
function parseFenceToKml(fenceList) {
    let folderList = "";
 
    // 渲染 folder list, {fenceName}, {fenceCenterLngLat}, {fenceLog}, {fenceCycleList},
    for (let i =0;i<fenceList.length;i++){
        let fence = fenceList[i];
 
        let folderNow = fenceFolderModel;
        folderNow = folderNow.replaceAll("{fenceName}", fence.id)
        folderNow = folderNow.replace("{fenceCenterLngLat}",
            "" + fence.lng + "," + fence.lat)
        folderNow = folderNow.replace("{fenceLog}", fence.log)
 
        let fenceCycleList = "";
        for(let degree = 0.0;degree<=360;degree+= (360/cyclePointCount) ){
            let temp = getLongLat(1.0 * fence.radius / 1000,
                fence.lng, fence.lat, degree)
            fenceCycleList += temp.lng+","+temp.lat+",0 \n"
        }
        folderNow = folderNow.replace("{fenceCycleList}", fenceCycleList)
        folderList += folderNow;
    }
 
    // 渲染整个 kml
    let resKml = fenceKmlModel;
    resKml = resKml.replace("{folderList}", folderList);
    return resKml;
}
 
// 调用示例
let kmlResult = parseFenceToKml([
    {
        id: "Fence_ID_1",
        lat: 22.712493131470283,
        lng: 113.10147288586933,
        radius: 200,
        log: "围栏备注",
    }
])

```

![image-20210909201158161](/img/image-20210909201158161.png)
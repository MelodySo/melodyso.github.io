---
layout: post
title: Unity程序总内存优化记录
date: 2017-01-18 15:32:24.000000000 +09:00
---
[//]: <> (在此记录一下支持的语言和其别名：)
[//]: <> (xml ["html","xhtml","rss","atom","xsl","plist"])
[//]: <> (pp ["c","cc","h","c++","h++","hpp")
[//]: <> (javascript ["js"])
[//]: <> (markdown ["md","mkdown","mkd"])
[//]: <> (swift)
[//]: <> (scheme)
[//]: <> (ruby ["rb","gemspec","podspec","thor","irb"])
[//]: <> (objectivec ["m","mm","objc","obj-c"])
[//]: # (TODO: csharp supported)


[//]: <> (This is also a comment.)


[//]: # (This may be the most platform independent comment)

首先，上线各大渠道要看应用的总内存量。总内存包含了我们在Unity Profiler的Memory面板上看到的Reserved Total数字的值，再加上除Unity以外的内存。但是很多时候，这个总内存要比Unity Profiler多出来一个量级。以我们的项目为例，iOS总内存为408MB，Unity Reserved Total为279.4MB，多出来408-279.4=128.6MB。

天了噜！这些暗箱里的东西都是什么？我打算从完整项目开始做减法，分别测试一探究竟。

先上我测试用的代码，下面分别是iOS和Android的获取总内存的代码。

iOS的c代码：
{% highlight objectivec %}
//#import <mach/mach.h>
long getResidentMemory
{
    struct task_basic_info t_info;
    mach_msg_type_number_t t_info_count = TASK_BASIC_INFO_COUNT;
    
    int r = task_info(mach_task_self(), TASK_BASIC_INFO, (task_info_t)&t_info, &t_info_count);
    if (r == KERN_SUCCESS)
    {
        return t_info.resident_size;
    }
    else
    {
        return -1;
    }
}
{% endhighlight %}

Android的java代码：
{% highlight java %}
package com.melody.memorytest;

import android.app.ActivityManager;
import android.content.Context;
import android.os.Debug;
import com.unity3d.player.UnityPlayer;

/**
 * Created by melody on 2017/1/17.
 */

public class MemoryUtil {
    /**
     * get the memory of process with certain pid.
     *
     * @param pid
     *            pid of process
     * @param context
     *            context of certain activity
     * @return memory usage of certain process
     */
    public static int getPidMemorySize(int pid,Context context) {
        ActivityManager am = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        int[] myMempid = new int[]{pid};
        Debug.MemoryInfo[] memoryInfo = am.getProcessMemoryInfo(myMempid);
        memoryInfo[0].getTotalSharedDirty();
        int memSize = memoryInfo[0].getTotalPss();
        return memSize;
    }
    public static int getUsedMemory(){
        int pid = android.os.Process.myPid();
        Context context = UnityPlayer.currentActivity;
        return getPidMemorySize(pid,context);
    }
}
{% endhighlight %}

c#代码：
{% highlight csharp %}
using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;


public class ProfilerGUI : MonoBehaviour {
    [DllImport("__Internal")]
    public extern static long getResidentMemory();
    float interval = 1f;
    string totalMemory = "totalMemory:";

    GUIStyle style;
    void Start(){
        style = new GUIStyle();
        style.normal.textColor = Color.green;
        style.fontSize = 30;
        StartCoroutine(GetMemoryInterval());
    }
    IEnumerator GetMemoryInterval()
    {
        yield return new WaitForSeconds(interval);
#if UNITY_EDITOR
        totalMemory = "totalMemory:" + Random.Range(100f, 200f).ToString(".00");//print fake number in UnityEditor
#elif UNITY_IOS
        totalMemory = "totalMemory:" + ((float)getResidentMemory() / 1048576).ToString(".00");
#elif UNITY_ANDROID
        AndroidJavaClass jc = new AndroidJavaClass("com.melody.memorytest.MemoryUtil");
        totalMemory = "totalMemory:" + (float)jc.CallStatic<int>("getUsedMemory") / 1024;
#endif
        StartCoroutine(GetMemoryInterval());
    }
    Rect r = new Rect(0,Screen.height - 80 ,200,80);
    void OnGUI(){
        GUI.Label (r,totalMemory,style);
    }
}
{% endhighlight %}

然后分别测试的结果如下：

<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
 <head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta name="ProgId" content="Excel.Sheet"/>
  <meta name="Generator" content="WPS Office ET"/>
  <!--[if gte mso 9]>
   <xml>
    <o:DocumentProperties>
     <o:Author>melod</o:Author>
     <o:Created>2017-01-17T10:59:00</o:Created>
     <o:LastSaved>2017-01-18T18:53:22</o:LastSaved>
    </o:DocumentProperties>
    <o:CustomDocumentProperties>
     <o:KSOProductBuildVer dt:dt="string">2052-10.1.0.6135</o:KSOProductBuildVer>
    </o:CustomDocumentProperties>
   </xml>
  <![endif]-->
<style>
tr
    {mso-height-source:auto;
    mso-ruby-visibility:none;}
col
    {mso-width-source:auto;
    mso-ruby-visibility:none;}
br
    {mso-data-placement:same-cell;}
td
    {mso-style-parent:style0;
    padding-top:1px;
    padding-right:1px;
    padding-left:1px;
    mso-ignore:padding;
    mso-number-format:"General";
    text-align:general;
    vertical-align:middle;
    white-space:nowrap;
    mso-rotate:0;
    mso-pattern:auto;
    mso-background-source:auto;
    color:#000000;
    font-size:11.0pt;
    font-weight:400;
    font-style:normal;
    text-decoration:none;
    font-family:宋体;
    mso-generic-font-family:auto;
    mso-font-charset:134;
    border:15;
    mso-protection:locked visible;}
.xl64
    {mso-style-parent:style0;
    text-align:center;
    background:#D0D0F0;
    mso-font-charset:134;}
.xl65
    {mso-style-parent:style0;
    text-align:left;
    mso-font-charset:134;}
.xl66
    {mso-style-parent:style0;
    text-align:center;
    mso-font-charset:134;}
.xl67
    {mso-style-parent:style0;
    text-align:center;
    mso-pattern:auto none;
    background:#D9D9D9;
    mso-font-charset:134;}
.xl68
    {mso-style-parent:style0;
    text-align:center;
    mso-pattern:auto none;
    background:#FFFF00;
    color:#FF0000;
    mso-font-charset:134;}
.xl69
    {mso-style-parent:style0;
    text-align:center;
    mso-pattern:auto none;
    background:#92D050;
    mso-font-charset:134;}
.xl70
    {mso-style-parent:style0;
    text-align:center;
    white-space:normal;
    mso-font-charset:134;}
</style>
 </head>
 <body link="blue" vlink="purple">
  <table width="2192" border="0" cellpadding="0" cellspacing="0" style='width:1644.00pt;border-collapse:collapse;table-layout:fixed;'>
   <col width="317" class="xl65" style='mso-width-source:userset;mso-width-alt:10144;'/>
   <col width="251" class="xl66" style='mso-width-source:userset;mso-width-alt:8032;'/>
   <col width="162" class="xl66" style='mso-width-source:userset;mso-width-alt:5184;'/>
   <col width="22" style='mso-width-source:userset;mso-width-alt:704;'/>
   <col width="72" span="20" style='width:54.00pt;'/>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" width="317" style='height:13.50pt;width:237.75pt;'></td>
    <td class="xl66" width="251" style='width:188.25pt;'></td>
    <td class="xl66" width="162" style='width:121.50pt;'></td>
    <td width="22" style='width:16.50pt;'></td>
    <td class="xl67" width="72" style='width:54.00pt;'></td>
    <td class="xl67" width="72" style='width:54.00pt;'></td>
    <td class="xl67" width="72" style='width:54.00pt;'></td>
    <td class="xl67" width="72" style='width:54.00pt;' x:str>结论</td>
    <td class="xl67" width="72" style='width:54.00pt;'></td>
    <td class="xl67" width="72" style='width:54.00pt;'></td>
    <td class="xl67" width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td class="xl65" width="72" style='width:54.00pt;'></td>
    <td class="xl65" width="72" style='width:54.00pt;'></td>
    <td class="xl65" width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
    <td width="72" style='width:54.00pt;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl68" height="36" colspan="3" rowspan="2" style='height:27.00pt;border-right:none;border-bottom:none;' x:str>游戏项目|完整</td>
    <td></td>
    <td class="xl65" colspan="10" style='mso-ignore:colspan;' x:str>屏蔽oc的代码就是指替换UnityAppController.mm,UnityView.mm文件，使在objective-c层面的代码屏蔽</td>
    <td class="xl65"></td>
    <td colspan="9" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Run</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>带有sdk启动的代码|Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>104.81</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>屏蔽oc的代码|Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>86.14</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="19" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>带有sdk启动的代码|Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>101</td>
    <td colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="19" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>屏蔽oc的代码|Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>82.5</td>
    <td colspan="2" style='mso-ignore:colspan;'></td>
    <td class="xl65" colspan="10" style='mso-ignore:colspan;'></td>
    <td colspan="9" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl68" height="36" colspan="3" rowspan="2" style='height:27.00pt;border-right:none;border-bottom:none;' x:str>游戏项目|去掉了其他场景</td>
    <td></td>
    <td class="xl65" colspan="8" style='mso-ignore:colspan;' x:str>内存减少了18.5MB，初步结论是各路sdk的native代码项就占用了18.5MB的app内存</td>
    <td colspan="12" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Run</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>带有sdk启动的代码|Development Build</td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>屏蔽oc的代码|Development Build</td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>带有sdk启动的代码|Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>101</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>屏蔽oc的代码|Development Build</td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl68" height="36" colspan="3" rowspan="2" style='height:27.00pt;border-right:none;border-bottom:none;' x:str>游戏项目|去掉了其他场景|去掉了所有代码和引用库</td>
    <td></td>
    <td class="xl65" colspan="7" style='mso-ignore:colspan;' x:str>内存减少了47.4MB，结论是il2cpp的代码的初始化内存占用了很大的一部分</td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td colspan="10" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td></td>
    <td class="xl65" colspan="7" style='mso-ignore:colspan;' x:str>如果可以用减法的话，47.4-18.5=28.9MB，这是il2cpp所占用的内存</td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td colspan="10" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Run</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>55.2</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>53.6</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl68" height="36" colspan="3" rowspan="2" style='height:27.00pt;border-right:none;border-bottom:none;' x:str>游戏项目|去掉了其他场景|去掉了所有代码和引用库|去掉了StreamingAssets</td>
    <td></td>
    <td class="xl65" colspan="8" style='mso-ignore:colspan;' x:str>无明显变化，结论是StreamingAssets在iOS下有绝对文件路径，所以不需要单独索引</td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td class="xl65"></td>
    <td colspan="7" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td></td>
    <td colspan="4" style='mso-ignore:colspan;' x:str>而且项目的StreamingAssets文件数量不多</td>
    <td colspan="16" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument</td>
    <td></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>53.5</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td></td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl68" height="36" colspan="3" rowspan="2" style='height:27.00pt;border-right:none;border-bottom:none;' x:str>游戏项目|去掉了其他场景|去掉了所有代码和引用库|去掉了StreamingAssets|去掉了所有Resources文件夹</td>
    <td></td>
    <td class="xl65" colspan="9" style='mso-ignore:colspan;border-right:none;border-bottom:none;' x:str>内存减少了20MB，结论是Unity在native层面进行的资源索引，这里和安卓的dalvik堆相似</td>
    <td colspan="11" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Run</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>35.4</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl68" height="36" colspan="3" rowspan="2" style='height:27.00pt;border-right:none;border-bottom:none;' x:str>无其他代码的项目</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl66" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Run</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>31.8</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument</td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66"></td>
    <td class="xl64" x:str>内存值</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>31</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl69" x:str>Xcode Profile|Instrument|Release<span style='display:none;'></span></td>
    <td class="xl66"></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;' x:str>No Development Build</td>
    <td class="xl66"></td>
    <td class="xl66" x:num>30</td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
   <tr height="18" style='height:13.50pt;'>
    <td class="xl65" height="18" style='height:13.50pt;'></td>
    <td class="xl66" colspan="2" style='mso-ignore:colspan;'></td>
    <td colspan="21" style='mso-ignore:colspan;'></td>
   </tr>
  </table>
 </body>
</html>

**总结：iOS内存测试报表里的128MB内存，包含了：18MB的sdk相关oc代码，28.9MB的代码相关代码（猜测为il2cpp的初始化内存分配），20MB的Resources文件夹分配索引的代码。**


在这个层面可优化的点不多。针对以上三项:
1.  sdk的代码层面的内存优化，我们接入的是MSDK，这里相信腾讯，问题先放置了。
2.  il2cpp的代码占用，只能通过减少总代码量来进行，及时清理无用代码，特别是第三方的库。
3.  Resources文件夹的内存：这个问题比较复杂，参考：[https://unity3d.com/cn/learn/tutorials/topics/best-practices/guide-assetbundles-and-resources](https://unity3d.com/cn/learn/tutorials/topics/best-practices/guide-assetbundles-and-resources "A guide to AssetBundles and Resources")

总的来说就是，Resources文件夹下面的所有文件，无论使用与否都会被打包出来。Unity引擎会在打包的时候，判断项目文件夹下面的需要打包的资源文件。

这些资源将要被打包：
*   所有Resources文件夹下的文件，及其引用到的所有资源。 例如我们把图集资源放到Resources文件夹外面，但是把引用到了这个图集的UIPrefab放到Resources文件夹里面，那么图集也会被打包。
*   获取在BuildSetting面板里面Scenes In Build窗口，获取所有已激活场景文件，并且找到这些场景文件引用到的所有资源。
*   所有的代码文件
*   所有的Plugins/当前平台 的文件
*   StreamingAssets文件，这部分文件比较特殊，在iOS下有绝对文件路径，在Android下没有，具体可以参考手册。


而Unity引擎在程序启动时会对所有的资源文件弄一个映射，这个映射的内存就是多出来的这一块内存，内存大小和打包的所有资源文件的数量（非大小）成正比。在Android下同样也可以看见，随着增/减Resources文件夹的文件数量，dalvik堆的内存也随之增加/减少，也是这个原理。还有一份内存是可以在Unity Profiler/Memory/Detailed里面看见，显示在Assets/ResourceManager的内存。这部分内存也是常驻，并且也随打包的所有资源文件的数量（非大小）成正比。

关于Resources文件夹，有的Resources文件夹都不在Assets/Resources这里，而是随意放置，不能统一管理。而且有些也是无用资源，清理打包后的无用资源可以用这个插件 Build Report Tool：[https://www.assetstore.unity3d.com/en/#!/content/8162](https://www.assetstore.unity3d.com/en/#!/content/8162)

先总结到这里。。2017年的第一篇博客总算写出来了，Markdown还不熟悉很蛋疼啊。万事开头难，加油。
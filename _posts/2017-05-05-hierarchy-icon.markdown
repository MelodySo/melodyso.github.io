---
layout: post
title: UnityEditor扩展：自定义Hierarchy图标
date: 2017-05-05 15:50:24.000000000 +08:00
---

能上代码就不BB了。


{% highlight c %}
using UnityEditor;
using UnityEngine;
using System.Collections.Generic;

[InitializeOnLoad]
class HierarchyIconDisplay
{
    static Texture2D texture;
    static List<int> markedObjects;

    static HierarchyIconDisplay()
    {
        //替换自己的图片
        texture = AssetDatabase.LoadAssetAtPath("Assets/Resources/radioButton.png", typeof(Texture2D)) as Texture2D;
        EditorApplication.update += UpdateCB;
        EditorApplication.hierarchyWindowItemOnGUI += HierarchyItemCB;
    }

    static void UpdateCB()
    {
        GameObject[] go = Object.FindObjectsOfType(typeof(GameObject)) as GameObject[];
        markedObjects = new List<int>();
        foreach (GameObject g in go)
        {
            //自定义逻辑
            if (!string.IsNullOrEmpty(g.tag)&&g.tag == "UIProperty")
                markedObjects.Add(g.GetInstanceID());
        }

    }

    static void HierarchyItemCB(int instanceID, Rect selectionRect)
    {
        Rect r = new Rect(selectionRect);
        r.x = r.x+r.width - 16;
        r.width = 16;
        if (markedObjects.Contains(instanceID))
        {
            GUI.Label(r, texture);
        }
    }

}
{% endhighlight %}
---
layout: post
title: c#的优先队列实现
date: 2017-06-25 12:00:24.000000000 +08:00
---
#### 如果不考虑顺序问题，可以使用那个折半插入，来减少插入排序的时间复杂度
{% highlight c %}
using System;
using System.Collections;
using System.Collections.Generic;
public class PriorityQueue<T, P> where P : IComparable<P>
{
    private List<KeyValuePair<T, P>> items = new List<KeyValuePair<T, P>>();
    public int Count { get { return items.Count; } }
    public void Clear() { items.Clear(); }
    public void Enqueue(T item, P priority)
    {
        //从队尾开始，顺序查找插入
        int i = items.Count - 1;
        while (i >= 0)
        {
            int result = items[i].Value.CompareTo(priority);
            if (result > 0)
                i--;
            else
            {
                break;
            }
        }
        items.Insert(i + 1, new KeyValuePair<T, P>(item, priority));
        //折半插入
        //int i = 0, j = items.Count - 1;
        //while (i <= j)
        //{
        //    int middle = (i + j) / 2;
        //    int result = items[middle].Value.CompareTo(priority);
        //    if (result > 0)
        //    {
        //        j = middle - 1;
        //    }
        //    else if (result < 0)
        //    {
        //        i = middle + 1;
        //    }
        //    else
        //    {
        //        i = middle;
        //        break;
        //    }
        //}
        //items.Insert(i, new KeyValuePair<T, P>(item, priority));
    }
    public T Dequeue()
    {
        T first = items[0].Key;
        items.RemoveAt(0);
        return first;
    }
}
{% endhighlight %}
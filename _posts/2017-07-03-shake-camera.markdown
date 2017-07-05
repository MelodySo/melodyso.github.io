---
layout: post
title: Unity3D屏幕震动脚本，集合了曲线功能
date: 2017-07-03 17:00:24.000000000 +08:00
---
#### 震屏功能的主代码，挂在MainCamera上比较好
{% highlight c %}
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
/// <summary>
/// 震屏功能
/// </summary>
// [SLua.CustomLuaClass]
public class ShakeCamera : MonoBehaviour
{
    /// <summary>
    /// 震屏数据封装
    /// </summary>
    private class ShakeData
    {
        /// <summary>
        ///  震屏曲线
        /// </summary>
        public AnimationCurve curve;
        /// <summary>
        ///  震屏曲线的总时长
        /// </summary>
        public float totalTime;
        /// <summary>
        ///  震屏曲线的当前时间
        /// </summary>
        public float currentTime;
        /// <summary>
        ///  震屏的频率，fps次/帧
        /// </summary>
        public float fps;
        /// <summary>
        ///  震屏曲线的当前帧
        /// </summary>
        public float currentFrame;
        public ShakeData(AnimationCurve curve, float fps)
        {
            this.curve = curve;
            this.fps = fps;
            totalTime = curve[curve.length - 1].time;
        }
    }
    /// <summary>
    /// 要控制的震屏camera
    /// </summary>
    Camera m_camera;
    /// <summary>
    /// 原位置
    /// </summary>
    Vector3 m_oriPosition;
    /// <summary>
    /// 震屏数据列表，计算中叠加
    /// </summary>
    List<ShakeData> m_dataList = new List<ShakeData>();
    void Awake()
    {
        m_camera = Camera.main;
    }
    /// <summary>
    /// 直接震屏
    /// </summary>
    public void AddShakeCurve(AnimationCurve shakeCurve, float fps)
    {
        //曲线的keys长度大于1才有意义
        if (shakeCurve.length > 1)
        {
            if (m_dataList.Count > 0)
            {
                m_camera.transform.localPosition = m_oriPosition;
            }
            else
            {
#if UNITY_EDITOR
                //测试时会出现调用顺序的问题，实际运行中并不会
                if (!m_camera)
                    m_camera = Camera.main;
#endif
                m_oriPosition = m_camera.transform.localPosition;
            }
            //Debug.Log("StartShake+" + m_dataList.Count);
            m_dataList.Add(new ShakeData(shakeCurve, fps));
        }
    }
    void StopShake(int index)
    {
        //Debug.Log("StopShake+" + index);
        m_dataList.RemoveAt(index);
        m_camera.transform.localPosition = m_oriPosition;
    }
    void Update()
    {
        if (m_dataList.Count > 0)
        {
            float maxLevel = 0;//所有曲线中，最大的震动幅度
            for (int i = 0; i < m_dataList.Count; i++)
            {
                ShakeData shakeData = m_dataList[i];
                if (shakeData.currentTime < shakeData.totalTime)
                {
                    shakeData.currentFrame += Time.deltaTime;
                    if (shakeData.currentFrame > 1.0 / shakeData.fps)
                    {
                        shakeData.currentFrame = 0;
                        maxLevel = Mathf.Max(maxLevel, shakeData.curve.Evaluate(shakeData.currentTime));
                        //Debug.Log("time=" + m_curTime + ",value=" + curLevel);
                        if (maxLevel == 0)
                        {
                            m_camera.transform.localPosition = m_oriPosition;
                        }
                        else
                        {
                            float x = maxLevel * Random.Range(-1f, 1f);
                            float y = maxLevel * Random.Range(-1f, 1f);
                            m_camera.transform.localPosition = m_oriPosition + m_camera.transform.right * x + m_camera.transform.up * y;
                        }
                    }
                    shakeData.currentTime += Time.deltaTime;
                }
                else
                {
                    StopShake(i);
                }
            }
        }
    }
}
{% endhighlight %}

#### 震屏的数据类，用于挂在实体物体上，例如每一个攻击特效

{% highlight c %}
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
/// <summary>
/// 震屏数据对象
/// </summary>
public class ShakeCameraData : MonoBehaviour
{
    /// <summary>
    /// 震动幅度
    /// </summary>
    public float shakeLevel = 3f;
    /// <summary>
    /// 震动时间
    /// </summary>
    public float setShakeTime = 0.2f;
    /// <summary>
    /// 延迟多少秒开始震屏
    /// </summary>
    public float m_delayTime = 0f;
    //----------------------------以上是废弃的属性，用于生成曲线----------------------------
    /// <summary>
    /// 要控制的震屏camera
    /// </summary>
    ShakeCamera m_shakeCamera;
    /// <summary>
    ///  震屏曲线
    /// </summary>
    [SerializeField]
    AnimationCurve shakeCurve = null;
    /// <summary>
    ///  震屏的频率，fps次/帧
    /// </summary>
    public float fps = 45f;
    void Awake()
    {
        if (m_shakeCamera == null)
        {
            m_shakeCamera = Camera.main.GetComponent<ShakeCamera>();
        }
    }
    void OnEnable()
    {
        Shake();
    }
    /// <summary>
    /// 直接震屏
    /// </summary>
    public void Shake()
    {
        m_shakeCamera.AddShakeCurve(shakeCurve, fps);
    }
}
{% endhighlight %}

#### 震屏的Inspector

{% highlight c %}
#if UNITY_EDITOR
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
/// <summary>
/// 震屏数据
/// </summary>
[CustomEditor(typeof(ShakeCameraData))]
public class ShakeCameraDataInspector : Editor
{
    static AnimationCurve copyedCurve;
    private void OnEnable()
    {
        AnimationCurve animationCurve = serializedObject.FindProperty("shakeCurve").animationCurveValue;
        if (animationCurve == null || animationCurve.keys.Length == 0)
        {
            GenerateCurve();
        }
    }
    public override void OnInspectorGUI()
    {
        base.OnInspectorGUI();
        if (GUILayout.Button("生成曲线"))
        {
            GenerateCurve();
        }
        if (GUILayout.Button("复制曲线"))
        {
            AnimationCurve animationCurve = serializedObject.FindProperty("shakeCurve").animationCurveValue;
            copyedCurve = animationCurve;
        }
        if (GUILayout.Button("粘贴曲线"))
        {
            serializedObject.FindProperty("shakeCurve").animationCurveValue = copyedCurve;
            serializedObject.ApplyModifiedProperties();
        }
        if (EditorApplication.isPlaying && GUILayout.Button("震屏"))
        {
            (target as ShakeCameraData).Shake();
        }
    }
    void GenerateCurve()
    {
        float shakeLevel = (target as ShakeCameraData).shakeLevel;
        float setShakeTime = (target as ShakeCameraData).setShakeTime;
        float m_delayTime = (target as ShakeCameraData).m_delayTime;
        Keyframe firstFrame = new Keyframe(0f, 0f, 0f, 0f);
        Keyframe lastFrame = new Keyframe(setShakeTime + m_delayTime, shakeLevel, float.PositiveInfinity, float.PositiveInfinity);

        AnimationCurve animationCurve = serializedObject.FindProperty("shakeCurve").animationCurveValue;
        if (m_delayTime == 0)
        {
            firstFrame.value = shakeLevel;
            animationCurve.keys = new Keyframe[] { firstFrame, lastFrame };
        }
        else
        {
            firstFrame.value = 0f;
            Keyframe secondFrame = new Keyframe(m_delayTime, shakeLevel, float.PositiveInfinity, float.PositiveInfinity);
            animationCurve.keys = new Keyframe[] { firstFrame, secondFrame, lastFrame };
        }
        serializedObject.FindProperty("shakeCurve").animationCurveValue = animationCurve;
        serializedObject.ApplyModifiedProperties();
    }
}
#endif
{% endhighlight %}
---
layout: post
title: Unity3D粒子特效加速器
date: 2017-07-05 12:00:24.000000000 +08:00
---
{% highlight c %}
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif
/// <summary>
/// 粒子特效加速器；
/// 目前仅针对刀光类型
/// 目前仅支持加速，不支持减速。
/// </summary>
public class ParticleAccelerator : MonoBehaviour
{
    [Range(1f, 2f)]
    public float speed;
    private Animator[] m_Animators;
    private ParticleSystem[] m_ParticleSystems;
    private ParticleSystem.MinMaxCurve[] m_StartDelayList;
    private ParticleSystem.MinMaxCurve[] m_StartLifetimeList;
    private Vector3[] m_RotationOverLifetimeList;
    public void Awake()
    {
        m_Animators = GetComponentsInChildren<Animator>();
        m_ParticleSystems = GetComponentsInChildren<ParticleSystem>();
        if (m_ParticleSystems != null)
        {
            m_StartDelayList = new ParticleSystem.MinMaxCurve[m_ParticleSystems.Length];
            m_StartLifetimeList = new ParticleSystem.MinMaxCurve[m_ParticleSystems.Length];
            m_RotationOverLifetimeList = new Vector3[m_ParticleSystems.Length];
        }
    }
    public void OnEnable()
    {
        Accelerate();
    }
    private void OnDisable()
    {
        if (m_ParticleSystems != null)
        {
            //animator的speed这里已经是1了。
            for (int i = 0; i < m_ParticleSystems.Length; i++)
            {
                ParticleSystem particle = m_ParticleSystems[i];
                var main = particle.main;
                //设置startDelay
                main.startDelay = m_StartDelayList[i];
                //startLifetime
                main.startLifetime = m_StartLifetimeList[i];                
                var rotationOverLifetimeModule = particle.rotationOverLifetime;
                if (rotationOverLifetimeModule.enabled)
                {
                    if (m_RotationOverLifetimeList[i].x != 0f)
                        rotationOverLifetimeModule.x = m_RotationOverLifetimeList[i].x;
                    if (m_RotationOverLifetimeList[i].y != 0f)
                        rotationOverLifetimeModule.y = m_RotationOverLifetimeList[i].y;
                    if (m_RotationOverLifetimeList[i].z != 0f)
                        rotationOverLifetimeModule.z = m_RotationOverLifetimeList[i].z;
                }
            }
        }
    }
    public void Accelerate()
    {
        foreach (Animator animator in m_Animators)
        {
            animator.speed = speed;
        }
        for (int i = 0; i < m_ParticleSystems.Length; i++)
        {
            ParticleSystem particle = m_ParticleSystems[i];
            var main = particle.main;
            //设置startDelay
            var temp = main.startDelay;
            m_StartDelayList[i] = temp;
            //temp.constant = temp.constant / speed;
            temp.constantMin = temp.constantMin / speed;
            temp.constantMax = temp.constantMax / speed;
            main.startDelay = temp;
            //startLifetime
            temp = main.startLifetime;
            m_StartLifetimeList[i] = temp;
            //temp.constant = temp.constant / speed;
            temp.constantMin = temp.constantMin / speed;
            temp.constantMax = temp.constantMax / speed;
            main.startLifetime = temp;
            var rotationOverLifetimeModule = particle.rotationOverLifetime;
            if (rotationOverLifetimeModule.enabled)
            {
                m_RotationOverLifetimeList[i].x = rotationOverLifetimeModule.x.constant;
                m_RotationOverLifetimeList[i].y = rotationOverLifetimeModule.y.constant;
                m_RotationOverLifetimeList[i].z = rotationOverLifetimeModule.z.constant;
                if (m_RotationOverLifetimeList[i].x != 0f)
                    rotationOverLifetimeModule.x = m_RotationOverLifetimeList[i].x * speed;
                if (m_RotationOverLifetimeList[i].y != 0f)
                    rotationOverLifetimeModule.y = m_RotationOverLifetimeList[i].y * speed;
                if (m_RotationOverLifetimeList[i].z != 0f)
                    rotationOverLifetimeModule.z = m_RotationOverLifetimeList[i].z * speed;
            }
        }
    }
}
#if UNITY_EDITOR
[CustomEditor(typeof(ParticleAccelerator))]
public class ParticleAcceleratorInspector : Editor
{
    public override void OnInspectorGUI()
    {
        base.OnInspectorGUI();
        if (EditorApplication.isPlaying && GUILayout.Button("Play"))
        {
            (target as ParticleAccelerator).gameObject.SetActive(false);
            (target as ParticleAccelerator).gameObject.SetActive(true);
        }
    }
}
#endif
{% endhighlight %}
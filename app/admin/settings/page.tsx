'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface SystemSettings {
  site_name: string
  site_description: string
  admin_email: string
  auto_approval: boolean
  email_notifications: boolean
  maintenance_mode: boolean
  max_applications_per_day: number
  allowed_file_types: string[]
  max_file_size_mb: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'بروفايل - هوية مهنية كاملة',
    site_description: 'هوية مهنية كاملة تجهزك لسوق العمل',
    admin_email: 'admin@profile.jo',
    auto_approval: false,
    email_notifications: true,
    maintenance_mode: false,
    max_applications_per_day: 100,
    allowed_file_types: ['pdf', 'doc', 'docx'],
    max_file_size_mb: 5,
  })
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const saveSettings = async () => {
    setLoading(true)
    setSaveStatus('saving')
    
    try {
      // هنا يمكنك حفظ الإعدادات في قاعدة البيانات
      // مؤقتاً سنحفظها في localStorage
      localStorage.setItem('admin_settings', JSON.stringify(settings))
      
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      setSettings({
        site_name: 'بروفايل - هوية مهنية كاملة',
        site_description: 'هوية مهنية كاملة تجهزك لسوق العمل',
        admin_email: 'admin@profile.jo',
        auto_approval: false,
        email_notifications: true,
        maintenance_mode: false,
        max_applications_per_day: 100,
        allowed_file_types: ['pdf', 'doc', 'docx'],
        max_file_size_mb: 5,
      })
    }
  }

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `settings_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearAllData = async () => {
    const confirmText = 'احذف كل شيء'
    const userInput = prompt(`تحذير: هذا الإجراء سيحذف جميع البيانات نهائياً!\n\nاكتب "${confirmText}" للتأكيد:`)
    
    if (userInput === confirmText) {
      try {
        setLoading(true)
        
        // حذف جميع الطلبات
        const { error } = await supabase
          .from('user_submissions')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // حذف جميع السجلات
        
        if (error) throw error
        
        alert('تم حذف جميع البيانات بنجاح')
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('حدث خطأ أثناء حذف البيانات')
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('admin_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3 space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              الرئيسية
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="mr-1 text-sm font-medium text-gray-500 md:mr-2">الإعدادات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
          <p className="mt-1 text-sm text-gray-600">
            إدارة إعدادات الموقع والنظام
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSettings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <span className="ml-2">📥</span>
            تصدير الإعدادات
          </button>
          <button
            onClick={resetSettings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <span className="ml-2">🔄</span>
            إعادة تعيين
          </button>
          <button
            onClick={saveSettings}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              saveStatus === 'saved' ? 'bg-green-600' : 
              saveStatus === 'error' ? 'bg-red-600' : 
              'bg-blue-600 hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>}
            {saveStatus === 'saved' && <span className="ml-2">✅</span>}
            {saveStatus === 'error' && <span className="ml-2">❌</span>}
            {saveStatus === 'saving' ? 'جاري الحفظ...' : 
             saveStatus === 'saved' ? 'تم الحفظ' :
             saveStatus === 'error' ? 'خطأ في الحفظ' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">الإعدادات العامة</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">اسم الموقع</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">وصف الموقع</label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">بريد المدير الإلكتروني</label>
              <input
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings({...settings, admin_email: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات الطلبات</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">الحد الأقصى للطلبات يومياً</label>
              <input
                type="number"
                value={settings.max_applications_per_day}
                onChange={(e) => setSettings({...settings, max_applications_per_day: parseInt(e.target.value)})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">الحد الأقصى لحجم الملف (ميجابايت)</label>
              <input
                type="number"
                value={settings.max_file_size_mb}
                onChange={(e) => setSettings({...settings, max_file_size_mb: parseInt(e.target.value)})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">أنواع الملفات المسموحة</label>
              <div className="mt-2 space-y-2">
                {['pdf', 'doc', 'docx', 'txt', 'rtf'].map(type => (
                  <label key={type} className="inline-flex items-center ml-6">
                    <input
                      type="checkbox"
                      checked={settings.allowed_file_types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({
                            ...settings,
                            allowed_file_types: [...settings.allowed_file_types, type]
                          })
                        } else {
                          setSettings({
                            ...settings,
                            allowed_file_types: settings.allowed_file_types.filter(t => t !== type)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <span className="mr-2 text-sm text-gray-600">.{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات النظام</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">الموافقة التلقائية</label>
                <p className="text-xs text-gray-500">موافقة تلقائية على جميع الطلبات الجديدة</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_approval}
                onChange={(e) => setSettings({...settings, auto_approval: e.target.checked})}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">إشعارات البريد الإلكتروني</label>
                <p className="text-xs text-gray-500">إرسال إشعارات عند وصول طلبات جديدة</p>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">وضع الصيانة</label>
                <p className="text-xs text-gray-500">منع المستخدمين من تقديم طلبات جديدة</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-lg shadow border-2 border-red-200">
          <h3 className="text-lg font-medium text-red-900 mb-4">المنطقة الخطرة</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-red-700">حذف جميع البيانات</h4>
              <p className="text-xs text-red-600 mb-3">
                سيتم حذف جميع الطلبات والبيانات نهائياً. هذا الإجراء لا يمكن التراجع عنه!
              </p>
              <button
                onClick={clearAllData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
              >
                <span className="ml-2">🗑️</span>
                حذف جميع البيانات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <span className="text-green-400 ml-3">✅</span>
            <div>
              <h3 className="text-sm font-medium text-green-800">تم حفظ الإعدادات بنجاح</h3>
              <p className="text-sm text-green-700">جميع التغييرات تم حفظها وتطبيقها.</p>
            </div>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <span className="text-red-400 ml-3">❌</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">خطأ في حفظ الإعدادات</h3>
              <p className="text-sm text-red-700">حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى.</p>
            </div>
          </div>
        </div>
      )}

      {settings.maintenance_mode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <span className="text-yellow-400 ml-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">وضع الصيانة مُفعل</h3>
              <p className="text-sm text-yellow-700">الموقع حالياً في وضع الصيانة. المستخدمون لا يمكنهم تقديم طلبات جديدة.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
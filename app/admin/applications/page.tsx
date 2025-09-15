'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Application {
  id: string
  full_name: string
  email: string
  phone_number: string
  field_of_study: string
  university: string
  graduation_year: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submission_date: string
  plan_name?: string
  payment_status?: 'pending' | 'completed' | 'failed'
  payment_amount?: number
  created_at: string
  updated_at: string
  notes?: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      
      // تحديث الحالة محلياً
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status } : app
        )
      )
    } catch (error) {
      console.error('Error updating application status:', error)
      alert('حدث خطأ أثناء تحديث حالة الطلب')
    }
  }

  const bulkUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (selectedApplications.length === 0) {
      alert('يرجى اختيار طلبات أولاً')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', selectedApplications)

      if (error) throw error
      
      // تحديث الحالة محلياً
      setApplications(prev => 
        prev.map(app => 
          selectedApplications.includes(app.id) ? { ...app, status } : app
        )
      )
      
      setSelectedApplications([])
    } catch (error) {
      console.error('Error bulk updating applications:', error)
      alert('حدث خطأ أثناء تحديث الطلبات')
    }
  }

  const deleteApplication = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setApplications(prev => prev.filter(app => app.id !== id))
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('حدث خطأ أثناء حذف الطلب')
    }
  }

  const updatePaymentStatus = async (id: string, paymentStatus: 'completed' | 'pending' | 'failed') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      
      // تحديث الحالة محلياً
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, payment_status: paymentStatus } : app
        )
      )
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('حدث خطأ أثناء تحديث حالة الدفع')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesPayment = paymentFilter === 'all' || app.payment_status === paymentFilter
    const matchesSearch = !searchTerm ||
      app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone_number?.includes(searchTerm)
    
    return matchesFilter && matchesPayment && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'submitted': return 'مُرسل'
      case 'approved': return 'مقبول'
      case 'rejected': return 'مرفوض'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل'
      case 'pending': return 'معلق'
      case 'failed': return 'فاشل'
      default: return status
    }
  }

  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setSelectedApplication(null)
    setShowDetailsModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
              <span className="mr-1 text-sm font-medium text-gray-500 md:mr-2">الطلبات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
        <p className="mt-1 text-sm text-gray-600">
          عرض ومراجعة جميع طلبات المستخدمين
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">جميع الطلبات</option>
                <option value="draft">مسودة</option>
                <option value="submitted">مُرسلة</option>
                <option value="approved">مقبولة</option>
                <option value="rejected">مرفوضة</option>
              </select>
              
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">جميع حالات الدفع</option>
                <option value="completed">تم الدفع</option>
                <option value="pending">في الانتظار</option>
                <option value="failed">فشل الدفع</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => bulkUpdateStatus('approved')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                قبول المحدد ({selectedApplications.length})
              </button>
              <button
                onClick={() => bulkUpdateStatus('rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                رفض المحدد ({selectedApplications.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            الطلبات ({filteredApplications.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApplications(filteredApplications.map(app => app.id))
                      } else {
                        setSelectedApplications([])
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المعلومات الشخصية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التعليم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ التقديم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApplications(prev => [...prev, application.id])
                        } else {
                          setSelectedApplications(prev => prev.filter(id => id !== application.id))
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {application.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.full_name || 'غير محدد'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.phone_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{application.university || 'غير محدد'}</div>
                      <div className="text-gray-500">{application.field_of_study || 'غير محدد'}</div>
                      <div className="text-gray-500">تخرج: {application.graduation_year || 'غير محدد'}</div>
                      {application.plan_name && (
                        <div className="text-blue-600 text-xs">الباقة: {application.plan_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                      {application.payment_status && (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(application.payment_status)}`}>
                          {getPaymentStatusText(application.payment_status)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{new Date(application.created_at).toLocaleDateString('ar-SA')}</div>
                      {application.submission_date && (
                        <div className="text-xs text-gray-400">
                          إرسال: {new Date(application.submission_date).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <div className="flex space-x-reverse space-x-2">
                      <button
                        onClick={() => viewApplicationDetails(application)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 border border-blue-300 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        عرض
                      </button>
                      {application.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            className="text-green-600 hover:text-green-900 inline-flex items-center px-2 py-1 border border-green-300 rounded text-xs font-medium hover:bg-green-50 transition-colors"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium hover:bg-red-50 transition-colors"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      {/* Payment Status Buttons */}
                      <div className="flex items-center space-x-reverse space-x-1">
                        {application.payment_status !== 'completed' && (
                          <button
                            onClick={() => updatePaymentStatus(application.id, 'completed')}
                            className="text-green-600 hover:text-green-900 inline-flex items-center px-2 py-1 border border-green-300 rounded text-xs font-medium hover:bg-green-50 transition-colors"
                          >
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            تم الدفع
                          </button>
                        )}
                        {application.payment_status !== 'pending' && (
                          <button
                            onClick={() => updatePaymentStatus(application.id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-900 inline-flex items-center px-2 py-1 border border-yellow-300 rounded text-xs font-medium hover:bg-yellow-50 transition-colors"
                          >
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            في الانتظار
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteApplication(application.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium hover:bg-red-50 transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApplications.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' ? 'لم يتم العثور على طلبات مطابقة' : 'لا توجد طلبات'}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeDetailsModal}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">تفاصيل الطلب</h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mt-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 ml-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    المعلومات الشخصية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.full_name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.email || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.phone_number || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">معرف الطلب</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedApplication.id}</p>
                    </div>
                  </div>
                </div>

                {/* Educational Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 ml-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    المعلومات التعليمية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الجامعة</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.university || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">التخصص</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.field_of_study || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">سنة التخرج</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.graduation_year || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 ml-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    حالة الطلب
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الحالة</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusText(selectedApplication.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">تاريخ الإنشاء</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedApplication.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {selectedApplication.submission_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">تاريخ الإرسال</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedApplication.submission_date).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">آخر تحديث</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedApplication.updated_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {(selectedApplication.plan_name || selectedApplication.payment_status || selectedApplication.payment_amount) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 ml-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      معلومات الدفع والباقة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.plan_name && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">اسم الباقة</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedApplication.plan_name}</p>
                        </div>
                      )}
                      {selectedApplication.payment_status && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">حالة الدفع</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getPaymentStatusColor(selectedApplication.payment_status)}`}>
                            {getPaymentStatusText(selectedApplication.payment_status)}
                          </span>
                        </div>
                      )}
                      {selectedApplication.payment_amount && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">مبلغ الدفع</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedApplication.payment_amount} د.أ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedApplication.notes && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      ملاحظات
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">{selectedApplication.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {selectedApplication.status === 'submitted' && (
                  <>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'approved')
                        closeDetailsModal()
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      قبول الطلب
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'rejected')
                        closeDetailsModal()
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      رفض الطلب
                    </button>
                  </>
                )}
                <button
                  onClick={closeDetailsModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
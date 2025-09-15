'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminUser {
  id: string
  user_id: string
  email: string
  created_at: string
  created_by_email?: string
  is_active: boolean
}

interface AuthUser {
  id: string
  email: string
  created_at: string
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [allUsers, setAllUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAdmins()
    fetchAllUsers()
  }, [])

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          id,
          user_id,
          email,
          created_at,
          is_active
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error('Error fetching admins:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      // جلب المستخدمين من auth.users عبر user_submissions
      const { data: submissions, error } = await supabase
        .from('user_submissions')
        .select('email, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // إزالة المكررة
      const uniqueUsers = submissions?.filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      ) || []

      setAllUsers(uniqueUsers.map(user => ({
        id: user.email,
        email: user.email,
        created_at: user.created_at
      })))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAdmin = async (email: string) => {
    setActionLoading(true)
    try {
      const { data, error } = await supabase.rpc('add_admin', { 
        admin_email: email 
      })

      if (error) throw error
      
      alert(data || 'تم إضافة المدير بنجاح')
      setShowAddModal(false)
      setSelectedUser('')
      fetchAdmins()
    } catch (error) {
      console.error('Error adding admin:', error)
      alert('حدث خطأ أثناء إضافة المدير: ' + (error as any).message)
    } finally {
      setActionLoading(false)
    }
  }

  const removeAdmin = async (email: string) => {
    if (!confirm('هل أنت متأكد من إزالة صلاحيات الإدارة من هذا المستخدم؟')) return

    setActionLoading(true)
    try {
      const { data, error } = await supabase.rpc('remove_admin', { 
        admin_email: email 
      })

      if (error) throw error
      
      alert(data || 'تم إزالة صلاحيات الإدارة بنجاح')
      fetchAdmins()
    } catch (error) {
      console.error('Error removing admin:', error)
      alert('حدث خطأ أثناء إزالة الصلاحيات: ' + (error as any).message)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = allUsers.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !admins.find(admin => admin.email === user.email)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المدراء</h1>
          <p className="mt-1 text-sm text-gray-600">
            إضافة وإزالة صلاحيات الإدارة للمستخدمين المسجلين
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={actionLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <span className="ml-2">➕</span>
          إضافة مدير جديد
        </button>
      </div>

      {/* Current Admins */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            المدراء الحاليون ({admins.length})
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {admins.map((admin) => (
            <li key={admin.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {admin.email?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        مدير منذ: {new Date(admin.created_at).toLocaleDateString('ar-SA')}
                      </div>
                      {admin.created_by_email && (
                        <div className="text-xs text-gray-400">
                          أضافه: {admin.created_by_email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      👑 مدير
                    </span>
                    <button
                      onClick={() => removeAdmin(admin.email)}
                      disabled={actionLoading}
                      className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                    >
                      إزالة الصلاحيات
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {admins.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500">لا يوجد مدراء حالياً</p>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة مدير جديد</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البحث عن مستخدم مسجل بالإيميل
                  </label>
                  <input
                    type="text"
                    placeholder="البحث بالإيميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أو أدخل إيميل مباشرة
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {searchTerm && filteredUsers.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    <div className="p-2 text-sm font-medium text-gray-700 bg-gray-50">
                      المستخدمون المسجلون:
                    </div>
                    {filteredUsers.slice(0, 10).map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user.email)
                          setSearchTerm('')
                        }}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          مسجل منذ: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedUser('')
                    setSearchTerm('')
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    if (selectedUser) {
                      addAdmin(selectedUser)
                    } else {
                      alert('يرجى اختيار مستخدم أو إدخال إيميل')
                    }
                  }}
                  disabled={!selectedUser || actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'جاري الإضافة...' : 'إضافة كمدير'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <span className="text-blue-400 ml-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-medium text-blue-800">النظام الجديد للمدراء:</h3>
            <div className="text-sm text-blue-700 mt-1">
              <p>• الآن النظام يعتمد على المستخدمين المسجلين فقط (auth.users)</p>
              <p>• لا حاجة لملء نموذج التقديم لتصبح مديراً</p>
              <p>• فقط سجل في النظام واطلب من مدير آخر إضافتك</p>
              <p className="mt-2 font-medium">⚠️ تحذير: المدراء يمكنهم الوصول لجميع البيانات والإعدادات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual SQL Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <span className="text-yellow-400 ml-3">💡</span>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">إضافة أول مدير (SQL Editor):</h3>
            <div className="text-sm text-yellow-700 mt-1">
              <p>إذا لم يكن لديك مدراء بعد، استخدم هذا الكود في Supabase SQL Editor:</p>
              <div className="bg-yellow-100 p-2 rounded mt-2 font-mono text-xs">
                <code>
                  INSERT INTO admins (user_id, email)<br/>
                  SELECT id, email FROM auth.users<br/>
                  WHERE email = 'your-email@example.com';
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
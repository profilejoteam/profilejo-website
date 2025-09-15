export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          اختبار الموقع 🧪
        </h1>
        <p className="text-gray-600 mb-4">
          إذا ترى هذه الصفحة، فالموقع يعمل بشكل صحيح!
        </p>
        <div className="bg-green-500 text-white px-4 py-2 rounded">
          ✅ الموقع يعمل!
        </div>
      </div>
    </div>
  )
}
// اختبار سريع لـ ChatGPT API
// يمكنك تشغيله بـ: node test-chatgpt.js

const testChatGPT = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'أنا مهندس حاسوب عندي 3 سنوات خبرة في JavaScript و React',
        context: {}
      }),
    });

    const data = await response.json();
    console.log('✅ نجح الاختبار!');
    console.log('📄 الرد:', data.response.text);
    console.log('🔍 المصدر:', data.source);
    
    if (data.response.suggestion) {
      console.log('💡 الاقتراحات:', data.response.suggestion);
    }
  } catch (error) {
    console.error('❌ فشل الاختبار:', error);
  }
};

// تشغيل الاختبار إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  testChatGPT();
}

module.exports = testChatGPT;
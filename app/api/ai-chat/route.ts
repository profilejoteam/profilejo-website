import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      const response = await generateFallbackResponse(message, context);
      return NextResponse.json({ 
        response,
        success: true,
        source: 'fallback'
      });
    }

    const response = await generateChatGPTResponse(message, context);
    return NextResponse.json({ 
      response,
      success: true,
      source: 'openai'
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ 
      response: {
        text: 'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.',
        suggestion: null
      },
      success: true,
      source: 'error_fallback'
    });
  }
}

async function generateChatGPTResponse(message: string, context: any) {
  const contextAnalysis = analyzeUserContext(context);
  
  const systemPrompt = `أنت خبير موارد بشرية وكوتش مهني عالمي مع خبرة 15+ سنة في السوق الأردني والخليجي. 

🧠 هويتك المهنية:
- متخصص في تطوير البروفايلات والسير الذاتية
- خبير في توجيه المسارات المهنية حسب السوق المحلي
- مستشار معتمد في التطوير المهني والتوظيف
- محلل ذكي لاحتياجات أصحاب العمل الأردنيين

📊 معلومات الحالة الحالية:
- التخصص المحدد: ${contextAnalysis.estimatedField}
- مستوى الخبرة: ${contextAnalysis.experienceLevel}
- نسبة الاكتمال: ${contextAnalysis.completedFields}%
- التركيز الحالي: ${contextAnalysis.currentFocus}

🎯 مهمتك الأساسية:
تقديم نصائح احترافية مخصصة وذكية تهدف إلى:
• زيادة فرص القبول في الوظائف بنسبة 70%+
• تحسين جاذبية البروفايل لأصحاب العمل
• توجيه المستخدم لأفضل الممارسات في مجاله
• اقتراح كلمات مفتاحية تزيد الظهور في محركات البحث

📋 قواعد الرد الاحترافي:
✅ استخدم تحليل عميق وذكي للبيانات المقدمة
✅ قدم نصائح عملية قابلة للتطبيق فوراً
✅ اربط كل نصيحة بمتطلبات السوق الأردني/الخليجي
✅ أعط أمثلة محددة وأرقام ملموسة
✅ اقترح عبارات احترافية جاهزة للاستخدام
✅ حدد الأولوية (🔥 عالي | ⚡ متوسط | 💡 مقترح)
✅ اربط النصائح بالتخصص المحدد

🚫 تجنب:
❌ النصائح العامة غير المخصصة
❌ المعلومات التقنية المعقدة جداً
❌ التكرار والحشو
❌ النصائح غير القابلة للتطبيق

💬 أسلوب التواصل:
- لغة عربية احترافية مع رموز تعبيرية مناسبة
- نبرة ودية وداعمة مع الحفاظ على الاحترافية
- ردود منظمة وسهلة القراءة
- تركيز على النتائج والتحسينات الفورية`;

  const userContextMessage = buildContextualMessage(message, context);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContextMessage }
    ],
    max_tokens: 1500,
    temperature: 0.8,
    presence_penalty: 0.2,
    frequency_penalty: 0.1,
    top_p: 0.9,
  });

  const aiText = completion.choices[0]?.message?.content || 'عذراً، أواجه مشكلة تقنية. دعني أساعدك بطريقة أخرى.';
  
  const smartSuggestion = await extractSmartSuggestions(aiText, context);

  return {
    text: aiText,
    suggestion: smartSuggestion
  };
}

// تحليل ذكي لسياق المستخدم
function analyzeUserContext(context: any) {
  console.log('📊 تحليل بيانات المستخدم:', JSON.stringify(context, null, 2));
  
  const formData = context?.formData || {};
  const currentStep = context?.currentStep || 1;
  
  // تحليل التخصص المحتمل من مصادر متعددة
  let estimatedField = 'غير محدد';
  
  // البحث في التخصص الأساسي
  const major = (formData.major || '').toLowerCase();
  
  // البحث في قسم التعليم (education array) - هنا المشكلة!
  let educationMajor = '';
  console.log('🎓 بيانات التعليم:', formData.education);
  
  if (formData.education && Array.isArray(formData.education) && formData.education.length > 0) {
    educationMajor = (formData.education[0].major || formData.education[0].degree || '').toLowerCase();
    console.log('✅ وجدت تخصص في التعليم:', educationMajor);
  } else if (formData.education && typeof formData.education === 'object') {
    educationMajor = (formData.education.major || formData.education.degree || '').toLowerCase();
    console.log('✅ وجدت تخصص في التعليم (object):', educationMajor);
  }
  
  // البحث في المنصب الوظيفي
  const jobTitle = (formData.jobTitle || '').toLowerCase();
  console.log('💼 المنصب الوظيفي:', jobTitle);
  
  // البحث في المسؤوليات والمهارات
  const responsibilities = (formData.responsibilities || '').toLowerCase();
  const skills = Array.isArray(formData.skills) ? formData.skills.join(' ').toLowerCase() : (formData.skills || '').toLowerCase();
  
  // تحليل متقدم من عدة مصادر
  const allContent = `${major} ${educationMajor} ${jobTitle} ${responsibilities} ${skills}`;
  console.log('🔍 المحتوى المدمج للتحليل:', allContent);
  
  if (allContent.includes('هندس') || allContent.includes('engineer')) {
    if (allContent.includes('حاسوب') || allContent.includes('computer') || allContent.includes('برمجة') || 
        allContent.includes('مطور') || allContent.includes('تطوير') || allContent.includes('software')) {
      estimatedField = 'هندسة البرمجيات وتكنولوجيا المعلومات';
    } else if (allContent.includes('مدني') || allContent.includes('civil') || allContent.includes('إنشاء') || allContent.includes('بناء')) {
      estimatedField = 'الهندسة المدنية والإنشاءات';
    } else if (allContent.includes('كهرباء') || allContent.includes('electrical')) {
      estimatedField = 'الهندسة الكهربائية';
    } else if (allContent.includes('ميكانيك') || allContent.includes('mechanical')) {
      estimatedField = 'الهندسة الميكانيكية';
    } else {
      estimatedField = 'الهندسة العامة';
    }
  } else if (allContent.includes('طب') || allContent.includes('medical') || allContent.includes('طبيب')) {
    estimatedField = 'المجال الطبي والصحي';
  } else if (allContent.includes('إدارة') || allContent.includes('business') || allContent.includes('أعمال') || 
             allContent.includes('مدير') || allContent.includes('manager') || allContent.includes('قيادة')) {
    estimatedField = 'إدارة الأعمال والقيادة';
  } else if (allContent.includes('تسويق') || allContent.includes('marketing') || allContent.includes('مبيعات')) {
    estimatedField = 'التسويق والمبيعات';
  } else if (allContent.includes('محاسبة') || allContent.includes('accounting') || allContent.includes('محاسب')) {
    estimatedField = 'المحاسبة والمالية';
  } else if (allContent.includes('تدريس') || allContent.includes('تعليم') || allContent.includes('معلم') || allContent.includes('أستاذ')) {
    estimatedField = 'التعليم والتدريس';
  } else if (allContent.includes('تصميم') || allContent.includes('design') || allContent.includes('مصمم')) {
    estimatedField = 'التصميم والإبداع';
  }
  
  // إذا لم نجد تخصص، استخدم أول شيء متاح
  if (estimatedField === 'غير محدد') {
    if (educationMajor) {
      estimatedField = educationMajor;
    } else if (major) {
      estimatedField = major;
    } else if (jobTitle) {
      estimatedField = jobTitle;
    }
  }
  
  console.log('🎯 التخصص المحدد:', estimatedField);
  
  // تحليل مستوى الخبرة
  let experienceLevel = 'مبتدئ';
  const userResponsibilities = formData.responsibilities || '';
  const achievements = formData.achievements || '';
  
  if (userResponsibilities.length > 200 || achievements.length > 200) {
    experienceLevel = 'متقدم';
  } else if (userResponsibilities.length > 100 || achievements.length > 100) {
    experienceLevel = 'متوسط';
  }
  
  // حساب نسبة الاكتمال
  const requiredFields = ['fullName', 'email', 'phone', 'jobTitle', 'major', 'university'];
  const completedCount = requiredFields.filter(field => formData[field] && formData[field].toString().trim()).length;
  const completedFields = Math.round((completedCount / requiredFields.length) * 100);
  
  // تحديد التركيز الحالي
  let currentFocus = 'المعلومات الأساسية';
  if (currentStep >= 2) currentFocus = 'التعليم والمؤهلات';
  if (currentStep >= 3) currentFocus = 'الخبرة المهنية';
  if (currentStep >= 4) currentFocus = 'المشاريع والإنجازات';
  if (currentStep >= 5) currentFocus = 'المهارات والقدرات';
  
  return {
    estimatedField,
    experienceLevel,
    completedFields,
    currentFocus,
    formData
  };
}

// بناء رسالة سياقية ذكية ومتقدمة
function buildContextualMessage(message: string, context: any) {
  const analysis = analyzeUserContext(context);
  
  let contextualMessage = `📝 سؤال المستخدم: "${message}"\n\n`;
  
  // إضافة سياق ذكي ومفصل
  contextualMessage += `🔍 تحليل البروفايل الحالي:\n`;
  contextualMessage += `• التخصص المحدد: ${analysis.estimatedField}\n`;
  contextualMessage += `• مستوى الخبرة المقدر: ${analysis.experienceLevel}\n`;
  contextualMessage += `• نسبة اكتمال البروفايل: ${analysis.completedFields}%\n`;
  contextualMessage += `• القسم قيد العمل: ${analysis.currentFocus}\n\n`;
  
  // إضافة بيانات المستخدم الموجودة
  if (analysis.formData) {
    contextualMessage += `📊 البيانات المتوفرة:\n`;
    
    if (analysis.formData.jobTitle) {
      contextualMessage += `• المنصب المطلوب: ${analysis.formData.jobTitle}\n`;
    }
    
    if (analysis.formData.education && Array.isArray(analysis.formData.education) && analysis.formData.education.length > 0) {
      const edu = analysis.formData.education[0];
      if (edu.major) contextualMessage += `• التخصص الدراسي: ${edu.major}\n`;
      if (edu.university) contextualMessage += `• الجامعة: ${edu.university}\n`;
    }
    
    if (analysis.formData.skills) {
      const skillsText = Array.isArray(analysis.formData.skills) ? analysis.formData.skills.join(', ') : analysis.formData.skills;
      contextualMessage += `• المهارات: ${skillsText}\n`;
    }
    
    if (analysis.formData.experience) {
      contextualMessage += `• سنوات الخبرة: ${analysis.formData.experience}\n`;
    }
    
    if (analysis.formData.responsibilities) {
      contextualMessage += `• المسؤوليات: ${analysis.formData.responsibilities.substring(0, 100)}...\n`;
    }
  }
  
  // تحديد نوع المساعدة المطلوبة
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('نصائح') || lowerMessage.includes('اقتراحات')) {
    contextualMessage += `\n🎯 نوع المساعدة المطلوبة: نصائح تحسين البروفايل\n`;
  } else if (lowerMessage.includes('كتابة') || lowerMessage.includes('صياغة')) {
    contextualMessage += `\n✍️ نوع المساعدة المطلوبة: مساعدة في الكتابة والصياغة\n`;
  } else if (lowerMessage.includes('مهارات')) {
    contextualMessage += `\n💪 نوع المساعدة المطلوبة: تطوير وعرض المهارات\n`;
  }
  
  contextualMessage += `\n🎯 المطلوب: تقديم نصائح احترافية مخصصة ومفصلة لتحسين البروفايل وزيادة فرص التوظيف.`;
  
  return contextualMessage;
}

// استخراج اقتراحات ذكية ومتقدمة من رد ChatGPT
async function extractSmartSuggestions(aiResponse: string, context: any) {
  const analysis = analyzeUserContext(context);
  
  // تحليل ذكي متقدم للرد واستخراج اقتراحات عملية
  const suggestions: any = {
    fields: {},
    confidence: 0.85,
    source: 'GPT-4o Enhanced Analysis',
    tips: [],
    keywords: [],
    marketInsights: []
  };
  
  // اقتراحات مخصصة حسب التخصص مع تحليل السوق الأردني
  if (analysis.estimatedField.includes('تكنولوجيا') || analysis.estimatedField.includes('حاسوب') || analysis.estimatedField.includes('برمجة')) {
    suggestions.fields = {
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'],
      responsibilities: 'تطوير تطبيقات ويب متقدمة، كتابة كود نظيف وقابل للصيانة، حل المشكلات التقنية المعقدة، التعاون مع فرق متعددة التخصصات، تحسين أداء التطبيقات'
    };
    suggestions.keywords = ['تطوير البرمجيات', 'هندسة البرمجيات', 'تطبيقات الويب', 'قواعد البيانات', 'البرمجة كائنية التوجه'];
    suggestions.tips = [
      '🔥 أضف portfolio على GitHub مع 5+ مشاريع متنوعة',
      '⚡ اذكر التقنيات الحديثة (React 18, Next.js, TypeScript)',
      '💡 أكد على خبرتك في Agile/Scrum والعمل الجماعي',
      '🎯 اذكر المشكلات التقنية المعقدة التي حللتها'
    ];
    suggestions.marketInsights = [
      'الطلب عالي على مطوري Full-Stack في الأردن',
      'شركات مثل Atypon وJETS تبحث عن مهارات React',
      'AWS وCloud Computing مطلوبة بكثرة'
    ];
  } else if (analysis.estimatedField.includes('هندسة') && analysis.estimatedField.includes('مدني')) {
    suggestions.fields = {
      skills: ['AutoCAD', 'SAP2000', 'ETABS', 'إدارة المشاريع', 'تصميم إنشائي', 'مراقبة الجودة'],
      responsibilities: 'تصميم المباني السكنية والتجارية، إشراف على تنفيذ المشاريع الإنشائية، ضمان مطابقة المعايير الهندسية، إدارة فرق العمل الهندسية'
    };
    suggestions.keywords = ['التصميم الإنشائي', 'إدارة المشاريع', 'هندسة الطرق', 'البناء المستدام'];
    suggestions.tips = [
      '🏗️ اذكر قيمة وحجم المشاريع التي عملت عليها',
      '📋 أضف شهادات PMP أو إدارة المشاريع',
      '🔧 أكد على خبرتك في البرامج الهندسية المتقدمة'
    ];
    suggestions.marketInsights = [
      'نمو قطاع البناء في الأردن يتطلب مهندسين مهرة',
      'مشاريع العقبة الاقتصادية تحتاج خبرات متقدمة'
    ];
  } else if (analysis.estimatedField.includes('إدارة') || analysis.estimatedField.includes('أعمال')) {
    suggestions.fields = {
      skills: ['القيادة الاستراتيجية', 'إدارة الفرق', 'تحليل البيانات', 'التخطيط المالي', 'التسويق الرقمي'],
      responsibilities: 'وضع الاستراتيجيات طويلة المدى، قيادة فرق متعددة الوظائف، تحليل مؤشرات الأداء، تحسين العمليات التشغيلية، تطوير خطط التسويق'
    };
    suggestions.keywords = ['القيادة الاستراتيجية', 'إدارة التغيير', 'تطوير الأعمال', 'التحليل المالي'];
    suggestions.tips = [
      '📈 اذكر نسب النمو المحققة (مثال: زيادة الإيرادات 25%)',
      '👥 أضف حجم الفرق والميزانيات التي أدرتها',
      '🎯 أكد على مشاريع التحول الرقمي التي قدتها'
    ];
  }
  
  // اقتراحات ذكية بناء على مستوى الخبرة
  if (analysis.experienceLevel === 'مبتدئ') {
    suggestions.tips.push('💡 ركز على مشاريع التخرج والتدريبات العملية بتفصيل');
    suggestions.tips.push('📚 أضف certifications حديثة ذات صلة بمجالك');
    suggestions.tips.push('🚀 اكتب عن شغفك للتعلم والنمو المهني');
  } else if (analysis.experienceLevel === 'متوسط') {
    suggestions.tips.push('📊 أكد على الإنجازات المحققة بأرقام ملموسة');
    suggestions.tips.push('🎯 اربط خبراتك بأهداف الشركات في السوق الأردني');
    suggestions.tips.push('⚡ اذكر المشاريع الناجحة وتأثيرها على النتائج');
  } else if (analysis.experienceLevel === 'متقدم') {
    suggestions.tips.push('🏆 أكد على القيادة والإنجازات الاستراتيجية');
    suggestions.tips.push('👨‍💼 اذكر فرق العمل التي قدتها والمشاريع الكبرى');
    suggestions.tips.push('🎓 أضف خبرتك في الإرشاد وتطوير المواهب');
    suggestions.tips.push('🌟 اذكر التكريمات والجوائز المهنية');
  }

  // تحسين مستوى الثقة بناءً على جودة البيانات المتوفرة
  if (analysis.completedFields > 80) {
    suggestions.confidence = 0.95;
  } else if (analysis.completedFields > 60) {
    suggestions.confidence = 0.88;
  } else if (analysis.completedFields > 40) {
    suggestions.confidence = 0.75;
  }

  return suggestions;
}

async function generateFallbackResponse(message: string, context: any) {
  const analysis = analyzeUserContext(context);
  const lowerMessage = message.toLowerCase();

  // Debug لرؤية ما يحدث
  console.log('Debug - Analysis result:', analysis);

  // ردود ذكية بناء على التحليل
  let responseText = '';
  let suggestions: any = null;

  // تحليل نوع السؤال
  if (lowerMessage.includes('نصائح') || lowerMessage.includes('نصيحة') || lowerMessage.includes('اقتراحات')) {
    if (analysis.estimatedField === 'غير محدد') {
      responseText = `💡 **نصائح سريعة لبناء بروفايل قوي:**\n\n🎯 **الخطوة الأولى - حدد تخصصك:**\n• ما مجال دراستك؟ (هندسة، طب، إدارة أعمال...)\n• ما المنصب الذي تريده؟ (مطور، مهندس، محاسب...)\n• ما مهاراتك الأساسية؟\n\n📝 **املأ المعلومات الأساسية:**\n• الاسم الكامل والمعلومات الشخصية\n• التعليم والدرجة العلمية\n• الخبرات العملية (ولو بسيطة)\n\n🚀 **اجعل بروفايلك مميز:**\n• اكتب إنجازاتك بأرقام ملموسة\n• أضف مشاريعك الشخصية أو التطوعية\n• اذكر الدورات والشهادات\n\n💬 **اكتب لي تخصصك وسأعطيك نصائح مخصصة!**`;
    } else {
      responseText = `💡 **نصائح مخصصة لمجال ${analysis.estimatedField}:**\n\n`;
      
      if (analysis.estimatedField.includes('تكنولوجيا') || analysis.estimatedField.includes('برمجة') || analysis.estimatedField.includes('حاسوب')) {
        responseText += `� **للتكنولوجيا والبرمجة:**\n• 🔧 أضف لغات البرمجة التي تجيدها (JavaScript, Python, Java...)\n• 📱 اذكر المشاريع البرمجية والتطبيقات التي طورتها\n• 🌐 أضف روابط GitHub أو Portfolio\n• ⚡ أكد على خبرتك في حل المشكلات التقنية\n• 📊 اذكر قواعد البيانات والتقنيات التي تعرفها`;
      } else if (analysis.estimatedField.includes('هندسة')) {
        responseText += `⚙️ **للهندسة:**\n• 🖥️ اذكر البرامج الهندسية التي تستخدمها (AutoCAD, SolidWorks...)\n• 🏗️ أضف المشاريع الهندسية التي شاركت فيها\n• 📐 أكد على خبرتك في التصميم والتنفيذ\n• 🔬 اذكر التخصص الدقيق (مدني، كهرباء، ميكانيك...)\n• 📜 أضف الشهادات المهنية إن وجدت`;
      } else if (analysis.estimatedField.includes('إدارة') || analysis.estimatedField.includes('أعمال')) {
        responseText += `👔 **للإدارة والأعمال:**\n• 👥 اذكر عدد الموظفين الذين أدرتهم\n• 📈 أضف النتائج المحققة بأرقام ملموسة\n• 🎯 أكد على مهارات القيادة والتطوير\n• 💼 اذكر الإستراتيجيات التي نفذتها\n• 📊 أضف خبرتك في التحليل واتخاذ القرارات`;
      } else if (analysis.estimatedField.includes('طب') || analysis.estimatedField.includes('صحي')) {
        responseText += `🏥 **للمجال الطبي:**\n• 🩺 حدد تخصصك الطبي بدقة\n• 🏥 اذكر المستشفيات أو العيادات التي عملت بها\n• 📚 أضف الدورات الطبية والشهادات\n• 👨‍⚕️ أكد على خبرتك في التشخيص والعلاج\n• 🔬 اذكر الأبحاث الطبية إن وجدت`;
      } else {
        responseText += `✨ **نصائح عامة لمجالك:**\n• 📝 أضف خبراتك العملية بتفاصيل واضحة\n• 🏆 اذكر إنجازاتك بأرقام ملموسة\n• 🎯 أكد على المهارات المميزة لديك\n• 📚 أضف الدورات والتدريبات ذات الصلة\n• 🌟 اكتب عن مشاريعك الناجحة`;
      }
      
      responseText += `\n\n🤔 **أي قسم تحتاج مساعدة أكثر فيه؟**`;
    }
  } else if (lowerMessage.includes('كيف') || lowerMessage.includes('ماذا') || lowerMessage.includes('أين')) {
    if (analysis.estimatedField === 'تكنولوجيا المعلومات') {
      responseText = `أفهم أنك تعمل في مجال ${analysis.estimatedField}! 💻\n\nإليك نصائح مخصصة:\n✅ أضف المشاريع البرمجية التي عملت عليها\n✅ اذكر التقنيات المتقنة (React, Node.js, Python)\n✅ أكد على المشكلات التي حللتها\n\nماذا تريد أن نركز عليه في بروفايلك؟`;
      
      suggestions = {
        fields: { 
          jobTitle: 'مطور برمجيات',
          skills: ['JavaScript', 'React', 'Node.js']
        },
        confidence: 0.85,
        source: 'Smart Analysis'
      };
    } else if (analysis.estimatedField === 'الهندسة') {
      responseText = `رائع! مهندس ${analysis.experienceLevel} 🔧\n\nنصائح لبروفايل هندسي قوي:\n🎯 أضف المشاريع الهندسية التي شاركت فيها\n🎯 اذكر البرامج الهندسية التي تتقنها\n🎯 أكد على الحلول الابتكارية التي قدمتها\n\nما نوع الهندسة التي تتخصص فيها؟`;
    } else {
      responseText = `مرحباً! أراك ${analysis.experienceLevel} في مجالك 👋\n\nدعني أساعدك في:\n📝 صياغة خبراتك بطريقة احترافية\n📈 إبراز إنجازاتك بشكل جذاب\n🎯 تحسين فرص القبول في الوظائف\n\nأخبرني أكثر عن تخصصك!`;
    }
  } else if (lowerMessage.includes('مساعدة') || lowerMessage.includes('أريد') || lowerMessage.includes('بدي')) {
    if (analysis.completedFields < 50) {
      responseText = `أهلاً وسهلاً! 🤗\n\nأرى أنك بدأت بملء البيانات (${analysis.completedFields}% مكتمل)\n\nدعني أساعدك في:\n🔥 تسريع عملية الملء\n💡 اقتراح محتوى مناسب لتخصصك\n⚡ تحسين جودة المعلومات\n\nما الحقل الذي تحتاج مساعدة فيه؟`;
    } else {
      responseText = `ممتاز! ${analysis.completedFields}% مكتمل 🎉\n\nالآن يمكنني مساعدتك في:\n🚀 تحسين صياغة النصوص\n📊 إضافة تفاصيل مهمة\n✨ تنسيق المعلومات بطريقة احترافية\n\nأي قسم تريد أن نحسنه معاً؟`;
    }
  } else if (lowerMessage.includes('تحسين') || lowerMessage.includes('تطوير')) {
    if (analysis.estimatedField === 'غير محدد') {
      responseText = `عظيم! أحب روح التطوير فيك 💪\n\nهنا أهم النصائح لتطوير أي بروفايل مهني:\n\n📝 اكتب منصبك الوظيفي المطلوب بوضوح\n🎯 أضف مهاراتك التقنية والشخصية\n🏆 اذكر إنجازاتك بأرقام ملموسة\n📚 أدرج الدورات والشهادات المكتسبة\n🔗 ربط خبراتك بمتطلبات السوق\n\nما أكثر شيء تريد تطويره في بروفايلك؟`;
    } else {
      responseText = `عظيم! أحب روح التطوير فيك 💪\n\nبناء على تخصصك في ${analysis.estimatedField}:\n\n📚 اقترح عليك إضافة دورات تدريبية حديثة\n🏆 إبراز الإنجازات بأرقام ملموسة\n🔗 ربط خبراتك بمتطلبات السوق المحلي\n\nما أكثر شيء تريد تطويره في بروفايلك؟`;
    }
  } else {
    // رد عام ذكي
    if (analysis.estimatedField === 'غير محدد') {
      responseText = `أهلاً بك! 😊\n\nأرى أنك بدأت في بناء بروفايلك المهني!\n\nدعني أساعدك في:\n💼 تحديد مجال تخصصك\n📝 كتابة معلومات احترافية\n🎯 إبراز نقاط القوة\n🚀 تحسين فرص القبول في الوظائف\n\nأخبرني عن مجال عملك أو دراستك!`;
    } else {
      responseText = `أهلاً بك! 😊\n\nتخصصك في ${analysis.estimatedField} مجال رائع!\nمستوى خبرتك: ${analysis.experienceLevel}\nالتركيز الحالي: ${analysis.currentFocus}\n\nكيف يمكنني مساعدتك اليوم؟\n💼 تحسين المحتوى الموجود؟\n📝 كتابة أقسام جديدة؟\n🎯 نصائح للسوق المحلي؟`;
    }
  }

  return {
    text: responseText,
    suggestion: suggestions
  };
}

'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Bot, MessageCircle, X, Send, User, Lightbulb, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'analysis' | 'quick';
}

interface FormSuggestion {
  fields: Record<string, any>;
  confidence: number;
  source: string;
}

interface SmartAssistantBotProps {
  formData?: Record<string, any>;
  onFormDataUpdate?: (data: Record<string, any>) => void;
  currentStep?: number;
  isVisible?: boolean;
}

const SmartAssistantBot: React.FC<SmartAssistantBotProps> = ({
  formData = {},
  onFormDataUpdate,
  currentStep = 1,
  isVisible = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [userIdleTime, setUserIdleTime] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [currentFocusedField, setCurrentFocusedField] = useState<string>('');
  const [fieldHistory, setFieldHistory] = useState<Record<string, any>>({});
  const [lastNotificationField, setLastNotificationField] = useState<string>('');
  const [lastCompletedCount, setLastCompletedCount] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [dataQualityScore, setDataQualityScore] = useState(0);
  const [notificationCooldown, setNotificationCooldown] = useState<Record<string, number>>({});
  const [userInteractionScore, setUserInteractionScore] = useState(0);
  const [intelligentNotificationQueue, setIntelligentNotificationQueue] = useState<any[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>({});
  const [conversationContext, setConversationContext] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // تحميل سجل المحادثات من localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('smartbot_conversation_history');
    const savedPreferences = localStorage.getItem('smartbot_user_preferences');
    const savedContext = localStorage.getItem('smartbot_conversation_context');
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setConversationHistory(history.slice(-20)); // آخر 20 رسالة فقط
      } catch (e) {
        console.log('Error loading conversation history');
      }
    }
    
    if (savedPreferences) {
      try {
        setUserPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.log('Error loading user preferences');
      }
    }
    
    if (savedContext) {
      try {
        setConversationContext(JSON.parse(savedContext));
      } catch (e) {
        console.log('Error loading conversation context');
      }
    }
  }, []);

  // حفظ سجل المحادثات
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('smartbot_conversation_history', JSON.stringify(messages));
      
      // تحديث سياق المحادثة
      const newContext = {
        lastInteraction: Date.now(),
        messageCount: messages.length,
        topics: extractTopicsFromMessages(messages),
        userInterests: analyzeUserInterests(messages)
      };
      
      setConversationContext(newContext);
      localStorage.setItem('smartbot_conversation_context', JSON.stringify(newContext));
    }
  }, [messages]);

  // استخراج المواضيع من الرسائل
  const extractTopicsFromMessages = (msgs: Message[]) => {
    const topics = new Set<string>();
    msgs.forEach(msg => {
      if (msg.sender === 'user') {
        const content = msg.content.toLowerCase();
        if (content.includes('مهارات') || content.includes('skills')) topics.add('skills');
        if (content.includes('خبرة') || content.includes('experience')) topics.add('experience');
        if (content.includes('تعليم') || content.includes('education')) topics.add('education');
        if (content.includes('وظيفة') || content.includes('job')) topics.add('career');
        if (content.includes('راتب') || content.includes('salary')) topics.add('salary');
        if (content.includes('شركة') || content.includes('company')) topics.add('companies');
      }
    });
    return Array.from(topics);
  };

  // تحليل اهتمامات المستخدم
  const analyzeUserInterests = (msgs: Message[]) => {
    const interests: any = {
      technicalLevel: 'beginner',
      careerFocus: 'general',
      communicationStyle: 'formal'
    };
    
    const userMessages = msgs.filter(msg => msg.sender === 'user');
    const totalLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0);
    
    if (totalLength > 500) interests.communicationStyle = 'detailed';
    if (userMessages.some(msg => msg.content.includes('تقني') || msg.content.includes('برمجة'))) {
      interests.technicalLevel = 'advanced';
      interests.careerFocus = 'technical';
    }
    
    return interests;
  };

  // تحديث تفضيلات المستخدم بناء على التفاعل
  const updateUserPreferences = (newData: any) => {
    const updatedPreferences = { ...userPreferences, ...newData, lastUpdate: Date.now() };
    setUserPreferences(updatedPreferences);
    localStorage.setItem('smartbot_user_preferences', JSON.stringify(updatedPreferences));
  };

  // ردود سريعة لإظهار الفهم الفوري
  const getQuickResponse = (userInput: string): string | null => {
    const input = userInput.toLowerCase();
    
    if (input.includes('شكرا') || input.includes('شكراً')) {
      return '😊 العفو! أحب مساعدتك!';
    }
    
    if (input.includes('مساعدة') || input.includes('ساعدني')) {
      return '🤝 بالطبع! أنا هنا لأساعدك';
    }
    
    if (input.includes('تحسين') || input.includes('طور')) {
      return '🚀 ممتاز! أحب روح التطوير!';
    }
    
    if (input.includes('وظيفة') || input.includes('عمل')) {
      return '💼 أكيد! العمل موضوع مهم';
    }
    
    if (input.includes('راتب') || input.includes('أجر')) {
      return '💰 فهمت! موضوع الراتب حساس';
    }
    
    if (input.includes('هندسة') || input.includes('مهندس')) {
      return '⚙️ رائع! الهندسة مجال واسع';
    }
    
    if (input.includes('برمجة') || input.includes('مطور')) {
      return '💻 عظيم! البرمجة مستقبل واعد';
    }
    
    if (input.length > 100) {
      return '📝 أقدر التفاصيل! دعني أقرأ بعناية...';
    }
    
    if (input.includes('؟')) {
      return '🤔 سؤال جيد! دعني أفكر...';
    }
    
    return null;
  };

  // دوال مساعدة للتصميم التفاعلي
  const getMessageStyle = (messageType: string | undefined): string => {
    switch (messageType) {
      case 'quick':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200';
      case 'analysis':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200';
      case 'suggestion':
        return 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200';
    }
  };

  const getBotIconColor = (messageType: string | undefined): string => {
    switch (messageType) {
      case 'quick':
        return 'text-blue-600';
      case 'analysis':
        return 'text-purple-600';
      case 'suggestion':
        return 'text-green-600';
      default:
        return 'text-purple-600';
    }
  };

  const getBotTitle = (messageType: string | undefined): string => {
    switch (messageType) {
      case 'quick':
        return 'رد سريع';
      case 'analysis':
        return 'تحليل ذكي';
      case 'suggestion':
        return 'اقتراحات';
      default:
        return 'المساعد الذكي';
    }
  };

  // نظام ذكاء اصطناعي لتحليل البيانات والاقتراحات المخصصة
  const performIntelligentAnalysis = () => {
    if (!formData || Object.keys(formData).length === 0) return null;

    const analysis: any = {
      profileStrength: 0,
      missingCritical: [],
      suggestions: [],
      careerPath: 'غير محدد',
      marketAlignment: 0,
      improvements: []
    };

    // تحليل قوة البروفايل
    const criticalFields = ['fullName', 'email', 'phone', 'jobTitle', 'major', 'university'];
    const secondaryFields = ['responsibilities', 'achievements', 'skills', 'languages'];
    
    const criticalCount = criticalFields.filter(field => 
      formData[field] && formData[field].toString().trim().length > 0
    ).length;
    
    const secondaryCount = secondaryFields.filter(field => 
      formData[field] && formData[field].toString().trim().length > 0
    ).length;

    analysis.profileStrength = Math.round(((criticalCount * 2 + secondaryCount) / (criticalFields.length * 2 + secondaryFields.length)) * 100);

    // تحديد المسار المهني المحتمل
    const major = formData.major?.toLowerCase() || '';
    const jobTitle = formData.jobTitle?.toLowerCase() || '';
    
    if (major.includes('هندس') || jobTitle.includes('مهندس')) {
      if (major.includes('حاسوب') || major.includes('برمجة') || jobTitle.includes('مطور')) {
        analysis.careerPath = 'هندسة البرمجيات وتكنولوجيا المعلومات';
        analysis.suggestions.push('أضف مشاريع برمجية ومهارات تقنية محددة');
        analysis.suggestions.push('اذكر اللغات البرمجية والإطارات التي تجيدها');
        analysis.suggestions.push('أكد على خبرتك في حل المشكلات التقنية');
      } else if (major.includes('مدني') || major.includes('إنشاء')) {
        analysis.careerPath = 'الهندسة المدنية والإنشاءات';
        analysis.suggestions.push('أكد على المشاريع الهندسية التي شاركت فيها');
        analysis.suggestions.push('اذكر البرامج الهندسية مثل AutoCAD, Revit');
        analysis.suggestions.push('أضف خبرات في الإشراف والتصميم');
      } else {
        analysis.careerPath = 'الهندسة العامة';
        analysis.suggestions.push('حدد تخصصك الهندسي بوضوح أكثر');
        analysis.suggestions.push('أضف الأدوات والبرامج التي تستخدمها');
      }
    } else if (major.includes('طب') || jobTitle.includes('طبيب')) {
      analysis.careerPath = 'المجال الطبي والصحي';
      analysis.suggestions.push('أضف التخصص الطبي والخبرات السريرية');
      analysis.suggestions.push('اذكر الشهادات الطبية المعتمدة');
    } else if (major.includes('إدارة') || major.includes('أعمال') || jobTitle.includes('مدير')) {
      analysis.careerPath = 'إدارة الأعمال والقيادة';
      analysis.suggestions.push('أكد على الإنجازات الإدارية والقيادية');
      analysis.suggestions.push('اذكر النتائج المحققة بأرقام ملموسة');
      analysis.suggestions.push('أضف خبرات في إدارة الفرق والمشاريع');
    } else if (major.includes('تسويق') || jobTitle.includes('تسويق')) {
      analysis.careerPath = 'التسويق والمبيعات';
      analysis.suggestions.push('أضف حملات تسويقية نجحت في إدارتها');
      analysis.suggestions.push('اذكر أرقام المبيعات والنمو المحقق');
    } else if (major.includes('محاسبة') || jobTitle.includes('محاسب')) {
      analysis.careerPath = 'المحاسبة والمالية';
      analysis.suggestions.push('أضف خبرتك في البرامج المحاسبية');
      analysis.suggestions.push('اذكر الشهادات المهنية مثل CPA أو CMA');
    } else {
      // نصائح عامة عندما لا نستطيع تحديد التخصص
      analysis.careerPath = 'متنوع';
      analysis.suggestions.push('حدد مجال تخصصك بوضوح في قسم "المنصب الحالي"');
      analysis.suggestions.push('أضف مهاراتك الأساسية والتقنية');
      analysis.suggestions.push('اذكر إنجازاتك المهنية بتفاصيل أكثر');
      analysis.suggestions.push('أكد على خبراتك العملية والعلمية');
      analysis.suggestions.push('أضف الدورات التدريبية والشهادات الحاصل عليها');
    }

    // تحليل التوافق مع السوق المحلي
    const universityName = formData.university?.toLowerCase() || '';
    const jordanianUnis = ['أردنية', 'علوم تكنولوجيا', 'يرموك', 'مؤتة', 'هاشمية'];
    const isLocalUni = jordanianUnis.some(uni => universityName.includes(uni));
    
    analysis.marketAlignment = isLocalUni ? 85 : 70;
    if (isLocalUni) {
      analysis.improvements.push('ممتاز! تعليمك من جامعة محلية معترف بها');
    }

    // تحليل جودة المحتوى
    const responsibilities = formData.responsibilities || '';
    const achievements = formData.achievements || '';
    
    if (responsibilities.length < 100) {
      analysis.improvements.push('وسع في وصف مسؤولياتك (الحالي: ' + responsibilities.length + ' حرف)');
    }
    
    if (achievements.length < 100) {
      analysis.improvements.push('أضف المزيد من الإنجازات الملموسة');
    }

    // تحديد الحقول الناقصة الحرجة
    criticalFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim().length === 0) {
        analysis.missingCritical.push(field);
      }
    });

    return analysis;
  };

  // حساب نقاط جودة البيانات
  useEffect(() => {
    const analysis = performIntelligentAnalysis();
    if (analysis) {
      setAiInsights(analysis);
      setDataQualityScore(analysis.profileStrength);
    }
  }, [formData]);

  // نظام إشعارات ذكي مع تقليل الإزعاج
  const shouldShowNotification = (type: string, priority: number = 1): boolean => {
    const now = Date.now();
    const lastShown = notificationCooldown[type] || 0;
    const cooldownPeriod = priority === 3 ? 15000 : priority === 2 ? 30000 : 60000; // فترات توقف ذكية
    
    // إذا كان البوت مفتوح، لا نظهر إشعارات
    if (isOpen) return false;
    
    // إذا كان هناك إشعار مُظهر حالياً، انتظر
    if (showNotification) return false;
    
    // فحص فترة التوقف
    if (now - lastShown < cooldownPeriod) return false;
    
    // تقييم نشاط المستخدم (أكثر نشاط = إشعارات أقل)
    if (userInteractionScore > 10 && priority < 2) return false;
    
    return true;
  };

  const showSmartNotification = (text: string, type: string = 'general', priority: number = 1) => {
    if (!shouldShowNotification(type, priority)) return;
    
    setNotificationCooldown(prev => ({
      ...prev,
      [type]: Date.now()
    }));
    
    setNotificationText(text);
    setShowNotification(true);
    
    // إخفاء تلقائي بناء على الأولوية
    const hideDelay = priority === 3 ? 8000 : priority === 2 ? 6000 : 4000;
    setTimeout(() => setShowNotification(false), hideDelay);
  };

  // تحديث نقاط التفاعل
  useEffect(() => {
    const handleUserActivity = () => {
      setUserInteractionScore(prev => Math.min(prev + 1, 20));
      setLastActivity(Date.now());
    };

    const events = ['click', 'keydown', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // تقليل النقاط تدريجياً
    const scoreDecay = setInterval(() => {
      setUserInteractionScore(prev => Math.max(prev - 1, 0));
    }, 30000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(scoreDecay);
    };
  }, []);

  // نظام ذكي للإشعارات المجدولة
  useEffect(() => {
    if (!isOpen && Object.keys(formData).length > 0 && aiInsights) {
      const scheduleIntelligentNotifications = () => {
        const notifications = [];
        
        // إشعارات عالية الأولوية (حقول مهمة ناقصة)
        if (aiInsights.missingCritical.length > 0) {
          notifications.push({
            text: `⚠️ ${aiInsights.missingCritical.length} حقول مهمة ناقصة لإكمال بروفايلك!`,
            type: 'critical_missing',
            priority: 3,
            delay: 20000
          });
        }
        
        // إشعارات متوسطة الأولوية (تحسينات)
        if (dataQualityScore < 70 && dataQualityScore > 30) {
          notifications.push({
            text: `📈 بروفايلك ${dataQualityScore}% مكتمل. دعني أساعدك في الوصول لـ90%+!`,
            type: 'improvement_suggestion',
            priority: 2,
            delay: 45000
          });
        }
        
        // إشعارات منخفضة الأولوية (نصائح عامة)
        if (userInteractionScore < 5) {
          notifications.push({
            text: `💡 نصيحة: مجالك في ${aiInsights.careerPath} يتطلب مهارات محددة!`,
            type: 'career_tip',
            priority: 1,
            delay: 90000
          });
        }
        
        setIntelligentNotificationQueue(notifications);
      };

      const timer = setTimeout(scheduleIntelligentNotifications, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, formData, aiInsights, dataQualityScore, userInteractionScore]);

  // معالج طابور الإشعارات الذكية
  useEffect(() => {
    if (intelligentNotificationQueue.length > 0) {
      const nextNotification = intelligentNotificationQueue[0];
      
      const timer = setTimeout(() => {
        showSmartNotification(
          nextNotification.text,
          nextNotification.type,
          nextNotification.priority
        );
        
        setIntelligentNotificationQueue(prev => prev.slice(1));
      }, nextNotification.delay);

      return () => clearTimeout(timer);
    }
  }, [intelligentNotificationQueue]);

  // حساب نقاط جودة البيانات

  // قاموس الحقول مع النصائح الذكية المحسنة
  const fieldAdvice = {
    fullName: {
      tips: [
        "✨ اكتب اسمك كاملاً كما يظهر في الهوية الشخصية",
        "💡 تجنب الألقاب مثل 'م.' أو 'د.' هنا",
        "🎯 مثال: أحمد محمد علي الأردني"
      ],
      emptyWarning: "📝 اسمك الكامل مهم جداً لبناء هويتك المهنية!",
      focusHelp: "🤝 أساعدك في كتابة اسمك بالطريقة الأنسب للسوق!"
    },
    email: {
      tips: [
        "📧 استخدم بريد إلكتروني مهني",
        "⚠️ تجنب الأرقام العشوائية والرموز الغريبة",
        "💼 مثال: ahmed.mohammed@gmail.com"
      ],
      emptyWarning: "📬 البريد الإلكتروني ضروري للتواصل مع أصحاب العمل!",
      focusHelp: "💌 أنصحك بأفضل طرق كتابة البريد المهني!"
    },
    phone: {
      tips: [
        "📱 ابدأ برقم الدولة +962",
        "✅ تأكد من صحة الرقم",
        "🇯🇴 مثال: +962791234567"
      ],
      emptyWarning: "☎️ رقم الهاتف مهم للتواصل السريع!",
      focusHelp: "📞 أساعدك في تنسيق رقم الهاتف بالشكل الصحيح!"
    },
    linkedinUrl: {
      tips: [
        "🔗 ضع رابط LinkedIn الكامل",
        "✨ تأكد من أن البروفايل محدث",
        "💼 مثال: https://linkedin.com/in/your-name"
      ],
      emptyWarning: "🌐 LinkedIn أصبح ضرورياً في السوق المهني!",
      focusHelp: "🚀 أعلمك كيف تحسن بروفايل LinkedIn ليجذب الشركات!"
    },
    jobTitle: {
      tips: [
        "🎯 اختر مسمى وظيفي واضح ومحدد",
        "⭐ استخدم مصطلحات معروفة في السوق",
        "💼 مثال: مطور برمجيات، مهندس شبكات"
      ],
      emptyWarning: "🎖️ المسمى الوظيفي يحدد مسارك المهني!",
      focusHelp: "🎪 أساعدك تختار المسمى المثالي لتخصصك!"
    },
    major: {
      tips: [
        "🎓 اكتب التخصص الدقيق كما هو في الشهادة",
        "📚 تجنب الاختصارات غير المفهومة",
        "🏫 مثال: هندسة الحاسوب، إدارة الأعمال"
      ],
      emptyWarning: "📖 تخصصك الأكاديمي يبني مصداقيتك!",
      focusHelp: "🎯 أساعدك تصيغ تخصصك بطريقة جذابة!"
    },
    university: {
      tips: [
        "🏛️ اذكر اسم الجامعة كاملاً",
        "🇯🇴 الجامعات الأردنية لها سمعة ممتازة",
        "⭐ لا تنس ذكر الكلية"
      ],
      emptyWarning: "🎓 الجامعة تضيف وزناً لمؤهلاتك!",
      focusHelp: "🏆 أعرف كيف تبرز مكانة جامعتك!"
    },
    responsibilities: {
      tips: [
        "📋 اكتب مهامك بصيغة الفعل الماضي",
        "📊 اذكر الأرقام والنتائج المحققة",
        "⚡ ابدأ بأهم المهام"
      ],
      emptyWarning: "💼 المسؤوليات تُظهر خبرتك العملية!",
      focusHelp: "✨ أساعدك تكتب مسؤوليات تُبهر أصحاب العمل!"
    },
    achievements: {
      tips: [
        "🏆 اذكر إنجازات قابلة للقياس",
        "📈 استخدم النسب والأرقام",
        "⭐ ركز على التأثير الإيجابي"
      ],
      emptyWarning: "🎖️ الإنجازات تميزك عن باقي المتقدمين!",
      focusHelp: "🚀 أعلمك كيف تحول أعمالك العادية لإنجازات مذهلة!"
    }
  };

  // نظام الإشعارات الذكية
  useEffect(() => {
    if (!isOpen && !hasShownWelcome) {
      // إشعار ترحيبي بعد 3 ثواني
      setTimeout(() => {
        setNotificationText('💡 هل تحتاج مساعدة في ملء بيانات بروفايلك؟');
        setShowNotification(true);
        setHasShownWelcome(true);
        
        // إخفاء الإشعار بعد 5 ثوان
        setTimeout(() => setShowNotification(false), 5000);
      }, 3000);
    }
  }, [isOpen, hasShownWelcome]);

  // إشعارات محفزة تتغير بالوقت
  useEffect(() => {
    if (!isOpen && hasShownWelcome) {
      const motivationalMessages = [
        '🚀 أضاعف فرص قبولك في الوظائف بنسبة 70%!',
        '⭐ أكتب لك وصف احترافي يجذب أصحاب العمل!',
        '🎯 أساعدك تبرز مهاراتك بطريقة مميزة!',
        '💼 أحسن بروفايلك ليكون الأفضل بين المتقدمين!',
        '🔥 دقيقة واحدة معي = ساعات من العمل!',
        '✨ خبرة 10 سنوات في كتابة السير الذاتية!'
      ];

      const intervals = [15000, 30000, 45000, 60000, 90000, 120000]; // تزيد المدة تدريجياً
      
      motivationalMessages.forEach((message, index) => {
        setTimeout(() => {
          if (!isOpen && !showNotification) {
            setNotificationText(message);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 4000);
          }
        }, intervals[index]);
      });
    }
  }, [hasShownWelcome, isOpen, showNotification]);

  // مراقبة الحقول المحددة والتفاعل معها
  useEffect(() => {
    const handleFieldFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const fieldName = target.getAttribute('name') || target.getAttribute('id') || '';
      
      if (fieldName && fieldAdvice[fieldName as keyof typeof fieldAdvice]) {
        setCurrentFocusedField(fieldName);
        
        // إشعار فوري عند التركيز على حقل جديد
        if (!isOpen && fieldName !== lastNotificationField) {
          const advice = fieldAdvice[fieldName as keyof typeof fieldAdvice];
          setNotificationText(advice.focusHelp);
          setShowNotification(true);
          setLastNotificationField(fieldName);
          setTimeout(() => setShowNotification(false), 6000);
        }
      }
    };

    const handleFieldBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const fieldName = target.getAttribute('name') || target.getAttribute('id') || '';
      const fieldValue = (target as HTMLInputElement).value;
      
      if (fieldName) {
        // حفظ تاريخ التعديل
        setFieldHistory(prev => ({
          ...prev,
          [fieldName]: {
            value: fieldValue,
            lastModified: Date.now(),
            isEmpty: !fieldValue.trim()
          }
        }));
        
        setCurrentFocusedField('');
      }
    };

    // إضافة مستمعي الأحداث
    document.addEventListener('focusin', handleFieldFocus);
    document.addEventListener('focusout', handleFieldBlur);

    return () => {
      document.removeEventListener('focusin', handleFieldFocus);
      document.removeEventListener('focusout', handleFieldBlur);
    };
  }, [isOpen, lastNotificationField]);

  // مراقبة الحقول النشطة وتقديم مساعدة ذكية (محسنة)
  useEffect(() => {
    if (currentFocusedField) {
      const timer = setTimeout(() => {
        if (currentFocusedField in fieldAdvice) {
          const advice = fieldAdvice[currentFocusedField as keyof typeof fieldAdvice];
          showSmartNotification(
            `💡 ${advice.focusHelp}`,
            `field_help_${currentFocusedField}`,
            2
          );
        }
      }, 25000); // 25 ثانية بدلاً من 20

      return () => clearTimeout(timer);
    }
  }, [currentFocusedField]);

  // إشعارات بناء على الحقول الفارغة (محسنة)
  useEffect(() => {
    if (!isOpen && Object.keys(formData).length > 0) {
      const emptyFields: string[] = [];
      const priorityFields = ['fullName', 'email', 'phone', 'jobTitle'];
      
      priorityFields.forEach(field => {
        if (!formData[field] || !formData[field].toString().trim()) {
          emptyFields.push(field);
        }
      });

      if (emptyFields.length > 0) {
        const randomField = emptyFields[Math.floor(Math.random() * emptyFields.length)];
        const advice = fieldAdvice[randomField as keyof typeof fieldAdvice];
        
        if (advice) {
          setTimeout(() => {
            showSmartNotification(
              advice.emptyWarning,
              `empty_field_${randomField}`,
              emptyFields.length > 2 ? 3 : 2
            );
          }, 15000);
        }
      }
    }
  }, [formData, isOpen]);

  // إشعارات بناء على الخطوة الحالية (محسنة)
  useEffect(() => {
    if (!isOpen && currentStep > 1) {
      const stepMessages = {
        2: '📚 تحتاج مساعدة في قسم التعليم؟',
        3: '💼 هل تريد نصائح لكتابة الخبرات العملية؟',
        4: '🚀 دعني أساعدك في وصف مشاريعك!',
        5: '⚡ أقترح عليك مهارات مناسبة لتخصصك!',
        6: '🌍 هل تحتاج مساعدة في أقسام اللغات والشهادات؟',
        7: '🎯 دعني أساعدك في تحديد تفضيلات العمل!'
      };

      const stepMessage = stepMessages[currentStep as keyof typeof stepMessages];
      if (stepMessage) {
        setTimeout(() => {
          showSmartNotification(stepMessage, `step_help_${currentStep}`, 1);
        }, 8000);
      }
    }
  }, [currentStep, isOpen]);

  // رسالة الترحيب الذكية مع التحليل والذاكرة
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeText = '';
      
      // تحديد نوع الترحيب بناء على السجل السابق
      const isReturningUser = conversationHistory.length > 0;
      const hasRecentInteraction = conversationContext.lastInteraction && 
        (Date.now() - conversationContext.lastInteraction) < 24 * 60 * 60 * 1000; // آخر 24 ساعة

      if (isReturningUser && hasRecentInteraction) {
        welcomeText = `أهلاً بعودتك! 🎉 \n\nأتذكر محادثتنا السابقة حول ${conversationContext.topics?.join(' و ') || 'تطوير بروفايلك'}!\n\n`;
        
        if (userPreferences.careerFocus === 'technical') {
          welcomeText += `🔧 أرى أنك مهتم بالمجال التقني. `;
        }
        
        welcomeText += `دعني أكمل مساعدتك:\n\n`;
      } else {
        welcomeText = `مرحباً! 👋 أنا مساعدك الذكي المطور! \n\n`;
      }

      // عرض التحليل الذكي
      if (aiInsights) {
        welcomeText += `📊 تحليل بروفايلك الحالي:\n`;
        welcomeText += `• قوة البروفايل: ${dataQualityScore}%\n`;
        welcomeText += `• مسارك المهني: ${aiInsights.careerPath}\n`;
        welcomeText += `• توافق مع السوق الأردني: ${aiInsights.marketAlignment}%\n\n`;

        if (dataQualityScore < 50) {
          welcomeText += `� دعني أساعدك في بناء بروفايل قوي:\n`;
        } else if (dataQualityScore < 80) {
          welcomeText += `⚡ بروفايلك جيد، دعني أحسنه أكثر:\n`;
        } else {
          welcomeText += `🏆 بروفايل ممتاز! دعني أضيف لمسات نهائية:\n`;
        }

        // أهم اقتراحات مخصصة
        const topSuggestions = aiInsights.suggestions.slice(0, 2);
        topSuggestions.forEach((suggestion: string, index: number) => {
          welcomeText += `${index + 1}. ${suggestion}\n`;
        });

        if (aiInsights.missingCritical.length > 0) {
          welcomeText += `\n⚠️ حقول مهمة ناقصة: ${aiInsights.missingCritical.length}`;
        }
      } else {
        welcomeText += `يمكنني مساعدتك في:\n🎯 صياغة احترافية للمعلومات\n✨ اقتراحات مخصصة لتخصصك\n🚀 تحسين فرص القبول`;
      }

      // رسالة مخصصة بناء على السياق
      if (currentFocusedField && fieldAdvice[currentFocusedField as keyof typeof fieldAdvice]) {
        const advice = fieldAdvice[currentFocusedField as keyof typeof fieldAdvice];
        welcomeText += `\n\n🎯 أراك تركز على "${currentFocusedField}"!\n${advice.focusHelp}`;
      } else if (isReturningUser) {
        welcomeText += `\n\nمن أين نكمل؟ 💼`;
      } else {
        welcomeText += `\n\nأخبرني عن مجالك وسأساعدك! 💼`;
      }

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: welcomeText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'analysis'
      };
      setMessages([welcomeMessage]);
      
      // تحديث تفضيلات المستخدم
      if (aiInsights?.careerPath && aiInsights.careerPath !== 'غير محدد') {
        updateUserPreferences({ careerFocus: aiInsights.careerPath });
      }
    }
  }, [isOpen, messages.length, currentFocusedField, aiInsights, dataQualityScore, conversationHistory, conversationContext, userPreferences]);

  // التمرير التلقائي
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // إعداد سياق محسن للـ AI
      const enhancedContext = {
        formData,
        currentStep,
        conversationHistory: conversationHistory.slice(-5), // آخر 5 رسائل
        userPreferences,
        aiInsights,
        dataQualityScore,
        topics: conversationContext.topics || [],
        userInterests: conversationContext.userInterests || {}
      };

      // استدعاء API للذكاء الاصطناعي
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          context: enhancedContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.response;

      // محاكاة كتابة طبيعية مع رسائل متدرجة
      const simulateNaturalTyping = async () => {
        setIsTyping(false);
        
        // رسالة فورية قصيرة لإظهار الفهم
        const quickResponse = getQuickResponse(userInput);
        if (quickResponse) {
          const quickMessage: Message = {
            id: Date.now().toString(),
            content: quickResponse,
            sender: 'bot',
            timestamp: new Date(),
            type: 'quick'
          };
          setMessages(prev => [...prev, quickMessage]);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // إظهار حالة "يكتب" للرسالة الرئيسية
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // الرسالة الرئيسية
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.text,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // اقتراحات إضافية (إن وجدت)
        if (aiResponse.suggestion && aiResponse.suggestion.fields && Object.keys(aiResponse.suggestion.fields).length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const suggestionMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `✨ اقتراحات ذكية:\n\n${generateSuggestionPreview(aiResponse.suggestion)}\n\nتريد أطبق هذه التحسينات؟ 🚀`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'suggestion'
          };
          setMessages(prev => [...prev, suggestionMessage]);
          setIsTyping(false);
        }
      };
      
      simulateNaturalTyping();
    } catch (error) {
      setIsTyping(false);
      console.error('Error generating response:', error);
      
      // رد احتياطي
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }, 1000);
    }
  };

  const generateSuggestionPreview = (suggestion: FormSuggestion): string => {
    const fields = suggestion.fields;
    let preview = '';
    
    if (fields.jobTitle) preview += `• المسمى الوظيفي: ${fields.jobTitle}\n`;
    if (fields.skills) preview += `• المهارات: ${fields.skills}\n`;
    if (fields.degree) preview += `• الدرجة العلمية: ${fields.degree}\n`;
    if (fields.specialty) preview += `• التخصص: ${fields.specialty}\n`;
    
    return preview || 'تحسينات عامة للبروفايل';
  };

  const applySuggestion = (suggestion: FormSuggestion) => {
    if (onFormDataUpdate && suggestion.fields) {
      onFormDataUpdate(suggestion.fields);
      
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: '✅ تم تطبيق الاقتراحات بنجاح! يمكنك مراجعة التغييرات في النموذج.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* إشعار ذكي للتفاعل */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 max-w-sm"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 relative">
              {/* سهم يشير للبوت */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {notificationText}
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setShowNotification(false);
                    }}
                    className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    تحدث معي
                  </button>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* أيقونة البوت العائمة */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        {!isOpen && (
          <>
            {/* نبضة تشير لوجود مساعدة */}
            <motion.div
              className="absolute inset-0 bg-purple-600 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.3, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.button
              onClick={() => {
                setIsOpen(true);
                setShowNotification(false);
              }}
              className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-6 h-6" />
              <span className="hidden md:block text-sm font-medium">مساعد ذكي</span>
              {/* نقطة إشعار */}
              {showNotification && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>
          </>
        )}
      </motion.div>

      {/* نافذة الدردشة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* رأس النافذة */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">المساعد الذكي</h3>
                  <p className="text-xs opacity-90">مساعدك لبناء بروفايل احترافي</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* منطقة الرسائل المحسنة */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl relative ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-md shadow-lg'
                        : `${getMessageStyle(message.type)} text-gray-800 rounded-bl-md shadow-md`
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <motion.div 
                        className="flex items-center gap-2 mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Bot className={`w-4 h-4 ${getBotIconColor(message.type)}`} />
                        <span className={`text-xs font-medium ${getBotIconColor(message.type)}`}>
                          {getBotTitle(message.type)}
                        </span>
                        {message.type === 'quick' && (
                          <motion.span 
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            رد سريع
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </motion.div>
                    
                    {message.type === 'suggestion' && (
                      <motion.button
                        onClick={() => applySuggestion({ fields: {}, confidence: 0.8, source: 'AI' })}
                        className="mt-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        تطبيق الاقتراحات
                      </motion.button>
                    )}
                    
                    {message.type === 'analysis' && (
                      <motion.div 
                        className="mt-2 flex gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                          تحليل ذكي
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          مخصص لك
                        </span>
                      </motion.div>
                    )}
                    
                    {/* وقت الإرسال */}
                    <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* مؤشر الكتابة */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* منطقة الإدخال */}
            <div className="border-t border-gray-200">
              {/* أزرار التحليل السريع */}
              {aiInsights && (
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const analysisMessage: Message = {
                          id: Date.now().toString(),
                          content: `📊 تحليل شامل لبروفايلك:\n\n🎯 قوة البروفايل: ${dataQualityScore}%\n💼 مسارك المهني: ${aiInsights.careerPath}\n🇯🇴 توافق مع السوق: ${aiInsights.marketAlignment}%\n\n📝 اقتراحات التحسين:\n${aiInsights.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n${aiInsights.improvements.length > 0 ? `🔧 تحسينات مطلوبة:\n${aiInsights.improvements.join('\n')}` : ''}`,
                          sender: 'bot',
                          timestamp: new Date(),
                          type: 'analysis'
                        };
                        setMessages(prev => [...prev, analysisMessage]);
                      }}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    >
                      📊 تحليل شامل
                    </button>
                    
                    <button
                      onClick={() => {
                        let tipsContent = '';
                        let suggestionsToShow = [];
                        
                        if (aiInsights && aiInsights.suggestions.length > 0) {
                          // إذا كان هناك اقتراحات من التحليل
                          suggestionsToShow = aiInsights.suggestions.slice(0, 3);
                          tipsContent = `💡 نصائح سريعة لتحسين بروفايلك:\n\n${suggestionsToShow.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n`;
                          
                          if (aiInsights.careerPath !== 'متنوع') {
                            tipsContent += `🎯 متخصص في: ${aiInsights.careerPath}\n`;
                          }
                        } else {
                          // نصائح عامة إذا لم يكن هناك تحليل
                          suggestionsToShow = [
                            'أكمل المعلومات الأساسية (الاسم، الإيميل، الهاتف)',
                            'حدد منصبك الوظيفي أو التخصص المطلوب بوضوح',
                            'أضف خبراتك العملية مع تواريخ محددة',
                            'اكتب إنجازاتك بأرقام ملموسة',
                            'أدرج المهارات التقنية والشخصية المهمة'
                          ];
                          tipsContent = `💡 نصائح أساسية لبناء بروفايل قوي:\n\n${suggestionsToShow.slice(0, 3).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n`;
                        }
                        
                        tipsContent += `هل تريد نصائح أكثر تخصصاً؟ 🎯`;
                        
                        const tipsMessage: Message = {
                          id: Date.now().toString(),
                          content: tipsContent,
                          sender: 'bot',
                          timestamp: new Date(),
                          type: 'suggestion'
                        };
                        setMessages(prev => [...prev, tipsMessage]);
                      }}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    >
                      💡 نصائح سريعة
                    </button>
                    
                    <div className="text-xs text-gray-600 flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${dataQualityScore >= 80 ? 'bg-green-400' : dataQualityScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                      قوة البروفايل: {dataQualityScore}%
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالة..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputValue.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white p-2 rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartAssistantBot;
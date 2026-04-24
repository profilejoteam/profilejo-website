/**
 * SmartAssistantBot — legacy shim.
 * The new floating AI assistant lives in components/floating-assistant/.
 * This file re-exports FloatingAssistant so any existing imports don't break.
 */
export { FloatingAssistant as default } from './floating-assistant'


interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  suggestion?: FormSuggestion
}

interface FormSuggestion {
  fields: Record<string, any>
  confidence: number
  source: string
}

interface SmartAssistantBotProps {
  currentField?: string
  currentFieldValue?: string
  onDataSuggestion?: (data: FormSuggestion) => void
  formContext?: Record<string, any>
  formData?: Record<string, any>
  onFormDataUpdate?: (data: Record<string, any>) => void
  currentStep?: number
  isVisible?: boolean
}

// رسائل توجيهية تفاعلية متقدمة لكل حقل
const fieldPrompts: Record<string, {
  message: string
  emoji: string
  priority: 'high' | 'medium' | 'low'
}> = {
  // المعلومات الأساسية
  fullName: {
    message: "هل تحتاج مساعدة في كتابة اسمك الكامل بالطريقة المهنية؟",
    emoji: "👤",
    priority: 'high'
  },
  email: {
    message: "تريد نصائح لاختيار إيميل مهني مناسب؟",
    emoji: "📧",
    priority: 'high'
  },
  phone: {
    message: "غير متأكد من تنسيق رقم الهاتف الصحيح؟",
    emoji: "📱",
    priority: 'medium'
  },
  linkedinUrl: {
    message: "تحتاج مساعدة في تحسين رابط LinkedIn الخاص بك؟",
    emoji: "💼",
    priority: 'high'
  },
  dateOfBirth: {
    message: "محتار في كيفية إدخال تاريخ الميلاد؟",
    emoji: "📅",
    priority: 'low'
  },
  city: {
    message: "تحتاج مساعدة في اختيار المدينة المناسبة؟",
    emoji: "🏙️",
    priority: 'medium'
  },

  // التعليم
  degree: {
    message: "مش متأكد من نوع الدرجة العلمية المناسبة؟",
    emoji: "🎓",
    priority: 'high'
  },
  major: {
    message: "تريد مساعدة في كتابة التخصص بطريقة مهنية؟",
    emoji: "📚",
    priority: 'high'
  },
  university: {
    message: "محتار في اختيار الجامعة المناسبة؟",
    emoji: "🏫",
    priority: 'medium'
  },
  faculty: {
    message: "تحتاج مساعدة في تحديد اسم الكلية الصحيح؟",
    emoji: "🏛️",
    priority: 'medium'
  },
  gpa: {
    message: "تحتاج نصيحة حول كتابة المعدل الأكاديمي؟",
    emoji: "📊",
    priority: 'low'
  },

  // الخبرة العملية
  jobTitle: {
    message: "تريد مساعدة في كتابة المسمى الوظيفي بطريقة احترافية؟",
    emoji: "💼",
    priority: 'high'
  },
  organization: {
    message: "محتار في طريقة كتابة اسم الشركة أو المؤسسة؟",
    emoji: "🏢",
    priority: 'medium'
  },
  responsibilities: {
    message: "تحتاج مساعدة في صياغة المهام والمسؤوليات بطريقة مؤثرة؟",
    emoji: "✍️",
    priority: 'high'
  },
  achievements: {
    message: "تريد مساعدة في كتابة الإنجازات بطريقة تلفت الانتباه؟",
    emoji: "🏆",
    priority: 'high'
  },
  employmentType: {
    message: "غير متأكد من نوع العمل المناسب؟",
    emoji: "⚡",
    priority: 'low'
  },

  // المشاريع
  projectTitle: {
    message: "تحتاج مساعدة في اختيار عنوان جذاب للمشروع؟",
    emoji: "🚀",
    priority: 'high'
  },
  projectDescription: {
    message: "تريد مساعدة في وصف المشروع بطريقة احترافية؟",
    emoji: "📝",
    priority: 'high'
  },
  technologies: {
    message: "محتار في اختيار التقنيات المناسبة للذكر؟",
    emoji: "💻",
    priority: 'medium'
  },
  demoLink: {
    message: "تحتاج نصائح لرابط العرض التوضيحي؟",
    emoji: "🔗",
    priority: 'low'
  },

  // المهارات
  skillName: {
    message: "تحتاج مساعدة في تحديد المهارات المهمة لتخصصك؟",
    emoji: "⚡",
    priority: 'high'
  },
  proficiency: {
    message: "غير متأكد من مستوى إتقانك للمهارة؟",
    emoji: "📈",
    priority: 'medium'
  },
  yearsOfExperience: {
    message: "تحتاج مساعدة في تقدير سنوات خبرتك؟",
    emoji: "⏰",
    priority: 'low'
  },

  // اللغات
  language: {
    message: "تريد مساعدة في اختيار اللغات المناسبة لذكرها؟",
    emoji: "🌍",
    priority: 'medium'
  },
  languageProficiency: {
    message: "غير متأكد من مستوى إتقانك للغة؟",
    emoji: "📖",
    priority: 'low'
  },

  // الشهادات
  certificationTitle: {
    message: "تحتاج مساعدة في كتابة اسم الشهادة بالطريقة الصحيحة؟",
    emoji: "🏅",
    priority: 'medium'
  },
  issuer: {
    message: "محتار في طريقة كتابة اسم الجهة المصدرة للشهادة؟",
    emoji: "🏛️",
    priority: 'low'
  },

  // تفضيلات العمل
  preferredRoles: {
    message: "تريد مساعدة في تحديد الوظائف المناسبة لك؟",
    emoji: "🎯",
    priority: 'high'
  },
  expectedSalaryRange: {
    message: "تحتاج نصيحة حول تحديد النطاق المتوقع للراتب؟",
    emoji: "💰",
    priority: 'medium'
  },
  desiredJobType: {
    message: "محتار في نوع العمل المفضل؟",
    emoji: "⚖️",
    priority: 'low'
  },

  // افتراضي
  default: {
    message: "تحتاج مساعدة في ملء هذا الحقل؟ دعني أساعدك!",
    emoji: "💡",
    priority: 'medium'
  }
}

export default function SmartAssistantBot({ 
  currentField, 
  currentFieldValue, 
  onDataSuggestion, 
  formContext 
}: SmartAssistantBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showPrompt, setShowPrompt] = useState(true)
  const [conversationContext, setConversationContext] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // رسالة ترحيبية ذكية عند فتح البوت
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `مرحباً! 👋 أنا مساعدك الذكي لبناء بروفايل مهني قوي! \n\nيمكنني مساعدتك في:\n🎯 صياغة المعلومات بطريقة احترافية\n✨ اقتراح محتوى مناسب لتخصصك\n🚀 تحسين طريقة عرض خبراتك\n\nأخبرني عن نفسك وتخصصك وسأساعدك في إنشاء بروفايل يميزك! 💼`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  // تمرير تلقائي للرسالة الأخيرة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // إدارة عرض الرسالة التوجيهية
  useEffect(() => {
    if (isOpen) {
      setShowPrompt(false)
    } else {
      const timer = setTimeout(() => setShowPrompt(true), 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // تحديث السياق عند تغيير الحقل
  useEffect(() => {
    if (currentField && currentFieldValue) {
      setConversationContext(prev => [
        ...prev.slice(-10), // الاحتفاظ بآخر 10 سياقات فقط
        `${currentField}: ${currentFieldValue}`
      ])
    }
  }, [currentField, currentFieldValue])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = inputValue
    setInputValue('')
    setIsTyping(true)

    // تحليل ذكي للرسالة
    try {
      const botResponse = await generateIntelligentResponse(userInput)
      
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          suggestion: botResponse.suggestion
        }
        
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)

        // عرض زر تطبيق الاقتراح إذا توفر
        if (botResponse.suggestion) {
          setTimeout(() => {
            const suggestionMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: `✨ بناءً على ما أخبرتني، لدي اقتراحات لتحسين بروفايلك!\n\n${generateSuggestionPreview(botResponse.suggestion || { fields: {}, confidence: 0, source: 'Default' })}\n\nهل تريد تطبيق هذه الاقتراحات؟`,
              sender: 'bot',
              timestamp: new Date(),
              suggestion: botResponse.suggestion
            }
            setMessages(prev => [...prev, suggestionMessage])
          }, 1000)
        }
      }, 1500)
    } catch (error) {
      setIsTyping(false)
      console.error('Error generating response:', error)
    }
  }

  const generateIntelligentResponse = async (userInput: string): Promise<{
    text: string;
    suggestion?: FormSuggestion;
  }> => {
    try {
      // استدعاء API للذكاء الاصطناعي
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          context: conversationContext,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      return data.response || {
        text: 'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.',
        suggestion: undefined
      }
    } catch (error) {
      console.error('AI Response Error:', error)
      
      // رد احتياطي في حالة فشل API
      const input = userInput.toLowerCase()
      const analysisResult = analyzeUserInput(input, conversationContext)
      
      if (analysisResult.domain === 'engineering') {
        return {
          text: `رائع! أرى أنك في مجال الهندسة ${analysisResult.specialty || ''}. هذا مجال مطلوب جداً!\n\nهل يمكنك إخباري:\n• كم سنة خبرة لديك؟\n• ما هي أهم المشاريع التي عملت عليها؟\n• ما هي التقنيات والأدوات التي تجيدها؟`,
          suggestion: generateEngineeringSuggestion(analysisResult)
        }
      }
      
      return {
        text: 'شكراً لك على المعلومات! يمكنني مساعدتك في تنظيم هذه البيانات وإضافتها للنموذج. هل تريد أن أقترح عليك كيفية صياغة أي من الحقول؟',
        suggestion: undefined
      }
    }
  }

  const analyzeUserInput = (input: string, context: string[]) => {
    const analysis = {
      domain: 'general',
      specialty: null as string | null,
      languages: [] as string[],
      skills: [] as string[],
      experience: null as number | null,
      confidence: 0
    }

    // تحليل المجال
    if (input.includes('هندسة') || input.includes('مهندس') || input.includes('engineering')) {
      analysis.domain = 'engineering'
      analysis.confidence += 0.3
      
      if (input.includes('حاسوب') || input.includes('كمبيوتر')) analysis.specialty = 'الحاسوب'
      if (input.includes('مدني') || input.includes('إنشائية')) analysis.specialty = 'المدنية'
      if (input.includes('كهرباء') || input.includes('كهربائية')) analysis.specialty = 'الكهربائية'
      if (input.includes('ميكانيك') || input.includes('آلات')) analysis.specialty = 'الميكانيكية'
    }

    if (input.includes('برمجة') || input.includes('مطور') || input.includes('developer') || input.includes('programming')) {
      analysis.domain = 'programming'
      analysis.confidence += 0.4
      
      const programmingLanguages = ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'php', 'c++', 'c#', 'flutter', 'dart']
      programmingLanguages.forEach(lang => {
        if (input.includes(lang)) {
          analysis.languages.push(lang)
          analysis.confidence += 0.1
        }
      })
    }

    if (input.includes('تصميم') || input.includes('مصمم') || input.includes('design') || input.includes('ui') || input.includes('ux')) {
      analysis.domain = 'design'
      analysis.confidence += 0.3
    }

    if (input.includes('إدارة') || input.includes('تسويق') || input.includes('مبيعات') || input.includes('business') || input.includes('management')) {
      analysis.domain = 'business'
      analysis.confidence += 0.3
    }

    // تحليل سنوات الخبرة
    const experienceMatch = input.match(/(\d+)\s*(سنة|سنوات|year|years)/)
    if (experienceMatch) {
      analysis.experience = parseInt(experienceMatch[1])
      analysis.confidence += 0.2
    }

    return analysis
  }

  const generateEngineeringSuggestion = (analysis: any): FormSuggestion => {
    return {
      fields: {
        jobTitle: `مهندس ${analysis.specialty || 'حاسوب'}`,
        major: `هندسة ${analysis.specialty || 'الحاسوب'}`,
        skills: [
          { name: 'حل المشكلات', proficiency: 'Advanced', yearsOfExperience: analysis.experience || 2 },
          { name: 'التحليل التقني', proficiency: 'Intermediate', yearsOfExperience: analysis.experience || 1 },
          { name: 'إدارة المشاريع', proficiency: 'Intermediate', yearsOfExperience: 1 }
        ],
        preferredRoles: ['مهندس تطوير', 'مهندس أنظمة', 'مهندس مشاريع'],
        preferredIndustries: ['التكنولوجيا', 'الاتصالات', 'الصناعة']
      },
      confidence: analysis.confidence,
      source: 'ai_analysis'
    }
  }

  const generateProgrammingSuggestion = (analysis: any): FormSuggestion => {
    const skills = analysis.languages.map((lang: string) => ({
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      proficiency: 'Intermediate',
      yearsOfExperience: analysis.experience || 2
    }))

    return {
      fields: {
        jobTitle: 'مطور برمجيات',
        major: 'علوم الحاسوب',
        skills: [
          ...skills,
          { name: 'حل المشكلات', proficiency: 'Advanced', yearsOfExperience: analysis.experience || 2 },
          { name: 'العمل الجماعي', proficiency: 'Advanced', yearsOfExperience: 2 }
        ],
        preferredRoles: ['مطور ويب', 'مطور تطبيقات', 'مطور Full Stack'],
        preferredIndustries: ['التكنولوجيا', 'الشركات الناشئة', 'التجارة الإلكترونية']
      },
      confidence: analysis.confidence,
      source: 'ai_analysis'
    }
  }

  const generateDesignSuggestion = (analysis: any): FormSuggestion => {
    return {
      fields: {
        jobTitle: 'مصمم UI/UX',
        major: 'التصميم الجرافيكي',
        skills: [
          { name: 'Adobe Creative Suite', proficiency: 'Advanced', yearsOfExperience: 2 },
          { name: 'Figma', proficiency: 'Advanced', yearsOfExperience: 2 },
          { name: 'UI/UX Design', proficiency: 'Intermediate', yearsOfExperience: 1 },
          { name: 'التفكير الإبداعي', proficiency: 'Advanced', yearsOfExperience: 3 }
        ],
        preferredRoles: ['مصمم UI/UX', 'مصمم جرافيك', 'مصمم منتجات رقمية'],
        preferredIndustries: ['التكنولوجيا', 'الإعلان والتسويق', 'الشركات الناشئة']
      },
      confidence: analysis.confidence,
      source: 'ai_analysis'
    }
  }

  const generateBusinessSuggestion = (analysis: any): FormSuggestion => {
    return {
      fields: {
        jobTitle: 'أخصائي إدارة أعمال',
        major: 'إدارة الأعمال',
        skills: [
          { name: 'التخطيط الاستراتيجي', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'إدارة الفرق', proficiency: 'Intermediate', yearsOfExperience: 1 },
          { name: 'تحليل البيانات', proficiency: 'Beginner', yearsOfExperience: 1 },
          { name: 'التواصل', proficiency: 'Advanced', yearsOfExperience: 3 }
        ],
        preferredRoles: ['مدير مشاريع', 'أخصائي تسويق', 'محلل أعمال'],
        preferredIndustries: ['الخدمات المالية', 'التجارة', 'الاستشارات']
      },
      confidence: analysis.confidence,
      source: 'ai_analysis'
    }
  }

  const generateSuggestionPreview = (suggestion: FormSuggestion): string => {
    const preview = []
    
    if (suggestion.fields.jobTitle) {
      preview.push(`📋 المسمى الوظيفي: ${suggestion.fields.jobTitle}`)
    }
    
    if (suggestion.fields.skills && suggestion.fields.skills.length > 0) {
      const skillNames = suggestion.fields.skills.slice(0, 3).map((s: any) => s.name).join('، ')
      preview.push(`⚡ المهارات: ${skillNames}`)
    }
    
    if (suggestion.fields.preferredRoles && suggestion.fields.preferredRoles.length > 0) {
      preview.push(`🎯 الوظائف المفضلة: ${suggestion.fields.preferredRoles.slice(0, 2).join('، ')}`)
    }

    return preview.join('\n')
  }

  const handleApplySuggestion = (suggestion: FormSuggestion) => {
    if (onDataSuggestion) {
      onDataSuggestion(suggestion)
      
      // إضافة رسالة تأكيد
      const confirmMessage: Message = {
        id: Date.now().toString(),
        text: "✅ تم تطبيق الاقتراحات بنجاح! يمكنك مراجعة البيانات وتعديلها حسب الحاجة. هل تحتاج المزيد من المساعدة؟",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])
    }
  }

  const getCurrentPrompt = () => {
    const prompt = fieldPrompts[currentField || 'default'] || fieldPrompts.default
    return {
      message: `${prompt.emoji} ${prompt.message}`,
      priority: prompt.priority
    }
  }

  const getPromptStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 from-red-500 to-pink-600'
      case 'medium':
        return 'border-blue-200 bg-blue-50 from-blue-500 to-purple-600'
      case 'low':
        return 'border-green-200 bg-green-50 from-green-500 to-teal-600'
      default:
        return 'border-blue-200 bg-blue-50 from-blue-500 to-purple-600'
    }
  }

  const currentPrompt = getCurrentPrompt()
  const promptStyles = getPromptStyles(currentPrompt.priority)

  return (
    <>
      {/* رسالة توجيهية تفاعلية عند إغلاق البوت */}
      <AnimatePresence>
        {!isOpen && showPrompt && currentField && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40"
          >
            <div className={`rounded-xl shadow-xl border-2 p-4 max-w-sm backdrop-blur-sm ${promptStyles.split(' ').slice(0, 2).join(' ')}`}>
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-2 flex-shrink-0 ${promptStyles.split(' ')[2]}`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    {currentPrompt.message}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className={`bg-gradient-to-r ${promptStyles.split(' ').slice(3).join(' ')} text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2`}
                  >
                    <MessageCircle className="w-3 h-3" />
                    ساعدني! 🚀
                  </motion.button>
                </div>
              </div>
              {/* مثلث للإشارة للبوت */}
              <div className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-current opacity-50"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* زر البوت المحسن */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300 group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Bot className="w-7 h-7" />
              {currentField && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <Zap className="w-2 h-2 text-yellow-800" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* نافذة الدردشة المحسنة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* رأس النافذة المحسن */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">المساعد الذكي</h3>
                <p className="text-xs opacity-90">مدعوم بالذكاء الاصطناعي</p>
              </div>
              <div className="ml-auto">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-400 rounded-full"
                />
              </div>
            </div>

            {/* منطقة الرسائل المحسنة */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-600 border-2 border-gray-200'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-2xl p-4 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      
                      {/* زر تطبيق الاقتراح */}
                      {message.suggestion && message.sender === 'bot' && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApplySuggestion(message.suggestion!)}
                          className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Zap className="w-3 h-3" />
                          تطبيق الاقتراحات ✨
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* مؤشر الكتابة المحسن */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm border border-gray-200">
                      <div className="flex space-x-1">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay }}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* منطقة الكتابة المحسنة */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isTyping}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                اضغط Enter للإرسال • مدعوم بالذكاء الاصطناعي 🤖
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
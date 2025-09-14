'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { FaPlus, FaMinus, FaQuestionCircle } from 'react-icons/fa'

const faqs = [
  {
    question: 'كم يستغرق إنجاز بروفايلي المهني؟',
    answer: 'نحتاج عادة من 3 إلى 7 أيام عمل لإنجاز بروفايلك المهني الكامل، حسب نوع الخدمة المطلوبة. السيرة الذاتية البسيطة تستغرق يومين، بينما الحزمة الشاملة مع LinkedIn وبناء العلامة الشخصية قد تستغرق أسبوعاً.'
  },
  {
    question: 'هل تقدمون ضمان على الخدمة؟',
    answer: 'نعم، نقدم ضمان استرداد كامل خلال 30 يوماً إذا لم تكن راضياً عن الخدمة. كما نوفر 3 مراجعات مجانية و3 أشهر متابعة ودعم بعد التسليم لضمان نجاحك.'
  },
  {
    question: 'ما الذي يميز خدماتكم عن المنافسين؟',
    answer: 'نجمع بين الخبرة والتقنية الحديثة. فريقنا من خبراء التوظيف يفهم متطلبات السوق السعودي والخليجي، ونستخدم أدوات تحليل متقدمة لضمان وصول بروفايلك للشركات المناسبة. كما نقدم متابعة شخصية لكل عميل.'
  },
  {
    question: 'هل يمكنني الحصول على مراجعة لبروفايلي الحالي؟',
    answer: 'بالطبع! نقدم خدمة تقييم مجاني لبروفايلك الحالي مع تقرير مفصل عن نقاط القوة والضعف واقتراحات للتحسين. هذا التقييم متاح لجميع العملاء الجدد مجاناً.'
  },
  {
    question: 'هل تساعدون في البحث عن وظائف؟',
    answer: 'نعم، نقدم استشارات مهنية شاملة تشمل استراتيجية البحث عن الوظائف، تحضير للمقابلات، نصائح للتفاوض على الراتب، وربطك بشبكة واسعة من الشركات الشريكة.'
  },
  {
    question: 'ما هي أسعار خدماتكم؟',
    answer: 'أسعارنا تنافسية وتبدأ من 299 ريال للسيرة الذاتية الأساسية، 599 ريال لحزمة LinkedIn، و1299 ريال للحزمة الشاملة. نقدم أيضاً خصومات للطلاب وحديثي التخرج.'
  },
  {
    question: 'هل تدعمون جميع التخصصات والمجالات؟',
    answer: 'نعم، لدينا خبراء متخصصون في جميع المجالات: الطب، الهندسة، التقنية، القانون، التسويق، المحاسبة، التعليم، وغيرها. كل عميل يتم تخصيص خبير له حسب مجال تخصصه.'
  },
  {
    question: 'كيف تضمنون سرية معلوماتي؟',
    answer: 'نتعامل مع سرية المعلومات بأقصى درجات الحماية. جميع البيانات مشفرة ومحمية، ولا نشارك أي معلومات شخصية مع طرف ثالث. كما نوقع اتفاقية سرية مع كل عميل.'
  }
]

const FAQItem = ({ faq, index, isOpen, onToggle }: {
  faq: typeof faqs[0]
  index: number
  isOpen: boolean
  onToggle: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
  >
    <button
      onClick={onToggle}
      className="w-full text-right p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
    >
      <span className="font-semibold text-gray-900 text-lg flex-1 ml-4">
        {faq.question}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-primary-500 text-xl flex-shrink-0"
      >
        {isOpen ? <FaMinus /> : <FaPlus />}
      </motion.div>
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 text-gray-600 leading-relaxed">
            {faq.answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0])) // First item open by default

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section id="faq" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FaQuestionCircle className="text-2xl text-primary-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              الأسئلة الشائعة
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            إجابات على أهم الأسئلة التي قد تخطر ببالك حول خدماتنا
          </p>
        </motion.div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openItems.has(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>

        {/* Still have questions section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              لديك سؤال آخر؟
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              فريق خدمة العملاء متاح على مدار الساعة للإجابة على جميع استفساراتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                تواصل معنا الآن
              </button>
              <a href="/auth" className="px-8 py-4 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors inline-block text-center">
                احجز استشارة مجانية
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

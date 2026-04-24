/**
 * field-questions.ts
 *
 * Defines the guided question sequences for every AI-assisted form field.
 * Each sequence drives GuidedFlowModal with 1-5 smart questions whose
 * answers are forwarded to /api/ai-chat (guided_generate intent) to
 * produce highly personalised professional content.
 */

import type { AIIntent } from '@/hooks/useAIConversation'

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionType = 'text' | 'textarea' | 'choice'

export interface Question {
  id: string
  text: string
  hint?: string
  placeholder?: string
  type: QuestionType
  choices?: string[]     // only for type='choice'
  optional?: boolean
}

export interface FieldQuestionSequence {
  /** The base field identifier (without dynamic indices, e.g. "responsibilities") */
  baseFieldId: string
  /** Full-match patterns — fieldId must match at least one (supports * wildcard) */
  matchPatterns: string[]
  /** Short title shown in modal header */
  title: string
  /** One-liner shown in the FloatingBubble */
  intro: string
  /** Emoji shown in bubble */
  emoji: string
  questions: Question[]
  intent: AIIntent | 'guided_generate'
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Returns true if a live fieldId matches a pattern ("*" matches any segment) */
export function matchesPattern(fieldId: string, pattern: string): boolean {
  const fParts = fieldId.split('.')
  const pParts = pattern.split('.')
  if (fParts.length !== pParts.length) return false
  return pParts.every((p, i) => p === '*' || p === fParts[i])
}

/** Find the sequence for a given live fieldId, or null if not found */
export function findSequence(fieldId: string): FieldQuestionSequence | null {
  for (const seq of FIELD_SEQUENCES) {
    if (seq.matchPatterns.some(p => matchesPattern(fieldId, p))) return seq
  }
  return null
}

// ─── Sequences ────────────────────────────────────────────────────────────────

const FIELD_SEQUENCES: FieldQuestionSequence[] = [

  // ── 1. المسمى الوظيفي المستهدف ──────────────────────────────────────────
  {
    baseFieldId: 'targetJobTitle',
    matchPatterns: ['targetJobTitle'],
    title: 'المسمى الوظيفي المستهدف',
    intro: 'دعني أساعدك في اختيار مسمى وظيفي احترافي ومناسب لسوق العمل!',
    emoji: '🎯',
    intent: 'guided_generate',
    questions: [
      {
        id: 'field',
        text: 'ما مجال تخصصك الدراسي أو العملي؟',
        placeholder: 'مثال: هندسة الحاسوب، إدارة الأعمال، المحاسبة...',
        type: 'text',
        hint: 'سيساعدني هذا في اقتراح مسميات احترافية تتناسب مع خلفيتك.',
      },
      {
        id: 'experience_level',
        text: 'ما مستوى خبرتك الحالي؟',
        type: 'choice',
        choices: ['حديث التخرج (0-1 سنة)', 'مبتدئ (1-3 سنوات)', 'متوسط (3-7 سنوات)', 'خبير (+7 سنوات)'],
      },
      {
        id: 'dream_company',
        text: 'ما نوع الشركة أو البيئة التي تود العمل بها؟',
        type: 'choice',
        choices: ['قطاع صحي وطبي', 'قطاع تعليمي', 'قطاع حكومي', 'شركة أعمال وتجارة', 'شركة دولية كبرى', 'مؤسسة مالية', 'قطاع هندسة وصناعة', 'قطاع تقنية وبرمجة', 'أي قطاع مناسب'],
        optional: true,
        hint: 'هذا يساعدني في انتقاء المسميات الأكثر جذباً في القطاع الذي تستهدفه.',
      },
    ],
  },

  // ── 2. النبذة الشخصية ────────────────────────────────────────────────────
  {
    baseFieldId: 'summary',
    matchPatterns: ['summary'],
    title: 'النبذة الشخصية',
    intro: 'سأكتب لك نبذة شخصية احترافية تسحب انتباه أصحاب العمل! أجبني على 5 أسئلة سريعة.',
    emoji: '✍️',
    intent: 'generate_summary',
    questions: [
      {
        id: 'strength',
        text: 'ما أبرز نقاط قوتك المهنية أو الشخصية؟',
        placeholder: 'مثال: سريع التعلم، أحل المشكلات بإبداع، أتقن العمل تحت الضغط...',
        type: 'textarea',
        hint: 'لا تتواضع! اذكر ما يميزك حقاً.',
      },
      {
        id: 'years',
        text: 'كم سنة خبرتك؟ (أو هل أنت حديث/ة التخرج؟)',
        type: 'choice',
        choices: ['حديث/ة التخرج', '1-2 سنة', '3-5 سنوات', '6-10 سنوات', '+10 سنوات'],
      },
      {
        id: 'achievement',
        text: 'اذكر إنجازاً أو مشروعاً تفخر به (ولو صغير!)',
        placeholder: 'مثال: طورت تطبيقاً استخدمه 500 شخص، حسّنت عملية كانت تأخذ 3 أيام إلى يوم واحد...',
        type: 'textarea',
        hint: 'الأرقام تصنع الفرق — إذا كان عندك رقم اذكره.',
        optional: true,
      },
      {
        id: 'goal',
        text: 'ما هدفك المهني في الوظيفة القادمة؟',
        placeholder: 'مثال: أريد أن أتقدم في مجال الذكاء الاصطناعي وأعمل في بيئة ابتكارية...',
        type: 'textarea',
        hint: 'سأدمج هذا في النبذة بشكل طبيعي.',
      },
      {
        id: 'tone',
        text: 'ما الأسلوب الذي تفضله في النبذة؟',
        type: 'choice',
        choices: ['رسمي واحترافي', 'ودود ومحفوز', 'مباشر ومختصر', 'متحمس وطموح'],
        hint: 'سأكيّف نبرة الكتابة حسب اختيارك.',
      },
    ],
  },

  // ── 3. المسؤوليات الوظيفية ───────────────────────────────────────────────
  {
    baseFieldId: 'responsibilities',
    matchPatterns: ['experience.*.responsibilities'],
    title: 'المسؤوليات الوظيفية',
    intro: 'سأصوغ مسؤولياتك الوظيفية بأفعال نشطة تترك أثراً على أصحاب العمل!',
    emoji: '📋',
    intent: 'write_responsibilities',
    questions: [
      {
        id: 'job_title',
        text: 'ما كان مسماك الوظيفي في هذه الوظيفة؟',
        placeholder: 'مثال: مطور برمجيات، محاسب أول، مدير مبيعات...',
        type: 'text',
        hint: 'إذا كان مختلفاً عن المسمى المدخل، اذكره هنا.',
      },
      {
        id: 'main_tasks',
        text: 'ما المهام الرئيسية التي كنت تقوم بها يومياً أو أسبوعياً؟',
        placeholder: 'مثال: إدارة قاعدة بيانات العملاء، تطوير تقارير المبيعات، التواصل مع الموردين...',
        type: 'textarea',
        hint: 'اكتب بشكل غير رسمي — أنا من سأصيغها باحترافية.',
      },
      {
        id: 'team',
        text: 'هل كنت تعمل ضمن فريق أم بشكل مستقل؟ وكم عدد الفريق؟',
        type: 'choice',
        choices: ['بشكل مستقل تماماً', 'فريق صغير (2-5)', 'فريق متوسط (6-15)', 'فريق كبير (+15)', 'كنت قائد الفريق'],
        optional: true,
      },
      {
        id: 'tools',
        text: 'ما الأدوات والتقنيات التي استخدمتها في هذه الوظيفة؟',
        placeholder: 'مثال: Excel, SAP, Python, Figma, Jira...',
        type: 'text',
        hint: 'ذكر الأدوات يقوي التفصيل ويجذب الـ ATS.',
        optional: true,
      },
    ],
  },

  // ── 4. الإنجازات الوظيفية ────────────────────────────────────────────────
  {
    baseFieldId: 'achievements',
    matchPatterns: ['experience.*.achievements'],
    title: 'الإنجازات الوظيفية',
    intro: 'سأحوّل تجاربك إلى إنجازات بأرقام ملموسة بأسلوب STAR الاحترافي!',
    emoji: '🏆',
    intent: 'write_achievements',
    questions: [
      {
        id: 'what_improved',
        text: 'هل حسّنت شيئاً في الشركة؟ (عملية، وقت، تكلفة، رضا عملاء...)',
        placeholder: 'مثال: خفضت وقت تجهيز التقارير من يومين إلى ساعتين، زدت المبيعات في منطقتي...',
        type: 'textarea',
        hint: 'أي تحسين ولو بسيط يُعدّ إنجازاً — فكّر بالأثر الذي تركته.',
      },
      {
        id: 'numbers',
        text: 'هل تتذكر أي أرقام أو نسب؟ (ولو تقديرية)',
        placeholder: 'مثال: ~30% زيادة في الكفاءة، وفّرت 5000 دينار سنوياً، 200 عميل راضٍ...',
        type: 'text',
        hint: 'الأرقام التقديرية مقبولة تماماً — كلها تُحسب.',
        optional: true,
      },
      {
        id: 'recognition',
        text: 'هل تلقيت أي تقدير أو مكافأة أو شكر من الإدارة؟',
        type: 'choice',
        choices: ['نعم، شكر/تقدير رسمي', 'نعم، مكافأة مالية', 'نعم، ترقية', 'شكر غير رسمي', 'لا شيء رسمي'],
        optional: true,
        hint: 'أي اعتراف بجهودك يُعزز النص.',
      },
    ],
  },

  // ── 5. وصف المشروع ───────────────────────────────────────────────────────
  {
    baseFieldId: 'projectDescription',
    matchPatterns: ['projects.*.description'],
    title: 'وصف المشروع',
    intro: 'سأكتب وصفاً احترافياً ومثيراً لمشروعك يجعله يبرز في السيرة الذاتية!',
    emoji: '🚀',
    intent: 'guided_generate',
    questions: [
      {
        id: 'type',
        text: 'ما نوع هذا المشروع؟',
        type: 'choice',
        choices: ['أكاديمي / تخرج', 'عملي / مهني', 'شخصي / هواية', 'تطوعي / خيري', 'بحثي / دراسي'],
        hint: 'هذا يساعدني في انتقاء الأسلوب والنبرة المناسبة للوصف.',
      },
      {
        id: 'what',
        text: 'بكلمات بسيطة، ماذا يفعل هذا المشروع أو ما هدفه؟',
        placeholder: 'مثال: برنامج رعاية مرضى، حملة توعوية، نظام جدولة طيران، دراسة بحثية...',
        type: 'textarea',
        hint: 'تخيل أنك تشرحه لصديق — اذكر المشكلة التي يحلها أو الهدف منه.',
      },
      {
        id: 'role',
        text: 'ما دورك تحديداً في هذا المشروع؟',
        type: 'choice',
        choices: ['قائد / مدير المشروع', 'مسؤول وحيد عن المشروع', 'عضو في الفريق', 'منسق / منظم', 'باحث / محقق', 'مصمم / مخطط'],
      },
      {
        id: 'tools',
        text: 'ما الأدوات أو الموارد التي استخدمتها في هذا المشروع؟',
        placeholder: 'مثال: Excel، أجهزة طبية، مواد تدريبية، برامج تصميم، معدات ميدانية، Python...',
        type: 'text',
        hint: 'ذكر الأدوات والموارد يُثري الوصف ويُظهر احترافيتك — سواء كانت تقنية أو غير تقنية.',
        optional: true,
      },
      {
        id: 'impact',
        text: 'ما النتيجة أو التأثير؟ (هل استفاد منه أحد؟ حلّ مشكلة حقيقية؟)',
        placeholder: 'مثال: خدم 50 مريض، قلّص وقت الإجراء من يومين لساعة، حصل على تقدير من الإدارة...',
        type: 'textarea',
        hint: 'حتى لو كان المشروع صغيراً — الأثر الذي تركته هو الأهم.',
        optional: true,
      },
    ],
  },

  // ── 6. المهارات التقنية ───────────────────────────────────────────────────
  {
    baseFieldId: 'skills',
    matchPatterns: ['skills', 'technicalSkills', 'softSkills'],
    title: 'المهارات',
    intro: 'سأقترح لك قائمة مهارات تقنية وشخصية تناسب تخصصك وسوق العمل الأردني!',
    emoji: '💡',
    intent: 'suggest_skills',
    questions: [
      {
        id: 'specialization',
        text: 'ما مجال تخصصك أو العمل الذي تسعى إليه؟',
        placeholder: 'مثال: تطوير ويب، محاسبة، تسويق رقمي، هندسة مدنية...',
        type: 'text',
        hint: 'سيساعدني هذا في انتقاء المهارات الأكثر طلباً في مجالك.',
      },
      {
        id: 'known_tools',
        text: 'ما الأدوات والتقنيات التي تجيدها بالفعل؟',
        placeholder: 'مثال: Excel، Python، Photoshop، AutoCAD...',
        type: 'text',
        hint: 'سأضيف مهارات تكمّل ما تعرفه وتعزّزه.',
        optional: true,
      },
      {
        id: 'level',
        text: 'كيف تصف مستواك العام؟',
        type: 'choice',
        choices: ['مبتدئ — أتعلم وأنمو', 'متوسط — أعمل باستقلالية', 'متقدم — أقود وأعلّم'],
      },
    ],
  },

  // ── 7. تفاصيل الإنجاز/الجائزة ────────────────────────────────────────────
  {
    baseFieldId: 'achievementDetails',
    matchPatterns: ['achievements.*.details'],
    title: 'تفاصيل الإنجاز',
    intro: 'سأصوغ إنجازك بأسلوب يجعله يلمع في سيرتك الذاتية!',
    emoji: '🥇',
    intent: 'guided_generate',
    questions: [
      {
        id: 'what',
        text: 'ما هذا الإنجاز أو الجائزة؟',
        placeholder: 'مثال: جائزة أفضل مشروع تخرج، شهادة تقدير من الشركة، أول مكان في مسابقة...',
        type: 'textarea',
        hint: 'صفه بشكل بسيط — أنا من سيجعله يبدو رائعاً.',
      },
      {
        id: 'context',
        text: 'في أي سياق حصلت عليه؟ (عمل، دراسة، تطوعي...)',
        type: 'choice',
        choices: ['في إطار الدراسة', 'في العمل', 'في مسابقة خارجية', 'نشاط تطوعي', 'مشروع شخصي'],
      },
      {
        id: 'impact',
        text: 'هل كان لهذا الإنجاز أثر على فريق أو مؤسسة؟',
        placeholder: 'مثال: أدى إلى تحسين العملية، حصل إثره على فرصة عمل، كسب الفريق جائزة...',
        type: 'textarea',
        optional: true,
        hint: 'الأثر يميّز الإنجاز العادي عن الاستثنائي.',
      },
    ],
  },

  // ── 8. العمل التطوعي ─────────────────────────────────────────────────────
  {
    baseFieldId: 'volunteerWork',
    matchPatterns: ['volunteerWork'],
    title: 'العمل التطوعي',
    intro: 'سأكتب عن تطوعك بأسلوب يعكس قيمتك المجتمعية وقيادتك!',
    emoji: '🤝',
    intent: 'guided_generate',
    questions: [
      {
        id: 'org',
        text: 'في أي منظمة أو مبادرة تطوعت؟',
        placeholder: 'مثال: منظمة الأمم المتحدة، نادي جامعي، حملة مجتمعية محلية...',
        type: 'text',
      },
      {
        id: 'role_and_impact',
        text: 'ما الدور الذي أديته وما أثره على المجتمع؟',
        placeholder: 'مثال: دربت 30 شاباً على البرمجة، ساعدت في تنظيم فعالية شارك فيها 500 شخص...',
        type: 'textarea',
        hint: 'الأرقام ولو تقديرية تجعل الوصف أقوى.',
      },
    ],
  },

  // ── 9. الاهتمامات والهوايات ───────────────────────────────────────────────
  {
    baseFieldId: 'interests',
    matchPatterns: ['interests'],
    title: 'الاهتمامات والهوايات',
    intro: 'سأكتب عن اهتماماتك بطريقة تكشف شخصيتك وتعزّز بروفايلك!',
    emoji: '⭐',
    intent: 'guided_generate',
    questions: [
      {
        id: 'hobbies',
        text: 'ما اهتماماتك وهواياتك الرئيسية؟',
        placeholder: 'مثال: القراءة، البرمجة، الرياضة، الموسيقى، السفر، التصوير...',
        type: 'text',
        hint: 'اذكر ما تحبه فعلاً — سيعكس شخصيتك الحقيقية.',
      },
    ],
  },

]

export default FIELD_SEQUENCES

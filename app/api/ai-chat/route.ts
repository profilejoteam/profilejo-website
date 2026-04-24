import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// ─── Types ────────────────────────────────────────────────────────────────────
type Intent =
  | 'generate_summary'
  | 'write_responsibilities'
  | 'write_achievements'
  | 'suggest_skills'
  | 'improve_text'
  | 'general_advice'
  | 'guided_generate'
  | 'chat';

interface FormSnapshot {
  isRecentGraduate?: boolean | null;
  targetJobTitle?: string;
  targetCompany?: string;
  fullName?: string;
  city?: string;
  country?: string;
  summary?: string;
  experience?: Array<{
    jobTitle?: string;
    companyName?: string;
    organization?: string;
    responsibilities?: string;
    achievements?: string;
    startDate?: string;
    endDate?: string;
    isPresent?: boolean;
  }>;
  education?: Array<{
    degree?: string;
    major?: string;
    university?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  technicalSkills?: string[];
  softSkills?: string[];
  languages?: string[];
  certifications?: Array<{ certName?: string; title?: string; issuer?: string }>;
  projects?: Array<{ projectName?: string; title?: string; description?: string }>;
  achievements?: Array<{ details?: string }>;
  volunteerWork?: string;
  interests?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      intent,
      targetField,
      existingContent,
      guidedAnswers,
      history = [],
      context,
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 });
    }

    const formData: FormSnapshot = context?.formData ?? {};
    const currentStep: number = context?.currentStep ?? 1;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: fallbackResponse(message, intent, formData),
        success: true,
        source: 'fallback',
      });
    }

    const detectedIntent: Intent = intent ?? detectIntent(message, targetField);
    const systemPrompt = buildSystemPrompt(detectedIntent, formData, currentStep, existingContent, guidedAnswers, targetField);
    const userMessage = buildUserMessage(message, detectedIntent, formData, existingContent, guidedAnswers, targetField);

    // Keep last 8 turns for multi-turn context
    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = (
      (history as ConversationMessage[]) ?? []
    ).slice(-8).map(m => ({ role: m.role, content: m.content }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1200,
      temperature: detectedIntent === 'chat' || detectedIntent === 'general_advice' ? 0.8 : 0.65,
      response_format: needsStructuredOutput(detectedIntent) ? { type: 'json_object' } : undefined,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const result = parseResponse(raw, detectedIntent, targetField);

    return NextResponse.json({ response: result, success: true, source: 'openai' });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({
      response: { text: 'عذراً، حدث خطأ مؤقت. حاول مرة أخرى.' },
      success: true,
      source: 'error_fallback',
    });
  }
}

// ─── Intent detection ─────────────────────────────────────────────────────────
function detectIntent(message: string, targetField?: string): Intent {
  const m = message.toLowerCase();

  if (targetField) {
    if (targetField === 'summary') return 'generate_summary';
    if (targetField.includes('responsibilities')) return 'write_responsibilities';
    if (targetField.includes('achievements') || targetField.includes('details')) return 'write_achievements';
    if (targetField === 'technicalSkills' || targetField === 'softSkills') return 'suggest_skills';
  }

  if (m.match(/اكتب|أكتب|اكتبي|أكتبي|ولّد|ولد|اصنع|صياغ|generate|write/)) {
    if (m.match(/نبذ|summary|هدف وظيفي|خلاصة/)) return 'generate_summary';
    if (m.match(/مسؤولي|واجب|مهام|responsib/)) return 'write_responsibilities';
    if (m.match(/إنجاز|جائزة|achievement|accomplish/)) return 'write_achievements';
    if (m.match(/مهار|skill/)) return 'suggest_skills';
  }

  if (m.match(/حسّن|حسن|طور|improve|enhance|edit|عدّل|راجع/)) return 'improve_text';
  if (m.match(/مهار|skill|تقني|برامج|أدوات/)) return 'suggest_skills';
  if (m.match(/نصيح|نصائح|كيف أ|ماذا أ|advice|tip/)) return 'general_advice';

  return 'chat';
}

function needsStructuredOutput(intent: Intent): boolean {
  return ['generate_summary', 'write_responsibilities', 'write_achievements', 'suggest_skills', 'improve_text', 'guided_generate'].includes(intent);
}

// ─── System prompt builder ────────────────────────────────────────────────────
function buildSystemPrompt(
  intent: Intent,
  form: FormSnapshot,
  step: number,
  existingContent?: string,
  guidedAnswers?: Record<string, string>,
  targetField?: string,
): string {
  const profile = buildProfileSummary(form);

  const BASE = `أنت "Rafi" — مساعد ذكاء اصطناعي متخصص في بناء السير الذاتية والبروفايلات المهنية للسوق الأردني والخليجي. تتحدث العربية بطلاقة وبأسلوب ودود واحترافي.

بيانات المستخدم الحالية:
${profile}

القسم النشط: ${stepName(step)}`;

  switch (intent) {
    case 'generate_summary':
      return `${BASE}

مهمتك: كتابة نبذة شخصية احترافية (Professional Summary) للمستخدم.

أعطني JSON بالشكل التالي فقط:
{
  "text": "شرح موجز لما ستكتبه",
  "content": "النبذة الشخصية المكتوبة هنا (3-4 جمل، 60-90 كلمة، بدون عناوين)",
  "tips": ["نصيحة 1", "نصيحة 2"]
}

قواعد النبذة:
- ابدأ بالمسمى الوظيفي أو الكفاءة المميزة
- اذكر سنوات الخبرة (أو "حديث التخرج" إن كان مبتدئاً)
- أبرز أهم قيمة يقدمها للشركة
- أسلوب واثق بدون ضمير المتكلم المباشر ("أنا")
- ملائم للسوق الأردني والخليجي`;

    case 'write_responsibilities':
      return `${BASE}

مهمتك: كتابة قائمة مسؤوليات وظيفية احترافية.

أعطني JSON بالشكل التالي فقط:
{
  "text": "شرح موجز",
  "content": "• مسؤولية 1\\n• مسؤولية 2\\n• مسؤولية 3\\n• مسؤولية 4\\n• مسؤولية 5",
  "tips": ["نصيحة 1"]
}

القواعد:
- 4-6 نقاط، كل نقطة تبدأ بـ •
- ابدأ كل نقطة بفعل نشط (أدار، طوّر، نفّذ، قاد، حلّل، صمّم...)
- اجعلها قابلة للقياس حيثما أمكن
- خصص للمسمى الوظيفي المذكور`;

    case 'write_achievements':
      return `${BASE}

مهمتك: كتابة إنجازات مهنية بأسلوب STAR.

أعطني JSON بالشكل التالي فقط:
{
  "text": "شرح موجز",
  "content": "• إنجاز 1 (بأرقام)\\n• إنجاز 2 (بأرقام)\\n• إنجاز 3",
  "tips": ["نصيحة 1"]
}

القواعد:
- 3-5 إنجازات تبدأ بـ •
- استخدم أرقاماً ونسباً مئوية دائماً (زيادة 25%، خفّض بـ 3 أيام...)
- نمط: فعل ماضٍ ← إجراء ← نتيجة قابلة للقياس
- ابدأ بأقوى إنجاز`;

    case 'suggest_skills':
      return `${BASE}

مهمتك: اقتراح مهارات مناسبة للمستخدم.

أعطني JSON بالشكل التالي فقط:
{
  "text": "شرح موجز",
  "technicalSkills": ["مهارة 1", "مهارة 2", "مهارة 3", "مهارة 4", "مهارة 5", "مهارة 6"],
  "softSkills": ["مهارة شخصية 1", "مهارة شخصية 2", "مهارة شخصية 3", "مهارة شخصية 4"],
  "tips": ["نصيحة 1"]
}

القواعد:
- 6-8 مهارات تقنية و4-5 شخصية
- خصص حسب المسمى الوظيفي والتخصص الدراسي
- أعط الأولوية للمهارات الأكثر طلباً في الأردن والخليج
- لا تكرر ما هو موجود بالفعل`;

    case 'improve_text':
      return `${BASE}

مهمتك: تحسين النص الموجود وإعادة صياغته بأسلوب أكثر احترافية.

النص الحالي للتحسين:
"""
${existingContent ?? 'غير محدد'}
"""

أعطني JSON بالشكل التالي فقط:
{
  "text": "شرح التحسينات التي أجريتها",
  "content": "النص المحسّن هنا",
  "improvements": ["التحسين 1", "التحسين 2", "التحسين 3"]
}

القواعد:
- احتفظ بالمعنى الأصلي لكن حسّن الأسلوب والصياغة
- أضف أرقاماً وتفاصيل حيثما أمكن
- اجعله أكثر تأثيراً وجاذبية لأصحاب العمل`;

    case 'general_advice':
      return `${BASE}

مهمتك: تقديم نصائح مهنية مخصصة وعملية.

القواعد:
- نصائح مخصصة للمستخدم تحديداً (استخدم اسمه وبياناته)
- اربط كل نصيحة بسوق العمل الأردني/الخليجي
- أعط أمثلة ملموسة وأرقاماً
- لا تتجاوز 200 كلمة
- استخدم تنسيق واضح (نقاط أو أقسام قصيرة)`;

    case 'guided_generate': {
      const answersText = Object.entries(guidedAnswers ?? {})
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');

      const fieldHint = resolveGuidedFieldHint(targetField ?? '');

      return `${BASE}

مهمتك: توليد محتوى احترافي عالي الجودة لحقل "${targetField}" بناءً على إجابات المستخدم.

إجابات المستخدم:
${answersText || '(لا توجد إجابات)'}

${fieldHint}

أعطني JSON بالشكل التالي فقط:
{
  "text": "شرح موجز لما ولّدته",
  "content": "المحتوى الاحترافي هنا",
  "tips": ["نصيحة 1", "نصيحة 2"]
}

القواعد:
- اعتمد على إجابات المستخدم أساساً
- اجعل المحتوى مخصصاً تماماً وليس عاماً
- أسلوب احترافي مناسب للسوق الأردني والخليجي
- لا تخترع معلومات غير موجودة في الإجابات`;
    }

    default: // chat
      return `${BASE}

أنت في محادثة تفاعلية مع المستخدم. أجب بطبيعية وبإيجاز (100-150 كلمة). اقترح خطوات عملية تالية متى أمكن.`;
  }
}

// ─── User message builder ─────────────────────────────────────────────────────
function buildUserMessage(
  message: string,
  intent: Intent,
  form: FormSnapshot,
  existingContent?: string,
  guidedAnswers?: Record<string, string>,
  targetField?: string,
): string {
  const job = form.targetJobTitle || form.experience?.[0]?.jobTitle || 'غير محدد';
  const company = form.targetCompany || form.experience?.[0]?.companyName || form.experience?.[0]?.organization || '';
  const edu = form.education?.[0];

  switch (intent) {
    case 'generate_summary':
      return `اكتب نبذة شخصية لي. معلوماتي:
- المسمى المستهدف: ${job}${company ? `\n- الشركة المستهدفة: ${company}` : ''}
- التعليم: ${edu?.degree ?? ''} ${edu?.major ?? ''} — ${edu?.university ?? ''}
- الخبرة: ${form.isRecentGraduate ? 'حديث التخرج' : `${form.experience?.length ?? 0} خبرات عملية`}
- المهارات: ${[...(form.technicalSkills ?? []), ...(form.softSkills ?? [])].slice(0, 5).join(', ') || 'لم تُحدَّد بعد'}
طلبي: ${message}`;

    case 'write_responsibilities':
      return `اكتب مسؤوليات وظيفية لمنصب "${job}"${company ? ` في "${company}"` : ''}.
طلبي: ${message}`;

    case 'write_achievements':
      return `اكتب إنجازات مهنية لمنصب "${job}"${company ? ` في "${company}"` : ''}.
طلبي: ${message}`;

    case 'suggest_skills':
      return `اقترح مهارات لـ "${job}". تخصصي: ${edu?.major ?? 'غير محدد'}. مهاراتي الحالية: ${[...(form.technicalSkills ?? [])].join(', ') || 'لا يوجد'}.
طلبي: ${message}`;

    case 'improve_text':
      return `حسّن هذا النص: "${existingContent}". طلبي: ${message}`;

    case 'guided_generate': {
      const lines = Object.entries(guidedAnswers ?? {})
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
      return `ولّد محتوى احترافياً للحقل "${targetField}" بناءً على الإجابات التالية:\n${lines}\n\nطلب إضافي: ${message}`;
    }

    default:
      return message;
  }
}

// ─── Response parser ──────────────────────────────────────────────────────────
function parseResponse(raw: string, intent: Intent, targetField?: string): Record<string, unknown> {
  if (!needsStructuredOutput(intent)) {
    return { text: raw };
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

    const result: Record<string, unknown> = {
      text: parsed.text ?? 'تم إنشاء المحتوى بنجاح ✅',
      tips: parsed.tips ?? [],
      improvements: parsed.improvements ?? [],
    };

    if (intent === 'generate_summary' && parsed.content) {
      result.content = parsed.content;
      result.fillTarget = { fieldId: targetField ?? 'summary', value: parsed.content };
    } else if (intent === 'write_responsibilities' && parsed.content) {
      result.content = parsed.content;
      result.fillTarget = { fieldId: targetField ?? 'responsibilities', value: parsed.content };
    } else if (intent === 'write_achievements' && parsed.content) {
      result.content = parsed.content;
      result.fillTarget = { fieldId: targetField ?? 'achievements', value: parsed.content };
    } else if (intent === 'improve_text' && parsed.content) {
      result.content = parsed.content;
      if (targetField) result.fillTarget = { fieldId: targetField, value: parsed.content };
    } else if (intent === 'guided_generate' && parsed.content) {
      result.content = parsed.content;
      if (targetField) result.fillTarget = { fieldId: targetField, value: parsed.content };
    } else if (intent === 'suggest_skills') {
      result.technicalSkills = parsed.technicalSkills ?? [];
      result.softSkills = parsed.softSkills ?? [];
      if (targetField) {
        const skills = targetField === 'softSkills' ? result.softSkills : result.technicalSkills;
        result.fillTarget = { fieldId: targetField, value: skills };
      }
    }

    return result;
  } catch {
    return { text: raw };
  }
}

// ─── Guided field hint resolver ───────────────────────────────────────────────
function resolveGuidedFieldHint(targetField: string): string {
  if (targetField === 'summary') {
    return 'النبذة الشخصية: 3-4 جمل، 60-90 كلمة، بدون ضمير المتكلم "أنا"، تبدأ بالمسمى الوظيفي أو الكفاءة.';
  }
  if (targetField.includes('responsibilities')) {
    return 'المسؤوليات: 4-6 نقاط تبدأ بـ •، كل نقطة تبدأ بفعل نشط (أدار، نفّذ، طوّر، قاد...).';
  }
  if (targetField.includes('achievements') || targetField.includes('details')) {
    return 'الإنجازات: 3-5 نقاط بأسلوب STAR (فعل ماضٍ + إجراء + نتيجة قابلة للقياس بأرقام).';
  }
  if (targetField.includes('description')) {
    return 'وصف المشروع: 2-3 جمل تشرح ماهية المشروع، نوعه، دورك فيه، الأدوات أو الموارد المستخدمة (تقنية أو غير تقنية)، والنتيجة أو التأثير. لا تفترض أن المشروع برمجي — اعتمد على إجابات المستخدم فقط واكتب بأسلوب يناسب مجاله الفعلي.';
  }
  if (targetField === 'targetJobTitle') {
    return 'المسمى الوظيفي: يجب أن يكون احترافياً، واضحاً، ومطابقاً للمسميات الشائعة في سوق العمل.';
  }
  if (targetField.includes('skill') || targetField === 'skills') {
    return 'المهارات: اذكر مهارات محددة وقابلة للقياس، مع الأدوات والتقنيات المطلوبة في السوق.';
  }
  if (targetField === 'volunteerWork') {
    return 'العمل التطوعي: اذكر المنظمة، دورك، والأثر الذي أحدثته (أرقام إن أمكن).';
  }
  if (targetField === 'interests') {
    return 'الاهتمامات: اجعلها مهنية وذات صلة بمجال العمل حين الإمكان.';
  }
  return 'أنتج محتوى احترافياً مخصصاً للحقل المطلوب.';
}

// ─── Profile summary builder ──────────────────────────────────────────────────
function buildProfileSummary(form: FormSnapshot): string {
  const lines: string[] = [];

  if (form.fullName) lines.push(`الاسم: ${form.fullName}`);
  if (form.targetJobTitle) lines.push(`المسمى المستهدف: ${form.targetJobTitle}`);
  if (form.targetCompany) lines.push(`الشركة المستهدفة: ${form.targetCompany}`);
  if (form.city) lines.push(`الموقع: ${form.city}، ${form.country ?? 'الأردن'}`);
  lines.push(`المستوى: ${form.isRecentGraduate ? 'حديث التخرج' : 'لديه خبرة عملية'}`);
  if (form.summary) lines.push(`النبذة الحالية: ${form.summary.slice(0, 150)}`);

  if (form.education?.length) {
    const e = form.education[0];
    lines.push(`التعليم: ${e.degree ?? ''} ${e.major ?? ''} — ${e.university ?? ''} (${e.graduationDate ?? ''})`);
  }

  if (form.experience?.length) {
    lines.push(`الخبرات (${form.experience.length}):`);
    form.experience.slice(0, 2).forEach(exp => {
      lines.push(`  • ${exp.jobTitle ?? ''} في ${exp.companyName ?? exp.organization ?? ''} (${exp.startDate ?? ''} - ${exp.isPresent ? 'حتى الآن' : exp.endDate ?? ''})`);
      if (exp.responsibilities) lines.push(`    المسؤوليات: ${exp.responsibilities.slice(0, 100)}...`);
    });
  }

  const allSkills = [...(form.technicalSkills ?? []), ...(form.softSkills ?? [])];
  if (allSkills.length) lines.push(`المهارات: ${allSkills.join(', ')}`);

  if (form.certifications?.length) {
    lines.push(`الشهادات: ${form.certifications.map(c => c.certName ?? c.title ?? '').filter(Boolean).join(', ')}`);
  }

  if (form.projects?.length) {
    lines.push(`المشاريع: ${form.projects.map(p => p.projectName ?? p.title ?? '').filter(Boolean).join(', ')}`);
  }

  return lines.join('\n') || 'لم يتم إدخال بيانات بعد';
}

function stepName(step: number): string {
  const names: Record<number, string> = {
    1: 'المسمى الوظيفي المستهدف',
    2: 'المعلومات الشخصية',
    3: 'الهدف الوظيفي / النبذة',
    6: 'المهارات',
    7: 'الدورات والشهادات',
    8: 'المشاريع',
    9: 'الإنجازات',
    10: 'معلومات إضافية',
  };
  return names[step] ?? `الخطوة ${step}`;
}

// ─── Offline fallback ─────────────────────────────────────────────────────────
function fallbackResponse(message: string, intent: Intent | undefined, form: FormSnapshot): Record<string, unknown> {
  const job = form.targetJobTitle || 'المسمى المستهدف';
  const name = form.fullName || '';

  switch (intent) {
    case 'generate_summary':
      return {
        text: 'مفتاح OPENAI_API_KEY غير موجود. إليك نموذج للنبذة يمكنك تعديله:',
        content: `${name ? `${name} هو` : 'متخصص في'} ${job}، يتمتع بخلفية أكاديمية قوية وشغف بالتطوير المهني المستمر. يسعى لتقديم قيمة مضافة للمؤسسات من خلال مهاراته التقنية وقدرته على العمل ضمن الفريق وتحقيق الأهداف في الوقت المحدد.`,
        tips: ['أضف سنوات الخبرة', 'اذكر أبرز مهاراتك', 'خصص للشركة المستهدفة'],
        fillTarget: { fieldId: 'summary', value: '' },
      };
    case 'suggest_skills':
      return {
        text: 'أضف OPENAI_API_KEY في .env.local للحصول على اقتراحات مخصصة.',
        technicalSkills: ['Microsoft Office', 'تحليل البيانات', 'إدارة المشاريع'],
        softSkills: ['العمل الجماعي', 'حل المشكلات', 'التواصل الفعّال', 'إدارة الوقت'],
        tips: ['أضف مهارات تقنية خاصة بمجالك'],
      };
    default:
      return {
        text: `مرحباً${name ? ` ${name}` : ''}! أضف OPENAI_API_KEY في ملف .env.local:\n\nOPENAI_API_KEY=sk-...\n\nبعدها سأكون قادراً على مساعدتك بشكل كامل.`,
      };
  }
}

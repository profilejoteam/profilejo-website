export interface SummaryPromptContext {
  fullName: string
  targetJobTitle: string
  targetCompany?: string
  experienceYears?: number
  topSkills?: string[]
  education?: string
  isRecentGraduate?: boolean
}

export function buildSummaryPrompt(ctx: SummaryPromptContext): string {
  const yearsText = ctx.experienceYears
    ? `خبرة ${ctx.experienceYears} سنة`
    : ctx.isRecentGraduate
    ? 'حديث/ة التخرج'
    : ''

  const skillsText =
    ctx.topSkills && ctx.topSkills.length > 0
      ? `أبرز مهاراته/ها: ${ctx.topSkills.slice(0, 5).join('، ')}`
      : ''

  return `أنت خبير موارد بشرية محترف. اكتب نبذة شخصية احترافية (Professional Summary) باللغة العربية لشخص بالمواصفات التالية:
- الاسم: ${ctx.fullName || 'المتقدم'}
- المسمى الوظيفي المستهدف: ${ctx.targetJobTitle}
${ctx.targetCompany ? `- الشركة المستهدفة: ${ctx.targetCompany}` : ''}
${yearsText ? `- المستوى: ${yearsText}` : ''}
${ctx.education ? `- التعليم: ${ctx.education}` : ''}
${skillsText ? `- ${skillsText}` : ''}

المتطلبات:
- النبذة 3-4 جمل متماسكة (50-80 كلمة)
- ابدأ بالمسمى الوظيفي أو الكفاءة المميزة
- اذكر أبرز القيمة التي يقدمها للشركة
- أسلوب واثق ومهني، تجنب ضمير المتكلم
- خصصها للسوق الأردني/الخليجي
- لا تضع عناوين أو رموز، فقط الفقرة النصية`
}

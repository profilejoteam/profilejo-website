export interface SkillsPromptContext {
  jobTitle: string
  major?: string
  existingSkills?: string[]
  isRecentGraduate?: boolean
}

export function buildSkillsPrompt(ctx: SkillsPromptContext): string {
  const existingText =
    ctx.existingSkills && ctx.existingSkills.length > 0
      ? `\nالمهارات الموجودة: ${ctx.existingSkills.join('، ')}`
      : ''

  return `أنت خبير موارد بشرية محترف. اقترح قائمة مهارات تقنية وشخصية باللغة العربية لـ:
- المسمى الوظيفي: ${ctx.jobTitle}
${ctx.major ? `- التخصص: ${ctx.major}` : ''}
${ctx.isRecentGraduate !== undefined ? `- المستوى: ${ctx.isRecentGraduate ? 'حديث التخرج' : 'محترف ذو خبرة'}` : ''}
${existingText}

المطلوب: أعطني قائمتين:

**المهارات التقنية (Technical Skills):**
اذكر 6-8 مهارات تقنية أساسية مفصولة بـ ، (فاصلة)

**المهارات الشخصية (Soft Skills):**
اذكر 4-5 مهارات شخصية مفصولة بـ ، (فاصلة)

الشرط: ملائمة لسوق العمل الأردني والخليجي، حديثة ومطلوبة فعلاً`
}

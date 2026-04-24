export interface AchievementsPromptContext {
  jobTitle: string
  companyName?: string
  responsibilities?: string
  existingText?: string
}

export function buildAchievementsPrompt(ctx: AchievementsPromptContext): string {
  return `أنت خبير موارد بشرية محترف. اكتب قائمة إنجازات مهنية باللغة العربية للمنصب التالي:
- المسمى الوظيفي: ${ctx.jobTitle}
${ctx.companyName ? `- الشركة: ${ctx.companyName}` : ''}
${ctx.responsibilities ? `- المسؤوليات: ${ctx.responsibilities.slice(0, 200)}` : ''}
${ctx.existingText ? `\nالنص الموجود (طوّره):\n${ctx.existingText}` : ''}

المتطلبات:
- 3-5 إنجازات ملموسة
- استخدم أرقاماً ونسباً مئوية (مثال: "زيادة المبيعات بنسبة 25%")
- نمط STAR: الموقف ← الإجراء ← النتيجة
- ابدأ كل إنجاز بفعل نشط في الماضي (حقق، طوّر، خفّض، زاد...)
- كل إنجاز في سطر يبدأ بـ •
- تجنب الغموض، كن محدداً`
}

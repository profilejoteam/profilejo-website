export interface ResponsibilitiesPromptContext {
  jobTitle: string
  companyName?: string
  industry?: string
  existingText?: string
}

export function buildResponsibilitiesPrompt(ctx: ResponsibilitiesPromptContext): string {
  return `أنت خبير موارد بشرية محترف. اكتب قائمة مسؤوليات وظيفية احترافية باللغة العربية للمنصب التالي:
- المسمى الوظيفي: ${ctx.jobTitle}
${ctx.companyName ? `- الشركة: ${ctx.companyName}` : ''}
${ctx.industry ? `- المجال: ${ctx.industry}` : ''}
${ctx.existingText ? `\nالنص الموجود حالياً (طوّره وحسّنه):\n${ctx.existingText}` : ''}

المتطلبات:
- 4-6 نقاط مسؤولية
- ابدأ كل نقطة بفعل نشط (أدار، طوّر، نفّذ، حلّل...)
- اجعلها قابلة للقياس حيثما أمكن
- ملائمة لسوق العمل الأردني
- لا تستخدم عناوين أو رموز، فقط النقاط المرقمة
- كل نقطة في سطر منفصل تبدأ بـ •`
}

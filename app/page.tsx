'use client'

import HeroSection from '@/components/HeroSection'
import ServicesSection from '@/components/ServicesSection'
import PricingSection from '@/components/PricingSection'
import FeaturesSection from '@/components/FeaturesSection'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import FAQSection from '@/components/FAQSection'
import ContactFooterSection from '@/components/ContactFooterSection'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const handlePlanSelect = (plan: any) => {
    // Redirect to form page with selected plan
    router.push('/form')
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <PricingSection onPlanSelect={handlePlanSelect} />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactFooterSection />
    </main>
  )
}

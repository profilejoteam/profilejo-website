'use client'

import HeroSection from '@/components/HeroSection'
import ServicesSection from '@/components/ServicesSection'
import FeaturesSection from '@/components/FeaturesSection'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import FAQSection from '@/components/FAQSection'
import ContactFooterSection from '@/components/ContactFooterSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactFooterSection />
    </main>
  )
}

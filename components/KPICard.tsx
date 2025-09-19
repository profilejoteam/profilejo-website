import React from 'react'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink'
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'text-blue-100',
    accent: 'bg-blue-100 text-blue-600'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'text-green-100',
    accent: 'bg-green-100 text-green-600'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'text-purple-100',
    accent: 'bg-purple-100 text-purple-600'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    icon: 'text-orange-100',
    accent: 'bg-orange-100 text-orange-600'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    icon: 'text-red-100',
    accent: 'bg-red-100 text-red-600'
  },
  pink: {
    bg: 'from-pink-500 to-pink-600',
    icon: 'text-pink-100',
    accent: 'bg-pink-100 text-pink-600'
  }
}

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color 
}: KPICardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10"></div>
        <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-white/5"></div>
      </div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-lg p-2 ${colors.icon} bg-white/20`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${colors.accent}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white/80">{title}</h3>
          <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString('ar-JO') : value}</p>
          {subtitle && (
            <p className="text-xs text-white/70">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
/**
 * Quick Start Templates
 * Pre-configured product templates for fast setup
 */

import { Zap, Shield, TrendingUp, Gift } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: typeof Zap;
  prompt: string;
  color: string;
}

const templates: Template[] = [
  {
    id: 'conservative-rc',
    name: 'Conservative RC',
    description: 'High barrier, moderate coupon',
    icon: Shield,
    prompt: 'Create a conservative reverse convertible with 75% barrier and 8% annual coupon for 12 months',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'aggressive-rc',
    name: 'Aggressive RC',
    description: 'Lower barrier, high coupon',
    icon: TrendingUp,
    prompt: 'Create an aggressive reverse convertible with 60% barrier and 15% annual coupon for 12 months',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'full-protection',
    name: 'Full Protection CPPN',
    description: '100% protected, leveraged upside',
    icon: Shield,
    prompt: 'Create a capital protected note with 100% protection and 120% participation for 12 months',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'bonus-hunter',
    name: 'Bonus Hunter',
    description: 'Bonus certificate with cushion',
    icon: Gift,
    prompt: 'Create a bonus certificate with 108% bonus level and 65% barrier for 12 months',
    color: 'from-purple-500 to-pink-500',
  },
];

interface QuickTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickTemplates({ onSelectTemplate, disabled }: QuickTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.prompt)}
            disabled={disabled}
            className="group relative p-5 bg-white border-2 border-slate-200 hover:border-indigo-300 rounded-2xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <h4 className="font-bold text-slate-800 mb-1">{template.name}</h4>
            <p className="text-sm text-slate-600">{template.description}</p>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </button>
        );
      })}
    </div>
  );
}


'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Basic',
    description: 'Basic features. Get started completely for free.',
    features: ['Core Features', 'Limited Storage', 'Ticket Support'],
    cta: 'Get started - 100% Free'
  },
  {
    name: 'Pro',
    description: 'Get access to advanced features for increased productivity.',
    features: [
      'All features of the basic plan',
      'Increased Storage',
      'Advanced Analytics',
      'Reporting Tools',
      'Third-Party Integrations',
      'E-Mail Support'
    ],
    cta: 'Buy Pro'
  },
  {
    name: 'Premium',
    description: 'Exclusive features and priority support for businesses.',
    features: [
      'All features of the Pro plan',
      'Unlimited Storage',
      'End-to-End Encryption',
      'Predictive Insights',
      'Early-Access',
      'Dedicated Account Manager',
      '24/7 Dedicated Customer Support'
    ],
    cta: 'Buy Premium'
  }
];

const featuresTable = [
  {
    name: 'Core Features',
    basic: true,
    pro: true,
    premium: true
  },
  {
    name: 'Increased Storage',
    basic: false,
    pro: true,
    premium: true
  },
  {
    name: 'Unlimited Storage',
    basic: false,
    pro: false,
    premium: true
  },
  {
    name: 'Advanced Analytics',
    basic: false,
    pro: true,
    premium: true
  },
  {
    name: 'End-to-End Encryption',
    basic: false,
    pro: false,
    premium: true
  },
  {
    name: 'Support',
    basic: 'Ticket Support',
    pro: 'E-Mail Support',
    premium: '24/7 Dedicated Support'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Pricing Plans</h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="flex flex-col rounded-2xl w-full bg-white text-gray-800 shadow-xl p-8"
            >
              <div className="text-3xl text-center font-bold pb-6">{plan.name}</div>
              <div className="text-center text-lg pb-12">{plan.description}</div>
              <div className="flex flex-col gap-3 text-base">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex flex-row gap-3 items-center">
                    <Check className="text-green-600" strokeWidth={3} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex-grow" />
              <div className="flex pt-10">
                <Button className="w-full bg-[#f3aa00] text-white font-bold text-base p-3 rounded-lg hover:bg-purple-800 active:scale-95 transition-transform">
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-xl">
            <thead>
              <tr>
                <th className="text-left p-4 border-b font-medium">Feature</th>
                <th className="text-center p-4 border-b font-medium">Basic</th>
                <th className="text-center p-4 border-b font-medium">Pro</th>
                <th className="text-center p-4 border-b font-medium">Premium</th>
              </tr>
            </thead>
            <tbody>
              {featuresTable.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-4 font-medium text-gray-700">{row.name}</td>
                  <td className="text-center p-4">
                    {typeof row.basic === 'string' ? row.basic : row.basic ? <Check className="mx-auto text-green-600" /> : '-'}
                  </td>
                  <td className="text-center p-4">
                    {typeof row.pro === 'string' ? row.pro : row.pro ? <Check className="mx-auto text-green-600" /> : '-'}
                  </td>
                  <td className="text-center p-4">
                    {typeof row.premium === 'string' ? row.premium : row.premium ? <Check className="mx-auto text-green-600" /> : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

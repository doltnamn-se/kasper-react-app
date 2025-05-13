
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Pricing = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Pricing Plans</h1>
      <p className="mb-8">
        Choose the plan that fits your needs.
      </p>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold">1 Month</h2>
          <p className="text-2xl font-bold mt-2">299 kr</p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Personal data protection
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Standard features
            </li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <h2 className="text-xl font-semibold">12 Months</h2>
          <p className="text-2xl font-bold mt-2">199 kr</p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mt-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            Popular
          </div>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Personal data protection
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Extended features
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority support
            </li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold">24 Months</h2>
          <p className="text-2xl font-bold mt-2">149 kr</p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Personal data protection
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All features
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Premium support
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Best value
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Support = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      <p className="mb-8">
        We're here to help. Contact our support team with any questions or issues.
      </p>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Email Support</h2>
          <p className="mb-4">
            Send us an email and we'll get back to you within 24 hours.
          </p>
          <a 
            href="mailto:support@digitaltskydd.se" 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Email Support
          </a>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
          <p className="mb-4">
            Browse our knowledge base for answers to common questions.
          </p>
          <a 
            href="https://digitaltskydd.se/faq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Visit Knowledge Base
          </a>
        </div>
      </div>
    </div>
  );
};

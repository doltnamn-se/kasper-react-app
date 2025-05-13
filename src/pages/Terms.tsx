
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Terms = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        This page contains the terms of service for DigitaltSkydd.
      </p>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Welcome to DigitaltSkydd. By using our service, you agree to these terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Usage</h2>
          <p>
            Our services are provided for personal and business privacy protection.
          </p>
        </section>
      </div>
    </div>
  );
};

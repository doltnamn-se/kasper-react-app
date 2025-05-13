
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This page outlines our privacy policy and how we handle your data.
      </p>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Data Collection</h2>
          <p>
            We collect only the information necessary to provide our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Data Usage</h2>
          <p>
            Your data is used solely for providing and improving our services.
          </p>
        </section>
      </div>
    </div>
  );
};

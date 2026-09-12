import React from 'react';
import { LegalView } from '../LegalViews';

interface PrivacyPolicySubPageProps {
  onBack: () => void;
}

export const PrivacyPolicySubPage = ({ onBack }: PrivacyPolicySubPageProps) => {
  return <LegalView onBack={onBack} type="privacy" />;
};

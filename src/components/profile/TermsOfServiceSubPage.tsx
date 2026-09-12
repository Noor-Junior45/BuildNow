import React from 'react';
import { LegalView } from '../LegalViews';

interface TermsOfServiceSubPageProps {
  onBack: () => void;
}

export const TermsOfServiceSubPage = ({ onBack }: TermsOfServiceSubPageProps) => {
  return <LegalView onBack={onBack} type="terms" />;
};

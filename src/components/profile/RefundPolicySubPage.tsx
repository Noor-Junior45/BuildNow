import React from 'react';
import { RefundPolicy } from '../RefundPolicy';

interface RefundPolicySubPageProps {
  onBack: () => void;
  onContactSupport?: () => void;
}

export const RefundPolicySubPage = ({
  onBack,
  onContactSupport
}: RefundPolicySubPageProps) => {
  return (
    <RefundPolicy
      onBack={onBack}
      onContactSupport={onContactSupport}
    />
  );
};


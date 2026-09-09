import React from 'react';
import { RefundPolicy } from '../RefundPolicy';

interface RefundPolicySubPageProps {
  onBack: () => void;
  onContactSupport?: () => void;
}

export const RefundPolicySubPage: React.FC<RefundPolicySubPageProps> = ({
  onBack,
  onContactSupport
}) => {
  return (
    <RefundPolicy
      onBack={onBack}
      onContactSupport={onContactSupport}
    />
  );
};


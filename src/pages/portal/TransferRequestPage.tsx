import React from 'react';
import { TransferRequestForm } from '@/components/TransferRequestForm';

export const TransferRequestPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <TransferRequestForm />
    </div>
  );
};

export default TransferRequestPage;

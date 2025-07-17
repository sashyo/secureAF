import React from 'react';
import { Authenticated, Unauthenticated } from '@tidecloak/react';
import { VaultProvider } from '@/contexts/VaultContext';
import { VaultLogin } from '@/components/VaultLogin';
import { VaultDashboard } from '@/components/VaultDashboard';

const Index = () => {
  return (
    <>
      <Unauthenticated>
        <VaultLogin />
      </Unauthenticated>
      
      <Authenticated>
        <VaultProvider>
          <VaultDashboard />
        </VaultProvider>
      </Authenticated>
    </>
  );
};

export default Index;

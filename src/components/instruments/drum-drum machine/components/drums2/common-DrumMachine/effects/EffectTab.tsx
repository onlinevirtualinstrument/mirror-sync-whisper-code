
import React, { ReactNode } from 'react';
import { TabsContent } from '@/components/ui/tabs';

interface EffectTabProps {
  value: string;
  children: ReactNode;
}

const EffectTab = ({ value, children }: EffectTabProps) => {
  return (
    <TabsContent value={value} className="space-y-4 py-2">
      {children}
    </TabsContent>
  );
};

export default EffectTab;

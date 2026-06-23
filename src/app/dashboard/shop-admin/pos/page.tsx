'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PosHeader } from '@/features/pos/components/PosHeader';
import { SaleTabNavigation } from '@/features/pos/components/SaleTabNavigation';
import { SaleWorkspace } from '@/features/pos/components/SaleWorkspace';
import { usePosStore } from '@/features/pos/store/usePosStore';
import { toast } from 'react-hot-toast';

export default function POSPage() {
  const { saleTabs } = usePosStore();
  const [mounted, setMounted] = useState(false);
  const notified = useRef(false);

  // Fix hydration mismatch by only rendering after mount, and handle recovery toast
  useEffect(() => {
    setMounted(true);
    
    if (!notified.current) {
      notified.current = true;
      // If we boot up and there is more than 1 tab, OR the 1 tab has items, we consider it a recovery
      const hasRecoveredData = saleTabs.length > 1 || saleTabs[0].cart.length > 0 || saleTabs[0].status !== 'draft';
      if (hasRecoveredData) {
        toast.success(`Recovered Previous POS Session (${saleTabs.length} active sales restored)`, {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#006970',
            color: '#fff',
            fontWeight: '600'
          }
        });
      }
    }
  }, [saleTabs]);

  if (!mounted) return null; // Avoid hydration mismatch for Zustand persist

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
      <PosHeader />
      <SaleTabNavigation />
      <SaleWorkspace />
    </div>
  );
}

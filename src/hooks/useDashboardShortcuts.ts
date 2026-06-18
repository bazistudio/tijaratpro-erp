import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useDashboardShortcuts = () => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Shift + {Key}
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            router.push('/dashboard/shop-admin/customers?tab=customers');
            break;
          case 'l':
            e.preventDefault();
            router.push('/dashboard/shop-admin/customers?tab=ledger');
            break;
          case 'a':
            e.preventDefault();
            router.push('/dashboard/shop-admin/customers?tab=analytics');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
};

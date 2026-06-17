import React from 'react';

export const metadata = {
  title: 'POS | TijaratPro',
  description: 'Point of Sale Workspace',
};

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden text-gray-900 dark:text-gray-100 font-sans">
      {/* 
        This layout is completely isolated from the dashboard.
        No sidebar, no standard topbar. Just the pure POS workspace.
      */}
      {children}
    </div>
  );
}

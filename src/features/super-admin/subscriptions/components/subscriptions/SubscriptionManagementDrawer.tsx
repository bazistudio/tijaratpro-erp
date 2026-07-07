'use client';
import React from 'react';
import { SubscriptionDetailCard } from './SubscriptionDetailCard';

interface DrawerProps {
  subscriptionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionManagementDrawer: React.FC<DrawerProps> = ({ subscriptionId, isOpen, onClose }) => {
  if (!isOpen || !subscriptionId) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[800px] bg-gray-50 shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Manage Subscription</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <SubscriptionDetailCard subscriptionId={subscriptionId} />
        </div>
      </div>
    </>
  );
};

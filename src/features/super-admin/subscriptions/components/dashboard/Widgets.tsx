import React from 'react';
import Link from 'next/link';

export const ExpiryAlertWidget = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Expiring Soon</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No subscriptions expiring in the next 7 days.</p>
      ) : (
        <ul className="space-y-4">
          {data.map((sub, i) => {
            const daysRemaining = Math.max(0, Math.ceil((new Date(sub.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
            
            return (
              <li key={i} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{typeof sub.ownerId === 'string' ? sub.ownerId : sub.ownerId?.name || sub.ownerId?._id || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{sub.package}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    {daysRemaining === 0 ? 'Today' : `in ${daysRemaining} days`}
                  </p>
                  <Link href={`/dashboard/super-admin/subscriptions/${sub._id}`} className="text-xs text-blue-600 hover:underline">
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const RecentActivityFeed = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Recent Activity</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity.</p>
      ) : (
        <div className="space-y-4">
          {data.map((event, i) => (
            <div key={i} className="flex space-x-3 text-sm">
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500 ring-2 ring-blue-100"></div>
                {i !== data.length - 1 && <div className="h-full w-px bg-gray-200 mt-2"></div>}
              </div>
              <div className="pb-4 flex-1">
                <p className="text-gray-900 font-medium">
                  {event.ownerType === 'ORGANIZATION' ? 'Organization' : 'Shop'} {event.action}
                </p>
                {event.notes && <p className="text-gray-500 text-xs mt-1">{event.notes}</p>}
                <p className="text-gray-400 text-xs mt-1">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

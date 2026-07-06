"use client";

import React, { useEffect, useState } from 'react';
import { getRequests, approveRequest, rejectRequest, OrganizationRequest } from '@/lib/api/organization-requests.api';

export default function SuperAdminRequestsPage() {
  const [requests, setRequests] = useState<OrganizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert('Error approving request: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return; // cancelled
    try {
      await rejectRequest(id, reason);
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert('Error rejecting request: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-6">Loading requests...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Organization Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">No requests found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-sm rounded-lg border">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3">Business Name</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{req.name}</td>
                  <td className="px-6 py-4">
                    {req.ownerId?.name}<br/>
                    <span className="text-xs text-gray-500">{req.ownerId?.email}</span><br/>
                    {req.ownerId?.phone && <span className="text-xs text-gray-400">{req.ownerId.phone}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="block">{req.accountType}</span>
                    <span className="text-xs text-gray-400">{req.businessType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                      ${req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

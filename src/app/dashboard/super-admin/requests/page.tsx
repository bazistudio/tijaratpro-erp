"use client";

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getRequests, approveRequest, rejectRequest, deleteRequest, OrganizationRequest } from '@/lib/api/organization-requests.api';

export default function SuperAdminRequestsPage() {
  const [requests, setRequests] = useState<OrganizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, action: 'APPROVE' | 'REJECT' | 'DELETE' | null, id: string | null, reason?: string }>({ isOpen: false, action: null, id: null });
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [planDuration, setPlanDuration] = useState('15_days');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getRequests();
      // Filter out APPROVED requests since they are now in Active Tenants
      setRequests(data.filter(req => req.status !== 'APPROVED'));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (id: string) => {
    setModalConfig({ isOpen: true, action: 'APPROVE', id });
  };

  const handleReject = (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return; // cancelled
    setModalConfig({ isOpen: true, action: 'REJECT', id, reason });
  };

  const handleDelete = (id: string) => {
    setModalConfig({ isOpen: true, action: 'DELETE', id });
  };

  const handleConfirmAction = async () => {
    if (!adminPassword) {
      alert("Super admin password is required");
      return;
    }
    if (!modalConfig.id || !modalConfig.action) return;

    try {
      setIsProcessing(true);
      if (modalConfig.action === 'APPROVE') {
        await approveRequest(modalConfig.id, adminPassword, planDuration);
      } else if (modalConfig.action === 'REJECT') {
        await rejectRequest(modalConfig.id, modalConfig.reason || 'No reason provided', adminPassword);
      } else if (modalConfig.action === 'DELETE') {
        await deleteRequest(modalConfig.id, adminPassword);
      }
      
      setModalConfig({ isOpen: false, action: null, id: null });
      setAdminPassword('');
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, action: null, id: null });
    setAdminPassword('');
    setShowPassword(false);
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
                    {req.tempPassword && <><br/><span className="text-xs font-mono text-red-500">Pwd: {req.tempPassword}</span></>}
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
                  <td className="px-6 py-4 flex flex-wrap gap-2">
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
                    <button
                      onClick={() => handleDelete(req._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please enter your super admin password to {modalConfig.action?.toLowerCase()} this request.
              {modalConfig.action === 'DELETE' && ' This action is permanent and cannot be undone.'}
            </p>
            
            {modalConfig.action === 'APPROVE' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Package Plan</label>
                <select
                  value={planDuration}
                  onChange={(e) => setPlanDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="15_days">15 Day Demo</option>
                  <option value="1_month">1 Month</option>
                  <option value="1_year">1 Year</option>
                  <option value="2_years">2 Years</option>
                  <option value="3_years">3 Years</option>
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter password"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmAction();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing || !adminPassword}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  modalConfig.action === 'DELETE' || modalConfig.action === 'REJECT' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

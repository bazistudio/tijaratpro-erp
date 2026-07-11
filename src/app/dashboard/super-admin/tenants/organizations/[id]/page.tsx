"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/features/super-admin/services/admin.api";
import { SecurityVerificationModal } from "@/features/super-admin/components/SecurityVerificationModal";
import { DecreaseLimitDialog } from "@/features/super-admin/components/DecreaseLimitDialog";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function OrganizationControlCenter() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const [isDecreaseDialogOpen, setIsDecreaseDialogOpen] = useState(false);
  const [newLimitInput, setNewLimitInput] = useState("");

  const [newExpiryInput, setNewExpiryInput] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrganizationDetails(id);
      setData(res);
      if (res.subscription?.expiresAt) {
        setNewExpiryInput(format(new Date(res.subscription.expiresAt), 'yyyy-MM-dd'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const requireSuperAdminPassword = (actionData: any) => {
    setPendingAction(actionData);
    setIsSecurityModalOpen(true);
  };

  const onSecurityVerified = async (password: string) => {
    setIsSecurityModalOpen(false);
    if (!pendingAction) return;

    try {
      if (pendingAction.type === "INCREASE_LIMIT") {
        await adminApi.updateOrganizationLimits({
          orgId: id,
          maxBranches: pendingAction.payload.newLimit,
          password
        });
      } else if (pendingAction.type === "DECREASE_LIMIT") {
        await adminApi.updateOrganizationLimits({
          orgId: id,
          maxBranches: pendingAction.payload.newLimit,
          branchesToDeactivate: pendingAction.payload.branchesToDeactivate,
          reason: pendingAction.payload.reason,
          password
        });
        setIsDecreaseDialogOpen(false);
      } else if (pendingAction.type === "EXTEND_SUBSCRIPTION") {
        await adminApi.updateSubscription({
          orgId: id,
          expiresAt: pendingAction.payload.expiresAt,
          password
        });
      } else if (pendingAction.type === "SUSPEND") {
        await adminApi.suspendTenant({ tenantId: id, password });
      } else if (pendingAction.type === "RESTORE") {
        await adminApi.restoreTenant({ tenantId: id, password });
      }

      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setPendingAction(null);
    }
  };

  const handleUpdateLimit = () => {
    const newLimit = parseInt(newLimitInput, 10);
    if (isNaN(newLimit) || newLimit < 1) return alert("Invalid limit");

    const activeCount = data.branches.filter((b: any) => b.status === 'ACTIVE').length;

    if (newLimit >= activeCount) {
      // Safe to just increase
      requireSuperAdminPassword({
        type: "INCREASE_LIMIT",
        payload: { newLimit }
      });
    } else {
      // Need to decrease
      setIsDecreaseDialogOpen(true);
    }
  };

  const handleConfirmDecrease = (selectedBranchIds: string[], reason: string) => {
    const newLimit = parseInt(newLimitInput, 10);
    requireSuperAdminPassword({
      type: "DECREASE_LIMIT",
      payload: { newLimit, branchesToDeactivate: selectedBranchIds, reason }
    });
  };

  const handleExtendSubscription = () => {
    if (!newExpiryInput) return alert("Select a date");
    requireSuperAdminPassword({
      type: "EXTEND_SUBSCRIPTION",
      payload: { expiresAt: new Date(newExpiryInput).toISOString() }
    });
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Organization Data...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data || !data.organization) return <div className="p-8">No data found.</div>;

  const { organization, subscription, branches, users, activity } = data;
  const activeBranches = branches.filter((b: any) => b.status === 'ACTIVE');
  const maxBranches = organization.limitsOverride?.maxBranches || 1;

  const renderTabs = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Business Information</h3>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Business Name</span>
                  <span className="font-medium text-gray-900">{organization.name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Account Type</span>
                  <span className="font-medium text-gray-900">{organization.accountType}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Owner Email</span>
                  <span className="font-medium text-gray-900">{organization.ownerEmail || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Owner Phone</span>
                  <span className="font-medium text-gray-900">{organization.ownerPhone || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Created At</span>
                  <span className="font-medium text-gray-900">{new Date(organization.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Global Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                {organization.status === 'ACTIVE' ? (
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 w-full md:w-auto"
                    onClick={() => requireSuperAdminPassword({ type: "SUSPEND" })}
                  >
                    Suspend Organization
                  </button>
                ) : (
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 w-full md:w-auto"
                    onClick={() => requireSuperAdminPassword({ type: "RESTORE" })}
                  >
                    Activate Organization
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      
      case "subscription":
        return (
          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Manual Subscription Management</h3>
              <p className="text-sm text-gray-500 mt-1">Extend or manage the current subscription details. Plan upgrades are not supported here yet.</p>
            </div>
            <div className="p-6 space-y-6">
              {subscription ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm max-w-md">
                    <div className="text-gray-500">Subscription ID</div>
                    <div className="font-medium text-gray-900 truncate">{subscription._id}</div>
                    
                    <div className="text-gray-500">Status</div>
                    <div className="font-medium text-gray-900">{subscription.status}</div>
                    
                    <div className="text-gray-500">Start Date</div>
                    <div className="font-medium text-gray-900">{new Date(subscription.startedAt).toLocaleDateString()}</div>
                    
                    <div className="text-gray-500">Current Expiry</div>
                    <div className="font-medium text-gray-900 text-blue-600">{new Date(subscription.expiresAt).toLocaleDateString()}</div>
                  </div>

                  <div className="pt-4 border-t max-w-md space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Extend Expiry Date</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="date" 
                        value={newExpiryInput} 
                        onChange={(e) => setNewExpiryInput(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                      />
                      <button 
                        onClick={handleExtendSubscription}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Extend
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">No active subscription found.</div>
              )}
            </div>
          </div>
        );

      case "branches":
        return (
          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Branch Management</h3>
              <p className="text-sm text-gray-500 mt-1">Increase or decrease the allowed branch limits for this organization.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Allowed Limit</p>
                  <p className="text-3xl font-semibold text-gray-900">{maxBranches}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Branches</p>
                  <p className="text-3xl font-semibold text-blue-600">{activeBranches.length}</p>
                </div>
              </div>

              <div className="pt-4 border-t max-w-md space-y-4">
                <label className="block text-sm font-medium text-gray-700">Change Branch Limit</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="New Limit"
                    value={newLimitInput}
                    onChange={(e) => setNewLimitInput(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  />
                  <button 
                    onClick={handleUpdateLimit} 
                    disabled={!newLimitInput || parseInt(newLimitInput) === maxBranches}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Update Limit
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  If the new limit is lower than the current active branches, you will be prompted to select branches to deactivate.
                </p>
              </div>

              <div className="pt-6">
                <h3 className="font-medium mb-3">All Branches</h3>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Branch Name</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Code</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((b: any) => (
                        <tr key={b._id} className="border-b last:border-0">
                          <td className="px-4 py-2 font-medium">{b.name}</td>
                          <td className="px-4 py-2 text-gray-500">{b.code}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Organization Users</h3>
            </div>
            <div className="p-6">
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">Name</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">Email</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">Role</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">Status</th>
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u._id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">{u.name}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.role}</td>
                        <td className="px-4 py-2">
                           <span className={`px-2 py-1 rounded text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {u.status || 'ACTIVE'}
                            </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{u.plainPassword || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activity.map((log: any) => (
                  <div key={log._id} className="border rounded p-3 flex flex-col space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <span className="text-sm text-gray-600">Resource: {log.resource}</span>
                    {log.metadata?.reason && (
                      <span className="text-sm text-gray-800 bg-gray-50 p-1 rounded italic w-fit mt-1">Reason: {log.metadata.reason}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <button 
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <span>{organization.name}</span>
            {organization.status === 'ACTIVE' ? (
              <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE
              </span>
            ) : (
              <span className="flex items-center text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                <AlertCircle className="w-3 h-3 mr-1" /> SUSPENDED
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Owner: {organization.ownerEmail}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-8 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Subscription</p>
            <p className="font-medium text-gray-900">{organization.subscriptionPlan || 'CUSTOM'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Expires</p>
            <p className="font-medium text-gray-900">
              {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Branches</p>
            <p className="font-medium text-blue-600">{activeBranches.length} / {maxBranches}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        {["overview", "subscription", "branches", "users", "activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabs()}
      </div>

      {/* Security Verification */}
      <SecurityVerificationModal 
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={onSecurityVerified}
      />

      {/* Decrease Limit Dialog */}
      <DecreaseLimitDialog 
        isOpen={isDecreaseDialogOpen}
        onClose={() => setIsDecreaseDialogOpen(false)}
        currentLimit={maxBranches}
        newLimit={parseInt(newLimitInput, 10)}
        activeBranches={activeBranches}
        onConfirm={handleConfirmDecrease}
      />
    </div>
  );
}

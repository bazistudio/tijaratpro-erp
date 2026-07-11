import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface DecreaseLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
  newLimit: number;
  activeBranches: any[];
  onConfirm: (selectedBranchIds: string[], reason: string) => void;
}

export function DecreaseLimitDialog({
  isOpen,
  onClose,
  currentLimit,
  newLimit,
  activeBranches,
  onConfirm
}: DecreaseLimitDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const requiredDeactivations = activeBranches.length - newLimit;

  const toggleBranch = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size < requiredDeactivations) {
        next.add(id);
      }
    }
    setSelectedIds(next);
  };

  const handleConfirm = () => {
    if (selectedIds.size === requiredDeactivations && reason.trim()) {
      onConfirm(Array.from(selectedIds), reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Decrease Branch Capacity
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">
            You are reducing branch capacity.
            <br /><br />
            <strong>Current Limit:</strong> {currentLimit} <br />
            <strong>New Limit:</strong> {newLimit}
            <br /><br />
            Since there are <strong>{activeBranches.length}</strong> active branches, you must select exactly <strong>{requiredDeactivations}</strong> branch(es) to deactivate.
            <br />
            <em>Branch data will be preserved (changed to INACTIVE).</em>
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Select branches to deactivate ({selectedIds.size} / {requiredDeactivations}):
            </label>
            <div className="h-48 overflow-y-auto border rounded-md p-3 space-y-3 bg-gray-50">
              {activeBranches.map((branch) => (
                <label key={branch._id} className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${selectedIds.has(branch._id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100 border border-transparent'}`}>
                  <input 
                    type="checkbox"
                    checked={selectedIds.has(branch._id)}
                    onChange={() => toggleBranch(branch._id)}
                    disabled={!selectedIds.has(branch._id) && selectedIds.size >= requiredDeactivations}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <div className="text-sm flex-1">
                    <span className="font-medium">{branch.name}</span> <span className="text-gray-500 text-xs">({branch.code})</span>
                  </div>
                </label>
              ))}
              {activeBranches.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No active branches found.</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for deactivation</label>
            <input 
              id="reason"
              type="text"
              placeholder="e.g. Customer closed branch..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedIds.size !== requiredDeactivations || !reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Reduction
          </button>
        </div>
      </div>
    </div>
  );
}

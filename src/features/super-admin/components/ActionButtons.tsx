import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ActionButtonsProps {
  onApprove?: () => void;
  onSuspend?: () => void;
  onReject?: () => void;
  onDeletePermanently?: () => void;
  isApproving?: boolean;
  isSuspending?: boolean;
  isRejecting?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onApprove,
  onSuspend,
  onReject,
  onDeletePermanently,
  isApproving,
  isSuspending,
  isRejecting,
  isDeleting,
  disabled
}) => {
  return (
    <div className="flex items-center gap-2">
      {onApprove && (
        <button
          onClick={onApprove}
          disabled={disabled || isApproving || isSuspending}
          className={clsx(
            "flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors",
            "bg-emerald-600 hover:bg-emerald-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isApproving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Approve
        </button>
      )}
      
      {onSuspend && (
        <button
          onClick={onSuspend}
          disabled={disabled || isApproving || isSuspending || isRejecting || isDeleting}
          className={clsx(
            "flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors",
            "bg-orange-600 hover:bg-orange-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSuspending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Suspend
        </button>
      )}

      {onReject && (
        <button
          onClick={onReject}
          disabled={disabled || isApproving || isSuspending || isRejecting || isDeleting}
          className={clsx(
            "flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors",
            "bg-yellow-500 hover:bg-yellow-600",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isRejecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Reject
        </button>
      )}

      {onDeletePermanently && (
        <button
          onClick={onDeletePermanently}
          disabled={disabled || isApproving || isSuspending || isRejecting || isDeleting}
          className={clsx(
            "flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors",
            "bg-rose-600 hover:bg-rose-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Delete Permanently
        </button>
      )}
    </div>
  );
};

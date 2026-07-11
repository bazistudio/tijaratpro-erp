'use client';

import React, { useEffect, useState } from 'react';
import {
  X, Building2, GitBranch, AlertTriangle, CheckCircle2,
  ChevronRight, ChevronLeft, Lock, Loader2, ArrowDownCircle,
  User, FileText, Eye
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../services/admin.api';
import { SecurityVerificationModal } from './SecurityVerificationModal';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Branch {
  _id: string;
  name: string;
  code?: string;
  status: string;
  manager?: { name: string } | null;
}

interface ReduceBranchCapacityWizardProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  currentLimit: number;
  targetLimit: number;
  activeBranches: Branch[];
  onSuccess: () => void;
}

type WizardStep = 'summary' | 'select' | 'reason' | 'confirm';

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'select', label: 'Select Branches' },
  { key: 'reason', label: 'Reason' },
  { key: 'confirm', label: 'Confirm' },
];

function StepIndicator({ current }: { current: WizardStep }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < idx ? 'bg-orange-600 text-white' :
              i === idx ? 'bg-orange-600 text-white ring-4 ring-orange-100' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i < idx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${i === idx ? 'text-orange-700' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all ${i < idx ? 'bg-orange-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export const ReduceBranchCapacityWizard: React.FC<ReduceBranchCapacityWizardProps> = ({
  isOpen,
  onClose,
  orgId,
  orgName,
  currentLimit,
  targetLimit,
  activeBranches,
  onSuccess,
}) => {
  const [step, setStep] = useState<WizardStep>('summary');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const requiredDeactivations = Math.max(0, activeBranches.length - targetLimit);
  const needsBranchSelection = requiredDeactivations > 0;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('summary');
      setSelectedIds(new Set());
      setReason('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const reductionMutation = useMutation({
    mutationFn: (password: string) =>
      adminApi.updateOrganizationLimits({
        orgId,
        maxBranches: targetLimit,
        branchesToDeactivate: needsBranchSelection ? Array.from(selectedIds) : [],
        reason,
        password,
      }),
    onSuccess: () => {
      setShowPasswordModal(false);
      setSuccessMsg(`Branch capacity successfully reduced to ${targetLimit}.`);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    },
  });

  if (!isOpen) return null;

  // ── Step navigation ──
  const goNext = () => {
    if (step === 'summary') setStep(needsBranchSelection ? 'select' : 'reason');
    else if (step === 'select') setStep('reason');
    else if (step === 'reason') setStep('confirm');
    else if (step === 'confirm') setShowPasswordModal(true);
  };

  const goBack = () => {
    if (step === 'select') setStep('summary');
    else if (step === 'reason') setStep(needsBranchSelection ? 'select' : 'summary');
    else if (step === 'confirm') setStep('reason');
  };

  // ── Branch selection toggle ──
  const toggleBranch = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < requiredDeactivations) {
        next.add(id);
      }
      return next;
    });
  };

  // ── Validation per step ──
  const canProceed = () => {
    if (step === 'summary') return true;
    if (step === 'select') return selectedIds.size === requiredDeactivations;
    if (step === 'reason') return reason.trim().length >= 10;
    if (step === 'confirm') return true;
    return false;
  };

  const selectedBranches = activeBranches.filter((b) => selectedIds.has(b._id));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ArrowDownCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-base leading-tight">Reduce Branch Capacity</h2>
                <p className="text-orange-100 text-xs mt-0.5 truncate max-w-[240px]">{orgName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex-shrink-0">
            <StepIndicator current={step} />
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* ── STEP: Summary ── */}
            {step === 'summary' && (
              <>
                <p className="text-sm font-medium text-gray-700 mb-2">Review the capacity change before proceeding.</p>
                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  <InfoRow label="Organization" value={orgName} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
                  <InfoRow label="Current Limit" value={String(currentLimit)} icon={<GitBranch className="w-4 h-4 text-blue-500" />} valueClass="text-blue-700 font-bold" />
                  <InfoRow label="Current Active Branches" value={String(activeBranches.length)} icon={<GitBranch className="w-4 h-4 text-gray-400" />} />
                  <InfoRow label="Requested Limit" value={String(targetLimit)} icon={<ArrowDownCircle className="w-4 h-4 text-orange-500" />} valueClass="text-orange-700 font-bold" />
                  {needsBranchSelection && (
                    <InfoRow
                      label="Branches to Deactivate"
                      value={String(requiredDeactivations)}
                      icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                      valueClass="text-red-700 font-bold"
                    />
                  )}
                </div>

                {needsBranchSelection && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      You will need to select <strong>{requiredDeactivations}</strong> branch{requiredDeactivations > 1 ? 'es' : ''} to deactivate.
                      No data will be deleted — only branch status will change to INACTIVE.
                    </p>
                  </div>
                )}

                {!needsBranchSelection && (
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      No active branches need to be deactivated for this reduction. You only need to provide a reason and confirm.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── STEP: Select Branches ── */}
            {step === 'select' && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">Select branches to deactivate</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    selectedIds.size === requiredDeactivations
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedIds.size} / {requiredDeactivations}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select exactly <strong>{requiredDeactivations}</strong> branch{requiredDeactivations > 1 ? 'es' : ''}. These will be set to INACTIVE.
                </p>

                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {activeBranches.map((b) => {
                    const isSelected = selectedIds.has(b._id);
                    const isDisabled = !isSelected && selectedIds.size >= requiredDeactivations;
                    return (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => !isDisabled && toggleBranch(b._id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected ? 'bg-red-50' : isDisabled ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? 'bg-red-600 border-red-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{b.name}</p>
                          <p className="text-xs text-gray-400">
                            {b.code && <span className="mr-2">{b.code}</span>}
                            {b.manager?.name && <span className="flex items-center gap-1 inline-flex"><User className="w-3 h-3" />{b.manager.name}</span>}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            Will deactivate
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedIds.size < requiredDeactivations && (
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Please select {requiredDeactivations - selectedIds.size} more branch{requiredDeactivations - selectedIds.size > 1 ? 'es' : ''}.
                  </div>
                )}
              </>
            )}

            {/* ── STEP: Reason ── */}
            {step === 'reason' && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">Provide a reason for this reduction</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  This reason will be recorded in the audit log. Minimum 10 characters.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="e.g. Customer permanently closed these branches due to consolidation of operations..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${reason.trim().length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    {reason.trim().length} characters {reason.trim().length < 10 ? `(${10 - reason.trim().length} more needed)` : '✓'}
                  </span>
                </div>
              </>
            )}

            {/* ── STEP: Confirm ── */}
            {step === 'confirm' && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">Review and confirm</p>
                </div>

                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  <InfoRow label="Organization" value={orgName} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
                  <InfoRow label="Current Limit" value={String(currentLimit)} icon={<GitBranch className="w-4 h-4 text-blue-500" />} valueClass="text-blue-700 font-bold" />
                  <InfoRow label="New Limit" value={String(targetLimit)} icon={<ArrowDownCircle className="w-4 h-4 text-orange-500" />} valueClass="text-orange-700 font-bold" />
                </div>

                {needsBranchSelection && selectedBranches.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Branches to Deactivate</p>
                    <div className="rounded-xl border border-red-200 divide-y divide-red-100 overflow-hidden">
                      {selectedBranches.map((b) => (
                        <div key={b._id} className="flex items-center gap-3 px-4 py-2.5 bg-red-50">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">{b.name}</p>
                            {b.code && <p className="text-xs text-red-400">{b.code}</p>}
                          </div>
                          <span className="ml-auto text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            ACTIVE → INACTIVE
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">{reason}</p>
                </div>

                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    No sales, inventory, customers, invoices, ledger or reports will be deleted.
                    All historical data remains intact. Only branch status changes to INACTIVE.
                  </p>
                </div>

                {successMsg && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {reductionMutation.isError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{(reductionMutation.error as any)?.response?.data?.message || 'Operation failed. Please try again.'}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 gap-3">
            {step !== 'summary' ? (
              <button type="button" onClick={goBack}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button type="button" onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed() || reductionMutation.isPending || !!successMsg}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                step === 'confirm'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {step === 'confirm' ? (
                <><Lock className="w-4 h-4" />Confirm & Enter Password</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Password verification — final step */}
      <SecurityVerificationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={(password) => reductionMutation.mutate(password)}
        title="Confirm Branch Capacity Reduction"
        message={`Reducing ${orgName} from ${currentLimit} to ${targetLimit} branches. ${needsBranchSelection ? `${requiredDeactivations} branch(es) will be set to INACTIVE.` : ''} This action will be logged. Enter your Super Admin password to proceed.`}
        actionLabel="Confirm Reduction"
        isProcessing={reductionMutation.isPending}
      />
    </>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({
  label, value, icon, valueClass = 'text-gray-800 font-semibold'
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm text-gray-500 flex-1">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

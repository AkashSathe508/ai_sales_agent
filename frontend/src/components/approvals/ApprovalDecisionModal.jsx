import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ApprovalDecisionModal({
  isOpen,
  onClose,
  approvalItem,
  actionType, // 'Approve' | 'Reject' | 'Request Changes'
  onConfirm,
}) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !approvalItem) return null;

  const isApprove = actionType === 'Approve';
  const isReject = actionType === 'Reject';
  const isChanges = actionType === 'Request Changes';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm({
        id: approvalItem.id,
        proposalId: approvalItem.proposalId,
        action: actionType,
        notes: notes.trim(),
        timestamp: new Date().toLocaleTimeString(),
        reviewer: 'Executive Reviewer (org_demo)',
      });
      setIsSubmitting(false);
      setNotes('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isApprove
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : isReject
                ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            {isApprove && <CheckCircle className="h-5 w-5" />}
            {isReject && <XCircle className="h-5 w-5" />}
            {isChanges && <AlertTriangle className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isApprove
                ? 'Authorize Proposal & Trigger PPTX'
                : isReject
                ? 'Reject Proposal'
                : 'Request Changes to Proposal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {approvalItem.proposalId} • {approvalItem.customer}
            </p>
          </div>
        </div>

        {/* Content details */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Proposal Value:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {approvalItem.annualValue}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Calculated ROI:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {approvalItem.roi}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Policy Gate:</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {approvalItem.requiresGate}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reviewer Decision Notes{' '}
              {isApprove ? '(Optional)' : '<span className="text-red-500">*</span>'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isApprove
                  ? 'e.g. Terms reviewed and authorized for client presentation delivery.'
                  : isReject
                  ? 'Please state reason for policy rejection...'
                  : 'Specify the required pricing or scope modifications...'
              }
              required={!isApprove}
              className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {isApprove && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Authorizing releases the backend approval lock in{' '}
                <code className="font-mono text-[11px] font-semibold">_route_approval</code>,
                enabling presentation_tool to generate the PPTX deck.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              variant={isReject ? 'destructive' : isChanges ? 'outline' : 'default'}
              className={`text-xs gap-1.5 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              {isSubmitting ? (
                'Recording...'
              ) : isApprove ? (
                <>
                  <FileCheck className="h-3.5 w-3.5" />
                  Confirm Authorization
                </>
              ) : (
                `Confirm ${actionType}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApprovalDecisionModal;

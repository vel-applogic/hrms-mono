'use client';

import type { ReimbursementDetailResponseType, ReimbursementFeedbackResponseType } from '@repo/dto';
import { ReimbursementStatusDtoEnum } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Check, CheckCircle, DollarSign, ExternalLink, Pencil, ThumbsDown, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  addReimbursementFeedback,
  deleteReimbursementFeedback,
  getReimbursementById,
  updateReimbursementFeedback,
  updateReimbursementStatus,
} from '@/lib/action/reimbursement.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reimbursementId: number | null;
  isAdmin: boolean;
  onStatusChange: () => void;
}

const statusColorMap: Record<ReimbursementStatusDtoEnum, string> = {
  [ReimbursementStatusDtoEnum.pending]: 'bg-yellow-500/20 text-yellow-600',
  [ReimbursementStatusDtoEnum.approved]: 'bg-blue-500/20 text-blue-600',
  [ReimbursementStatusDtoEnum.paid]: 'bg-green-500/20 text-green-600',
  [ReimbursementStatusDtoEnum.rejected]: 'bg-red-500/20 text-red-600',
};

function FeedbackItem({
  fb,
  isAdmin,
  onUpdate,
  onDelete,
}: {
  fb: ReimbursementFeedbackResponseType;
  isAdmin: boolean;
  onUpdate: (id: number, message: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(fb.message);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!editMessage.trim()) return;
    setLoading(true);
    try {
      await onUpdate(fb.id, editMessage.trim());
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(fb.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-lg border border-border bg-card p-3'>
      {editing ? (
        <div className='flex flex-col gap-2'>
          <Input
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') {
                setEditing(false);
                setEditMessage(fb.message);
              }
            }}
          />
          <div className='flex justify-end gap-1'>
            <button
              type='button'
              onClick={() => { setEditing(false); setEditMessage(fb.message); }}
              disabled={loading}
              className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
            >
              <X className='h-3.5 w-3.5' />
            </button>
            <button
              type='button'
              onClick={handleSave}
              disabled={loading || !editMessage.trim()}
              className='rounded p-1 text-primary hover:bg-primary/10 disabled:opacity-50'
            >
              <Check className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className='text-sm'>{fb.message}</p>
          <div className='mt-1.5 flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>
              {new Date(fb.createdAt).toLocaleDateString()} by {fb.createdBy.firstname} {fb.createdBy.lastname}
            </span>
            {isAdmin && (
              <div className='flex gap-1'>
                <button
                  type='button'
                  onClick={() => setEditing(true)}
                  disabled={loading}
                  className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
                >
                  <Pencil className='h-3.5 w-3.5' />
                </button>
                <button
                  type='button'
                  onClick={handleDelete}
                  disabled={loading}
                  className='rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function ReimbursementDetailDrawer({ open, onOpenChange, reimbursementId, isAdmin, onStatusChange }: Props) {
  const [detail, setDetail] = useState<ReimbursementDetailResponseType | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const loadDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await getReimbursementById(id);
      setDetail(data);
    } catch {
      // Error handled by service
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (open && reimbursementId) {
      loadDetail(reimbursementId);
      setFeedbackMessage('');
      setRejectReason('');
      setShowRejectInput(false);
    } else {
      setDetail(null);
    }
  }, [open, reimbursementId, loadDetail]);

  const handleAddFeedback = async () => {
    if (!detail || !feedbackMessage.trim()) return;
    setSubmittingFeedback(true);
    try {
      const updated = await addReimbursementFeedback(detail.id, { message: feedbackMessage.trim() });
      setDetail(updated);
      setFeedbackMessage('');
      onStatusChange();
    } catch {
      // Error handled by service
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleUpdateFeedback = async (feedbackId: number, message: string) => {
    if (!detail) return;
    const updated = await updateReimbursementFeedback(detail.id, feedbackId, { message });
    setDetail(updated);
    onStatusChange();
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!detail) return;
    await deleteReimbursementFeedback(detail.id, feedbackId);
    await loadDetail(detail.id);
    onStatusChange();
  };

  const handleApprove = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      await updateReimbursementStatus(detail.id, { status: ReimbursementStatusDtoEnum.approved });
      await loadDetail(detail.id);
      onStatusChange();
    } catch {
      // Error handled by service
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detail || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await updateReimbursementStatus(detail.id, { status: ReimbursementStatusDtoEnum.rejected, rejectReason: rejectReason.trim() });
      await loadDetail(detail.id);
      setShowRejectInput(false);
      setRejectReason('');
      onStatusChange();
    } catch {
      // Error handled by service
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      await updateReimbursementStatus(detail.id, { status: ReimbursementStatusDtoEnum.paid });
      await loadDetail(detail.id);
      onStatusChange();
    } catch {
      // Error handled by service
    } finally {
      setActionLoading(false);
    }
  };

  const showFooter = isAdmin && detail && (
    detail.status === ReimbursementStatusDtoEnum.pending ||
    detail.status === ReimbursementStatusDtoEnum.approved
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title='Reimbursement details'
      footer={
        showFooter ? (
          <div className='flex justify-end gap-3'>
            {detail.status === ReimbursementStatusDtoEnum.pending && (
              <>
                <Button variant='destructive' onClick={() => setShowRejectInput(!showRejectInput)} disabled={actionLoading}>
                  <ThumbsDown className='mr-1 h-4 w-4' />
                  Reject
                </Button>
                <Button onClick={handleApprove} disabled={actionLoading}>
                  <CheckCircle className='mr-1 h-4 w-4' />
                  Approve
                </Button>
              </>
            )}
            {detail.status === ReimbursementStatusDtoEnum.approved && (
              <Button onClick={handleMarkPaid} disabled={actionLoading}>
                <DollarSign className='mr-1 h-4 w-4' />
                Mark Paid
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      {loadingDetail && <div className='p-6 text-sm text-muted-foreground'>Loading...</div>}
      {!loadingDetail && detail && (
        <div className='flex flex-col gap-5 p-6'>
          {/* Details box */}
          <div className='rounded-lg border border-border p-4'>
            <h4 className='mb-3 text-[15px] font-semibold'>Details</h4>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-base font-semibold'>{detail.title}</h3>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[detail.status as ReimbursementStatusDtoEnum] ?? ''}`}>
                  {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Amount</span>
                  <p className='font-medium'>{detail.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Requested by</span>
                  <p className='font-medium'>{detail.user.firstname} {detail.user.lastname}</p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Created</span>
                  <p className='font-medium'>{new Date(detail.createdAt).toLocaleDateString()}</p>
                </div>
                {detail.approvedAt && (
                  <div>
                    <span className='text-muted-foreground'>Approved</span>
                    <p className='font-medium'>{new Date(detail.approvedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {detail.paidAt && (
                  <div>
                    <span className='text-muted-foreground'>Paid</span>
                    <p className='font-medium'>{new Date(detail.paidAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              {detail.rejectReason && (
                <div className='rounded-md bg-red-50 p-3 text-sm'>
                  <span className='font-medium text-red-700'>Reject reason:</span>
                  <p className='text-red-600'>{detail.rejectReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reject input */}
          {showRejectInput && (
            <div className='flex flex-col gap-2 rounded-lg border border-border p-4'>
              <label className='text-xs font-medium text-muted-foreground'>Reject reason (required)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                rows={2}
                placeholder='Enter reason for rejection...'
              />
              <div className='flex justify-end gap-2'>
                <Button size='sm' variant='outline' onClick={() => { setShowRejectInput(false); setRejectReason(''); }}>
                  Cancel
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm reject'}
                </Button>
              </div>
            </div>
          )}

          {/* Attachments box */}
          {detail.medias.length > 0 && (
            <div className='rounded-lg border border-border p-4'>
              <h4 className='mb-3 text-[15px] font-semibold'>Attachments</h4>
              <div className='flex flex-col gap-2'>
                {detail.medias.map((media) => (
                  <a
                    key={media.id}
                    href={media.urlFull}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2.5 rounded-md border border-border p-2.5 text-sm hover:bg-muted'
                  >
                    <ExternalLink className='h-4 w-4 shrink-0 text-muted-foreground' />
                    <span className='truncate'>{media.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Feedback box */}
          <div className='rounded-lg border border-border p-4'>
            <h4 className='mb-3 text-[15px] font-semibold'>Feedback</h4>
            <div className='flex flex-col gap-3'>
              {detail.feedbacks.length === 0 && (
                <p className='text-sm text-muted-foreground'>No feedback yet</p>
              )}
              {detail.feedbacks.map((fb) => (
                <FeedbackItem
                  key={fb.id}
                  fb={fb}
                  isAdmin={isAdmin}
                  onUpdate={handleUpdateFeedback}
                  onDelete={handleDeleteFeedback}
                />
              ))}

              {/* Admin feedback input */}
              {isAdmin && (
                <div className='flex gap-2'>
                  <Input
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder='Add feedback...'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddFeedback();
                      }
                    }}
                  />
                  <Button size='sm' onClick={handleAddFeedback} disabled={submittingFeedback || !feedbackMessage.trim()}>
                    {submittingFeedback ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

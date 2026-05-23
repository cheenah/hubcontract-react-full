import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, XCircle } from 'lucide-react';

const RejectDialog = ({ dialog, onClose, reason, onReasonChange, loading, onConfirm }) => (
  <Dialog open={!!dialog} onOpenChange={open => !open && onClose()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Причина отказа</DialogTitle>
      </DialogHeader>
      <div className="py-1">
        <Label
          htmlFor="reject-reason"
          className="text-sm mb-2 block"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Укажите причину отказа (необязательно — придёт пользователю на email)
        </Label>
        <Textarea
          id="reject-reason"
          placeholder="Например: документы нечитаемы или не соответствуют требованиям…"
          value={reason}
          onChange={e => onReasonChange(e.target.value)}
          rows={4}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button variant="destructive" disabled={loading} onClick={onConfirm}>
          {loading
            ? <Loader2 size={14} className="animate-spin mr-1" />
            : <XCircle size={14} className="mr-1" />}
          Отклонить
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RejectDialog;

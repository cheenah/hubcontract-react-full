import React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ConfirmDialog = ({ dialog, onClose }) => (
  <AlertDialog open={!!dialog} onOpenChange={open => !open && onClose()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{dialog?.title}</AlertDialogTitle>
        <AlertDialogDescription>{dialog?.desc}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction
          className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          onClick={() => { dialog?.onConfirm(); onClose(); }}
        >
          Удалить
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDialog;

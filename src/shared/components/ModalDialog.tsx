import { useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';

import Box from '@mui/material/Box';

type ModalDialogProps = {
  open: boolean;
  onClose: () => void;
  width: number;
  children: ReactNode;
};

export function ModalDialog({ open, onClose, width, children }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <Box
      component="dialog"
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      sx={{
        width: { xs: 'calc(100vw - 32px)', sm: width },
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        p: 0,
        border: 0,
        borderRadius: 2,
        boxShadow: 24,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        overflow: 'auto',
        '&::backdrop': { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
    >
      {open ? children : null}
    </Box>
  );
}

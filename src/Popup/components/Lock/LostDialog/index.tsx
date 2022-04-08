import type { DialogProps } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';

type LostDialogProps = Omit<DialogProps, 'children'>;

export default function LostDialog({ onClose, ...remainder }: LostDialogProps) {
  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };

  return <Dialog {...remainder} onClose={handleOnClose} />;
}

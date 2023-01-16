import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Button } from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';

type CopyButtonProps = {
  text?: string;
  className?: string;
};

export default function CopyButton({ text, className }: CopyButtonProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  if (!text) {
    return null;
  }

  return (
    <Button
      className={className}
      type="button"
      onClick={() => {
        if (text && copy(text)) {
          enqueueSnackbar(t('pages.Popup.Ethereum.Transaction.components.TxMessage.components.CopyButton.index.copied'));
        }
      }}
    >
      <Copy16Icon />
    </Button>
  );
}

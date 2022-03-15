import { Typography } from '@mui/material';

import IconButton from '~/Popup/components/IconButton';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, LeftContainter } from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';

type HeaderProps = { children?: string; onClick?: () => void };

export default function Header({ children, onClick }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <Container>
      <LeftContainter>
        <Typography variant="h4">{children}</Typography>
      </LeftContainter>
      <IconButton onClick={onClick} Icon={Copy16Icon}>
        {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.PrivateKeyView.Header.index.copy')}
      </IconButton>
    </Container>
  );
}

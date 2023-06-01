import { useSnackbar } from 'notistack';
import type { PopoverProps } from '@mui/material';

import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AddressInfo } from '~/types/chromeStorage';

import ManageButton from './ManageButton';
import { Container, StyledPopover } from './styled';

import Delete16Icon from '~/images/icons/Delete16.svg';

type ManagePopoverProps = Omit<PopoverProps, 'children'> & { addressInfo: AddressInfo };

export default function ManagePopover({ addressInfo, onClose, ...remainder }: ManagePopoverProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { enqueueSnackbar } = useSnackbar();
  const { addressBook } = chromeStorage;

  const { t } = useTranslation();

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        <ManageButton
          Icon={Delete16Icon}
          onClick={async () => {
            const newAddressBook = addressBook.filter((item) => item.id !== addressInfo.id);

            await setChromeStorage('addressBook', newAddressBook);

            enqueueSnackbar(t('components.AddressBookItem.ManagePopover.index.deleteSnackbar'), { variant: 'error' });

            onClose?.({}, 'backdropClick');
          }}
        >
          {t('components.AddressBookItem.ManagePopover.index.delete')}
        </ManageButton>
      </Container>
    </StyledPopover>
  );
}

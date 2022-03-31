import { useState } from 'react';
import { useSnackbar } from 'notistack';
import type { PopoverProps } from '@mui/material';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AddressInfo } from '~/types/chromeStorage';

import EditDialog from './EditDialog';
import ManageButton from './ManageButton';
import { Container, StyledPopover } from './styled';

import Delete16Icon from '~/images/icons/Delete16.svg';
import Edit16Icon from '~/images/icons/Edit16.svg';

type ManagePopoverProps = Omit<PopoverProps, 'children'> & { addressInfo: AddressInfo };

export default function ManagePopover({ addressInfo, onClose, ...remainder }: ManagePopoverProps) {
  const [isOpenedEditDialog, setIsOpenedEditDialog] = useState(false);

  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { enqueueSnackbar } = useSnackbar();
  const { addressBook } = chromeStorage;

  const { t } = useTranslation();

  return (
    <>
      <StyledPopover onClose={onClose} {...remainder}>
        <Container>
          <ManageButton
            Icon={Edit16Icon}
            onClick={() => {
              setIsOpenedEditDialog(true);
              onClose?.({}, 'backdropClick');
            }}
          >
            {t('components.AddressBookItem.ManagePopover.index.edit')}
          </ManageButton>

          <ManageButton
            Icon={Delete16Icon}
            onClick={async () => {
              const newAddressBook = addressBook.filter((item) => item.id !== addressInfo.id);

              await setChromeStorage('addressBook', newAddressBook);

              enqueueSnackbar('delete', { variant: 'error' });

              onClose?.({}, 'backdropClick');
            }}
          >
            {t('components.AddressBookItem.ManagePopover.index.delete')}
          </ManageButton>
        </Container>
      </StyledPopover>
      <EditDialog open={isOpenedEditDialog} onClose={() => setIsOpenedEditDialog(false)} addressInfo={addressInfo} />
    </>
  );
}

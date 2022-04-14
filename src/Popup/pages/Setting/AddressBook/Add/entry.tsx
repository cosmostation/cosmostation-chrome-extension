import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AddressInfo } from '~/types/chromeStorage';

import ChainButton from './components/ChainButton';
import { ButtonContainer, Container, InputContainer, MarginTop8Container, StyledChainPopover, StyledInput, StyledTextarea } from './styled';
import type { AddressBookForm } from './useSchema';
import { useSchema } from './useSchema';

export default function Entry() {
  const { currentChain } = useCurrentChain();
  const [chain, setChain] = useState(currentChain);

  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { enqueueSnackbar } = useSnackbar();

  const { addressBook } = chromeStorage;

  const regex = chain.line === 'TENDERMINT' ? { prefix: chain.bech32Prefix.address, lengths: [39] } : undefined;

  const { addressBookForm } = useSchema({ regex });

  const { t } = useTranslation();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AddressBookForm>({
    resolver: joiResolver(addressBookForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: AddressBookForm) => {
    const newAddressInfo: AddressInfo = { id: uuidv4(), chainId: chain.id, ...data };

    const newAddressBook = [...addressBook, newAddressInfo];
    await setChromeStorage('addressBook', newAddressBook);
    enqueueSnackbar('success');
    reset();
  };
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <ChainButton
          imgSrc={chain.imageURL}
          onClick={(event) => {
            setPopoverAnchorEl(event.currentTarget);
          }}
          isActive={isOpenPopover}
        >
          {chain.chainName}
        </ChainButton>
        <InputContainer>
          <div>
            <StyledInput
              inputProps={register('label')}
              placeholder={t('pages.Setting.AddressBook.Add.entry.labelPlaceholder')}
              error={!!errors.label}
              helperText={errors.label?.message}
            />
          </div>
          <MarginTop8Container>
            <StyledInput
              inputProps={register('address')}
              placeholder={t('pages.Setting.AddressBook.Add.entry.addressPlaceholder')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </MarginTop8Container>

          <MarginTop8Container>
            <StyledTextarea
              multiline
              inputProps={register('memo')}
              minRows={3}
              maxRows={3}
              placeholder={t('pages.Setting.AddressBook.Add.entry.memoPlaceholder')}
              error={!!errors.memo}
              helperText={errors.memo?.message}
            />
          </MarginTop8Container>
        </InputContainer>

        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Setting.AddressBook.Add.entry.save')}
          </Button>
        </ButtonContainer>

        <StyledChainPopover
          marginThreshold={0}
          currentChain={chain}
          onClickChain={(clickedChain) => {
            setChain(clickedChain);
          }}
          open={isOpenPopover}
          onClose={() => setPopoverAnchorEl(null)}
          anchorEl={popoverAnchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        />
      </Container>
    </form>
  );
}

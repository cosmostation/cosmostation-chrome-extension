import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps, PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import ChainButton from '~/Popup/components/ChainButton';
import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getKeyPair } from '~/Popup/utils/common';
import { sha512 } from '~/Popup/utils/crypto';
import type { Account } from '~/types/extensionStorage';

import PrivateKeyView from './PrivateKeyView';
import {
  AccentText,
  ChainContainer,
  Container,
  DescriptionContainer,
  DescriptionImageContainer,
  DescriptionTextContainer,
  HdPathTextContainer,
  InputContainer,
  StyledButton,
  StyledChainPopover,
  StyledInput,
} from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

type ExportPrivateKeyDialogProps = Omit<DialogProps, 'children'> & { account: Account; popoverOnClose?: PopoverProps['onClose'] };

export default function ExportPrivateKeyDialog({ onClose, account, ...remainder }: ExportPrivateKeyDialogProps) {
  const { extensionStorage } = useExtensionStorage();

  const { currentChain } = useCurrentChain();

  const { currentAdditionalChains } = useCurrentAdditionalChains();

  const [isCustom, setIsCustom] = useState(!!currentAdditionalChains.find((item) => item.id === currentChain.id));

  const [chain, setChain] = useState(currentChain);

  const { accountName, encryptedPassword } = extensionStorage;

  const [password, setPassword] = useState('');

  const [privateKey, setPrivateKey] = useState('');

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const invalidNames = [...Object.values(accountName)];
  invalidNames.splice(invalidNames.indexOf(accountName[account.id], 1));

  const { t } = useTranslation();

  const { passwordForm } = useSchema({ encryptedPassword: encryptedPassword! });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = () => {
    const keyPair = getKeyPair(account, chain, password);

    const privatekey = keyPair?.privateKey?.toString('hex');

    setPrivateKey(privatekey ? `0x${privatekey}` : '');
  };

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
    setTimeout(() => {
      reset();
      setPassword('');
      setPrivateKey('');
    }, 200);
  };

  const isMnemonic = account.type === 'MNEMONIC';

  const path = isMnemonic
    ? `m/${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${account.bip44.addressIndex}${
        chain.line === 'APTOS' ? "'" : ''
      }`
    : '';

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      {privateKey ? (
        <PrivateKeyView privateKey={privateKey} onClose={handleOnClose} />
      ) : (
        <>
          <DialogHeader onClose={handleOnClose}>{t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.title')}</DialogHeader>
          <Container>
            <form onSubmit={handleSubmit(submit)}>
              {isMnemonic && (
                <ChainContainer>
                  <ChainButton
                    imgSrc={chain.imageURL}
                    onClick={(event) => {
                      setPopoverAnchorEl(event.currentTarget);
                    }}
                    isActive={isOpenPopover}
                    isCustom={isCustom}
                  >
                    {chain.chainName}
                  </ChainButton>
                  <HdPathTextContainer>
                    <Typography variant="h6">{path}</Typography>
                  </HdPathTextContainer>
                </ChainContainer>
              )}
              <InputContainer>
                <StyledInput
                  inputProps={register('password', {
                    setValueAs: (v: string) => {
                      setPassword(v);
                      return v ? sha512(v) : '';
                    },
                  })}
                  type="password"
                  placeholder={t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.placeholder')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </InputContainer>

              {isMnemonic && (
                <DescriptionContainer>
                  <DescriptionImageContainer>
                    <Info16Icon />
                  </DescriptionImageContainer>
                  <DescriptionTextContainer>
                    <Typography variant="h6">
                      {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.mnemonicWarning1')}{' '}
                      <AccentText>{chain.chainName}</AccentText>{' '}
                      {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.mnemonicWarning2')}
                    </Typography>
                  </DescriptionTextContainer>
                </DescriptionContainer>
              )}

              <StyledButton type="submit" disabled={!isDirty}>
                {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.confirm')}
              </StyledButton>
            </form>
          </Container>
          <StyledChainPopover
            isOnlyChain
            marginThreshold={0}
            currentChain={chain}
            onClickChain={(clickedChain, clickedIsCustom) => {
              setChain(clickedChain);
              setIsCustom(!!clickedIsCustom);
            }}
            open={isOpenPopover}
            onClose={() => setPopoverAnchorEl(null)}
            anchorEl={popoverAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          />
        </>
      )}
    </Dialog>
  );
}

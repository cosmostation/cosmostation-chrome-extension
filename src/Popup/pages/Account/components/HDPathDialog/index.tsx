import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { SUI } from '~/constants/chain/sui/sui';
import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import {
  Container,
  DescriptionContainer,
  InfoContainer,
  InfoItemContainer,
  InfoItemLeftContainer,
  InfoItemRightAccentSpan,
  InfoItemRightContainer,
  InputContainer,
  StyledButton,
  StyledInput,
} from './styled';
import type { HDPathForm } from './useSchema';
import { useSchema } from './useSchema';

type HDPathDialogProps = Omit<DialogProps, 'children'> & {
  onSubmitHdPath?: (data: HDPathForm) => void;
  currentAddressIndex?: number;
};

export default function HDPathDialog({ onClose, onSubmitHdPath, currentAddressIndex, ...remainder }: HDPathDialogProps) {
  const [addressIndex, setAddressIndex] = useState(0);

  const { currentAdditionalChains } = useCurrentAdditionalChains();

  const { hdPathForm } = useSchema();

  const { t } = useTranslation();
  const hdPathInfos = [...CHAINS, ...currentAdditionalChains].map((item) => ({
    id: item.id,
    name: item.chainName,
    path: `${item.bip44.purpose}/${item.bip44.coinType}/${item.bip44.account}/${item.bip44.change}`,
  }));

  const apostrophesChainID = [APTOS.id, SUI.id];

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<HDPathForm>({
    resolver: joiResolver(hdPathForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: HDPathForm) => {
    onSubmitHdPath?.(data);
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Account.components.HDPathDialog.index.title')}</DialogHeader>
      <form onSubmit={handleSubmit(submit)}>
        <Container>
          <DescriptionContainer>
            <Typography variant="h6">{t('pages.Account.components.HDPathDialog.index.description')}</Typography>
          </DescriptionContainer>
          <InfoContainer>
            {hdPathInfos.map((info) => (
              <InfoItemContainer key={info.name}>
                <InfoItemLeftContainer>
                  <Typography variant="h5">{info.name}</Typography>
                </InfoItemLeftContainer>
                <InfoItemRightContainer>
                  <Typography variant="h5">
                    {`${info.path}/`}
                    <InfoItemRightAccentSpan>{addressIndex || currentAddressIndex || '0'}</InfoItemRightAccentSpan>
                    {apostrophesChainID.includes(info.id) ? "'" : ''}
                  </Typography>
                </InfoItemRightContainer>
              </InfoItemContainer>
            ))}
          </InfoContainer>
          <InputContainer>
            <StyledInput
              inputProps={register('addressIndex', {
                setValueAs: (v: number) => {
                  setAddressIndex(v);
                  return v;
                },
              })}
              type="number"
              placeholder={`${currentAddressIndex || '0'}`}
              error={!!errors.addressIndex}
              helperText={errors.addressIndex?.message}
            />
          </InputContainer>
          <StyledButton type="submit" disabled={!isDirty}>
            {t('pages.Account.components.HDPathDialog.index.confirm')}
          </StyledButton>
        </Container>
      </form>
    </Dialog>
  );
}

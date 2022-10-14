import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SEND_GAS } from '~/constants/chain';
import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { ButtonContainer, Container, ContentsContainer, Div, InputContainer, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import type { AddChainForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { addChainForm } = useSchema();
  const { addAdditionalChains } = useCurrentAdditionalChains();
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AddChainForm>({
    resolver: joiResolver(addChainForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const gasRateError = useMemo(() => {
    const error = errors[''];
    if (error?.type === 'object.and') {
      return error.message;
    }
    return '';
  }, [errors]);

  const submit = async (data: AddChainForm) => {
    try {
      if (COSMOS_CHAINS.map((item) => item.chainId).includes(data.chainId)) {
        throw Error(`Can't add ${data.chainId}. `.concat(t('pages.Chain.Cosmos.Chain.Add.entry.warningDuplicateChain')));
      }

      await addAdditionalChains({
        ...data,
        id: uuidv4(),
        type: data.type ?? '',
        line: 'COSMOS',
        bech32Prefix: { address: data.addressPrefix },
        bip44: {
          purpose: "44'",
          account: "0'",
          change: '0',
          coinType: data.coinType ? `${data.coinType}'` : "118'",
        },
        decimals: data.decimals ?? 6,
        gasRate: { average: data.gasRateAverage ?? '0.025', low: data.gasRateLow ?? '0.0025', tiny: data.gasRateTiny ?? '0.00025' },
        gas: { send: data.sendGas ?? COSMOS_DEFAULT_SEND_GAS },
      });

      enqueueSnackbar(t('pages.Chain.Cosmos.Chain.Add.entry.addChainSnackbar'));
      reset();
    } catch (e) {
      const message = (e as { message?: string }).message ? (e as { message: string }).message : 'Failed';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <ContentsContainer>
          <WarningContainer>
            <WarningIconContainer>
              <Info16Icon />
            </WarningIconContainer>
            <WarningTextContainer>
              <Typography variant="h6">{t('pages.Chain.Cosmos.Chain.Add.entry.warning')}</Typography>
            </WarningTextContainer>
          </WarningContainer>
          <InputContainer>
            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('chainId')}
                error={!!errors.chainId}
                helperText={errors.chainId?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.chainIdPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('chainName')}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.chainNamePlaceholder')}
                error={!!errors.chainName}
                helperText={errors.chainName?.message}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('restURL')}
                error={!!errors.restURL}
                helperText={errors.restURL?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.restURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('displayDenom')}
                error={!!errors.displayDenom}
                helperText={errors.displayDenom?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.displayDenomPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('addressPrefix')}
                error={!!errors.addressPrefix}
                helperText={errors.addressPrefix?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.addressPrefixPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('baseDenom')}
                error={!!errors.baseDenom}
                helperText={errors.baseDenom?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.baseDenomPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('coinType')}
                error={!!errors.coinType}
                helperText={errors.coinType?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.coinTypePlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('decimals')}
                error={!!errors.decimals}
                helperText={errors.decimals?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.decimalsPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('gasRateTiny')}
                error={!!gasRateError}
                helperText={gasRateError}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.gasRateTinyPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('gasRateLow')}
                error={!!gasRateError}
                helperText={gasRateError}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.gasRateLowPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('gasRateAverage')}
                error={!!gasRateError}
                helperText={gasRateError}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.gasRateAveragePlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('sendGas')}
                error={!!errors.sendGas}
                helperText={errors.sendGas?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.sendGasPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('imageURL')}
                error={!!errors.imageURL}
                helperText={errors.imageURL?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.imageURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('coinGeckoId')}
                error={!!errors.coinGeckoId}
                helperText={errors.coinGeckoId?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.coinGeckoIdPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('type')}
                error={!!errors.type}
                helperText={errors.type?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.typePlaceholder')}
              />
            </Div>

            <Div>
              <Input
                type="text"
                inputProps={register('cosmWasm')}
                error={!!errors.cosmWasm}
                helperText={errors.cosmWasm?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.cosmWasmPlaceholder')}
              />
            </Div>
          </InputContainer>
        </ContentsContainer>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Chain.Cosmos.Chain.Add.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}

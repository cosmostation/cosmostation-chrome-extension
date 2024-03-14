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
import { get, isAxiosError } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { NodeInfoPayload } from '~/types/cosmos/nodeInfo';

import { ButtonContainer, Container, ContentsContainer, Div, InputContainer, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import type { AddChainForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { addChainForm } = useSchema();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();
  const { addAdditionalChains } = useCurrentAdditionalChains();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
  const unofficialCosmosLowercaseChainIds = currentCosmosAdditionalChains.map((item) => item.chainId.toLowerCase());
  const invalidChainIds = [...officialCosmosLowercaseChainIds, ...unofficialCosmosLowercaseChainIds];

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
      const nodeInfo = await get<NodeInfoPayload>(`${data.restURL}/cosmos/base/tendermint/v1beta1/node_info`);

      if (!nodeInfo?.default_node_info?.network) {
        throw new Error(t('pages.Chain.Cosmos.Chain.Add.entry.restURLError'));
      }
      if (invalidChainIds.includes(nodeInfo?.default_node_info?.network)) {
        throw new Error(t('pages.Chain.Cosmos.Chain.Add.entry.chainID.invalid'));
      }
      const newChain: CosmosChain = {
        id: uuidv4(),
        line: 'COSMOS',
        type: data.type ?? '',
        chainId: nodeInfo.default_node_info.network,
        chainName: data.chainName,
        displayDenom: data.displayDenom,
        baseDenom: data.baseDenom,
        bech32Prefix: { address: data.addressPrefix },
        restURL: data.restURL,
        explorerURL: data.explorerURL,
        coinGeckoId: data.coinGeckoId,
        bip44: {
          purpose: "44'",
          account: "0'",
          change: '0',
          coinType: data.coinType ? (data.coinType.endsWith("'") ? data.coinType : `${data.coinType}'`) : "118'",
        },
        decimals: data.decimals ?? 6,
        gasRate: { average: data.gasRateAverage ?? '0.025', low: data.gasRateLow ?? '0.0025', tiny: data.gasRateTiny ?? '0.00025' },
        tokenImageURL: data.tokenImageURL || data.imageURL,
        imageURL: data.imageURL || data.tokenImageURL,
        gas: { send: data.sendGas ?? COSMOS_DEFAULT_SEND_GAS },
        cosmWasm: data.cosmWasm,
      };
      await addAdditionalChains(newChain);
      enqueueSnackbar(t('pages.Chain.Cosmos.Chain.Add.entry.addChainSnackbar'));
      reset();
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status) {
          enqueueSnackbar(t('pages.Chain.Cosmos.Chain.Add.entry.restURLError'), {
            variant: 'error',
          });
        }
      } else {
        const message = (e as { message?: string }).message ? (e as { message: string }).message : 'Failed';
        enqueueSnackbar(message, { variant: 'error' });
      }
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
                inputProps={register('imageURL')}
                error={!!errors.imageURL}
                helperText={errors.imageURL?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.imageURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('tokenImageURL')}
                error={!!errors.tokenImageURL}
                helperText={errors.tokenImageURL?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.tokenImageURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('explorerURL')}
                error={!!errors.explorerURL}
                helperText={errors.explorerURL?.message}
                placeholder={t('pages.Chain.Cosmos.Chain.Add.entry.explorerURLPlaceholder')}
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

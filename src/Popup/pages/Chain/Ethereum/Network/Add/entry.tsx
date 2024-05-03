import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { requestRPC } from '~/Popup/utils/ethereum';
import { toHex } from '~/Popup/utils/string';
import type { ResponseRPC } from '~/types/ethereum/rpc';

import { ButtonContainer, Container, ContentsContainer, Div, InputContainer, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import type { AddNetworkForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { addNetworkForm } = useSchema();
  const { addEthereumNetwork } = useCurrentEthereumNetwork();
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AddNetworkForm>({
    resolver: joiResolver(addNetworkForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const submit = async (data: AddNetworkForm) => {
    try {
      const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], '1', data.rpcURL);

      const convertChainId = toHex(data.chainId, { addPrefix: true, isStringNumber: true });

      if (response.result !== convertChainId) {
        throw Error(`Chain ID returned by RPC URL ${data.rpcURL} does not match ${data.chainId} (${convertChainId}) (result: ${response.result || ''})`);
      }

      if (ETHEREUM_NETWORKS.map((item) => item.chainId).includes(convertChainId)) {
        throw Error(`Can't add ${data.chainId}`);
      }

      await addEthereumNetwork({
        ...data,
        tokenImageURL: data.tokenImageURL || data.imageURL,
        imageURL: data.imageURL || data.tokenImageURL,
        chainId: convertChainId,
        decimals: 18,
      });

      enqueueSnackbar(t('pages.Chain.Ethereum.Network.Add.entry.addNetworkSnackbar'));
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
              <Typography variant="h6">{t('pages.Chain.Ethereum.Network.Add.entry.warning')}</Typography>
            </WarningTextContainer>
          </WarningContainer>
          <InputContainer>
            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('networkName')}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.networkNamePlaceholder')}
                error={!!errors.networkName}
                helperText={errors.networkName?.message}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('rpcURL')}
                error={!!errors.rpcURL}
                helperText={errors.rpcURL?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.rpcURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('chainId')}
                error={!!errors.chainId}
                helperText={errors.chainId?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.chainIdPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('displayDenom')}
                error={!!errors.displayDenom}
                helperText={errors.displayDenom?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.displayDenomPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('explorerURL')}
                error={!!errors.explorerURL}
                helperText={errors.explorerURL?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.explorerURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('imageURL')}
                error={!!errors.imageURL}
                helperText={errors.imageURL?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.imageURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('tokenImageURL')}
                error={!!errors.tokenImageURL}
                helperText={errors.tokenImageURL?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.tokenImageURLPlaceholder')}
              />
            </Div>

            <Div>
              <Input
                type="text"
                inputProps={register('coinGeckoId')}
                error={!!errors.coinGeckoId}
                helperText={errors.coinGeckoId?.message}
                placeholder={t('pages.Chain.Ethereum.Network.Add.entry.coinGeckoIdPlaceholder')}
              />
            </Div>
          </InputContainer>
        </ContentsContainer>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Chain.Ethereum.Network.Add.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}

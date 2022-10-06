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
  // TODO useSchema 훅에 커스텀 체인용 타입 또 만들어주면 됨
  // TODO 다국어 지원을 위해 translation.json에 새로 chain용 텍스트 작성
  // TODO useForm, pick학습
  // TODO inject script에 보면 cos_addChain method가 정의되어있는데 여기 param을 인풋으로 받아오면 될 것 같음.

  // /Users/ahnsihun/Workspace/cosmostation-chrome-extension/src/types/message/cosmos.ts
  // CosAddChainParams

  // /Users/ahnsihun/Workspace/cosmostation-chrome-extension/src/Popup/pages/Popup/Cosmos/AddChain/entry.tsx
  // 위 주소에서 param 어떻게 받고 어떻게 cosmoschain 타입에 집어넣는지 볼 수 있음
  const submit = async (data: AddNetworkForm) => {
    try {
      const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], '1', data.rpcURL);

      if (response.result !== data.chainId) {
        throw Error(`Chain ID returned by RPC URL ${data.rpcURL} does not match ${data.chainId} (result: ${response.result || ''})`);
      }

      if (ETHEREUM_NETWORKS.map((item) => item.chainId).includes(data.chainId)) {
        throw Error(`Can't add ${data.chainId}`);
      }

      await addEthereumNetwork({ ...data, decimals: 18 });

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
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.chainNamePlaceholder')}
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
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.restURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('chainId')}
                error={!!errors.chainId}
                helperText={errors.chainId?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.chainIdPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('displayDenom')}
                error={!!errors.displayDenom}
                helperText={errors.displayDenom?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.displayDenomPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('explorerURL')}
                error={!!errors.explorerURL}
                helperText={errors.explorerURL?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.explorerURLPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('explorerURL')}
                error={!!errors.explorerURL}
                helperText={errors.explorerURL?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.gasPlaceHolder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('imageURL')}
                error={!!errors.imageURL}
                helperText={errors.imageURL?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.imageURLPlaceholder')}
              />
            </Div>

            <Div>
              <Input
                type="text"
                inputProps={register('coinGeckoId')}
                error={!!errors.coinGeckoId}
                helperText={errors.coinGeckoId?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.coinGeckoIdPlaceholder')}
              />
            </Div>
          </InputContainer>
        </ContentsContainer>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Chain.Cosmos.Token.Add.entry.submitButton')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}

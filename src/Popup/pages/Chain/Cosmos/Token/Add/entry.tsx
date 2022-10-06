import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
// import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { requestRPC } from '~/Popup/utils/ethereum';
import type { ResponseRPC } from '~/types/ethereum/rpc';
import type { CosAddChainParams } from '~/types/message/cosmos';

import { ButtonContainer, Container, ContentsContainer, Div, InputContainer, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { addChainForm } = useSchema();

  // const { addAdditionalChains } = useCurrentAdditionalChains();
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CosAddChainParams>({
    resolver: joiResolver(addChainForm),
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

  // addAdditionalChains 이 메서드가 체인 추가해주는 메서드 인듯

  // 로직따서 밑에 넣고 스키마 따서 추가하고 스키마 맞춰서 인풋 필드 더 만들어 내기

  // ! 어떻게 입력된 데이터가 AddNetworkForm이런 타입안에 들어가는지 모르겠는데? 이걸 useForm이 해주는건가 아님 joiresolver

  const submit = async (data: CosAddChainParams) => {
    try {
      const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], '1', data.restURL);

      if (response.result !== data.chainId) {
        throw Error(`Chain ID returned by RPC URL ${data.restURL} does not match ${data.chainId} (result: ${response.result || ''})`);
      }
      // 중복 추가 방지
      if (ETHEREUM_NETWORKS.map((item) => item.chainId).includes(data.chainId)) {
        throw Error(`Can't add ${data.chainId}`);
      }

      // await addEthereumNetwork({ ...data, decimals: 18 });
      // 체인 추가 구문
      // await addAdditionalChains({ ...data, decimals: 18 });
      enqueueSnackbar(t('pages.Chain.Cosmos.Token.Add.entry.addChainSnackbar'));
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
              <Typography variant="h6">{t('pages.Chain.Cosmos.Token.Add.entry.warning')}</Typography>
            </WarningTextContainer>
          </WarningContainer>
          <InputContainer>
            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('chainName')}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.chainNamePlaceholder')}
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
                inputProps={register('coinType')}
                error={!!errors.coinType}
                helperText={errors.coinType?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.coinTypePlaceHolder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('addressPrefix')}
                error={!!errors.addressPrefix}
                helperText={errors.addressPrefix?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.gasPlaceHolder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('gasRate')}
                error={!!errors.gasRate}
                helperText={errors.addressPrefix?.message}
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

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
import type { CosmosChain } from '~/types/chain';
import type { CosAddChainParams } from '~/types/message/cosmos';

import { ButtonContainer, Container, ContentsContainer, Div, InputContainer, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { addChainForm } = useSchema();

  // const { additionalChains } = await chromeStorage();
  // const cosmosAdditionalChains = additionalChains.filter((item) => item.line === 'COSMOS') as CosmosChain[];

  // const cosmosLowercaseChainNames = COSMOS_CHAINS.map((item) => item.chainName.toLowerCase());
  // const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
  // const unofficialCosmosLowercaseChainIds = cosmosAdditionalChains.map((item) => item.chainId.toLowerCase());

  const { addAdditionalChains } = useCurrentAdditionalChains();
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

  // useCurrentAdditionalChains 훅이 추가 체인관련 훅
  // addAdditionalChains 이 메서드가 체인 추가해주는 메서드 인듯

  // 로직따서 밑에 넣고 스키마 따서 추가하고 스키마 맞춰서 인풋 필드 더 만들어 내기

  // ! 어떻게 입력된 데이터가 AddNetworkForm이런 타입안에 들어가는지 모르겠는데? 이걸 useForm이 해주는건가 아님 joiresolver

  const submit = async (data: CosAddChainParams) => {
    try {
      // 이 함수 어떻게 쓰이는지 확인
      // const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], '1', data.restURL);

      // if (response.result !== data.chainId) {
      //   throw Error(`Chain ID returned by RPC URL ${data.restURL} does not match ${data.chainId} (result: ${response.result || ''})`);
      // }
      // 중복 추가 방지
      if (COSMOS_CHAINS.map((item) => item.chainId).includes(data.chainId)) {
        throw Error(`Can't add ${data.chainId}`);
      }

      const newChain: CosmosChain = {
        id: uuidv4(),
        line: 'COSMOS',
        // 이거 임의로 넣은거라 기존의 삼항연산자 그거 넣어야함
        type: 'ETHERMINT' || '',
        //
        chainId: data.chainId,
        chainName: data.chainName,
        displayDenom: data.displayDenom,
        baseDenom: data.baseDenom,
        bech32Prefix: { address: data.addressPrefix },
        restURL: data.restURL,
        coinGeckoId: data.coinGeckoId,
        bip44: {
          purpose: "44'",
          account: "0'",
          change: '0',
          coinType: data.coinType ? `${data.coinType}'` : "118'",
        },
        decimals: data.decimals ?? 6,
        // 세개 필드를 어떻게 동시에 받을까..
        gasRate: data.gasRate ?? { average: '0.025', low: '0.0025', tiny: '0.00025' },
        imageURL: data.imageURL,
        gas: { send: data.sendGas ?? COSMOS_DEFAULT_SEND_GAS },
        cosmWasm: data.cosmWasm,
      };
      // console.log(newChain); // for test
      // 체인 추가 구문
      await addAdditionalChains(newChain);
      // TODO await addEthereumNetwork({ ...data, decimals: 18 }); 이거가 data를 스프레드로 뿌려주고 안써도 되는 디폴트 값을 18로 준건가?
      enqueueSnackbar(t('pages.Chain.Cosmos.Token.Add.entry.addChainSnackbar'));
      reset();
    } catch (e) {
      const message = (e as { message?: string }).message ? (e as { message: string }).message : 'Failed';

      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // TODO 인풋 순서 조정 필요
  // TODO 로컬라이징 텍스트 수정 필요
  // TODO joi 좀 더 공부해봐야 할 듯,
  // .label('params')
  // .required(); 원래 있던 스키마의 뒤에 붙어있던 메서드인데 무슨 의미인지 모르겠음
  // 그냥 스키마에 있는 모든 메서드 다 이해하기
  // 1순위 Joi공부해

  // FIXME gasRate부분을 어떻게 인풋을 받아야할지 모르겠음, 그냥 받는거는 타입이 GasRate가 아니고 나눠서 받자니
  // CosAddChainParams에서 gasRate필드에서 타입을 gasRate로 받아서 쪼개서 넣을 수가 없음(인풋이 들어온게 파람타입 필드 참조해서 넣으니깐...gasRate타입으로 넣어야하는거여)

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
                inputProps={register('chainId')}
                error={!!errors.chainId}
                helperText={errors.chainId?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.chainIdPlaceholder')}
              />
            </Div>
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
                inputProps={register('displayDenom')}
                error={!!errors.displayDenom}
                helperText={errors.displayDenom?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.displayDenomPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('addressPrefix')}
                error={!!errors.addressPrefix}
                helperText={errors.addressPrefix?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.addressPrefixPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('baseDenom')}
                error={!!errors.baseDenom}
                helperText={errors.baseDenom?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.baseDenomPlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('coinType')}
                error={!!errors.coinType}
                helperText={errors.coinType?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.coinTypePlaceholder')}
              />
            </Div>

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('decimals')}
                error={!!errors.decimals}
                helperText={errors.decimals?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.decimalsPlaceholder')}
              />
            </Div>

            {/* <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('gasRate')}
                error={!!errors.gasRate}
                // helperText={errors.gasRate?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.gasRatePlaceholder')}
              />
            </Div> */}

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('sendGas')}
                error={!!errors.sendGas}
                helperText={errors.sendGas?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.sendGasPlaceholder')}
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

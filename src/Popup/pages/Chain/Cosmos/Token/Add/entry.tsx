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
      // 중복 추가 방지
      if (COSMOS_CHAINS.map((item) => item.chainId).includes(data.chainId)) {
        throw Error(`Can't add ${data.chainId}`);
      }
      const newChain: CosmosChain = {
        id: uuidv4(),
        line: 'COSMOS',
        // 이거 임의로 넣은거라 기존의 삼항연산자 그거 넣어야함
        type: data.type ?? '',
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

  // FIXME 기존에 존재하는 chain의 chainID를 입력 시 "chainId" contains an invalid value
  // 라는 헬퍼 텍스트가 출력되는데 원래는 위 onsubmit함수에서 스낵바를 띄워야하는데 아마
  // 스키마에서 invalid를 설정해줘서 그런거같음
  // sol: 1.useSchema의 invalid를 삭제 => 모든 인풋들이 invalid한 뒤에 submit함수가 발동되니
  // 인풋들이 검증을 통과한다 -> onsubmit함수가 걸리면서 중복 체크를 하고 스낵바를 띄운다
  // 근데 스키마에서 invalid 조건을 작성하면 인풋 검증 과정에서 부적합판정 뒤 헬퍼 텍스트가 출력되는거임
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

            <Div sx={{ marginBottom: '0.8rem' }}>
              <Input
                type="text"
                inputProps={register('coinGeckoId')}
                error={!!errors.coinGeckoId}
                helperText={errors.coinGeckoId?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.coinGeckoIdPlaceholder')}
              />
            </Div>

            <Div>
              <Input
                type="text"
                inputProps={register('type')}
                error={!!errors.type}
                helperText={errors.type?.message}
                placeholder={t('pages.Chain.Cosmos.Token.Add.entry.typePlaceholder')}
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

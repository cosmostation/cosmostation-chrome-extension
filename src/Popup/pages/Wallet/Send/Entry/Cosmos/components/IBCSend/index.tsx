import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_FEE_BASE_DENOMS, COSMOS_GAS_RATES } from '~/constants/chain';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { AXELAR } from '~/constants/chain/cosmos/axelar';
import { CRYPTO_ORG } from '~/constants/chain/cosmos/cryptoOrg';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { JUNO } from '~/constants/chain/cosmos/juno';
import { KI } from '~/constants/chain/cosmos/ki';
import { SHENTU } from '~/constants/chain/cosmos/shentu';
import { SIF } from '~/constants/chain/cosmos/sif';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/common/IconButton';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { get } from '~/Popup/utils/axios';
import { fix, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { ibc } from '~/proto/ibc-v5.0.1';
import type { CosmosChain, CosmosToken as BaseCosmosToken } from '~/types/chain';
import type { AssetV2 } from '~/types/cosmos/asset';

import {
  BottomContainer,
  CoinButton,
  CoinLeftAvailableContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightContainer,
  Container,
  MarginTop8Div,
  MarginTop12Div,
  MaxButton,
  StyledInput,
  StyledTextarea,
} from './styled';
import CoinOrTokenPopover from '../CoinOrTokenPopover';
import RecipientChainPopover from '../RecipientChainPopover';

import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

export type CoinInfo = BaseCoinInfo & { type: typeof TYPE.COIN };
export type TokenInfo = BaseCosmosToken & { type: typeof TYPE.TOKEN };

export type CoinOrTokenInfo = CoinInfo | TokenInfo;

type IBCSendProps = {
  chain: CosmosChain;
};

export default function IBCSend({ chain }: IBCSendProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const accounts = useAccounts(true);
  const allCosmosAssets = useAssetsSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const { enqueueSnackbar } = useSnackbar();
  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const params = useParams();

  const { t } = useTranslation();
  const { currentCosmosTokens } = useCurrentCosmosTokens();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [recipientPopoverAnchorEl, setRecipientPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);
  const isRecipientOpenPopover = Boolean(recipientPopoverAnchorEl);
  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { decimals, gasRate } = chain;

  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        type: 'staking',
        decimals: chain.decimals,
        imageURL: chain.imageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
      },
      ...coinList.coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
      ...coinList.ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
    ],
    [
      chain.baseDenom,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.imageURL,
      coinList.coins,
      coinList.ibcCoins,
      totalAmount,
      vestingRelatedAvailable,
    ],
  );
  const availableCoinOrTokenList: CoinOrTokenInfo[] = useMemo(
    () => [
      ...coinAll.filter((item) => gt(item.availableAmount, '0')).map((item) => ({ ...item, type: TYPE.COIN })),
      ...currentCosmosTokens.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item, type: TYPE.TOKEN })),
    ],
    [coinAll, currentCosmosTokens],
  );

  const [currentCoinOrTokenId, setCurrentCoinOrTokenId] = useState(params.id || chain.baseDenom);

  const [currentAddress, setCurrentAddress] = useState('');
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);

  const currentCoinOrToken = useMemo(
    () =>
      availableCoinOrTokenList.find(
        (item) => (item.type === 'coin' && item.baseDenom === currentCoinOrTokenId) || (item.type === 'token' && item.address === currentCoinOrTokenId),
      )!,
    [availableCoinOrTokenList, currentCoinOrTokenId],
  );

  // TODO 체인별로 요구하는 가스량이 어느정도인지 테스트 해보기
  // FIXME hard-coding: 대다수의 앱에서 가스비를 130000으로 책정하여 이를 직접 할당하였음
  // const sendGas = currentCoinOrToken.type === 'coin' ? gas.send || COSMOS_DEFAULT_SEND_GAS : gas.transfer || COSMOS_DEFAULT_TRANSFER_GAS;
  const sendGas = '130000';

  const [currentGas, setCurrentGas] = useState(sendGas);
  const [currentFeeAmount, setCurrentFeeAmount] = useState(times(sendGas, gasRate.low));

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentFeeAmount, decimals);

  const tokenBalance = useTokenBalanceSWR(chain, currentCoinOrTokenId, address);

  const currentCoinOrTokenAvailableAmount = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      return currentCoinOrToken.availableAmount;
    }

    return tokenBalance.data?.balance || '0';
  }, [currentCoinOrToken, tokenBalance.data?.balance]);

  const currentCoinOrTokenDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentCoinOrTokenAvailableAmount, currentCoinOrToken.decimals),
    [currentCoinOrToken.decimals, currentCoinOrTokenAvailableAmount],
  );
  // SECTION - IBC send logic
  // FIXME - coin type이 token인 경우에 대한 ibc send 미구현 상태
  // FIXME - 현재 기본 가스비가 부족해서 tx가 fail되도 스낵바로 success라고 뜨는 현상 발견 -> 해결 불가능
  // NOTE 현재 체인에서 가지고있는 ibc 코인을 ibc_send가 가능한 ibc코인의 List
  const ibcPossibleChainList = currentChainAssets.data.filter((item) => item.counter_party);
  const ibcPossibleChainListDenom = currentChainAssets.data.filter((item) => item.counter_party).map((item) => item.base_denom);
  // FIXME 변수명 정리
  // NOTE 현재 체인에서 가지고 있는 native coin을 수신 가능한 체인의 List
  const nativePossibleChainList = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      const nativeChainNameList = allCosmosAssets.data.filter((item) => item.counter_party?.denom === currentCoinOrToken.baseDenom).map((item) => item.chain);

      const nativeOkChainList = allCosmosAssets.data.filter((item) => item.counter_party?.denom === currentCoinOrToken.baseDenom);
      const NativeChainList = currentChainAssets.data.filter(
        // couter_party필드의 denom이 긴 값은 이미 수신 채널이 정의되어있는(그래비티, 주노)있기에 임시적으로 length값으로 필터링하였음
        // (item) => nativeChainNameList.includes(item.origin_chain) && (item.counter_party?.denom.length as number) < 20,
        (item) => nativeChainNameList.includes(item.origin_chain),
      );
      const nativeChainList = NativeChainList.map((item) => ({
        ...item,
        denom: nativeOkChainList.find((nativeChain) => nativeChain.chain === item.origin_chain)?.base_denom,
      }));

      return nativeChainList;
    }
    return [];
  }, [allCosmosAssets.data, currentChainAssets.data, currentCoinOrToken]);
  const coinInfos = availableCoinOrTokenList.filter((item) => item.type === 'coin') as CoinInfo[];
  // NOTE 현재 보유중인 코인 중에서 available한 코인 리스트: native & ibc 구분

  // FIXME coinall 에 새로 타입정의 해서 여기서 ibc 구분짓는 로직 삭제하면 될 듯
  const availableIBCCoinList = coinInfos.filter((item) => item.baseDenom.substring(0, 3) === 'ibc');
  const avaiableIBCCoinDisplayDenomList = availableIBCCoinList.map((item) => item.displayDenom);
  const availableNativeCoinList = coinInfos.filter((item) => item.baseDenom.substring(0, 3) !== 'ibc');

  // NOTE available한 IBC코인중 수신할 체인이 있는 available한 IBC코인리스트
  const checkedAvailableIBCCoinList = availableIBCCoinList.filter((item) =>
    item.originBaseDenom ? ibcPossibleChainListDenom.includes(item.originBaseDenom) : [],
  );
  const checkedAvailableNativeCoinList = nativePossibleChainList ? [...availableNativeCoinList] : [];
  // NOTE 보유 available체인 중에서 수신할 체인이 있는지 체크가 된 보낼 코인 List
  const checkedAvailableCoinList = [...checkedAvailableIBCCoinList, ...checkedAvailableNativeCoinList];

  // NOTE 선택한 코인을 수신 가능한 체인 리스트
  const recipientChainList = useMemo(() => {
    const nameMap = {
      [CRYPTO_ORG.baseDenom]: CRYPTO_ORG.chainName,
      [ASSET_MANTLE.baseDenom]: ASSET_MANTLE.chainName,
      [GRAVITY_BRIDGE.baseDenom]: GRAVITY_BRIDGE.chainName,
      [SIF.baseDenom]: SIF.chainName,
      [KI.baseDenom]: KI.chainName,
    };
    // const displayDenomMap = {
    //   [EMONEY.chainName.toLowerCase()]: EMONEY.displayDenom,
    //   [JUNO.chainName.toLowerCase()]: JUNO.displayDenom,
    // };
    const baseDenomMap = {
      [EMONEY.chainName.toLowerCase()]: EMONEY.baseDenom,
    };
    const imgURLMap = {
      [EMONEY.chainName.toLowerCase()]: EMONEY.imageURL,
      [JUNO.chainName.toLowerCase()]: JUNO.imageURL,
    };

    if (currentCoinOrToken.type === 'coin') {
      // 선택 코인이 ibc일 경우
      if (avaiableIBCCoinDisplayDenomList.includes(currentCoinOrToken.displayDenom)) {
        const ibcRecipientChainList = ibcPossibleChainList
          .filter((item) => item.dp_denom === currentCoinOrToken.displayDenom)
          .map(
            (item) =>
              ({
                ...item,
                chain: nameMap[item.base_denom] ? nameMap[item.base_denom] : item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
                // dp_denom: displayDenomMap[item.origin_chain] ? displayDenomMap[item.origin_chain] : item.dp_denom,
                base_denom: baseDenomMap[item.origin_chain] ? baseDenomMap[item.origin_chain] : item.base_denom,
                channel: item.counter_party?.channel,
                image: imgURLMap[item.origin_chain] ? imgURLMap[item.origin_chain] : item.image,
                counter_party: { denom: chain.baseDenom, channel: item.channel, port: item.counter_party?.port },
              } as AssetV2),
          );
        return ibcRecipientChainList;
      }
      const nativeRecipientChainList = nativePossibleChainList.map(
        (item) =>
          ({
            ...item,
            chain: nameMap[item.base_denom] ? nameMap[item.base_denom] : item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
            // dp_denom: displayDenomMap[item.origin_chain] ? displayDenomMap[item.origin_chain] : item.dp_denom,
            base_denom: baseDenomMap[item.origin_chain] ? baseDenomMap[item.origin_chain] : item.base_denom,
            channel: item.counter_party?.channel,
            image: imgURLMap[item.origin_chain] ? imgURLMap[item.origin_chain] : item.image,
            counter_party: { denom: chain.baseDenom, channel: item.channel, port: item.counter_party?.port },
          } as AssetV2),
      );

      // FIXME lodash 불필요한 전체 import
      const uniqueNativeRecipientChainList = _.uniqBy(nativeRecipientChainList, 'chain');
      return uniqueNativeRecipientChainList;
    }
    return [];
  }, [
    currentCoinOrToken.type,
    currentCoinOrToken.displayDenom,
    avaiableIBCCoinDisplayDenomList,
    nativePossibleChainList,
    ibcPossibleChainList,
    chain.baseDenom,
  ]);
  // NOTE 선택된 수신 체인
  // REVIEW 방향성에 대해 고민할 필요가 있음
  // 1. recipientChainList의 첫번째 요소를 자동으로 선택되도록
  // 2. 매번 코인을 선택할 때 마다 selectedRecipientChain이 초기화 되도록
  // ANCHOR - 수신인
  const [selectedRecipientChainDP, setSelectedRecipientChainDP] = useState(recipientChainList[0].dp_denom ?? '');
  // legacy
  // const [selectedRecipientChain, setSelectedRecipientChain] = useState(recipientChainList[0]?? '');

  // FIXME 현재 당연히 수신체인에서 고르니까 오스모랑 이온이 없지 이 바보야
  const selectedRecipientChain = useMemo(
    // () => recipientChainList.find((item) => item.dp_denom === selectedRecipientChainDP)!,
    //  availableNativeCoinList((item)=> item.)
    () =>
      selectedRecipientChainDP !== chain.displayDenom ? recipientChainList.find((item) => item.dp_denom === selectedRecipientChainDP)! : recipientChainList[0],

    [chain.displayDenom, recipientChainList, selectedRecipientChainDP],
  );
  // REVIEW - 계산이 반복됨. 최적화가 필요함
  // useEffect(() => {
  //   setSelectedRecipientChain(recipientChainList[0]);
  //   // 확실하면 린트무시처리 해도 괜찮다
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentCoinOrToken]);
  // const aaa = useMemo(() => recipientChainList[0], [recipientChainList]);

  // FIXME 여기 없으면 아예 안뜨게해야함
  const selectedRecipientCosmosChain = useMemo(
    () => COSMOS_CHAINS.find((item) => selectedRecipientChain?.chain === item.chainName),
    [selectedRecipientChain?.chain],
  );

  const selectedRecipientChainIMG = selectedRecipientChain.dp_denom.substring(0, 3) === 'axl' ? AXELAR.imageURL : selectedRecipientCosmosChain?.imageURL ?? '';
  const selectedRecipientChainChainName =
    selectedRecipientChain.dp_denom.substring(0, 3) === 'axl' ? AXELAR.chainName : selectedRecipientCosmosChain?.chainName ?? '';
  const selectedRecipientChainChannel = selectedRecipientChain.channel ?? '';
  const addressRegex = useMemo(
    () => getCosmosAddressRegex(selectedRecipientCosmosChain?.bech32Prefix.address || '', [39]),
    [selectedRecipientCosmosChain?.bech32Prefix.address],
  );
  // TODO error handling
  const [timeoutHeight, setTimeoutHeight] = useState<ibc.core.client.v1.IHeight>();
  // FIXME make it hook & imple new type for get타입 자체적으로 만들기 ,swr훅으로 만들기 // 필요한 값만 타입 (string으로 정의 해야함)정의해서 쓰기 //  balance 예시 참고
  // 서큘러탭바 클릭시 색깔 하얗게 나오는거 삭제
  // 수신 체인 컨테이너 색 변경
  // 팝오버 오픈 두개의 버튼이 동시 작동된다...
  // 이더리움 레이아웃 분기 코드 작성하기 (유연성있게)
  // tx amount 위치 상단으로 올리기
  // 기존 가스타입에 ibc tx 용 필드 추가정의 (완벽한 기본 1500000)
  // 서쿨러 탭 텍스트 대문자 -> 소문자로 수정
  // 수신 체인 팝업 툴팁 삭제

  // 값 특정지을떄는 되도록 denom값으로 사용할 것
  // FIXME timeoutHeight 널세이프티 조건 더 추가하기 아래 sign+anmino쪽 확인하기

  // NOTE - cw20 토큰은 ibc send가 완전히 다르니 우선 무시할것 ...

  // FIXME path 값 참조해서 체인가져올수있도록 구현하기, path 값 스필릿 하고 길이값 -2 해서 그 값을 체인으로 쓰자!
  // COMSMOS_CHAIN이 최종값이 되도록 해야함
  useEffect(() => {
    const getTimeout = async () => {
      const identifiedClientStateInfo =
        await get<ibc.core.channel.v1.IQueryChannelClientStateResponse>(`https://lcd-osmosis.cosmostation.io/ibc/core/channel/v1/channels/${
          selectedRecipientChain.counter_party?.channel ?? ''
        }/ports/${selectedRecipientChain.port ?? ''}/client_state
        `);
      const clientState = identifiedClientStateInfo.identified_client_state?.client_state as ibc.lightclients.tendermint.v1.IClientState;
      const timeoutHeightInfo = {
        revision_number: clientState.latest_height?.revision_number ?? 0,
        // parseInt + nullsafety
        revision_height: clientState?.latest_height?.revision_height ? 1000 + +clientState.latest_height.revision_height : 0,
      };

      setTimeoutHeight(timeoutHeightInfo);
    };
    getTimeout().catch((e) => {
      // FIXME 에러 스낵바 보다 다른 에러 캐치방식을 고려해보는게 좋다고 생각합니다.
      // 이거는 훅에서 구현할 때는 삭제하기
      const message = (e as { message?: string }).message ? (e as { message: string }).message : 'Failed';
      enqueueSnackbar(message, { variant: 'error' });
    });
  }, [enqueueSnackbar, selectedRecipientChain.counter_party?.channel, selectedRecipientChain.port]);

  const feeCoins = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      const feeBaseDenoms = COSMOS_FEE_BASE_DENOMS.find((item) => item.chainId === chain.id && item.baseDenom === currentCoinOrToken.baseDenom)?.feeBaseDenoms;

      const filteredFeeCoins = coinAll.filter((item) => feeBaseDenoms?.includes(item.baseDenom));

      return filteredFeeCoins.length > 0 ? filteredFeeCoins : [coinAll[0]];
    }

    return [coinAll[0]];
  }, [chain.id, coinAll, currentCoinOrToken]);

  // 복수 개가 될 때 필요
  const [currentFeeBaseDenom] = useState(feeCoins[0].baseDenom);

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom)!, [currentFeeBaseDenom, feeCoins]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeCoin.availableAmount, currentFeeCoin.decimals),
    [currentFeeCoin.availableAmount, currentFeeCoin.decimals],
  );

  const currentFeeGasRate = useMemo(
    () => COSMOS_GAS_RATES.find((item) => item.chainId === chain.id && item.baseDenom === currentFeeCoin.baseDenom)?.gasRate ?? chain.gasRate,
    [chain.gasRate, chain.id, currentFeeCoin.baseDenom],
  );

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount);
    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentCoinOrTokenDisplayAvailableAmount;
  }, [currentCoinOrToken, currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount, currentFeeCoin.baseDenom]);

  const currentCoinOrTokenDecimals = currentCoinOrToken.decimals || 0;
  const currentCoinOrTokenDisplayDenom = currentCoinOrToken.displayDenom;
  const currentDisplayMaxDecimals = getDisplayMaxDecimals(currentCoinOrTokenDecimals);
  const errorMessage = useMemo(() => {
    if (!timeoutHeight) {
      return t('pages.Wallet.Send.Entry.Cosmos.index.timeoutHeightError');
    }
    if (!addressRegex.test(currentAddress)) {
      return t('pages.Wallet.Send.Entry.Cosmos.index.invalidAddress');
    }

    if (!currentDisplayAmount || !gt(currentDisplayAmount, '0')) {
      return t('pages.Wallet.Send.Entry.Cosmos.index.invalidAmount');
    }

    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, plus(currentDisplayAmount, currentDisplayFeeAmount))) {
        return t('pages.Wallet.Send.Entry.Cosmos.index.insufficientAmount');
      }
    }

    if ((currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom !== currentFeeCoin.baseDenom) || currentCoinOrToken.type === 'token') {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, currentDisplayAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.index.insufficientAmount');
      }

      if (!gte(currentFeeCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.index.insufficientFeeAmount');
      }
    }

    return '';
  }, [
    addressRegex,
    currentAddress,
    currentCoinOrToken,
    currentCoinOrTokenDisplayAvailableAmount,
    currentDisplayAmount,
    currentDisplayFeeAmount,
    currentFeeCoin.baseDenom,
    currentFeeCoinDisplayAvailableAmount,
    t,
    timeoutHeight,
  ]);

  return (
    <Container>
      <MarginTop8Div>
        <CoinButton
          type="button"
          onClick={(event) => {
            setPopoverAnchorEl(event.currentTarget);
          }}
        >
          <CoinLeftContainer>
            <CoinLeftImageContainer>
              <Image src={currentCoinOrToken.imageURL} />
            </CoinLeftImageContainer>
            <CoinLeftInfoContainer>
              <CoinLeftDisplayDenomContainer>
                <Typography variant="h5">{currentCoinOrTokenDisplayDenom}</Typography>
              </CoinLeftDisplayDenomContainer>
              <CoinLeftAvailableContainer>
                <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Cosmos.index.available')} :</Typography>{' '}
                <Tooltip title={currentCoinOrTokenDisplayAvailableAmount} arrow placement="top">
                  <span>
                    <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={currentDisplayMaxDecimals}>
                      {currentCoinOrTokenDisplayAvailableAmount}
                    </Number>
                  </span>
                </Tooltip>
              </CoinLeftAvailableContainer>
            </CoinLeftInfoContainer>
          </CoinLeftContainer>
          <CoinRightContainer data-is-active={isOpenPopover ? 1 : 0}>
            <BottomArrow24Icon />
          </CoinRightContainer>
        </CoinButton>
      </MarginTop8Div>
      <MarginTop8Div>
        <CoinButton
          type="button"
          onClick={(event) => {
            setRecipientPopoverAnchorEl(event.currentTarget);
          }}
        >
          <CoinLeftContainer>
            <CoinLeftImageContainer>
              <Image src={selectedRecipientChainIMG} />
            </CoinLeftImageContainer>
            <CoinLeftInfoContainer>
              <CoinLeftDisplayDenomContainer>
                <Typography variant="h5">{selectedRecipientChainChainName}</Typography>
              </CoinLeftDisplayDenomContainer>
              <CoinLeftAvailableContainer>
                <Tooltip title={selectedRecipientChainChannel} arrow placement="top">
                  <Typography variant="h6n">{selectedRecipientChainChannel}</Typography>
                </Tooltip>
              </CoinLeftAvailableContainer>
            </CoinLeftInfoContainer>
          </CoinLeftContainer>
          <CoinRightContainer data-is-active={isOpenPopover ? 1 : 0}>
            <BottomArrow24Icon />
          </CoinRightContainer>
        </CoinButton>
      </MarginTop8Div>
      <MarginTop8Div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                <AddressBook24Icon />
              </IconButton>
            </InputAdornment>
          }
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </MarginTop8Div>

      <MarginTop8Div>
        <StyledInput
          endAdornment={
            <InputAdornment position="end">
              <MaxButton
                type="button"
                onClick={() => {
                  setCurrentDisplayAmount(maxDisplayAmount);
                }}
              >
                <Typography variant="h7">MAX</Typography>
              </MaxButton>
            </InputAdornment>
          }
          onChange={(e) => {
            if (!isDecimal(e.currentTarget.value, currentCoinOrToken.decimals || 0) && e.currentTarget.value) {
              return;
            }

            setCurrentDisplayAmount(e.currentTarget.value);
          }}
          value={currentDisplayAmount}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.index.amountPlaceholder')}
        />
      </MarginTop8Div>

      <MarginTop8Div>
        <StyledTextarea
          multiline
          minRows={1}
          maxRows={1}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.index.memoPlaceholder')}
          onChange={(e) => setCurrentMemo(e.currentTarget.value)}
          value={currentMemo}
        />
      </MarginTop8Div>

      <MarginTop12Div>
        <Fee
          feeCoin={{ ...currentFeeCoin, originBaseDenom: currentFeeCoin.originBaseDenom }}
          gasRate={currentFeeGasRate}
          baseFee={currentFeeAmount}
          gas={currentGas}
          onChangeGas={(g) => setCurrentGas(g)}
          onChangeFee={(f) => setCurrentFeeAmount(f)}
          isEdit
        />
      </MarginTop12Div>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage}
              onClick={async () => {
                // FIXME timeoutHeight 널세이프티 조건 더 추가하기
                if (currentCoinOrToken.type === 'coin') {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'cos_signAmino',
                      params: {
                        chainName: chain.chainName,
                        doc: {
                          account_number: String(account.data?.value.account_number ?? ''),
                          sequence: String(account.data?.value.sequence ?? '0'),
                          chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
                          fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: fix(currentFeeAmount, 0) }], gas: currentGas },
                          memo: currentMemo,
                          msgs: [
                            {
                              type: chain.chainName === SHENTU.chainName ? 'bank/MsgTransfer' : 'cosmos-sdk/MsgTransfer',
                              value: {
                                receiver: currentAddress,
                                sender: address,
                                source_channel: selectedRecipientChain.counter_party?.channel,
                                source_port: selectedRecipientChain.port,
                                timeout_height: {
                                  revision_height: String(timeoutHeight?.revision_height ? timeoutHeight?.revision_height : 0),
                                  revision_number: timeoutHeight?.revision_number ? timeoutHeight?.revision_number : 0,
                                },
                                token: {
                                  amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                                  denom: selectedRecipientChain.denom,
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  });
                }

                if (currentCoinOrToken.type === 'token') {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'cos_signAmino',
                      params: {
                        chainName: chain.chainName,
                        doc: {
                          account_number: String(account.data?.value.account_number ?? ''),
                          sequence: String(account.data?.value.sequence ?? '0'),
                          chain_id: nodeInfo.data?.node_info?.network ?? chain.chainId,
                          fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: fix(currentFeeAmount, 0) }], gas: currentGas },
                          memo: currentMemo,
                          msgs: [
                            {
                              type: 'wasm/MsgExecuteContract',
                              value: {
                                sender: address,
                                contract: currentCoinOrToken.address,
                                msg: {
                                  transfer: {
                                    recipient: currentAddress,
                                    amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                                  },
                                },
                                funds: [],
                              },
                            },
                          ],
                        },
                      },
                    },
                  });
                }

                if (currentAccount.type === 'LEDGER') {
                  await openWindow();
                  window.close();
                }
              }}
            >
              {t('pages.Wallet.Send.Entry.Cosmos.index.sendButton')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>

      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        selectedRecipientChain={selectedRecipientCosmosChain}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a.address);
          setCurrentMemo(a.memo || '');
        }}
      />
      {/* ANCHOR - 수신인  */}
      <CoinOrTokenPopover
        chain={chain}
        address={address}
        marginThreshold={0}
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={checkedAvailableCoinList}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          // setSelectedRecipientChain(recipientChainList[0]);
          setSelectedRecipientChainDP(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.displayDenom : '');
          setCurrentDisplayAmount('');
          setCurrentAddress('');
          setCurrentMemo('');
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

      <RecipientChainPopover
        recipientList={recipientChainList}
        chain={chain}
        marginThreshold={0}
        selectedRecipientChain={selectedRecipientChain}
        onClickChain={(clickedChain) => {
          setSelectedRecipientChainDP(clickedChain);
        }}
        open={isRecipientOpenPopover}
        onClose={() => setRecipientPopoverAnchorEl(null)}
        anchorEl={recipientPopoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </Container>
  );
}

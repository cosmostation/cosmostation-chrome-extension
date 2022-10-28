import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as _ from 'lodash';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_DEFAULT_SEND_GAS, COSMOS_DEFAULT_TRANSFER_GAS, COSMOS_FEE_BASE_DENOMS, COSMOS_GAS_RATES } from '~/constants/chain';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRYPTO_ORG } from '~/constants/chain/cosmos/cryptoOrg';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { SHENTU } from '~/constants/chain/cosmos/shentu';
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
import { useCoinAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useCoinAssetsSWR';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { fix, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain, CosmosToken as BaseCosmosToken } from '~/types/chain';
import type { IbcSend } from '~/types/cosmos/ibcCoin';

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
import RecipentCoinOrTokenPopover from '../RecipentCoinorTokenPopover';

import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

export type CoinInfo = BaseCoinInfo & { type: typeof TYPE.COIN };
export type TokenInfo = BaseCosmosToken & { type: typeof TYPE.TOKEN };

export type CoinOrTokenInfo = CoinInfo | TokenInfo;

type CosmosProps = {
  chain: CosmosChain;
};
// 이거 넘겨주면 됨
export default function IBCSend({ chain }: CosmosProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const accounts = useAccounts(true);
  const allCosmosAssets = useCoinAssetsSWR();
  const currentChainAssets = useCoinAssetsSWR(chain);

  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const params = useParams();

  const { t } = useTranslation();
  const { currentCosmosTokens } = useCurrentCosmosTokens();
  // FIXME
  // TODO 현재 여러여러 루트를 통해 넘어온 토큰(카운터 denom이 ibc로 시작하는)은 그냥 제외해버렸음 수정이 필요함
  // 이런놈들은 gravityfasdikfhas이렇게 넘어옴
  // ex weth같은거
  // NOTE 수신인 팝업 추가
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [recipentPopoverAnchorEl, setRecipentPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);
  const isRecipentOpenPopover = Boolean(recipentPopoverAnchorEl);
  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { decimals, gas, gasRate } = chain;
  // NOTE 보유중인 모든 코인
  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
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

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39]), [chain.bech32Prefix.address]);
  // NOTE 현재 선택된 코인의 정보
  const currentCoinOrToken = useMemo(
    () =>
      availableCoinOrTokenList.find(
        (item) => (item.type === 'coin' && item.baseDenom === currentCoinOrTokenId) || (item.type === 'token' && item.address === currentCoinOrTokenId),
      )!,
    [availableCoinOrTokenList, currentCoinOrTokenId],
  );

  const sendGas = currentCoinOrToken.type === 'coin' ? gas.send || COSMOS_DEFAULT_SEND_GAS : gas.transfer || COSMOS_DEFAULT_TRANSFER_GAS;

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
  // FIXME 전체적으로 nullsafety로 인해 코드가 더러워지고 있음, 선언한 변수가 optional해서 그런거같으니 그 근본 변수를 확실히하자
  // NOTE 현재 체인의 asset중 counter_party필드를 가지고 있는 값들의 denom들의 배열
  //  현재 체인에서 ibc 코인을 ibc_send가 가능한 ibc코인의 base denom (e.g uatom)
  const IBCOkChainListDenom = currentChainAssets.data.filter((item) => item.counter_party).map((item) => item.base_denom);
  const IBCOkChainList = currentChainAssets.data.filter((item) => item.counter_party);
  const coinInfos = availableCoinOrTokenList.filter((item) => item.type === 'coin') as CoinInfo[];
  // NOTE 현재 보유중인 코인 중에서 available한 코인 리스트: native & ibc 구분
  const availableIBCCoinList = coinInfos.filter((item) => item.baseDenom.substring(0, 3) === 'ibc');
  const avaiableIBCCoinDisplayDenomList = availableIBCCoinList.map((item) => item.displayDenom);
  const availableNativeCoinList = coinInfos.filter((item) => item.baseDenom.substring(0, 3) !== 'ibc');

  // NOTE available한 코인중 수신할 체인이 있는 코인리스트
  // FIXME 더블 filter는 좀 구린데 include 하면 널 세이프티 적용이 안됨
  const checkedAvailableIBCCoinList = availableIBCCoinList.filter((item) =>
    item.originBaseDenom ? IBCOkChainListDenom.includes(item.originBaseDenom) : undefined,
  );

  // TODO 스테이킹 말고 네이티브도 체크가 되고있는건가?
  // FIXME 스테이킹 말고 네이티브가 available한데 정작 수신 채널에 아무것도 안뜰 가능성이 있음
  // 스테이킹을 먼저 체크하고 -> available리스트를 넘기고 -> 선택한 체인의 possible 수신인 리스트를 출력하는 프로세스라
  // coinList.coin
  const NativePossibleChainList = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      const NativeOkChainListChainName = allCosmosAssets.data
        .filter((item) => item.counter_party?.denom === currentCoinOrToken.baseDenom)
        .map((item) => item.chain);
      // FIXME emoney 체인 중복으로 잡힙
      const NativeChainList = currentChainAssets.data.filter(
        // 카운터 디놈이 긴 애들은 이미 수신 채널이 있는(그래비티, 주노)같은 놈들이라 날렸음
        (item) => NativeOkChainListChainName.includes(item.origin_chain) && (item.counter_party?.denom.length as number) < 20,
      );
      return NativeChainList;
    }
    return [];
  }, [allCosmosAssets.data, currentChainAssets.data, currentCoinOrToken]);
  // NOTE 네이티브 코인을 수신할 체인이 하나도 없는 경우 available에도 안뜨게 할려고

  // const NativePossibleChainListDenom = NativePossibleChainList?.map((item) => item.base_denom);
  // const checkedAvailableNativeCoinList = availableNativeCoinList.filter(
  //   (item) => (item.originBaseDenom ? NativePossibleChainListDenom?.includes(item.originBaseDenom) : undefined),
  // );

  // FIXME  현재 체인의 스테이킹은 check이 되는데 native는 수신 리스트가 있는지 체크가 안된 상태에서 리스트가 팝업으로 넘겨짐
  const checkedAvailableNativeCoinList = NativePossibleChainList ? [...availableNativeCoinList] : [];
  // NOTE 보유 available체인 중에서 수신할 체인이 있는지 체크가 된 보낼 코인리스트
  const checkedAvailableCoinList = [...checkedAvailableIBCCoinList, ...checkedAvailableNativeCoinList];

  // NOTE 선택한 코인을 수신 가능한 체인 리스트
  const canGetChain = useMemo(() => {
    const nameMap = {
      [CRYPTO_ORG.baseDenom]: CRYPTO_ORG.chainName,
      [ASSET_MANTLE.baseDenom]: ASSET_MANTLE.chainName,
      [GRAVITY_BRIDGE.baseDenom]: GRAVITY_BRIDGE.chainName,
    };
    const imgURLMap = {
      [EMONEY.chainName.toLowerCase()]: 'common/ngm.png',
    };
    if (currentCoinOrToken.type === 'coin') {
      // 선택 코인이 ibc일 경우
      if (avaiableIBCCoinDisplayDenomList.includes(currentCoinOrToken.displayDenom)) {
        const canSendIBC = IBCOkChainList.filter((item) => item.dp_denom === currentCoinOrToken.displayDenom).map(
          (item) =>
            ({
              chain_name: nameMap[item.base_denom] ? nameMap[item.base_denom] : item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
              // chain_name: item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
              // chain_name: item.coinGeckoId,
              base_denom: item.base_denom,
              display_denom: item.dp_denom,
              channel_id: item.counter_party?.channel,
              port_id: item.port,
              // FIXME nullsafety
              img_Url: item.counter_party?.denom.length && item.counter_party?.denom.substring(0, 4) === 'juno' ? 'common/juno.png' : item.image,
              counter_party: { chain_id: chain.baseDenom, channel_id: item.channel, port_id: item.counter_party?.port },
            } as IbcSend),
        );
        return canSendIBC;
      }
      const canSendNative = NativePossibleChainList.map(
        (item) =>
          ({
            chain_name: nameMap[item.base_denom] ? nameMap[item.base_denom] : item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
            // chain_name: item.coinGeckoId,
            // chain_name: item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
            base_denom: item.base_denom,
            display_denom: item.dp_denom,
            channel_id: item.counter_party?.channel,
            port_id: item.port,
            img_Url: imgURLMap[item.origin_chain] ? imgURLMap[item.origin_chain] : item.image,
            counter_party: { chain_id: chain.baseDenom, channel_id: item.channel, port_id: item.counter_party?.port },
          } as IbcSend),
      );
      // const uniqueCanSendNative = canSendNative.filter((element, index) => canSendNative.indexOf(element) === index);
      // FIXME lodash 불필요한 전체 import
      const uniqueCanSendNative = _.uniqBy(canSendNative, 'chain_name');
      return uniqueCanSendNative;
    }
    // FIXME undefined대신 다른거
    return undefined;
  }, [currentCoinOrToken.type, currentCoinOrToken.displayDenom, avaiableIBCCoinDisplayDenomList, NativePossibleChainList, IBCOkChainList, chain.baseDenom]);

  // FIXME 현재 current코인이 바뀌면 canGetChain가 자동으로 안바뀌어서 그 전의 첫번째 값을 가져와서 문제가 발생
  // FIXME useMemo를 사용하여 수정할
  // NOTE 선택된

  const [selectedCanGetChain, setSelectedCurrentCoinOrTokenId] = useState(canGetChain ? canGetChain[0] : undefined);
  // useEffect(() => {
  //   setSelectedCurrentCoinOrTokenId(canGetChain ? canGetChain[0] : undefined);
  // }, [canGetChain, currentCoinOrToken]);

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
  // NOTE 현재 선택된 코인의 정보
  const currentCoinOrTokenDisplayDenom = currentCoinOrToken.displayDenom;
  const currentDisplayMaxDecimals = getDisplayMaxDecimals(currentCoinOrTokenDecimals);

  const errorMessage = useMemo(() => {
    if (!addressRegex.test(currentAddress) || address === currentAddress) {
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
    address,
    addressRegex,
    currentAddress,
    currentCoinOrToken,
    currentCoinOrTokenDisplayAvailableAmount,
    currentDisplayAmount,
    currentDisplayFeeAmount,
    currentFeeCoin.baseDenom,
    currentFeeCoinDisplayAvailableAmount,
    t,
  ]);
  return (
    <Container>
      {/* 보낼 코인 */}
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
      {/* 수신 체인 */}
      <MarginTop8Div>
        <CoinButton
          type="button"
          onClick={(event) => {
            setRecipentPopoverAnchorEl(event.currentTarget);
          }}
        >
          <CoinLeftContainer>
            <CoinLeftImageContainer>
              <Image
                src={
                  // FIXME nullsafety
                  selectedCanGetChain
                    ? selectedCanGetChain.display_denom.substring(0, 3) === 'axl'
                      ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/common/axl.png`
                      : `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${selectedCanGetChain.img_Url}`
                    : undefined
                  // selectedCanGetChain?.img_Url
                  //   ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${selectedCanGetChain?.img_Url}`
                  //   : undefined
                }
              />
            </CoinLeftImageContainer>
            <CoinLeftInfoContainer>
              <CoinLeftDisplayDenomContainer>
                <Typography variant="h5">
                  {selectedCanGetChain ? (selectedCanGetChain.display_denom.substring(0, 3) === 'axl' ? 'Axelar' : selectedCanGetChain.chain_name) : undefined}
                </Typography>
              </CoinLeftDisplayDenomContainer>
              <CoinLeftAvailableContainer>
                <Typography variant="h6n">{selectedCanGetChain?.channel_id}</Typography>
                {/* <Tooltip title={selectedCanGetChain?.channel_id ? selectedCanGetChain?.channel_id : ''} arrow placement="top">
                  <span>{selectedCanGetChain?.channel_id}</span>
                </Tooltip> */}
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
      {/* FIXME Overflow error */}
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
                              type: chain.chainName === SHENTU.chainName ? 'bank/MsgSend' : 'cosmos-sdk/MsgSend',
                              value: {
                                from_address: address,
                                to_address: currentAddress,
                                amount: [
                                  { amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0), denom: currentCoinOrToken.baseDenom },
                                ],
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

      {/* TODO 선택한 수신인의 체인의 주소목록을 불러와야함 */}
      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a.address);
          setCurrentMemo(a.memo || '');
        }}
      />

      <CoinOrTokenPopover
        chain={chain}
        address={address}
        marginThreshold={0}
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={checkedAvailableCoinList}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          // FIXME 다음 체인이 선택되면 그 전 체인의 값을 가져오게됨
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          setCurrentDisplayAmount('');
          setSelectedCurrentCoinOrTokenId(canGetChain ? canGetChain[0] : undefined);
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
      {/* TODO 수신가능한 리스트 팝업버튼 */}
      {/* TODO currentCoinOrToken가 어디에 속해있는지 따라 보여주는 수신인 리스트가 달라야 할 것 */}
      {/* TODO 선택되면 선택된 그 카운터 정보의 channel 정보를 저장하도록 하자 */}
      <RecipentCoinOrTokenPopover
        recipentList={canGetChain}
        chain={chain}
        marginThreshold={0}
        currentCoinOrTokenInfo={currentCoinOrToken}
        // 여기에 checkedList들어가면 되겠다
        // coinOrTokenInfos={checkedAvailableCoinList}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setSelectedCurrentCoinOrTokenId(clickedCoinOrToken);
        }}
        open={isRecipentOpenPopover}
        onClose={() => setRecipentPopoverAnchorEl(null)}
        anchorEl={recipentPopoverAnchorEl}
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

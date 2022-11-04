import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as _ from 'lodash';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SEND_GAS, COSMOS_DEFAULT_TRANSFER_GAS, COSMOS_FEE_BASE_DENOMS, COSMOS_GAS_RATES } from '~/constants/chain';
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

  const { decimals, gas, gasRate } = chain;

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
  // FIXME - coin type이 token인 경우에 대한 ibc send 미구현 상태
  // NOTE 현재 체인에서 가지고있는 ibc 코인을 ibc_send가 가능한 ibc코인의 List
  const ibcPossibleChainList = currentChainAssets.data.filter((item) => item.counter_party);
  const ibcPossibleChainListDenom = currentChainAssets.data.filter((item) => item.counter_party).map((item) => item.base_denom);
  const coinInfos = availableCoinOrTokenList.filter((item) => item.type === 'coin') as CoinInfo[];
  // NOTE 현재 보유중인 코인 중에서 available한 코인 리스트: native & ibc 구분
  const availableIBCCoinList = coinInfos.filter((item) => item.baseDenom.substring(0, 3) === 'ibc');
  const avaiableIBCCoinDisplayDenomList = availableIBCCoinList.map((item) => item.displayDenom);
  const availableNativeCoinList = coinInfos.filter((item) => item.baseDenom.substring(0, 3) !== 'ibc');

  // NOTE available한 IBC코인중 수신할 체인이 있는 available한 IBC코인리스트
  const checkedAvailableIBCCoinList = availableIBCCoinList.filter((item) =>
    item.originBaseDenom ? ibcPossibleChainListDenom.includes(item.originBaseDenom) : [],
  );

  // NOTE 현재 체인에서 가지고 있는 native coin을 수신 가능한 체인의 List
  const NativePossibleChainList = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      const NativeOkChainListChainName = allCosmosAssets.data
        .filter((item) => item.counter_party?.denom === currentCoinOrToken.baseDenom)
        .map((item) => item.chain);
      const NativeChainList = currentChainAssets.data.filter(
        // couter_party필드의 denom이 긴 값은 이미 수신 채널이 정의되어있는(그래비티, 주노)있기에 임시적으로 length값으로 필터링하였음
        (item) => NativeOkChainListChainName.includes(item.origin_chain) && (item.counter_party?.denom.length as number) < 20,
      );
      return NativeChainList;
    }
    return [];
  }, [allCosmosAssets.data, currentChainAssets.data, currentCoinOrToken]);

  // FIXME  현재 체인의 스테이킹은 check이 되는데 native는 수신 리스트가 있는지 체크가 안된 상태에서 리스트가 팝업으로 넘겨짐
  const checkedAvailableNativeCoinList = NativePossibleChainList ? [...availableNativeCoinList] : [];
  // NOTE 보유 available체인 중에서 수신할 체인이 있는지 체크가 된 보낼 코인 List
  const checkedAvailableCoinList = [...checkedAvailableIBCCoinList, ...checkedAvailableNativeCoinList];

  // NOTE 선택한 코인을 수신 가능한 체인 리스트
  const recipientChainList = useMemo(() => {
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
        const ibcRecipientChainList = ibcPossibleChainList
          .filter((item) => item.dp_denom === currentCoinOrToken.displayDenom)
          .map(
            (item) =>
              ({
                chain_name: nameMap[item.base_denom] ? nameMap[item.base_denom] : item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
                denom: item.denom,
                base_denom: item.base_denom,
                display_denom: item.dp_denom,
                channel_id: item.counter_party?.channel,
                port_id: item.port,
                // FIXME nullsafety
                img_Url: item.counter_party?.denom.length && item.counter_party?.denom.substring(0, 4) === 'juno' ? 'common/juno.png' : item.image,
                counter_party: { chain_id: chain.baseDenom, channel_id: item.channel, port_id: item.counter_party?.port },
              } as IbcSend),
          );
        return ibcRecipientChainList;
      }
      const nativeRecipientChainList = NativePossibleChainList.map(
        (item) =>
          ({
            chain_name: nameMap[item.base_denom] ? nameMap[item.base_denom] : item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
            denom: item.denom,
            base_denom: item.base_denom,
            display_denom: item.dp_denom,
            channel_id: item.counter_party?.channel,
            port_id: item.port,
            img_Url: imgURLMap[item.origin_chain] ? imgURLMap[item.origin_chain] : item.image,
            counter_party: { chain_id: chain.baseDenom, channel_id: item.channel, port_id: item.counter_party?.port },
          } as IbcSend),
      );
      // FIXME lodash 불필요한 전체 import
      const uniqueNativeRecipientChainList = _.uniqBy(nativeRecipientChainList, 'chain_name');
      return uniqueNativeRecipientChainList;
    }
    return [];
  }, [
    currentCoinOrToken.type,
    currentCoinOrToken.displayDenom,
    avaiableIBCCoinDisplayDenomList,
    NativePossibleChainList,
    ibcPossibleChainList,
    chain.baseDenom,
  ]);

  // NOTE 선택된 수신 체인
  const [selectedRecipientChain, setSelectedRecipientChain] = useState(recipientChainList[0] ?? []);
  // REVIEW - 계산이 반복됨. 최적화가 필요함
  // useEffect(() => {
  //   setSelectedCurrentCoinOrTokenId(recipientChainList[0]);
  // }, [recipientChainList]);

  const cosmosSelectedRC = useMemo(
    () => COSMOS_CHAINS.find((item) => selectedRecipientChain?.base_denom === item.baseDenom),
    [selectedRecipientChain?.base_denom],
  );
  const addressRegex = useMemo(() => getCosmosAddressRegex(cosmosSelectedRC?.bech32Prefix.address || '', [39]), [cosmosSelectedRC?.bech32Prefix.address]);
  // TODO error handling
  const [timeoutHeight, setTimeoutHeight] = useState<ibc.core.client.v1.IHeight>();
  // const [sample, setSample] = useState<number>();

  useEffect(() => {
    const getTimeout = async () => {
      const identifiedClientStateInfo =
        await get<ibc.core.channel.v1.IQueryChannelClientStateResponse>(`https://lcd-osmosis.cosmostation.io/ibc/core/channel/v1/channels/${selectedRecipientChain.counter_party.channel_id}/ports/${selectedRecipientChain.port_id}/client_state
        `);

      const clientState = identifiedClientStateInfo.identified_client_state?.client_state as ibc.lightclients.tendermint.v1.IClientState;
      const latestHeight = clientState?.latest_height ?? {};
      const timeoutHeightInfo = {
        revision_number: latestHeight?.revision_number ? +latestHeight.revision_number : 0,
        revision_height: latestHeight?.revision_height ? 1000 + +latestHeight.revision_height : 0,
      };
      // REVIEW - fortest
      // const a = (clientState.trusting_period as string) ?? 0;
      // const b = a.slice(0, -1) as unknown as number;
      // setSample(b);

      setTimeoutHeight(timeoutHeightInfo);
    };
    getTimeout().catch((e) => {
      // FIXME 에러 스낵바 보다 다른 에러 캐치방식을 고려해보는게 좋다고 생각합니다.
      const message = (e as { message?: string }).message ? (e as { message: string }).message : 'Failed';
      enqueueSnackbar(message, { variant: 'error' });
    });
  }, [enqueueSnackbar, selectedRecipientChain.counter_party.channel_id, selectedRecipientChain.port_id]);

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
    // TODO timeoutHeight error handling
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
          {/* FIXME axelar를 거쳐 들어온 코인의 경우 이미지 정보가 모두 이더리움이어서 강제로 형변화 */}
          <CoinLeftContainer>
            <CoinLeftImageContainer>
              <Image
                src={
                  selectedRecipientChain.display_denom.substring(0, 3) === 'axl'
                    ? `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/common/axl.png`
                    : `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${selectedRecipientChain.img_Url}`
                }
              />
            </CoinLeftImageContainer>
            <CoinLeftInfoContainer>
              <CoinLeftDisplayDenomContainer>
                <Typography variant="h5">
                  {selectedRecipientChain.display_denom.substring(0, 3) === 'axl' ? 'Axelar' : selectedRecipientChain.chain_name}
                </Typography>
              </CoinLeftDisplayDenomContainer>
              <CoinLeftAvailableContainer>
                <Tooltip title={selectedRecipientChain?.channel_id} arrow placement="top">
                  <Typography variant="h6n">{selectedRecipientChain?.channel_id}</Typography>
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
                                source_channel: selectedRecipientChain.counter_party.channel_id,
                                source_port: selectedRecipientChain.port_id,
                                timeout_height: {
                                  revision_height: timeoutHeight?.revision_height ?? 0,
                                  revision_number: timeoutHeight?.revision_number ?? 0,
                                },
                                // FIXME timeout값 둘중 하나만 정의해도 괜찮은것으로 이해했지만 옳은 것인지는 모르겠음
                                // TimeoutHeight and TimeoutTimestamp are both zero.
                                // timeout_timestamp: sample ?? 0,
                                timeout_timestamp: 0,
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

      {/* TODO 선택한 수신인의 체인의 주소목록을 불러와야함 */}
      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        // NOTE 선택한 체인의 주소를 불러오기 위한 props
        selectedRecipientChain={cosmosSelectedRC}
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
          setCurrentAddress('');
          setCurrentMemo('');
          setSelectedRecipientChain(recipientChainList[0]);
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
          setSelectedRecipientChain(clickedChain);
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

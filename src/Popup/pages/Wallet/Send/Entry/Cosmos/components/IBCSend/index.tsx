import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_CHAINS, COSMOS_DEFAULT_IBCSEND_GAS, COSMOS_DEFAULT_TRANSFER_GAS, COSMOS_FEE_BASE_DENOMS, COSMOS_GAS_RATES } from '~/constants/chain';
import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRYPTO_ORG } from '~/constants/chain/cosmos/cryptoOrg';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
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
import { useClientState } from '~/Popup/hooks/SWR/cosmos/useClientStateSWR';
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
import type { CosmosChain, CosmosToken as BaseCosmosToken, IBCCosmosChain } from '~/types/chain';
import type { AssetV2 } from '~/types/cosmos/asset';

import {
  BottomContainer,
  ChainButton,
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
  const cosmosChainsAssets = useAssetsSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const nodeInfo = useNodeInfoSWR(chain);
  const { enQueue } = useCurrentQueue();
  const params = useParams();

  const { t } = useTranslation();
  const { currentCosmosTokens } = useCurrentCosmosTokens();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [recipientPopoverAnchorEl, setRecipientPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);
  const isRecipientOpenPopover = Boolean(recipientPopoverAnchorEl);
  const senderAddress = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { decimals, gas, gasRate } = chain;
  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        coinType: 'staking',
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

  const [receiverAddress, setreceiverAddress] = useState('');
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

  const sendGas = currentCoinOrToken.type === 'coin' ? gas.ibcSend || COSMOS_DEFAULT_IBCSEND_GAS : gas.transfer || COSMOS_DEFAULT_TRANSFER_GAS;

  const [currentGas, setCurrentGas] = useState(sendGas);
  const [currentFeeAmount, setCurrentFeeAmount] = useState(times(sendGas, gasRate.low));

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentFeeAmount, decimals);

  const tokenBalance = useTokenBalanceSWR(chain, currentCoinOrTokenId, senderAddress);

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
  // REVIEW - 수신할 체인이 아예 없는, ibc send가 불가능한 케이스도 테스트해볼것
  // NOTE - cw20 토큰은 ibc send가 완전히 다르니 우선 무시할것 ...

  // NOTE 현재 체인에서 가지고있는 ibc 코인을 ibc_send가 가능한 ibc코인의 List
  const ibcPossibleChainList = currentChainAssets.data
    .filter((item) => item.counter_party)
    .map((item) => ({
      ...item,
      origin_chain: item.path ? item.path?.split('>').at(-2) : item.origin_chain,
    }));

  // FIXME 변수명 정리
  // NOTE 현재 체인에서 가지고 있는 native coin을 수신 가능한 체인의 List
  const nativePossibleChainList = useMemo(() => {
    if (currentCoinOrToken.type === 'coin') {
      const nativeOkChainList = cosmosChainsAssets.data.filter((item) => item.counter_party?.denom === currentCoinOrToken.baseDenom);
      const nativeOkChainNameList = cosmosChainsAssets.data
        .filter((item) => item.counter_party?.denom === currentCoinOrToken.baseDenom)
        .map((item) => item.chain);
      const nativePossibleAssets = currentChainAssets.data.filter((item) => nativeOkChainNameList.includes(item.origin_chain));
      const nativeChainList = nativePossibleAssets.map((item) => ({
        ...item,
        denom: nativeOkChainList.find((nativeChain) => nativeChain.chain === item.origin_chain)?.base_denom,
        origin_chain: item.path ? item.path?.split('>').at(-2) ?? item.origin_chain : item.origin_chain,
      }));

      return nativeChainList;
    }
    return [];
  }, [cosmosChainsAssets.data, currentChainAssets.data, currentCoinOrToken]);

  // 이미 type이라는 필드명을 사용중이어서 'coinType'이라는 필드를 선언함
  // NOTE 현재 보유중인 코인 중에서 available한 코인 리스트: native & ibc 구분
  const coinInfos = availableCoinOrTokenList.filter((item) => item.type === 'coin') as CoinInfo[];
  const ibcPossibleChainListDenom = currentChainAssets.data.filter((item) => item.counter_party).map((item) => item.base_denom);
  const availableIBCCoinList = coinInfos.filter((item) => item.coinType === 'ibc');
  const availableNativeCoinList = coinInfos.filter((item) => item.coinType === 'staking' || item.coinType === 'native');

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

    if (currentCoinOrToken.type === 'coin') {
      if (currentCoinOrToken.coinType === 'ibc') {
        const ibcRecipientChainList = ibcPossibleChainList
          .filter((item) => item.base_denom === currentCoinOrToken.originBaseDenom)
          .map(
            (item) =>
              ({
                ...item,
                chain: nameMap[item.base_denom]
                  ? nameMap[item.base_denom]
                  : COSMOS_CHAINS.find((cosmosChain) => cosmosChain.chainName.toLowerCase() === item.origin_chain)?.chainName,
              } as AssetV2),
          );
        return ibcRecipientChainList;
      }
      const nativeRecipientChainList = nativePossibleChainList.map(
        (item) =>
          ({
            ...item,
            chain: nameMap[item.base_denom]
              ? nameMap[item.base_denom]
              : COSMOS_CHAINS.find((cosmosChain) => cosmosChain.chainName.toLowerCase() === item.origin_chain)?.chainName,
          } as AssetV2),
      );

      const uniqueNativeRecipientChainList = _.uniqBy(nativeRecipientChainList, 'chain');
      return uniqueNativeRecipientChainList;
    }
    return [];
  }, [currentCoinOrToken, nativePossibleChainList, ibcPossibleChainList]);

  const recipientChainNameList = recipientChainList.map((item) => item.chain);
  const recipientCosmosChainList = useMemo(
    () =>
      COSMOS_CHAINS.filter((item) => recipientChainNameList.includes(item.chainName)).map(
        (item) =>
          ({
            ...item,
            channelId: recipientChainList.find((recipientChain) => recipientChain.chain === item.chainName)?.channel,
            counterChannelId: recipientChainList.find((recipientChain) => recipientChain.chain === item.chainName)?.counter_party?.channel,
            ibcDenom: recipientChainList.find((recipientChain) => recipientChain.chain === item.chainName)?.denom,
          } as IBCCosmosChain),
      ),
    [recipientChainNameList, recipientChainList],
  );
  // NOTE 선택된 수신 체인
  // ANCHOR - 수신인
  const [selectedRecipientChain, setSelectedRecipientChain] = useState(recipientCosmosChainList[0] ?? '');
  // NOTE 코인 재선택시 자동으로 수신 체인 리스트 변경 반영
  useEffect(() => {
    setSelectedRecipientChain(recipientCosmosChainList[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCoinOrTokenId]);

  const selectedRecipientChainChainName = selectedRecipientChain?.chainName ?? 'UNKNOWN';
  const selectedRecipientChainChannel = selectedRecipientChain.counterChannelId ?? 'UNKNOWN';
  const addressRegex = useMemo(
    () => getCosmosAddressRegex(selectedRecipientChain?.bech32Prefix.address || '', [39]),
    [selectedRecipientChain?.bech32Prefix.address],
  );

  const currentChainAssetName = currentChainAssets.data.find((item) => item.base_denom === chain.baseDenom)?.origin_chain ?? chain.chainName.toLowerCase();

  const timeoutHeight = useClientState(currentChainAssetName, selectedRecipientChain.channelId ?? '');
  const revisionHeight = String(1000 + parseInt(timeoutHeight.data?.timeoutHeight?.revision_height ?? '', 10));
  const revisionNumber = timeoutHeight.data?.timeoutHeight?.revision_number;

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
    if (!addressRegex.test(receiverAddress)) {
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
    receiverAddress,
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
        <ChainButton
          type="button"
          onClick={(event) => {
            setRecipientPopoverAnchorEl(event.currentTarget);
          }}
        >
          <CoinLeftContainer>
            <CoinLeftImageContainer>
              <Image src={selectedRecipientChain?.imageURL} />
            </CoinLeftImageContainer>
            <CoinLeftInfoContainer>
              <CoinLeftDisplayDenomContainer>
                <Typography variant="h5">{selectedRecipientChainChainName}</Typography>
              </CoinLeftDisplayDenomContainer>
              <CoinLeftAvailableContainer>
                <Typography variant="h6n">{selectedRecipientChainChannel}</Typography>
              </CoinLeftAvailableContainer>
            </CoinLeftInfoContainer>
          </CoinLeftContainer>
          <CoinRightContainer data-is-active={isRecipientOpenPopover ? 1 : 0}>
            <BottomArrow24Icon />
          </CoinRightContainer>
        </ChainButton>
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
          onChange={(e) => setreceiverAddress(e.currentTarget.value)}
          value={receiverAddress}
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
                if (currentCoinOrToken.type === 'coin' && revisionNumber && revisionHeight) {
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
                                receiver: receiverAddress,
                                sender: senderAddress,
                                source_channel: selectedRecipientChain.channelId,
                                source_port: 'transfer',
                                timeout_height: {
                                  revision_height: revisionHeight,
                                  revision_number: revisionNumber,
                                },
                                token: {
                                  amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                                  denom: selectedRecipientChain.ibcDenom,
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
                                sender: senderAddress,
                                contract: currentCoinOrToken.address,
                                msg: {
                                  transfer: {
                                    recipient: receiverAddress,
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
        selectedRecipientChain={selectedRecipientChain}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setreceiverAddress(a.address);
          setCurrentMemo(a.memo || '');
        }}
      />

      <CoinOrTokenPopover
        chain={chain}
        address={senderAddress}
        marginThreshold={0}
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={checkedAvailableCoinList}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          setSelectedRecipientChain(recipientCosmosChainList[0]);
          setCurrentDisplayAmount('');
          setreceiverAddress('');
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
        recipientList={recipientCosmosChainList}
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

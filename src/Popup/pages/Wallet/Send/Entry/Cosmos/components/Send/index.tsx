import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_DEFAULT_SEND_GAS, COSMOS_DEFAULT_TRANSFER_GAS } from '~/constants/chain';
import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { SHENTU } from '~/constants/chain/cosmos/shentu';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import AssetBottomSheetButton from '~/Popup/components/common/AssetBottomSheetButton';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useArchIDSWR } from '~/Popup/hooks/SWR/cosmos/useArchIDSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useGasMultiplySWR } from '~/Popup/hooks/SWR/cosmos/useGasMultiplySWR';
import { useICNSSWR } from '~/Popup/hooks/SWR/cosmos/useICNSSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useParamsSWR } from '~/Popup/hooks/SWR/cosmos/useParamsSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokenBalanceSWR';
import { useTokensBalanceSWR as useCosmosTokensBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokensBalanceSWR';
import { useChainIdToAssetNameMapsSWR } from '~/Popup/hooks/SWR/useChainIdToAssetNameMapsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { convertAssetNameToCosmos, getPublicKeyType } from '~/Popup/utils/cosmos';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain, GasRateKey } from '~/types/chain';

import {
  Address,
  AddressContainer,
  BottomContainer,
  CheckAddressIconContainer,
  Container,
  LeftContainer,
  LeftHeaderTitleContainer,
  LeftImageContainer,
  LeftInfoContainer,
  MarginTop8Div,
  MarginTop12Div,
  MarginTop16Div,
  MaxButton,
  StyledInput,
  StyledTextarea,
  TitleContainer,
} from './styled';
import type { CoinOrTokenInfo } from '../..';
import CoinListBottomSheet from '../CoinListBottomSheet';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import CheckAddress16Icon from '~/images/icons/CheckAddress16.svg';

export const TYPE = {
  COIN: 'coin',
  TOKEN: 'token',
} as const;

type CosmosProps = {
  chain: CosmosChain;
};

export default function Send({ chain }: CosmosProps) {
  const { currentAccount } = useCurrentAccount();
  const account = useAccountSWR(chain, true);
  const { vestingRelatedAvailable, totalAmount } = useAmountSWR(chain, true);
  const coinList = useCoinListSWR(chain, true);
  const accounts = useAccounts(true);
  const nodeInfo = useNodeInfoSWR(chain);
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { enQueue } = useCurrentQueue();
  const params = useParams();

  const chainParams = useParamsSWR(chain);
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR();

  const [isDisabled, setIsDisabled] = useState(false);

  const { t } = useTranslation();

  const { currentCosmosTokens } = useCurrentCosmosTokens(chain);

  const [isOpenedCoinList, setIsOpenedCoinList] = useState(false);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const { gas, gasRate } = chain;

  const coinAll = useMemo(
    () => [
      {
        availableAmount: vestingRelatedAvailable,
        totalAmount,
        decimals: chain.decimals,
        imageURL: chain.tokenImageURL,
        displayDenom: chain.displayDenom,
        baseDenom: chain.baseDenom,
        coinGeckoId: chain.coinGeckoId,
        baseChainName: chain.chainName,
      },
      ...coinList.coins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
      ...coinList.ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)).map((item) => ({ ...item })),
    ],
    [
      chain.baseDenom,
      chain.chainName,
      chain.coinGeckoId,
      chain.decimals,
      chain.displayDenom,
      chain.tokenImageURL,
      coinList.coins,
      coinList.ibcCoins,
      totalAmount,
      vestingRelatedAvailable,
    ],
  );

  const cosmosTokensBalance = useCosmosTokensBalanceSWR({ chain, contractAddresses: currentCosmosTokens.map((item) => item.address), address });

  const availableCoinOrTokenList: CoinOrTokenInfo[] = useMemo(() => {
    const coinOrTokenList = [
      ...coinAll.map((item) => ({
        ...item,
        type: TYPE.COIN,
        name: convertAssetNameToCosmos(item.baseChainName || '', chainIdToAssetNameMaps)?.chainName || item.baseChainName?.toUpperCase() || '',
      })),
      ...currentCosmosTokens.map((item) => ({
        ...item,
        type: TYPE.TOKEN,
        availableAmount: cosmosTokensBalance.data.find((tokenBalance) => tokenBalance.contractAddress === item.address)?.balance || '0',
        name: chain.chainName,
      })),
    ].map((item) => {
      const coinPrice = item.coinGeckoId ? coinGeckoPrice.data?.[item.coinGeckoId]?.[currency] || '0' : '0';
      const price = times(toDisplayDenomAmount(item.availableAmount, item.decimals), coinPrice);
      return {
        ...item,
        price,
      };
    });

    return coinOrTokenList
      .sort((a, b) => (gt(a.availableAmount, b.availableAmount) ? -1 : 1))
      .sort((a, b) => (gt(a.price, b.price) ? -1 : 1))
      .sort((a) => (a.displayDenom === chain.displayDenom ? -1 : 1));
  }, [chain.chainName, chain.displayDenom, chainIdToAssetNameMaps, coinAll, coinGeckoPrice.data, cosmosTokensBalance.data, currency, currentCosmosTokens]);

  const [currentCoinOrTokenId, setCurrentCoinOrTokenId] = useState(params.id || chain.baseDenom);

  const [currentAddress, setCurrentAddress] = useState('');

  const [debouncedCurrentAddress] = useDebounce(currentAddress, 500);

  const [currentDisplayAmount, setCurrentDisplayAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39]), [chain.bech32Prefix.address]);

  const { data: ICNS } = useICNSSWR({ name: addressRegex.test(debouncedCurrentAddress) || chain.id === ARCHWAY.id ? '' : debouncedCurrentAddress });

  const { data: ArchID } = useArchIDSWR({ archID: addressRegex.test(debouncedCurrentAddress) || chain.id !== ARCHWAY.id ? '' : debouncedCurrentAddress });

  const nameResolvedAddress = useMemo(() => {
    if (chain.id === ARCHWAY.id) {
      return ArchID?.data.address;
    }
    return ICNS?.data.bech32_address;
  }, [ArchID?.data?.address, ICNS?.data.bech32_address, chain.id]);

  const currentDepositAddress = useMemo(() => nameResolvedAddress || currentAddress, [nameResolvedAddress, currentAddress]);

  const currentCoinOrToken = useMemo(
    () =>
      availableCoinOrTokenList.find(
        (item) => (item.type === 'coin' && item.baseDenom === currentCoinOrTokenId) || (item.type === 'token' && item.address === currentCoinOrTokenId),
      )!,
    [availableCoinOrTokenList, currentCoinOrTokenId],
  );

  const { feeCoins, defaultGasRateKey } = useCurrentFeesSWR(chain);

  const sendGas = useMemo(
    () => (currentCoinOrToken.type === 'coin' ? gas.send || COSMOS_DEFAULT_SEND_GAS : gas.transfer || COSMOS_DEFAULT_TRANSFER_GAS),
    [currentCoinOrToken.type, gas.send, gas.transfer],
  );

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [customGasRateKey, setCustomGasRateKey] = useState<GasRateKey | undefined>();

  const currentGasRateKey = useMemo(() => customGasRateKey || defaultGasRateKey, [defaultGasRateKey, customGasRateKey]);

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

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(feeCoins[0].baseDenom);

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom) ?? feeCoins[0], [currentFeeBaseDenom, feeCoins]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeCoin.availableAmount, currentFeeCoin.decimals),
    [currentFeeCoin.availableAmount, currentFeeCoin.decimals],
  );

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate ?? gasRate, [currentFeeCoin.gasRate, gasRate]);

  const currentCoinOrTokenDecimals = useMemo(() => currentCoinOrToken.decimals || 0, [currentCoinOrToken.decimals]);

  const currentCoinOrTokenDisplayDenom = currentCoinOrToken.displayDenom;

  const currentDisplayMaxDecimals = useMemo(() => getDisplayMaxDecimals(currentCoinOrTokenDecimals), [currentCoinOrTokenDecimals]);

  const memoizedSendAminoTx = useMemo(() => {
    if (account.data?.value.account_number && addressRegex.test(currentDepositAddress) && currentDisplayAmount) {
      const sequence = String(account.data?.value.sequence || '0');

      if (currentCoinOrToken.type === 'coin') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: currentFeeCoin.baseDenom,
                amount: chain.type === 'ETHERMINT' ? times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_SEND_GAS, 0) : '1',
              },
            ],
            gas: COSMOS_DEFAULT_SEND_GAS,
          },
          memo: currentMemo,
          msgs: [
            {
              type: chain.chainName === SHENTU.chainName ? 'bank/MsgSend' : 'cosmos-sdk/MsgSend',
              value: {
                from_address: address,
                to_address: currentDepositAddress,
                amount: [{ amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0), denom: currentCoinOrToken.baseDenom }],
              },
            },
          ],
        };
      }

      if (currentCoinOrToken.type === 'token') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: currentFeeCoin.baseDenom,
                amount: times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_TRANSFER_GAS, 0),
              },
            ],
            gas: COSMOS_DEFAULT_TRANSFER_GAS,
          },
          memo: currentMemo,
          msgs: [
            {
              type: 'wasm/MsgExecuteContract',
              value: {
                sender: address,
                contract: currentCoinOrToken.address,
                msg: {
                  transfer: {
                    recipient: currentDepositAddress,
                    amount: toBaseDenomAmount(currentDisplayAmount, currentCoinOrToken.decimals || 0),
                  },
                },
                funds: [],
              },
            },
          ],
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    address,
    addressRegex,
    chain.chainId,
    chain.chainName,
    chain.type,
    currentDepositAddress,
    currentCoinOrToken,
    currentDisplayAmount,
    currentFeeCoin.baseDenom,
    currentFeeGasRate,
    currentGasRateKey,
    currentMemo,
    nodeInfo.data?.default_node_info?.network,
  ]);

  const [sendAminoTx] = useDebounce(memoizedSendAminoTx, 700);

  const sendProtoTx = useMemo(() => {
    if (sendAminoTx) {
      const pTx = protoTx(sendAminoTx, [Buffer.from(new Uint8Array(64)).toString('base64')], { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [chain, sendAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: sendProtoTx?.tx_bytes });

  const { data: gasMultiply } = useGasMultiplySWR(chain);

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasMultiply, 0) : undefined),
    [gasMultiply, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(() => customGas || simulatedGas || sendGas, [customGas, sendGas, simulatedGas]);

  const currentFeeAmount = useMemo(() => times(currentGas, currentFeeGasRate[currentGasRateKey]), [currentFeeGasRate, currentGas, currentGasRateKey]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentCeilFeeAmount, currentFeeCoin.decimals);

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount);
    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentCoinOrTokenDisplayAvailableAmount;
  }, [currentCoinOrToken, currentCoinOrTokenDisplayAvailableAmount, currentDisplayFeeAmount, currentFeeCoin.baseDenom]);

  const errorMessage = useMemo(() => {
    if (chainParams.data?.params?.chainlist_params?.isBankLocked) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.bankLocked');
    }

    if (!addressRegex.test(currentDepositAddress) || address === currentDepositAddress) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.invalidAddress');
    }

    if (!currentDisplayAmount || !gt(currentDisplayAmount, '0')) {
      return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.invalidAmount');
    }

    if (currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom === currentFeeCoin.baseDenom) {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, plus(currentDisplayAmount, currentDisplayFeeAmount))) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.insufficientAmount');
      }
    }

    if ((currentCoinOrToken.type === 'coin' && currentCoinOrToken.baseDenom !== currentFeeCoin.baseDenom) || currentCoinOrToken.type === 'token') {
      if (!gte(currentCoinOrTokenDisplayAvailableAmount, currentDisplayAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.insufficientAmount');
      }

      if (!gte(currentFeeCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.insufficientFeeAmount');
      }
    }

    return '';
  }, [
    address,
    addressRegex,
    currentDepositAddress,
    chainParams.data?.params?.chainlist_params?.isBankLocked,
    currentCoinOrToken,
    currentCoinOrTokenDisplayAvailableAmount,
    currentDisplayAmount,
    currentDisplayFeeAmount,
    currentFeeCoin.baseDenom,
    currentFeeCoinDisplayAvailableAmount,
    t,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSendAminoTx]);
  return (
    <Container>
      <div>
        <StyledInput
          endAdornment={
            <>
              <InputAdornment position="end">
                <InputAdornmentIconButton onClick={() => setIsOpenedMyAddressBook(true)}>
                  <AccountAddressIcon />
                </InputAdornmentIconButton>
              </InputAdornment>
              <InputAdornment position="start">
                <InputAdornmentIconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                  <AddressBook24Icon />
                </InputAdornmentIconButton>
              </InputAdornment>
            </>
          }
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.recipientAddressPlaceholder')}
          onChange={(e) => setCurrentAddress(e.currentTarget.value)}
          value={currentAddress}
        />
      </div>
      {nameResolvedAddress && (
        <AddressContainer>
          <CheckAddressIconContainer>
            <CheckAddress16Icon />
          </CheckAddressIconContainer>
          <Address>
            <Typography variant="h7">{nameResolvedAddress}</Typography>
          </Address>
        </AddressContainer>
      )}
      <MarginTop8Div>
        <AssetBottomSheetButton
          leftProps={
            <LeftContainer>
              <LeftImageContainer>
                <Image src={currentCoinOrToken.imageURL} />
              </LeftImageContainer>
              <LeftInfoContainer>
                <TitleContainer>
                  <Typography variant="h5">{currentCoinOrTokenDisplayDenom}</Typography>
                </TitleContainer>
                <LeftHeaderTitleContainer>
                  <Typography variant="h6n">{t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.available')}</Typography>
                  {currentDisplayMaxDecimals && currentCoinOrTokenDisplayAvailableAmount && (
                    <>
                      <Typography variant="h6n"> :</Typography>{' '}
                      <Tooltip title={currentCoinOrTokenDisplayAvailableAmount} arrow placement="top">
                        <span>
                          <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={currentDisplayMaxDecimals}>
                            {currentCoinOrTokenDisplayAvailableAmount}
                          </Number>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </LeftHeaderTitleContainer>
              </LeftInfoContainer>
            </LeftContainer>
          }
          isOpenBottomSheet={isOpenedCoinList}
          onClick={() => {
            setIsOpenedCoinList(true);
          }}
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
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.amountPlaceholder')}
        />
      </MarginTop8Div>

      <MarginTop16Div>
        <StyledTextarea
          multiline
          minRows={3}
          maxRows={3}
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.memoPlaceholder')}
          onChange={(e) => setCurrentMemo(e.currentTarget.value)}
          value={currentMemo}
        />
      </MarginTop16Div>

      <MarginTop12Div>
        <Fee
          feeCoin={currentFeeCoin}
          feeCoinList={feeCoins}
          gasRate={currentFeeGasRate}
          baseFee={currentFeeAmount}
          gas={currentGas}
          onChangeFeeCoin={(selectedFeeCoin) => {
            setCurrentFeeBaseDenom(selectedFeeCoin.baseDenom);
          }}
          onChangeGas={(g) => setCustomGas(g)}
          onChangeGasRateKey={(gasRateKey) => setCustomGasRateKey(gasRateKey)}
          isEdit
        />
      </MarginTop12Div>
      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button
              type="button"
              disabled={!!errorMessage || !sendAminoTx || isDisabled}
              onClick={async () => {
                if (sendAminoTx) {
                  await enQueue({
                    messageId: '',
                    origin: '',
                    channel: 'inApp',
                    message: {
                      method: 'cos_signAmino',
                      params: {
                        chainName: chain.chainName,
                        doc: { ...sendAminoTx, fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: currentCeilFeeAmount }], gas: currentGas } },
                        isEditFee: false,
                        isEditMemo: false,
                        isCheckBalance: true,
                      },
                    },
                  });
                }

                if (currentAccount.type === 'LEDGER') {
                  await debouncedOpenTab();
                }
              }}
            >
              {t('pages.Wallet.Send.Entry.Cosmos.components.Send.index.sendButton')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>

      <AddressBookBottomSheet
        open={isOpenedAddressBook}
        onClose={() => setIsOpenedAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a.address);
          setCurrentMemo(a.memo || '');
        }}
      />

      <AccountAddressBookBottomSheet
        open={isOpenedMyAddressBook}
        hasCurrentAccount={false}
        chain={chain}
        onClose={() => setIsOpenedMyAddressBook(false)}
        onClickAddress={(a) => {
          setCurrentAddress(a);
        }}
      />

      <CoinListBottomSheet
        currentCoinOrTokenInfo={currentCoinOrToken}
        coinOrTokenInfos={availableCoinOrTokenList}
        open={isOpenedCoinList}
        onClose={() => setIsOpenedCoinList(false)}
        onClickCoinOrToken={(clickedCoinOrToken) => {
          setCurrentCoinOrTokenId(clickedCoinOrToken.type === 'coin' ? clickedCoinOrToken.baseDenom : clickedCoinOrToken.address);
          setCurrentDisplayAmount('');
        }}
      />
    </Container>
  );
}

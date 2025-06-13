import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet/index.tsx';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import Fee from '@/components/Fee/CosmosFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas.ts';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx.ts';
import { useAccount } from '@/hooks/cosmos/useAccount.ts';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/cosmos/useAutoFeeCurrencySelectionOnInit.ts';
import { useBlockLatest } from '@/hooks/cosmos/useBlockLatest.ts';
import { useClientState } from '@/hooks/cosmos/useClientState.ts';
import { useFees } from '@/hooks/cosmos/useFees.ts';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo.ts';
import { useSimulate } from '@/hooks/cosmos/useSimulate.ts';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { UniqueChainId } from '@/types/chain.ts';
import { isTestnetChain } from '@/utils/chain.ts';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee.ts';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto.ts';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign.ts';
import { cosmosURL } from '@/utils/crypto/cosmos.ts';
import { ceil, gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import {
  getCoinId,
  getUniqueChainId,
  getUniqueChainIdWithManual,
  isMatchingCoinId,
  isMatchingUniqueChainId,
  parseCoinId,
} from '@/utils/queryParamGenerator.ts';
import { getCosmosAddressRegex } from '@/utils/regex.ts';
import { getUtf8BytesLength, isDecimal, isEqualsIgnoringCase, safeStringify, shorterAddress } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  DescriptionContainer,
  Divider,
  EstimatedValueTextContainer,
  IBCSendText,
  InputWrapper,
} from './styled.tsx';
import TxProcessingOverlay from '../components/TxProcessingOverlay/index.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const account = useAccount({ coinId });
  const nodeInfo = useNodeInfo({ coinId });

  const { data } = useAccountAllAssets();
  const { getCosmosAccountAssetFilteredByAccountType } = useGetAccountAsset({ coinId });

  const [isDisabled, setIsDisabled] = useState(false);

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId });

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');
  const [autoSetFeeCoinId, setAutoSetFeeCoinId] = useState('');

  const alternativeFeeAsset = useMemo(
    () =>
      customFeeCoinId
        ? feeAssets.find((item) => isMatchingCoinId(item.asset, customFeeCoinId))
        : autoSetFeeCoinId
          ? feeAssets.find((item) => isMatchingCoinId(item.asset, autoSetFeeCoinId))
          : feeAssets[0],
    [autoSetFeeCoinId, customFeeCoinId, feeAssets],
  );
  const alternativeFeeCoinId = useMemo(() => (alternativeFeeAsset?.asset ? getCoinId(alternativeFeeAsset.asset) : ''), [alternativeFeeAsset?.asset]);

  const alternativeGasRate = useMemo(() => alternativeFeeAsset?.gasRate, [alternativeFeeAsset?.gasRate]);

  const selectedCoinToSend = getCosmosAccountAssetFilteredByAccountType();

  const [inputFeeStepKey, setInputFeeStepKey] = useState<number | undefined>();

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const [customGasRate, setCustomGasRate] = useState('');

  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol
    ? selectedCoinToSend.asset.symbol + `${isTestnetChain(selectedCoinToSend.chain.id) ? ' (Testnet)' : ''}`
    : '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'cw20') {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.contract');
    }

    if (selectedCoinToSend?.asset.type === 'ibc') {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.denom');
    }

    return '';
  })();

  const coinDescription = selectedCoinToSend?.asset.description;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = useMemo(() => toDisplayDenomAmount(baseAvailableAmount, coinDecimals), [baseAvailableAmount, coinDecimals]);

  const availableRecipientAsset = useMemo(() => {
    if (selectedCoinToSend?.asset.type === 'native' || selectedCoinToSend?.asset.type === 'bridge') {
      const sendPossibleChain = {
        address: selectedCoinToSend.address.address,
        chain: selectedCoinToSend.chain,
        channel: '',
        port: '',
      };

      const ibcSendPossibleChains =
        data?.cosmosAccountAssets
          .filter((asset) => {
            const path = asset.asset.type === 'bridge' ? asset.asset.bridge_info?.path : asset.asset.ibc_info?.path;
            const preChainId = path?.split('>').at(-2);

            return (
              isEqualsIgnoringCase(asset.asset.ibc_info?.counterparty?.denom, selectedCoinToSend.asset.id) &&
              isEqualsIgnoringCase(preChainId, selectedCoinToSend.chain.id)
            );
          })
          .map((item) => ({
            address: item.address,
            chain: item.chain,
            channel: item.asset.ibc_info?.counterparty?.channel || '',
            port: item.asset.ibc_info?.counterparty?.port || '',
          })) || [];

      return [sendPossibleChain, ...ibcSendPossibleChains].filter(
        (receiverIBC, idx, arr) =>
          arr.findIndex((item) => item.chain.id === receiverIBC.chain.id && item.channel === receiverIBC.channel && item.port === receiverIBC.port) === idx,
      );
    }

    if (selectedCoinToSend?.asset.type === 'ibc' || selectedCoinToSend?.asset.type === 'cw20') {
      const sendPossibleChain = {
        address: selectedCoinToSend.address.address,
        chain: selectedCoinToSend.chain,
        channel: '',
        port: '',
      };

      const originPrevChain = (() => {
        if ('ibc_info' in selectedCoinToSend.asset) {
          const originChainId = selectedCoinToSend.asset.ibc_info?.counterparty.chain;
          const originPrevAsset = data?.cosmosAccountAssets.find((asset) => asset.chain.id === originChainId);
          if (originPrevAsset) {
            return {
              address: originPrevAsset.address,
              chain: originPrevAsset.chain,
              channel: selectedCoinToSend.asset.ibc_info?.client.channel || '',
              port: selectedCoinToSend.asset.ibc_info?.client.port || '',
            };
          }
        }
      })();

      const ibcSendPossibleChains =
        data?.cosmosAccountAssets
          .filter((asset) => {
            const path = asset.asset.type === 'bridge' ? asset.asset.bridge_info?.path : asset.asset.ibc_info?.path;
            const preChainId = path?.split('>').at(-2);

            return (
              isEqualsIgnoringCase(asset.asset.ibc_info?.counterparty?.denom, selectedCoinToSend.asset.id) &&
              isEqualsIgnoringCase(preChainId, selectedCoinToSend.chain.id)
            );
          })
          .map((item) => ({
            address: item.address,
            chain: item.chain,
            channel: item.asset.ibc_info?.counterparty?.channel || '',
            port: item.asset.ibc_info?.counterparty?.port || '',
          })) || [];

      const possibleChains = originPrevChain ? [sendPossibleChain, originPrevChain, ...ibcSendPossibleChains] : [sendPossibleChain, ...ibcSendPossibleChains];

      return possibleChains.filter(
        (receiverIBC, idx, arr) =>
          arr.findIndex((item) => item.chain.id === receiverIBC.chain.id && item.channel === receiverIBC.channel && item.port === receiverIBC.port) === idx,
      );
    }

    return [];
  }, [data?.cosmosAccountAssets, selectedCoinToSend?.address.address, selectedCoinToSend?.asset, selectedCoinToSend?.chain]);

  const availableRecipientChainList = useMemo(() => availableRecipientAsset?.map((item) => item.chain) || [], [availableRecipientAsset]);

  const [recipientAddress, setRecipientAddress] = useState('');
  const [displaySendAmount, setDisplaySendAmount] = useState('');

  const displaySendAmountPrice = useMemo(() => (displaySendAmount ? times(displaySendAmount, coinPrice) : '0'), [coinPrice, displaySendAmount]);

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const [selectedRecipientChainId, setSelectedRecipientChainId] = useState<UniqueChainId>();

  const currentRecipientChainId = useMemo(() => {
    if (selectedRecipientChainId) return selectedRecipientChainId;

    const defaultRecipientChainId = selectedCoinToSend?.chain ? getUniqueChainId(selectedCoinToSend?.chain) : undefined;

    return defaultRecipientChainId;
  }, [selectedCoinToSend?.chain, selectedRecipientChainId]);

  const currentRecipientChain = useMemo(
    () => availableRecipientChainList.find((asset) => isMatchingUniqueChainId(asset, currentRecipientChainId)),
    [availableRecipientChainList, currentRecipientChainId],
  );

  const isIBCSend = useMemo(
    () => currentRecipientChain && currentRecipientChain.id !== selectedCoinToSend?.chain.id,
    [currentRecipientChain, selectedCoinToSend?.chain.id],
  );

  const addressRegex = useMemo(() => getCosmosAddressRegex(currentRecipientChain?.accountPrefix || '', [39]), [currentRecipientChain?.accountPrefix]);

  const currentRecipientAsset = useMemo(
    () => availableRecipientAsset.find((asset) => isMatchingUniqueChainId(asset.chain, currentRecipientChainId)),
    [availableRecipientAsset, currentRecipientChainId],
  );

  const clientState = useClientState({ coinId: isIBCSend ? coinId : '', channelId: currentRecipientAsset?.channel ?? '', port: currentRecipientAsset?.port });

  const receiverLatestBlock = useBlockLatest({ chainId: isIBCSend ? currentRecipientChainId : undefined });

  const latestHeight = useMemo(() => receiverLatestBlock.data?.block?.header?.height, [receiverLatestBlock.data?.block?.header?.height]);

  const revisionHeight = useMemo(() => (latestHeight ? String(100 + parseInt(latestHeight, 10)) : undefined), [latestHeight]);
  const revisionNumber = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number,
    [clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number],
  );

  const memoizedSendAminoTx = useMemo(() => {
    if (selectedCoinToSend) {
      if (isIBCSend) {
        if (revisionNumber && revisionHeight) {
          if (account.data?.value.account_number && currentRecipientAsset && gt(displaySendAmount || '0', '0') && alternativeFeeAsset) {
            const sequence = String(account.data?.value.sequence || '0');

            if (selectedCoinToSend?.asset.type === 'cw20') {
              return {
                account_number: String(account.data.value.account_number),
                sequence,
                chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoinToSend?.chain.chainId,
                fee: {
                  amount: [
                    {
                      denom: alternativeFeeAsset.asset.id,
                      amount: selectedCoinToSend?.chain.isEvm
                        ? times(alternativeGasRate?.[0] || '0', selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                        : '1',
                    },
                  ],
                  gas: String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
                },
                memo: inputMemo,
                msgs: [
                  {
                    type: 'wasm/MsgExecuteContract',
                    value: {
                      sender: selectedCoinToSend.address.address,
                      contract: selectedCoinToSend.asset.id,
                      msg: {
                        send: {
                          amount: toBaseDenomAmount(displaySendAmount, selectedCoinToSend.asset.decimals || 0),
                          contract: currentRecipientAsset.port?.split('.')?.[1],
                          msg: Buffer.from(
                            JSON.stringify({ channel: currentRecipientAsset.channel, remote_address: recipientAddress, timeout: 900 }),
                            'utf8',
                          ).toString('base64'),
                        },
                      },
                      funds: [],
                    },
                  },
                ],
              };
            }

            if (revisionNumber && revisionHeight) {
              return {
                account_number: String(account.data.value.account_number),
                sequence,
                chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoinToSend?.chain.chainId,
                fee: {
                  amount: [
                    {
                      denom: alternativeFeeAsset.asset.id,
                      amount: selectedCoinToSend?.chain.isEvm
                        ? times(alternativeGasRate?.[0] || '0', selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                        : '1',
                    },
                  ],
                  gas: String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
                },
                memo: inputMemo,
                msgs: [
                  {
                    type: 'cosmos-sdk/MsgTransfer',
                    value: {
                      receiver: recipientAddress,
                      sender: selectedCoinToSend.address.address,
                      source_channel: currentRecipientAsset.channel,
                      source_port: currentRecipientAsset.port || 'transfer',
                      timeout_height: {
                        revision_height: revisionHeight,
                        revision_number: revisionNumber === '0' ? undefined : revisionNumber,
                      },
                      timeout_timestamp: new Date().getTime() * 1000000 + 1000000 * 1000 * 120,
                      token: {
                        amount: toBaseDenomAmount(displaySendAmount, selectedCoinToSend.asset.decimals || 0),
                        denom: selectedCoinToSend.asset.id,
                      },
                    },
                  },
                ],
              };
            }
          }
        }
        return undefined;
      }

      if (account.data?.value.account_number && addressRegex.test(recipientAddress) && gt(displaySendAmount || '0', '0') && alternativeFeeAsset) {
        const sequence = String(account.data?.value.sequence || '0');

        if (selectedCoinToSend?.asset.type === 'cw20') {
          return {
            account_number: String(account.data.value.account_number),
            sequence,
            chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoinToSend?.chain.chainId,
            fee: {
              amount: [
                {
                  denom: alternativeFeeAsset.asset.id,
                  amount: selectedCoinToSend?.chain.isEvm
                    ? times(alternativeGasRate?.[0] || '0', selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                    : '1',
                },
              ],
              gas: String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
            },
            memo: inputMemo,
            msgs: [
              {
                type: 'wasm/MsgExecuteContract',
                value: {
                  sender: selectedCoinToSend.address.address,
                  contract: selectedCoinToSend.asset.id,
                  msg: {
                    transfer: {
                      recipient: recipientAddress,
                      amount: toBaseDenomAmount(displaySendAmount, selectedCoinToSend.asset.decimals || 0),
                    },
                  },
                  funds: [],
                },
              },
            ],
          };
        }

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoinToSend?.chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: selectedCoinToSend?.chain.isEvm
                  ? times(alternativeGasRate?.[0] || '0', selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                  : '1',
              },
            ],
            gas: String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: [
            {
              type: 'cosmos-sdk/MsgSend',
              value: {
                from_address: selectedCoinToSend.address.address,
                to_address: recipientAddress,
                amount: [{ amount: toBaseDenomAmount(displaySendAmount, selectedCoinToSend.asset.decimals || 0), denom: selectedCoinToSend.asset.id }],
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
    addressRegex,
    alternativeFeeAsset,
    alternativeGasRate,
    currentRecipientAsset,
    displaySendAmount,
    inputMemo,
    isIBCSend,
    nodeInfo.data?.default_node_info?.network,
    recipientAddress,
    revisionHeight,
    revisionNumber,
    selectedCoinToSend,
  ]);

  const [sendAminoTx] = useDebounce(memoizedSendAminoTx, 700);

  const sendProtoTx = useMemo(() => {
    if (sendAminoTx) {
      const pTx = protoTx(
        sendAminoTx,
        [''],
        { type: selectedCoinToSend?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [sendAminoTx, selectedCoinToSend?.address.accountType.pubkeyType]);

  const simulate = useSimulate({ coinId, txBytes: sendProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedCoinToSend?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [selectedCoinToSend?.chain.feeInfo.defaultGasLimit, selectedCoinToSend?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

  const feeOptions = useMemo(() => {
    const customOption = {
      gas: customGasAmount,
      gasRate: customGasRate,
      coinId: alternativeFeeCoinId,
      decimals: alternativeFeeAsset?.asset.decimals || 0,
      balance: alternativeFeeAsset?.balance || '0',
      denom: alternativeFeeAsset?.asset.id,
      coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
      symbol: alternativeFeeAsset?.asset.symbol || '',
      title: 'Custom',
    };

    const feeStepNames = getCosmosFeeStepNames(isFeemarketActive || false, alternativeGasRate);

    const alternativeFeeOptions = alternativeGasRate
      ? alternativeGasRate.map((item, i) => ({
          gas: alternativeGas,
          gasRate: item,
          coinId: alternativeFeeCoinId,
          decimals: alternativeFeeAsset?.asset.decimals || 0,
          balance: alternativeFeeAsset?.balance || '0',
          denom: alternativeFeeAsset?.asset.id,
          coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
          symbol: alternativeFeeAsset?.asset.symbol || '',
          title: feeStepNames[i],
        }))
      : [];

    return [...alternativeFeeOptions, customOption];
  }, [
    alternativeFeeAsset?.asset.coinGeckoId,
    alternativeFeeAsset?.asset.decimals,
    alternativeFeeAsset?.asset.id,
    alternativeFeeAsset?.asset.symbol,
    alternativeFeeAsset?.balance,
    alternativeFeeCoinId,
    alternativeGas,
    alternativeGasRate,
    customGasAmount,
    customGasRate,
    isFeemarketActive,
  ]);

  const isCustomStep = useMemo(() => {
    if (!alternativeGasRate || feeOptions.length === 0) return false;
    return feeOptions.length - 1 === currentFeeStepKey;
  }, [alternativeGasRate, currentFeeStepKey, feeOptions.length]);

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const currentGas = selectedFeeOption.gas || '0';

  const currentFeeAmount = useMemo(() => times(currentGas, selectedFeeOption.gasRate || '0'), [currentGas, selectedFeeOption.gasRate]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(currentCeilFeeAmount, selectedFeeOption.decimals || 0),
    [currentCeilFeeAmount, selectedFeeOption.decimals],
  );
  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(selectedFeeOption?.balance || '0', selectedFeeOption?.decimals || 0),
    [selectedFeeOption?.balance, selectedFeeOption.decimals],
  );

  const handleOnClickMax = () => {
    if (selectedCoinToSend && selectedFeeOption && isMatchingCoinId(selectedCoinToSend?.asset, selectedFeeOption.coinId)) {
      const maxAmount = minus(displayAvailableAmount, currentDisplayFeeAmount);

      setDisplaySendAmount(gt(maxAmount, '0') ? maxAmount : '0');
    } else {
      setDisplaySendAmount(displayAvailableAmount);
    }
  };

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.invalidAddress');
      }

      if (!addressRegex.test(recipientAddress)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.invalidAddress');
      }
    }

    return '';
  }, [addressRegex, recipientAddress, selectedCoinToSend?.address.address, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    if (displaySendAmount) {
      if (selectedCoinToSend?.asset.id === selectedFeeOption.denom) {
        const totalCoastAmount = plus(displaySendAmount, currentDisplayFeeAmount);

        if (gt(totalCoastAmount, currentFeeCoinDisplayAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientAmount');
        }
      } else {
        if (gt(displaySendAmount, displayAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientAmount');
        }
      }

      if (!gt(displaySendAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.tooLowAmount');
      }
    }
    return '';
  }, [
    currentDisplayFeeAmount,
    currentFeeCoinDisplayAvailableAmount,
    displayAvailableAmount,
    displaySendAmount,
    selectedCoinToSend?.asset.id,
    selectedFeeOption.denom,
    t,
  ]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const displayTx = useMemo(() => {
    if (!memoizedSendAminoTx) return undefined;

    const tx = {
      ...memoizedSendAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentCeilFeeAmount }],
        gas: currentGas,
      },
    };

    return safeStringify(tx);
  }, [currentCeilFeeAmount, currentGas, memoizedSendAminoTx, selectedFeeOption.denom]);

  const errorMessage = useMemo(() => {
    if (selectedCoinToSend?.chain.isDiableSend) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.bankLocked');
    }

    if (isIBCSend && !latestHeight) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.timeoutHeightError');
    }

    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noRecipientAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noAvailableAmount');
    }

    if (!displaySendAmount) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (gt(currentDisplayFeeAmount, currentFeeCoinDisplayAvailableAmount)) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientFee');
    }

    if (!gt(displaySendAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.invalidAmount');
    }

    if (!sendAminoTx) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    currentDisplayFeeAmount,
    currentFeeCoinDisplayAvailableAmount,
    displaySendAmount,
    inputMemoErrorMessage,
    isIBCSend,
    latestHeight,
    recipientAddress,
    selectedCoinToSend?.chain.isDiableSend,
    sendAminoTx,
    sendAmountInputErrorMessage,
    t,
  ]);

  useAutoFeeCurrencySelectionOnInit({
    feeAssets: feeAssets,
    isCustomFee: isCustomStep,
    currentFeeStepKey: currentFeeStepKey,
    gas: currentGas,
    setFeeCoinId: (coinId) => {
      setAutoSetFeeCoinId(coinId);
    },
  });

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedSendAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedSendAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentCeilFeeAmount }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(selectedCoinToSend.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: selectedCoinToSend.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: selectedCoinToSend.chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = selectedCoinToSend?.chain.lcdUrls.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: selectedCoinToSend.chain,
        urls: requestURLs,
      });

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({ txHash: response.tx_response.txhash, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId,
          txHash: response.tx_response.txhash,
        },
      });
    } catch {
      navigate({
        to: TxResult.to,
        search: {
          coinId,
        },
      });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  }, [
    account.data?.value.account_number,
    addTx,
    coinId,
    currentAccount,
    currentCeilFeeAmount,
    currentGas,
    currentPassword,
    memoizedSendAminoTx,
    navigate,
    recipientAddress,
    selectedCoinToSend?.address.accountType.pubkeyType,
    selectedCoinToSend?.address.address,
    selectedCoinToSend?.chain,
    selectedFeeOption,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSendAminoTx, simulate.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Cosmos.index.send')}`}</CoinSymbolText>
            {coinType ? (
              <CoinDenomContainer>
                <Typography variant="b4_R">{`${coinType} :`}</Typography>
                &nbsp;
                <Typography variant="b3_M">{shortCoinDenom}</Typography>
              </CoinDenomContainer>
            ) : (
              <DescriptionContainer>
                <Typography variant="b3_M">{coinDescription}</Typography>
              </DescriptionContainer>
            )}
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={availableRecipientChainList}
              currentChainId={currentRecipientChainId}
              onClickChain={(chainId) => {
                setSelectedRecipientChainId(chainId);
              }}
              disableSortChain
              label={t('pages.wallet.send.$coinId.Entry.Cosmos.index.recipientNetwork')}
              rightAdornmentComponent={
                isIBCSend ? <IBCSendText variant="b3_M">{t('pages.wallet.send.$coinId.Entry.Cosmos.index.ibcSend')}</IBCSendText> : undefined
              }
              bottomSheetTitle={t('pages.wallet.send.$coinId.Entry.Cosmos.index.selectRecipientNetwork')}
              bottomSheetSearchPlaceholder={t('pages.wallet.send.$coinId.Entry.Cosmos.index.searchRecipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Cosmos.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              inputVarient="address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <AddressBookButton disabled={!currentRecipientChainId} onClick={() => setIsOpenAddressBottomSheet(true)}>
                        <AddressBookIcon />
                      </AddressBookButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Cosmos.index.amount')}
              error={!!sendAmountInputErrorMessage}
              helperText={sendAmountInputErrorMessage}
              value={displaySendAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimals || 0) && e.currentTarget.value) {
                  return;
                }

                setDisplaySendAmount(e.currentTarget.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displaySendAmountPrice}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
              rightBottomAdornment={
                selectedCoinToSend && <BalanceButton onClick={handleOnClickMax} coin={selectedCoinToSend?.asset} balance={baseAvailableAmount} />
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              error={!!inputMemoErrorMessage}
              helperText={inputMemoErrorMessage}
              label={t('pages.wallet.send.$coinId.Entry.Cosmos.index.memo')}
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <Fee
            feeOptionDatas={feeOptions}
            availableFeeAssets={feeAssets}
            selectedCustomFeeCoinId={alternativeFeeCoinId}
            currentSelectedFeeOptionKey={currentFeeStepKey}
            onChangeGas={(gas) => {
              setCustomGasAmount(gas);
            }}
            onChangeGasRate={(gasRate) => {
              setCustomGasRate(gasRate);
            }}
            onChangeFeeCoinId={(feeCoinId) => {
              setCustomFeeCoinId(feeCoinId);
            }}
            onClickFeeStep={(val) => {
              setInputFeeStepKey(val);
            }}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
            errorMessage={errorMessage}
            disableConfirm={isDisabled || !!errorMessage}
            isLoading={isDisabled}
          />
        </>
      </BaseFooter>

      {currentRecipientChainId && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={currentRecipientChainId}
          headerTitle={t('pages.wallet.send.$coinId.Entry.Cosmos.index.chooseRecipientAddress')}
          onClickAddress={(address, memo) => {
            setRecipientAddress(address);
            if (memo) {
              setInputMemo(memo);
            }
          }}
        />
      )}
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCoinToSend?.asset.symbol
            ? t('pages.wallet.send.$coinId.Entry.Cosmos.index.sendReviewWithSymbol', {
                symbol: selectedCoinToSend.asset.symbol,
              })
            : t('pages.wallet.send.$coinId.Entry.Cosmos.index.sendReview')
        }
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Cosmos.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Cosmos.index.send')}
        onClickConfirm={handleOnClickConfirm}
        rawTxString={displayTx}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}

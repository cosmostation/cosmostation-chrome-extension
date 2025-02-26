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
import { useAccount } from '@/hooks/cosmos/useAccount.ts';
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
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto.ts';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign.ts';
import { cosmosURL } from '@/utils/crypto/cosmos.ts';
import { ceil, gt, gte, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, isMatchingCoinId, isMatchingUniqueChainId, isSameCoin, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { getCosmosAddressRegex } from '@/utils/regex.ts';
import { isDecimal, isEqualsIgnoringCase, shorterAddress } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
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

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const account = useAccount({ coinId });
  const nodeInfo = useNodeInfo({ coinId });

  const { data } = useAccountAllAssets();
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isDisabled, setIsDisabled] = useState(false);

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { feeAssets, defaultGasRateKey } = useFees({ coinId });

  const [cusotmFeeCoinId, setCustomFeeCoinId] = useState('');

  const currentFeeAsset = useMemo(
    () => (cusotmFeeCoinId ? feeAssets.find((item) => isMatchingCoinId(item.asset, cusotmFeeCoinId)) : feeAssets[0]),
    [cusotmFeeCoinId, feeAssets],
  );
  const currentFeeCoinId = useMemo(() => (currentFeeAsset?.asset ? getCoinId(currentFeeAsset.asset) : ''), [currentFeeAsset?.asset]);

  const selectedCoinToSend = getCosmosAccountAsset();

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

  const coinSymbol = selectedCoinToSend?.asset.symbol || '';
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

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

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

  const [currentRecipientChainId, setCurrentRecipientChainId] = useState<UniqueChainId>();
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

  const clientState = useClientState({ coinId, channelId: currentRecipientAsset?.channel ?? '', port: currentRecipientAsset?.port });

  const receiverLatestBlock = useBlockLatest({ chainId: currentRecipientChainId });

  const latestHeight = useMemo(() => receiverLatestBlock.data?.block?.header?.height, [receiverLatestBlock.data?.block?.header?.height]);

  const revisionHeight = useMemo(() => (latestHeight ? String(100 + parseInt(latestHeight, 10)) : undefined), [latestHeight]);
  const revisionNumber = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number,
    [clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number],
  );

  const currentFeeCoinGasRateList = useMemo(() => [...(currentFeeAsset?.gasRate || []), customGasRate], [currentFeeAsset?.gasRate, customGasRate]);

  const currentFeeGasRateValue = useMemo(() => currentFeeCoinGasRateList[currentFeeStepKey] || '0', [currentFeeCoinGasRateList, currentFeeStepKey]);

  const memoizedSendAminoTx = useMemo(() => {
    if (selectedCoinToSend) {
      if (isIBCSend) {
        if (revisionNumber && revisionHeight) {
          if (account.data?.value.account_number && currentRecipientAsset && gt(displaySendAmount || '0', '0') && currentFeeAsset) {
            const sequence = String(account.data?.value.sequence || '0');

            if (selectedCoinToSend?.asset.type === 'cw20') {
              return {
                account_number: String(account.data.value.account_number),
                sequence,
                chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoinToSend?.chain.chainId,
                fee: {
                  amount: [
                    {
                      denom: currentFeeAsset.asset.id,
                      amount: selectedCoinToSend?.chain.isEvm
                        ? times(currentFeeGasRateValue, selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
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
                      denom: currentFeeAsset.asset.id,
                      amount: selectedCoinToSend?.chain.isEvm
                        ? times(currentFeeGasRateValue, selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
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

      if (account.data?.value.account_number && addressRegex.test(recipientAddress) && gt(displaySendAmount || '0', '0') && currentFeeAsset?.asset.id) {
        const sequence = String(account.data?.value.sequence || '0');

        if (selectedCoinToSend?.asset.type === 'cw20') {
          return {
            account_number: String(account.data.value.account_number),
            sequence,
            chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCoinToSend?.chain.chainId,
            fee: {
              amount: [
                {
                  denom: currentFeeAsset.asset.id,
                  amount: selectedCoinToSend?.chain.isEvm
                    ? times(currentFeeGasRateValue, selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
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
                denom: currentFeeAsset.asset.id,
                amount: selectedCoinToSend?.chain.isEvm
                  ? times(currentFeeGasRateValue, selectedCoinToSend.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
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
    currentFeeAsset,
    currentFeeGasRateValue,
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

  const currentGasList = useMemo(() => {
    const gasCoefficient = selectedCoinToSend?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    const defaultGasStepCount = currentFeeAsset?.gasRate.length || 0;

    return [...Array(defaultGasStepCount).fill(baseEstimateGas), customGasAmount];
  }, [
    currentFeeAsset?.gasRate.length,
    customGasAmount,
    selectedCoinToSend?.chain.feeInfo.defaultGasLimit,
    selectedCoinToSend?.chain.feeInfo.gasCoefficient,
    simulate.data?.gas_info?.gas_used,
  ]);

  const currentGas = currentGasList[currentFeeStepKey] || '0';

  const currentFeeAmount = useMemo(() => times(currentGas, currentFeeGasRateValue), [currentFeeGasRateValue, currentGas]);

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = useMemo(
    () => toDisplayDenomAmount(currentCeilFeeAmount, currentFeeAsset?.asset.decimals || 0),
    [currentCeilFeeAmount, currentFeeAsset?.asset.decimals],
  );
  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeAsset?.balance || '0', currentFeeAsset?.asset.decimals || 0),
    [currentFeeAsset?.asset.decimals, currentFeeAsset?.balance],
  );

  const handleOnClickMax = () => {
    if (selectedCoinToSend && currentFeeAsset && isSameCoin(selectedCoinToSend?.asset, currentFeeAsset?.asset)) {
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
      if (selectedCoinToSend?.asset.id === currentFeeAsset?.asset.id) {
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
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noAmount');
      }
    }
    return '';
  }, [
    currentDisplayFeeAmount,
    currentFeeAsset?.asset.id,
    currentFeeCoinDisplayAvailableAmount,
    displayAvailableAmount,
    displaySendAmount,
    selectedCoinToSend?.asset.id,
    t,
  ]);

  const errorMessage = useMemo(() => {
    if (selectedCoinToSend?.chain.isDiableSend) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.bankLocked');
    }

    if (!latestHeight) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.timeoutHeightError');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noAvailableAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (!displaySendAmount || !gt(displaySendAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.invalidAmount');
    }

    if (!!selectedCoinToSend?.asset && !!currentFeeAsset?.asset && !isSameCoin(selectedCoinToSend.asset, currentFeeAsset.asset)) {
      if (!gte(displayAvailableAmount, displaySendAmount)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientAmount');
      }

      if (!gte(currentFeeCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientFeeAmount');
      }
    }

    if (!sendAminoTx) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    currentDisplayFeeAmount,
    currentFeeAsset?.asset,
    currentFeeCoinDisplayAvailableAmount,
    displayAvailableAmount,
    displaySendAmount,
    latestHeight,
    selectedCoinToSend?.asset,
    selectedCoinToSend?.chain.isDiableSend,
    sendAminoTx,
    sendAmountInputErrorMessage,
    t,
  ]);

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

      if (!currentFeeAsset) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedSendAminoTx,
        fee: {
          amount: [{ denom: currentFeeAsset?.asset.id, amount: currentCeilFeeAmount }],
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
    coinId,
    currentAccount,
    currentCeilFeeAmount,
    currentFeeAsset,
    currentGas,
    currentPassword,
    memoizedSendAminoTx,
    navigate,
    recipientAddress,
    selectedCoinToSend?.address.accountType.pubkeyType,
    selectedCoinToSend?.chain,
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
            {coinType && (
              <CoinDenomContainer>
                <Typography variant="b4_R">{`${coinType} :`}</Typography>
                &nbsp;
                <Typography variant="b3_M">{shortCoinDenom}</Typography>
              </CoinDenomContainer>
            )}
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={availableRecipientChainList}
              currentChainId={currentRecipientChainId}
              onClickChain={(chainId) => {
                setCurrentRecipientChainId(chainId);
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
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency} isApporximation>
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
            feeAssets={feeAssets}
            feeStepKey={currentFeeStepKey}
            selectedFeeCoinId={currentFeeCoinId}
            gases={currentGasList}
            gasRates={currentFeeCoinGasRateList}
            onClickFeeStep={(index) => {
              setInputFeeStepKey(index);
            }}
            onChangeGas={(gas) => {
              setCustomGasAmount(gas);
            }}
            onChangeGasRate={(gasRate) => {
              setCustomGasRate(gasRate);
            }}
            onChangeFeeCoinId={(feeCoinId) => {
              setCustomFeeCoinId(feeCoinId);
            }}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
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
        contentsTitle={t('pages.wallet.send.$coinId.Entry.Cosmos.index.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Cosmos.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Cosmos.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}

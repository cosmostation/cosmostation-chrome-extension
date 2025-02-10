import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useFees } from '@/hooks/cosmos/useFees.ts';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result/$txHash/$coinId';
import type { UniqueChainId } from '@/types/chain.ts';
import { ceil, gt, gte, minus, plus, times, toDisplayDenomAmount } from '@/utils/numbers.ts';
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

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { data } = useAccountAllAssets();

  const { feeAssets, defaultGasRateKey } = useFees({ coinId });

  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState<string | undefined>();

  const [currentFeeCoinId, setCurrentFeeCoinId] = useState(getCoinId(feeAssets[0].asset));
  const currentFeeAsset = feeAssets.find((item) => isMatchingCoinId(item.asset, currentFeeCoinId));

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [currentGasRateKey, setCurrentGasRateKey] = useState(defaultGasRateKey);

  // TODO 디폴트 값 처리 필요.
  const currentFeeCoinGasRateList = currentFeeAsset?.gasRate || [];
  const currentFeeGasRateValue = currentFeeCoinGasRateList[currentGasRateKey] || '0';

  const parsedCoinId = parseCoinId(coinId);

  const aggregatedCosmosAccountAssets = data
    ? [...data.cosmosAccountAssets, ...data.cosmosAccountCustomAssets, ...data.cw20AccountAssets, ...data.customCw20AccountAssets]
    : [];

  const selectedCoinToSend = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'cosmos') {
      return aggregatedCosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  // const currentGas = customGas || simulatedGas || sendGas;
  const currentGas = customGas || String(selectedCoinToSend?.chain.feeInfo.defaultGasLimit) || '300000';

  const currentFeeAmount = times(currentGas, currentFeeGasRateValue);

  const currentCeilFeeAmount = ceil(currentFeeAmount);

  const currentDisplayFeeAmount = toDisplayDenomAmount(currentCeilFeeAmount, currentFeeAsset?.asset.decimals || 0);
  const currentFeeCoinDisplayAvailableAmount = toDisplayDenomAmount(currentFeeAsset?.balance || '0', currentFeeAsset?.asset.decimals || 0);

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimal = selectedCoinToSend?.asset.decimals || 0;

  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'cw20') {
      return t('pages.wallet.send.$coinId.entry.contract');
    }

    if (selectedCoinToSend?.asset.type === 'ibc') {
      return t('pages.wallet.send.$coinId.entry.denom');
    }

    return '';
  })();

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimal);

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

    return [];
  }, [data?.cosmosAccountAssets, selectedCoinToSend?.address.address, selectedCoinToSend?.asset.id, selectedCoinToSend?.asset.type, selectedCoinToSend?.chain]);

  const availableRecipientChainList = availableRecipientAsset?.map((item) => item.chain) || [];

  const maxDisplayAmount = (() => {
    const maxAmount = minus(displayAvailableAmount, currentDisplayFeeAmount);
    if (selectedCoinToSend?.asset && currentFeeAsset?.asset && isSameCoin(selectedCoinToSend.asset, currentFeeAsset?.asset)) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return displayAvailableAmount;
  })();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [displaySendAmount, setDisplaySendAmount] = useState('');

  const displaySendAmountPrice = displaySendAmount ? times(displaySendAmount, coinPrice) : '0';

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const [currentRecipientChainId, setCurrentRecipientChainId] = useState<UniqueChainId>();
  const currentRecipientChain = aggregatedCosmosAccountAssets.find((asset) => isMatchingUniqueChainId(asset.chain, currentRecipientChainId));

  const isIBCSend = currentRecipientChain && currentRecipientChain.chain.id !== selectedCoinToSend?.chain.id;

  const addressRegex = getCosmosAddressRegex(currentRecipientChain?.chain.accountPrefix || '', [39]);

  const errorMessage = useMemo(() => {
    if (selectedCoinToSend?.chain.isDiableSend) {
      return t('pages.wallet.send.$coinId.entry.cosmos.bankLocked');
    }

    // if (!latestHeight) {
    //   return t('pages.wallet.send.$coinId.entry.cosmos.timeoutHeightError');
    // }
    if (!addressRegex.test(recipientAddress)) {
      return t('pages.wallet.send.$coinId.entry.cosmos.invalidAddress');
    }

    if (!displaySendAmount || !gt(displaySendAmount, '0')) {
      return t('pages.wallet.send.$coinId.entry.cosmos.invalidAmount');
    }

    if (!!selectedCoinToSend?.asset && !!currentFeeAsset?.asset && isSameCoin(selectedCoinToSend.asset, currentFeeAsset.asset)) {
      if (!gte(displayAvailableAmount, plus(displaySendAmount, currentDisplayFeeAmount))) {
        return t('pages.wallet.send.$coinId.entry.cosmos.insufficientAmount');
      }
    }

    if (!!selectedCoinToSend?.asset && !!currentFeeAsset?.asset && !isSameCoin(selectedCoinToSend.asset, currentFeeAsset.asset)) {
      if (!gte(displayAvailableAmount, displaySendAmount)) {
        return t('pages.wallet.send.$coinId.entry.cosmos.insufficientAmount');
      }

      if (!gte(currentFeeCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
        return t('pages.wallet.send.$coinId.entry.cosmos.insufficientFeeAmount');
      }
    }

    return '';
  }, [
    addressRegex,
    currentDisplayFeeAmount,
    currentFeeAsset?.asset,
    currentFeeCoinDisplayAvailableAmount,
    displayAvailableAmount,
    displaySendAmount,
    recipientAddress,
    selectedCoinToSend?.asset,
    selectedCoinToSend?.chain.isDiableSend,
    t,
  ]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.entry.cosmos.send')}`}</CoinSymbolText>
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
              label={t('pages.wallet.send.$coinId.entry.cosmos.recipientNetwork')}
              rightAdornmentComponent={isIBCSend ? <IBCSendText variant="b3_M">{t('pages.wallet.send.$coinId.entry.cosmos.ibcSend')}</IBCSendText> : undefined}
              bottomSheetTitle={t('pages.wallet.send.$coinId.entry.cosmos.selectRecipientNetwork')}
              bottomSheetSearchPlaceholder={t('pages.wallet.send.$coinId.entry.cosmos.searchRecipientNetwork')}
            />
            {/* FIXME 이거 에러메시지를 어느 타이밍에 띄우지? 입력값있고 포커스 아웃될때? */}
            <StandardInput
              label={t('pages.wallet.send.$coinId.entry.cosmos.recipientAddress')}
              // ? !addressRegex.test(recipientAddress) : false
              error={!!addressInputErrorMessage}
              // helperText={t('pages.wallet.send.$coinId.entry.cosmos.invalidAddress')}
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
              onBlur={() => {
                if (recipientAddress && (!addressRegex.test(recipientAddress) || isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address))) {
                  setAddressInputErrorMessage(t('pages.wallet.send.$coinId.entry.cosmos.invalidAddress'));
                } else {
                  setAddressInputErrorMessage(undefined);
                }
              }}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.entry.cosmos.amount')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={displaySendAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimal || 0) && e.currentTarget.value) {
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
                selectedCoinToSend && (
                  <BalanceButton
                    onClick={() => {
                      setDisplaySendAmount(maxDisplayAmount);
                    }}
                    coin={selectedCoinToSend?.asset}
                    balance={baseAvailableAmount}
                  />
                )
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.send.$coinId.entry.cosmos.memo')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={inputMemo}
              // TODO 숫자만 입력할 수 있도록 처리 필요.
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
            selectedFeeCoinId={currentFeeCoinId}
            gas={currentGas}
            gasRate={currentFeeCoinGasRateList}
            gasRateKey={currentGasRateKey}
            onClickGasRate={(val) => {
              setCurrentGasRateKey(val);
            }}
            onChangeGas={(gas) => {
              setCustomGas(gas);
            }}
            onChangeFeeCoinId={(feeCoinId) => {
              setCurrentFeeCoinId(feeCoinId);
            }}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
            disableConfirm={!!errorMessage}
          />
        </>
      </BaseFooter>

      {currentRecipientChainId && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={currentRecipientChainId}
          headerTitle={t('pages.wallet.send.$coinId.entry.cosmos.chooseRecipientAddress')}
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
        contentsTitle={t('pages.wallet.send.$coinId.entry.cosmos.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.entry.cosmos.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.entry.cosmos.send')}
        onClickCancel={() => {
          console.log('onClickCancel');
        }}
        onClickConfirm={() => {
          navigate({
            to: TxResult.to,
            params: {
              coinId,
              txHash: 'BE8D07E79F4F74C64C2F672621FF05A6CA13F3541AFAD36F8C7037D28B2C05C4',
            },
          });
        }}
      />
    </>
  );
}

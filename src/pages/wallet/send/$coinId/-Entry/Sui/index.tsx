import { useState } from 'react';
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
// import Fee from '@/components/Fee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { useChainList } from '@/hooks/useChainList.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result/$txHash/$coinId';
import type { UniqueChainId } from '@/types/chain.ts';
import { times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, isMatchingUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal, shorterAddress } from '@/utils/string.ts';
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

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { flatChainList } = useChainList();
  const { data } = useAccountAssets();

  const parsedCoinId = parseCoinId(coinId);

  const selectedCoinToSend = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'sui') {
      return data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }
    return undefined;
  })();

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimal = selectedCoinToSend?.asset.decimals || 0;

  // NOTE 수이에 맞는 적절한 코인타입 설정 필요.
  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'erc20' || selectedCoinToSend?.asset.type === 'cw20') {
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

  console.log('🚀 ~ Entry ~ displayAvailableAmount:', displayAvailableAmount);

  // FIXME: 밸런스 그대로를 입력할 지 예상 가스비를 제외한 값을 맥스값으로 설정할 지 결정 필요.
  const maxAmount = '1000000000000';

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const displaySendAmountPrice = sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0';

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  // TODO
  // const recipientChainList =
  const [currentRecipientChainId, setCurrentRecipientChainId] = useState<UniqueChainId>();
  const currentRecipientChain = flatChainList.find((chain) => isMatchingUniqueChainId(chain, currentRecipientChainId));

  console.log('🚀 ~ Entry ~ currentRecipientChain:', currentRecipientChain);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.entry.send')}`}</CoinSymbolText>
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
              chainList={flatChainList}
              currentChainId={currentRecipientChainId}
              onClickChain={(chainId) => {
                setCurrentRecipientChainId(chainId);
              }}
              label={t('pages.wallet.send.$coinId.entry.recipientNetwork')}
              rightAdornmentComponent={<IBCSendText variant="b3_M">{t('pages.wallet.send.$coinId.entry.ibcSend')}</IBCSendText>}
              bottomSheetTitle={t('pages.wallet.send.$coinId.entry.selectRecipientNetwork')}
              bottomSheetSearchPlaceholder={t('pages.wallet.send.$coinId.entry.searchRecipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.entry.recipientAddress')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
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
              label={t('pages.wallet.send.$coinId.entry.amount')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={sendDisplayAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimal || 0) && e.currentTarget.value) {
                  return;
                }

                setSendDisplayAmount(e.currentTarget.value);
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
                      setSendDisplayAmount(maxAmount);
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
              label={t('pages.wallet.send.$coinId.entry.memo')}
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
          {/* <Fee
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          /> */}
        </>
      </BaseFooter>

      {currentRecipientChainId && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          chainId={currentRecipientChainId}
          headerTitle={t('pages.wallet.send.$coinId.entry.chooseRecipientAddress')}
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
        contentsTitle={t('pages.wallet.send.$coinId.entry.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.entry.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.entry.send')}
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

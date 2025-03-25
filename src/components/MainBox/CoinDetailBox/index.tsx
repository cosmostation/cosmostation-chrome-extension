import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import IconButton from '@/components/common/IconButton';
import NumberTypo from '@/components/common/NumberTypo';
import TextButton from '@/components/common/TextButton';
import EthermintSendBottomSheet from '@/components/EthermintSendBottomSheet';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase, removeTemplateLiteral, removeTrailingSlash, shorterAddress } from '@/utils/string';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  BodyBottomContainer,
  BodyContainer,
  BodyTopContainer,
  BottomButtonContainer,
  ChangeAddressIconButtonContainer,
  SpacedTypography,
  StyledIconTextButton,
  TopContainer,
} from './styled';
import MainBox from '..';

import ChangeIcon from '@/assets/images/icons/ChangeGrey14.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';

import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

type CoinDetailBoxProps = {
  coinId: string;
};

export default function CoinDetailBox({ coinId }: CoinDetailBoxProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);
  const [isShowCosmosStyleAddress, setIsShowCosmosStyleAddress] = useState(false);

  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const { data: currentAccountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const currentCoin = getAccountAsset();

  const coinImage = currentCoin?.asset.image;
  const symbol = currentCoin?.asset.symbol;
  const chainName = currentCoin?.chain.name;
  const coinGeckoId = currentCoin?.asset.coinGeckoId;

  const totalDisplayAmount = toDisplayDenomAmount(currentCoin?.balance || '0', currentCoin?.asset.decimals || 0);
  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const totalValue = times(totalDisplayAmount, chainPrice);

  const cosmosStyleCoin = useMemo(() => {
    const isEthermint = currentCoin?.chain.chainType === 'evm' && currentCoin.chain.isCosmos;

    const isMainCoin = isEqualsIgnoringCase(currentCoin?.asset.id, NATIVE_EVM_COIN_ADDRESS);

    if (isEthermint && isMainCoin) {
      return currentAccountAssets?.cosmosAccountAssets.find(
        (item) =>
          item.asset.id === currentCoin.chain.mainAssetDenom &&
          item.chain.id === currentCoin.chain.id &&
          item.address.chainId === currentCoin.address.chainId &&
          item.address.accountType.hdPath === currentCoin.address.accountType.hdPath,
      );
    }

    return undefined;
  }, [currentAccountAssets?.cosmosAccountAssets, currentCoin]);

  const address = isShowCosmosStyleAddress ? cosmosStyleCoin?.address.address || '' : currentCoin?.address.address || '';

  const voteURL = currentCoin?.chain.explorer?.proposal;
  const formattedVoteURL = voteURL && removeTrailingSlash(removeTemplateLiteral(voteURL));

  const copyToClipboard = () => {
    copy(address);
    toastSuccess(t('components.MainBox.CoinDetailBox.index.copied'));
  };

  const handleOnClickChangeAddress = () => {
    setIsShowCosmosStyleAddress(!isShowCosmosStyleAddress);
  };

  const hanldeOnClickSend = () => {
    if (cosmosStyleCoin) {
      setIsOpenBottomSheet(true);
    } else {
      navigate({
        to: Send.to,
        params: { coinId: coinId },
      });
    }
  };

  const hanldeOnEthermintSend = useCallback(
    (val: 'cosmos' | 'evm') => {
      if (!currentCoin) return;

      if (val === 'cosmos') {
        if (cosmosStyleCoin) {
          const cosmosStyleCoinId = getCoinId(cosmosStyleCoin.asset);

          navigate({
            to: Send.to,
            params: { coinId: cosmosStyleCoinId },
          });
        }
      } else {
        navigate({
          to: Send.to,
          params: { coinId: coinId },
        });
      }
    },
    [coinId, cosmosStyleCoin, currentCoin, navigate],
  );
  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <TextButton onClick={copyToClipboard} variant="underline" typoVarient="h6n_M">
              {shorterAddress(address)}
            </TextButton>
            {cosmosStyleCoin && (
              <ChangeAddressIconButtonContainer onClick={handleOnClickChangeAddress}>
                <IconButton>
                  <ChangeIcon />
                </IconButton>
              </ChangeAddressIconButtonContainer>
            )}
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyTopContainer>
              <Base1300Text variant="h1_B">{symbol}</Base1300Text>
              <NumberTypo typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" fixed={6}>
                {totalDisplayAmount}
              </NumberTypo>
            </BodyTopContainer>
            <BodyBottomContainer>
              <Typography variant="b3_M">{chainName}</Typography>
              <NumberTypo typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency="usd">
                {totalValue}
              </NumberTypo>
            </BodyBottomContainer>
          </BodyContainer>
        }
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton onClick={hanldeOnClickSend} leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.send')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.receive')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.swap')}</SpacedTypography>
            </StyledIconTextButton>
            {formattedVoteURL && (
              <StyledIconTextButton
                onClick={() => {
                  window.open(formattedVoteURL, '_blank');
                }}
                leadingIcon={<StakeIcon />}
                direction="vertical"
              >
                <SpacedTypography variant="b3_M">{t('components.MainBox.CoinDetailBox.index.vote')}</SpacedTypography>
              </StyledIconTextButton>
            )}
          </BottomButtonContainer>
        }
        className="circleGradient"
        coinBackgroundImage={coinImage || DefaultCoinImage}
      />
      {cosmosStyleCoin && (
        <EthermintSendBottomSheet
          open={isOpenBottomSheet}
          onClose={() => setIsOpenBottomSheet(false)}
          bech32AddressPrefix={cosmosStyleCoin.chain.accountPrefix + 1}
          onSelectOption={hanldeOnEthermintSend}
        />
      )}
    </>
  );
}

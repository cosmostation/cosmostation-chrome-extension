import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { QRCodeSVG } from 'qrcode.react';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1000Text from '@/components/common/Base1000Text/index.tsx';
import Base1300Text from '@/components/common/Base1300Text/index.tsx';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab/index.tsx';
import TextButton from '@/components/common/TextButton/index.tsx';
import CopyButton from '@/components/CopyButton/index.tsx';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm.ts';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets.ts';
import { getCoinId } from '@/utils/queryParamGenerator.ts';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string.ts';
import { toastDefault } from '@/utils/toast.tsx';

import {
  AddressBodyContainer,
  AddressBottomContainer,
  AddressContainer,
  AddressText,
  AddressTopContainer,
  AddressTopTitleContainer,
  BottomLeftCornerContainer,
  BottomRightCornerContainer,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  Container,
  CornerIconContainer,
  DescriptionContainer,
  FilledTabContainer,
  InfoIconContainer,
  QRBorderContainer,
  QRContainer,
  TopLeftCornerContainer,
  TopRightCornerContainer,
} from './-styled.tsx';

import BottomLeftCornerStrokeIcon from '@/assets/images/icons/BorderStroke27.svg';
import InformationIcon from '@/assets/images/icons/Information14.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['EVM Style', 'COSMOS Style'];

  const { data: currentAccountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const selectedCoin = currentAccountAssets?.flatAccountAssets && currentAccountAssets.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const isEthermint = selectedCoin?.chain.chainType === 'evm' && selectedCoin.chain.isCosmos;

  const isMainCoin = isEqualsIgnoringCase(selectedCoin?.asset.id, NATIVE_EVM_COIN_ADDRESS);

  const isShowCosmosStyle = isEthermint && isMainCoin;

  const cosmosStyleCoin = isShowCosmosStyle
    ? currentAccountAssets?.cosmosAccountAssets.find(
        (item) =>
          item.asset.id === selectedCoin.chain.mainAssetDenom &&
          item.chain.id === selectedCoin.chain.id &&
          item.address.chainId === selectedCoin.address.chainId &&
          item.address.accountType.hdPath === selectedCoin.address.accountType.hdPath,
      )
    : undefined;

  const coinDenom = (() => {
    if (isShowCosmosStyle) {
      if (tabValue === 0) {
        return selectedCoin?.asset.id;
      }
      if (tabValue === 1) {
        return cosmosStyleCoin?.asset.id;
      }
    }

    return selectedCoin?.asset.id;
  })();

  const coinType = selectedCoin?.asset.type;

  const coinImage = selectedCoin?.asset.image;

  const symbol = selectedCoin?.asset.symbol || '';

  const chainAddress = (() => {
    if (isShowCosmosStyle) {
      if (tabValue === 0) {
        return selectedCoin.address.address;
      }
      if (tabValue === 1) {
        return cosmosStyleCoin?.address.address || '';
      }
    }

    return selectedCoin?.address.address || '';
  })();

  const chainName = selectedCoin?.chain.name || '';

  const coinTypeText = (() => {
    if (isShowCosmosStyle) {
      if (tabValue === 0) {
        return `${t('pages.wallet.receive.$coinId.entry.contract')} : `;
      }
      if (tabValue === 1) {
        return `${t('pages.wallet.receive.$coinId.entry.denom')} : `;
      }
    }

    if (coinType === 'erc20' || coinType === 'cw20') {
      return `${t('pages.wallet.receive.$coinId.entry.contract')} : `;
    }
    if (coinType === 'ibc') {
      return `${t('pages.wallet.receive.$coinId.entry.denom')} :`;
    }
    if (coinType === 'native' && selectedCoin?.chain.chainType === 'cosmos') {
      return `${t('pages.wallet.receive.$coinId.entry.denom')} :`;
    }
  })();

  const coinDescription = selectedCoin?.asset.description;

  const isShowDescription = (() => {
    if (['erc20', 'cw20', 'ibc'].includes(selectedCoin?.asset.type || '')) return false;

    return true;
  })();

  const shortCoinDenom = shorterAddress(coinDenom, 16);

  const badgeImageURL = selectedCoin?.chain.image || '';

  const copyToClipboard = (copyString?: string) => {
    copy(copyString || '');
    toastDefault(t('pages.wallet.receive.$coinId.entry.copied'));
  };

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <BaseBody>
      <Container>
        {isShowCosmosStyle && (
          <FilledTabContainer>
            <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>
          </FilledTabContainer>
        )}
        <CoinContainer>
          <CoinSymbolText variant="h2_B">{symbol}</CoinSymbolText>
          {isShowDescription ? (
            <DescriptionContainer>
              <Typography variant="b3_M">{coinDescription}</Typography>
            </DescriptionContainer>
          ) : (
            <CoinDenomContainer>
              {coinTypeText && <Typography variant="b4_R">{`${coinTypeText}`}</Typography>}
              &nbsp;
              <TextButton
                typoVarient="b3_M"
                onClick={() => {
                  copyToClipboard(coinDenom);
                }}
              >
                {shortCoinDenom}
              </TextButton>
            </CoinDenomContainer>
          )}
        </CoinContainer>
        <QRBorderContainer>
          <QRContainer>
            <QRCodeSVG level="H" value={chainAddress} size={200} />
          </QRContainer>
          <BottomLeftCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </BottomLeftCornerContainer>

          <BottomRightCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </BottomRightCornerContainer>

          <TopLeftCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </TopLeftCornerContainer>

          <TopRightCornerContainer>
            <CornerIconContainer>
              <BottomLeftCornerStrokeIcon />
            </CornerIconContainer>
          </TopRightCornerContainer>
          <CoinImage imageURL={coinImage} badgeImageURL={badgeImageURL} />
        </QRBorderContainer>

        <AddressContainer>
          <AddressTopContainer>
            <AddressTopTitleContainer>
              <Base1000Text variant="b3_M">{`${t('pages.wallet.receive.$coinId.entry.myAddress')}
              ${tabValue === 1 && isShowCosmosStyle ? ' (Cosmos Style)' : ''}`}</Base1000Text>
            </AddressTopTitleContainer>

            <AddressBodyContainer>
              <AddressText variant="b3_M_Multiline">{chainAddress}</AddressText>

              <CopyButton sx={{ width: '2rem', height: '2rem' }} copyString={chainAddress} />
            </AddressBodyContainer>
          </AddressTopContainer>
          <AddressBottomContainer>
            <InfoIconContainer>
              <InformationIcon />
            </InfoIconContainer>
            <Base1000Text variant="b3_R">{t('pages.wallet.receive.$coinId.entry.addressDescription1')}</Base1000Text>
            &nbsp;
            <Base1300Text variant="b3_M">{chainName}</Base1300Text>
            &nbsp;
            <Base1000Text variant="b3_R">{t('pages.wallet.receive.$coinId.entry.addressDescription2')}</Base1000Text>
          </AddressBottomContainer>
        </AddressContainer>
      </Container>
    </BaseBody>
  );
}

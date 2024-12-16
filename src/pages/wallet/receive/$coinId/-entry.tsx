import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { QRCodeSVG } from 'qrcode.react';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1000Text from '@/components/common/Base1000Text/index.tsx';
import Base1300Text from '@/components/common/Base1300Text/index.tsx';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { getCoinId } from '@/utils/queryParamGenerator.ts';
import { shorterAddress } from '@/utils/string.ts';
import { toastSuccess } from '@/utils/toast.tsx';

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
  InfoIconContainer,
  QRBorderContainer,
  QRContainer,
  StyledIconButton,
  TopLeftCornerContainer,
  TopRightCornerContainer,
} from './-styled.tsx';

import BottomLeftCornerStrokeIcon from '@/assets/images/icons/BorderStroke27.svg';
import InformationIcon from '@/assets/images/icons/Information14.svg';
import CopyIcon from '@/assets/images/icons/Paste20.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();

  const { data: currentAccountAssets } = useAccountAssets();

  const selectedCoin = currentAccountAssets?.flatAccountAssets && currentAccountAssets.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const coinDenom = selectedCoin?.asset.id;
  const coinType = selectedCoin?.asset.type;

  const coinImage = selectedCoin?.asset.image;

  const symbol = selectedCoin?.asset.symbol || '';

  const chainAddres = selectedCoin?.address.address || '';

  const chainName = selectedCoin?.chain.name || '';

  const coinTypeText = (() => {
    if (coinType === 'erc20' || coinType === 'cw20') {
      return `${t('pages.wallet.receive.$coinId.entry.contract')} : `;
    }
    if (coinType === 'ibc') {
      return `${t('pages.wallet.receive.$coinId.entry.ibc')} :`;
    }
    if (coinType === 'native' && selectedCoin?.chain.chainType === 'cosmos') {
      return `${t('pages.wallet.receive.$coinId.entry.denom')} :`;
    }
  })();

  const shortCoinDenom = shorterAddress(coinDenom, 16);

  const badgeImageURL = selectedCoin?.asset.type !== 'native' ? selectedCoin?.chain.image || '' : '';

  const copyToClipboard = () => {
    copy(selectedCoin?.address.address || '');
    toastSuccess(t('pages.wallet.receive.$coinId.entry.copied'));
  };

  return (
    <BaseBody>
      <Container>
        <CoinContainer>
          <CoinSymbolText variant="h2_B">{symbol}</CoinSymbolText>
          <CoinDenomContainer>
            {coinTypeText && <Typography variant="b4_R">{`${coinTypeText}`}</Typography>}
            &nbsp;
            <Typography variant="b3_M">{shortCoinDenom}</Typography>
          </CoinDenomContainer>
        </CoinContainer>
        <QRBorderContainer>
          <QRContainer>
            <QRCodeSVG value={chainAddres} size={200} />
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
              <Base1000Text variant="b3_M">{t('pages.wallet.receive.$coinId.entry.myAddress')}</Base1000Text>
            </AddressTopTitleContainer>

            <AddressBodyContainer>
              <AddressText variant="b3_M_Multiline">{chainAddres}</AddressText>

              <StyledIconButton onClick={copyToClipboard}>
                <CopyIcon />
              </StyledIconButton>
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

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useMultipleAccountTypes } from '@/hooks/useMultipleAccountTypes';
import { Route as CoinTypeSetting } from '@/pages/manage-assets/coin-type-setting';
import { gt } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Body,
  Container,
  ContentsContainer,
  Footer,
  Header,
  HeaderTitle,
  IconContainer,
  InfoContainer,
  StyledBottomSheet,
  SubTitleText,
  TitleText,
} from './styled';
import Button from '../common/Button';
import SplitButtonsLayout from '../common/SplitButtonsLayout';
import InformationPanel from '../InformationPanel';

import AssetFoundIcon from '@/assets/images/icons/AssetFound82.svg';

type CheckLegacyAddressBalanceBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function CheckLegacyAddressBalanceBottomSheet({ ...remainder }: CheckLegacyAddressBalanceBottomSheetProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading: isUpdateBalnaceLoading } = useUpdateBalance();

  const { initCheckLegacyBalanceAccountIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { currentAccount } = useCurrentAccount();
  const { data: multipleAccountTypeWithAddress } = useMultipleAccountTypes({ accountId: currentAccount?.id });
  const { data: accountAllAssets } = useAccountAllAssets({ accountId: currentAccount?.id });

  const isAlreayChecked = currentAccount.type === 'MNEMONIC' ? initCheckLegacyBalanceAccountIds.includes(currentAccount?.id) : true;

  const [isShow, setIsShow] = useState(false);

  const handleClose = () => {
    setIsShow(false);
    const filteredAccountIds = initCheckLegacyBalanceAccountIds.filter((id) => id !== currentAccount?.id);
    const updatedAccountIds = [...filteredAccountIds, currentAccount?.id];

    updateExtensionStorageStore('initCheckLegacyBalanceAccountIds', updatedAccountIds);
  };

  const handleConfirm = () => {
    navigate({
      to: CoinTypeSetting.to,
    });
    handleClose();
  };

  useEffect(() => {
    if (!isShow && !isAlreayChecked && multipleAccountTypeWithAddress && !isUpdateBalnaceLoading) {
      const multipleAccountTypes = Object.values(multipleAccountTypeWithAddress);

      const isLegacyAddressHasBalance = multipleAccountTypes.some((item) => {
        const legacyAccountTypes = item.filter((i) => i.accountType.isDefault === false);

        const hasBalance = legacyAccountTypes.some((i) => {
          const address = i.address;

          if (i.chainType === 'cosmos') {
            const filteredCosmosAssets = accountAllAssets?.cosmosAccountAssets.filter((asset) => asset.address.address === address) || [];

            if (filteredCosmosAssets.length > 0) {
              return filteredCosmosAssets?.some((asset) => {
                return gt(asset.balance, '0');
              });
            }

            const filteredCW20Assets = accountAllAssets?.cw20AccountAssets.filter((asset) => asset.address.address === address) || [];

            if (filteredCW20Assets.length > 0) {
              return filteredCW20Assets?.some((asset) => {
                return gt(asset.balance, '0');
              });
            }
          }
          if (i.chainType === 'bitcoin') {
            const filteredBitcoinAssets = accountAllAssets?.bitcoinAccountAssets.filter((asset) => asset.address.address === address) || [];

            if (filteredBitcoinAssets.length > 0) {
              return filteredBitcoinAssets?.some((asset) => {
                return gt(asset.balance, '0');
              });
            }
          }
          return false;
        });

        return hasBalance;
      });

      if (isLegacyAddressHasBalance) {
        setIsShow(true);
      }
    }
  }, [
    accountAllAssets?.bitcoinAccountAssets,
    accountAllAssets?.cosmosAccountAssets,
    accountAllAssets?.cw20AccountAssets,
    isAlreayChecked,
    isShow,
    isUpdateBalnaceLoading,
    multipleAccountTypeWithAddress,
  ]);

  return (
    <StyledBottomSheet {...remainder} open={isShow && !isAlreayChecked}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('components.CheckLegacyAddressBalanceBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <Body>
          <ContentsContainer>
            <IconContainer>
              <AssetFoundIcon />
            </IconContainer>
            <TitleText variant="b1_B">{t('components.CheckLegacyAddressBalanceBottomSheet.index.contentTitle')}</TitleText>
            <SubTitleText variant="b3_R_Multiline">{t('components.CheckLegacyAddressBalanceBottomSheet.index.contentBody')}</SubTitleText>
          </ContentsContainer>
          <InfoContainer>
            <InformationPanel
              varitant="info"
              title={<Typography variant="b3_M">{t('components.CheckLegacyAddressBalanceBottomSheet.index.infoTitle')}</Typography>}
              body={<Typography variant="b4_R_Multiline">{t('components.CheckLegacyAddressBalanceBottomSheet.index.infoBody')}</Typography>}
            />
          </InfoContainer>
        </Body>
        <Footer>
          <SplitButtonsLayout
            cancelButton={
              <Button onClick={handleClose} variant="dark">
                {t('components.CheckLegacyAddressBalanceBottomSheet.index.later')}
              </Button>
            }
            confirmButton={<Button onClick={handleConfirm}>{t('components.CheckLegacyAddressBalanceBottomSheet.index.goToSetUp')}</Button>}
          />
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}

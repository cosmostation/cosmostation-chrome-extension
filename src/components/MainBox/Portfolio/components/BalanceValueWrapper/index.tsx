import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';

import ChipButton from '@/components/common/ChipButton';
import { useManualBalanceUpdate } from '@/hooks/common/useManualBalanceUpdate';
import { useLastUpdateChecker } from '@/hooks/useLastUpdateChecker';
import { Route as SelectReceiveCoin } from '@/pages/wallet/receive';
import { Route as ReceiveWithChainId } from '@/pages/wallet/receive/chain/$chainId';
import { Route as SelectSendCoin } from '@/pages/wallet/send';
import { Route as SendCoinWithChainId } from '@/pages/wallet/send/chain/$chainId';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainId } from '@/utils/queryParamGenerator';

import {
  BodyBottomChipButtonContainer,
  BodyBottomContainer,
  BodyContainer,
  BodyTopContainer,
  ChipButtonContentsContainer,
  LastBalanceUpdateText,
  StyledChipButton,
} from '../../styled';
import BalanceValueButton from '../BalanceValueButton';

interface BalanceValueButtonProps {
  accountAssets: FlatAccountAssets[];
  selectedChainId?: UniqueChainId;
  selectedChainMainAsset?: FlatAccountAssets;
}

export default function BalanceValueWrapper({ accountAssets, selectedChainId, selectedChainMainAsset }: BalanceValueButtonProps) {
  const [isBalanceUpdateButtonHovered, setIsBalanceUpdateButtonHovered] = useState(false);
  const { updateAllBalance, updateChainBalance, isLoadingAllBalance, isLoadingChainBalance } = useManualBalanceUpdate();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const lastUpdateStatusText = useLastUpdateChecker(selectedChainMainAsset?.lastUpdatedAtMs);
  const isUpdatingBalance = selectedChainId && selectedChainMainAsset?.address.address ? isLoadingChainBalance : isLoadingAllBalance;

  const isShowAccountDetail = !!selectedChainMainAsset?.asset;

  const chainIdForReceivePage = useMemo(() => {
    if (!selectedChainMainAsset?.chain) return undefined;

    return getUniqueChainId(selectedChainMainAsset.chain);
  }, [selectedChainMainAsset?.chain]);

  const handleManualBalanceUpdate = async () => {
    if (selectedChainId && selectedChainMainAsset?.address.address) {
      await updateChainBalance(selectedChainId, selectedChainMainAsset.address.address);
      return;
    }

    await updateAllBalance();
  };

  return (
    <BodyContainer>
      <BodyTopContainer>
        <BalanceValueButton
          accountAssets={accountAssets}
          isUpdatingBalance={isUpdatingBalance}
          selectedChainId={selectedChainId}
          handleManualBalanceUpdate={handleManualBalanceUpdate}
          isHovering={isBalanceUpdateButtonHovered}
          handleHovering={(value) => {
            setIsBalanceUpdateButtonHovered(value);
          }}
        />
      </BodyTopContainer>
      <BodyBottomContainer>
        {lastUpdateStatusText && (
          <LastBalanceUpdateText
            typoVarient="b5_M"
            onMouseEnter={() => {
              setIsBalanceUpdateButtonHovered(true);
            }}
            onMouseLeave={() => {
              setIsBalanceUpdateButtonHovered(false);
            }}
            data-is-hovering={isBalanceUpdateButtonHovered}
            onClick={handleManualBalanceUpdate}
          >
            {lastUpdateStatusText}
          </LastBalanceUpdateText>
        )}

        <BodyBottomChipButtonContainer>
          <ChipButton
            variant="light"
            onClick={() => {
              if (isShowAccountDetail) {
                navigate({
                  to: SendCoinWithChainId.to,
                  params: {
                    chainId: selectedChainId as string,
                  },
                });
              } else {
                navigate({
                  to: SelectSendCoin.to,
                });
              }
            }}
          >
            <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.send')}</Typography>
          </ChipButton>
          <StyledChipButton
            variant="dark"
            onClick={() => {
              if (isShowAccountDetail && chainIdForReceivePage) {
                navigate({
                  to: ReceiveWithChainId.to,
                  params: {
                    chainId: chainIdForReceivePage as UniqueChainId,
                  },
                });
              } else {
                navigate({
                  to: SelectReceiveCoin.to,
                });
              }
            }}
          >
            <ChipButtonContentsContainer>
              <Typography variant="b4_M">{t('components.MainBox.Portfolio.index.receive')}</Typography>
            </ChipButtonContentsContainer>
          </StyledChipButton>
        </BodyBottomChipButtonContainer>
      </BodyBottomContainer>
    </BodyContainer>
  );
}

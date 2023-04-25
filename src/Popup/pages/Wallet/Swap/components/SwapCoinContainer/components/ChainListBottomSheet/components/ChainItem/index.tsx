import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { IntegratedSwapChain } from '~/types/swap/asset';

import {
  ChainButton,
  ChainButtonLeftColumnContainer,
  ChainButtonLeftContainer,
  ChainButtonLeftImageContainer,
  ChainButtonLeftTitleContainer,
  ChainButtonRightContainer,
  ChainButtonRightIconContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type ChainItemProps = {
  chainInfo: IntegratedSwapChain;
  isActive: boolean;
  onClickChain: (clickedChain: IntegratedSwapChain) => void;
};

const ChainItem = forwardRef<HTMLButtonElement, ChainItemProps>(({ chainInfo, isActive, onClickChain }, ref) => {
  const { t, language } = useTranslation();

  return (
    <ChainButton
      key={chainInfo.id}
      data-is-active={isActive}
      data-is-unavailable={chainInfo.isUnavailable}
      disabled={chainInfo.isUnavailable}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickChain?.(chainInfo);
      }}
    >
      <ChainButtonLeftContainer>
        <ChainButtonLeftImageContainer>
          <Image src={chainInfo.imageURL} />
        </ChainButtonLeftImageContainer>
        <ChainButtonLeftColumnContainer>
          <ChainButtonLeftTitleContainer>
            <Typography variant="h5">{chainInfo.networkName}</Typography>
          </ChainButtonLeftTitleContainer>
          {chainInfo.isUnavailable && (
            <Typography variant="h6">
              {`${t('pages.Wallet.Swap.components.SwapCoinContainer.components.ChainListBottomSheet.components.ChainItem.index.unAvailable1')} ${
                language === 'en' ? chainInfo.networkName : ''
              } ${t('pages.Wallet.Swap.components.SwapCoinContainer.components.ChainListBottomSheet.components.ChainItem.index.unAvailable2')}`}
            </Typography>
          )}
        </ChainButtonLeftColumnContainer>
      </ChainButtonLeftContainer>
      <ChainButtonRightContainer>
        <ChainButtonRightIconContainer>{isActive && <Check16Icon />}</ChainButtonRightIconContainer>
      </ChainButtonRightContainer>
    </ChainButton>
  );
});

export default ChainItem;

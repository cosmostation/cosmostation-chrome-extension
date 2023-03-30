import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { IntegratedSwapChain } from '~/types/swap/asset';

import {
  ChainButton,
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

const ChainItem = forwardRef<HTMLButtonElement, ChainItemProps>(({ chainInfo, isActive, onClickChain }, ref) => (
  <ChainButton
    key={chainInfo.id}
    data-is-active={isActive}
    ref={isActive ? ref : undefined}
    onClick={() => {
      onClickChain?.(chainInfo);
    }}
  >
    <ChainButtonLeftContainer>
      <ChainButtonLeftImageContainer>
        <Image src={chainInfo.imageURL} />
      </ChainButtonLeftImageContainer>
      <ChainButtonLeftTitleContainer>
        <Typography variant="h5">{chainInfo.networkName}</Typography>
      </ChainButtonLeftTitleContainer>
    </ChainButtonLeftContainer>
    <ChainButtonRightContainer>
      <ChainButtonRightIconContainer>{isActive && <Check16Icon />}</ChainButtonRightIconContainer>
    </ChainButtonRightContainer>
  </ChainButton>
));
export default ChainItem;

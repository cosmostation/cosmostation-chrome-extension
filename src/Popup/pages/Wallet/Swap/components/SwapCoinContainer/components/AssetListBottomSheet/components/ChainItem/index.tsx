import { forwardRef } from 'react';
import type { ChainData } from '@0xsquid/sdk/dist/types';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { ChainButton, ChainLeftContainer, ChainLeftImageContainer, ChainLeftTitleContainer, ChainRightContainer, ChainRightIconContainer } from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type ChainItemProps = {
  chainInfo: ChainData;
  isActive: boolean;
  onClickChain: (clickedChain: ChainData) => void;
};

const ChainItem = forwardRef<HTMLButtonElement, ChainItemProps>(({ chainInfo, onClickChain, isActive }, ref) => (
  <ChainButton
    key={chainInfo.chainId}
    data-is-active={isActive}
    ref={isActive ? ref : undefined}
    onClick={() => {
      onClickChain?.(chainInfo);
    }}
  >
    <ChainLeftContainer>
      <ChainLeftImageContainer>
        <Image src={chainInfo.chainIconURI} />
      </ChainLeftImageContainer>
      <ChainLeftTitleContainer>
        <Typography variant="h5">{chainInfo.chainName}</Typography>
      </ChainLeftTitleContainer>
    </ChainLeftContainer>
    <ChainRightContainer>
      <ChainRightIconContainer>{isActive && <Check16Icon />}</ChainRightIconContainer>
    </ChainRightContainer>
  </ChainButton>
));
export default ChainItem;

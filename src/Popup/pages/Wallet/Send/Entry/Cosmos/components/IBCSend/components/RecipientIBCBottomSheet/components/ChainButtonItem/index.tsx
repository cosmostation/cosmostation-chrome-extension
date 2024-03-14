import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownImg from '~/images/chainImgs/unknown.png';
import Image from '~/Popup/components/common/Image';

import {
  ChainButton,
  ChainLeftChainNameContainer,
  ChainLeftChannelIdContainer,
  ChainLeftContainer,
  ChainLeftImageContainer,
  ChainLeftInfoContainer,
  ChainRightContainer,
} from './styled';
import type { RecipientIBC } from '../..';

import Check16Icon from '~/images/icons/Check16.svg';

type ChainButtonItemProps = {
  isActive: boolean;
  recipientIBCInfo: RecipientIBC;
  onClickChain?: (selectedRecipientIBC: RecipientIBC) => void;
};

const ChainButtonItem = forwardRef<HTMLButtonElement, ChainButtonItemProps>(({ isActive, recipientIBCInfo, onClickChain }, ref) => {
  const recipientIBCChain = useMemo(() => recipientIBCInfo.chain, [recipientIBCInfo.chain]);
  const { id, imageURL, chainName } = recipientIBCChain;

  return (
    <ChainButton
      type="button"
      key={id}
      data-is-active={isActive ? 1 : 0}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickChain?.(recipientIBCInfo);
      }}
    >
      <ChainLeftContainer>
        <ChainLeftImageContainer>
          <Image src={imageURL} defaultImgSrc={unknownImg} />
        </ChainLeftImageContainer>
        <ChainLeftInfoContainer>
          <ChainLeftChainNameContainer>
            <Typography variant="h5">{chainName}</Typography>
          </ChainLeftChainNameContainer>
          <ChainLeftChannelIdContainer>
            <Typography variant="h6n">{recipientIBCInfo.channel}</Typography>
          </ChainLeftChannelIdContainer>
        </ChainLeftInfoContainer>
      </ChainLeftContainer>
      <ChainRightContainer>{isActive && <Check16Icon />}</ChainRightContainer>
    </ChainButton>
  );
});
export default ChainButtonItem;

import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { toDisplayCWTokenStandard } from '~/Popup/utils/cosmos';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

import {
  Button,
  LeftContainer,
  LeftImageContainer,
  LeftInfoBodyContainer,
  LeftInfoContainer,
  LeftInfoFooterContainer,
  LeftInfoHeaderContainer,
  RightContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';

type NFTButtonProps = ComponentProps<typeof Button> & {
  chain: CosmosChain;
  currentNFT: CosmosNFT;
  isActive?: boolean;
};

export default function NFTButton({ currentNFT, chain, isActive, ...remainder }: NFTButtonProps) {
  const { address, tokenType, tokenId } = currentNFT;

  const { data: nftMeta } = useNFTMetaSWR({ contractAddress: address, tokenId, chain });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 14), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 10), [tokenId]);

  const displayTokenStandard = useMemo(() => toDisplayCWTokenStandard(tokenType), [tokenType]);

  return (
    <Button type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          {nftMeta?.imageURL ? <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta?.name || ''} placement="top" arrow>
              <Typography variant="h5">{nftMeta?.name}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={address || ''} placement="top" arrow>
              <Typography variant="h6">{shorterContractAddress}</Typography>
            </Tooltip>
            &nbsp;/&nbsp;
            <Tooltip title={tokenId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterTokenId}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Typography variant="h6">{displayTokenStandard}</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer data-is-active={isActive ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </Button>
  );
}

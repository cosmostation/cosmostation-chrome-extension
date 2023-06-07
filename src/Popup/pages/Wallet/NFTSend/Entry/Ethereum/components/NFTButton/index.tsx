import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

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
  isActive?: boolean;
  currentNFT: EthereumNFT;
};

export default function NFTButton({ currentNFT, isActive, ...remainder }: NFTButtonProps) {
  const { address, tokenType, tokenId } = currentNFT || {};

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: address, tokenId });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 23), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 17), [tokenId]);

  const tokenStandard = useMemo(() => tokenType?.replace('ERC', 'ERC-'), [tokenType]);

  return (
    <Button type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} />
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta?.name || '-'} placement="top" arrow>
              <Typography variant="h5">{nftMeta?.name || '-'}</Typography>
            </Tooltip>
          </LeftInfoHeaderContainer>
          <LeftInfoBodyContainer>
            <Tooltip title={address || ''} placement="top" arrow>
              <Typography variant="h6">{shorterContractAddress}</Typography>
            </Tooltip>
          </LeftInfoBodyContainer>
          <LeftInfoFooterContainer>
            <Tooltip title={tokenId || ''} placement="top" arrow>
              <Typography variant="h6">{shorterTokenId}</Typography>
            </Tooltip>
            /<Typography variant="h6">{tokenStandard}</Typography>
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer data-is-active={isActive ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </Button>
  );
}

import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetNFTBalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTBalanceSWR';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

import {
  Button,
  InvalidImageContainer,
  InvalidImageTextContainer,
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

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  // NOTE erc1155일때 밸런스 보여줘야함
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: nftBalance } = useGetNFTBalanceSWR({
    contractAddress: currentNFT.address,
    ownerAddress: address,
    tokenId: currentNFT.tokenId,
    tokenStandard: currentNFT.tokenType,
  });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 23), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 17), [tokenId]);

  const tokenStandard = useMemo(() => tokenType?.replace('ERC', 'ERC-'), [tokenType]);

  return (
    <Button type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          {nftMeta?.imageURL ? (
            <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} />
          ) : (
            <InvalidImageContainer>
              <InvalidImageTextContainer>
                <Typography variant="h6">{tokenId}</Typography>
              </InvalidImageTextContainer>
            </InvalidImageContainer>
          )}
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

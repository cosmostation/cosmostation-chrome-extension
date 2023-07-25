import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetNFTBalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTBalanceSWR';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayTokenStandard } from '~/Popup/utils/ethereum';
import { toDisplayTokenId } from '~/Popup/utils/nft';
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
  const { t } = useTranslation();
  const { address, tokenType, tokenId } = currentNFT || {};

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const { data: currentNFTBalance } = useGetNFTBalanceSWR({
    contractAddress: address,
    tokenId,
    tokenStandard: tokenType,
  });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 10), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 10), [tokenId]);

  const displayTokenStandard = useMemo(() => toDisplayTokenStandard(tokenType), [tokenType]);

  return (
    <Button type="button" {...remainder}>
      <LeftContainer>
        <LeftImageContainer>
          {nftMeta?.imageURL ? <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
        </LeftImageContainer>
        <LeftInfoContainer>
          <LeftInfoHeaderContainer>
            <Tooltip title={nftMeta?.name || tokenId} placement="top" arrow>
              <Typography variant="h5">{nftMeta?.name || toDisplayTokenId(tokenId)}</Typography>
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
            {currentNFT.tokenType === 'ERC1155' && (
              <Typography variant="h6">{`/ ${t('pages.Wallet.NFTSend.Entry.Ethereum.components.NFTButton.index.balance')}: ${
                currentNFTBalance || '0'
              }`}</Typography>
            )}
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer data-is-active={isActive ? 1 : 0}>
        <BottomArrow24Icon />
      </RightContainer>
    </Button>
  );
}

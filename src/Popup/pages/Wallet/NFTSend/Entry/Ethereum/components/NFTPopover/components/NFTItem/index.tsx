import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetNFTBalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTBalanceSWR';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayTokenStandard } from '~/Popup/utils/ethereum';
import { toDisplayTokenId } from '~/Popup/utils/nft';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

import {
  LeftContainer,
  LeftImageContainer,
  LeftInfoBodyContainer,
  LeftInfoContainer,
  LeftInfoFooterContainer,
  LeftInfoHeaderContainer,
  NFTButton,
  RightContainer,
} from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type NFTItemProps = ComponentProps<typeof NFTButton> & {
  isActive?: boolean;
  nft: EthereumNFT;
};

const NFTItem = forwardRef<HTMLButtonElement, NFTItemProps>(({ isActive, nft, ...remainder }, ref) => {
  const { t } = useTranslation();

  const { tokenId, tokenType, address, ownerAddress } = nft;

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const { data: isOwnedNFT } = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress, tokenId, tokenStandard: tokenType });

  const { data: currentNFTBalance } = useGetNFTBalanceSWR({
    contractAddress: address,
    tokenId,
    tokenStandard: tokenType,
  });

  const shorterContractAddress = useMemo(() => shorterAddress(address, 9), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 9), [tokenId]);

  const displayTokenStandard = useMemo(() => toDisplayTokenStandard(tokenType), [tokenType]);

  return (
    <NFTButton type="button" data-is-available={!!isOwnedNFT} data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
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
            {tokenType === 'ERC1155' && (
              <Typography variant="h6">{`/ ${t('pages.Wallet.NFTSend.Entry.Ethereum.components.NFTPopover.components.NFTItem.index.balance')}: ${
                currentNFTBalance || '0'
              }`}</Typography>
            )}
          </LeftInfoFooterContainer>
        </LeftInfoContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </NFTButton>
  );
});

export default NFTItem;

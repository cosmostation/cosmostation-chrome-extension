import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useGetNFTBalanceSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTBalanceSWR';
import { useGetNFTMetaSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTMetaSWR';
import { useGetNFTURISWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTURISWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { httpsRegex } from '~/Popup/utils/regex';
import { shorterAddress } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

import {
  AttributeContainer,
  AttributeHeaderContainer,
  ItemColumnContainer,
  ItemContainer,
  ItemRightContainer,
  ItemTitleContainer,
  ItemValueContainer,
  StyledIconButton,
  URLButton,
} from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';

type NFTInfoItemProps = {
  nft: EthereumNFT;
};

export default function NFTInfoItem({ nft }: NFTInfoItemProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { tokenType, address, tokenId, ownerAddress } = nft;

  const { data: nftMetaSourceURI } = useGetNFTURISWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const { data: nftMeta } = useGetNFTMetaSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const { data: nftBalance } = useGetNFTBalanceSWR({ contractAddress: address, tokenId, tokenStandard: tokenType });

  const shorterOwnerAddress = useMemo(() => shorterAddress(ownerAddress, 14), [ownerAddress]);
  const shorterContractAddress = useMemo(() => shorterAddress(address, 14), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 14), [tokenId]);

  const shorterExternalURL = useMemo(() => shorterAddress(nftMeta?.externalLink, 20), [nftMeta?.externalLink]);
  const shorterSourceURL = useMemo(() => shorterAddress(nftMetaSourceURI || '', 20), [nftMetaSourceURI]);

  const displayTokenStandard = useMemo(() => tokenType.replace('ERC', 'ERC-'), [tokenType]);

  const handleOnClickCopy = (copyString?: string) => {
    if (copyString && copy(copyString)) {
      enqueueSnackbar(t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.copied'));
    }
  };

  return (
    <>
      {shorterOwnerAddress && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.ownerAddress')}</Typography>
          </ItemTitleContainer>

          <ItemRightContainer>
            <Tooltip title={ownerAddress} placement="top" arrow>
              <Typography variant="h5">{shorterOwnerAddress}</Typography>
            </Tooltip>

            <StyledIconButton onClick={() => handleOnClickCopy(ownerAddress)}>
              <Copy16Icon />
            </StyledIconButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.contractAddress')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Tooltip title={address || ''} placement="top" arrow>
            <Typography variant="h5">{shorterContractAddress}</Typography>
          </Tooltip>

          <StyledIconButton onClick={() => handleOnClickCopy(address)}>
            <Copy16Icon />
          </StyledIconButton>
        </ItemRightContainer>
      </ItemContainer>

      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.tokenId')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Tooltip title={tokenId || ''} placement="top" arrow>
            <Typography variant="h5">{shorterTokenId}</Typography>
          </Tooltip>

          <StyledIconButton onClick={() => handleOnClickCopy(tokenId)}>
            <Copy16Icon />
          </StyledIconButton>
        </ItemRightContainer>
      </ItemContainer>

      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.tokenType')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Typography variant="h5">{displayTokenStandard}</Typography>
        </ItemRightContainer>
      </ItemContainer>

      {tokenType === 'ERC1155' && gt(nftBalance || '0', '0') && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.balance')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <Typography variant="h5">{nftBalance}</Typography>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {nftMetaSourceURI && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.source')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(nftMetaSourceURI)}>
              <Typography variant="h5">{shorterSourceURL}</Typography>
            </URLButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {nftMeta?.externalLink && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.url')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(nftMeta.externalLink)}>
              <Typography variant="h5">{shorterExternalURL}</Typography>
            </URLButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {nftMeta?.description && (
        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.description')}</Typography>
          </ItemTitleContainer>
          <ItemValueContainer>{nftMeta.description}</ItemValueContainer>
        </ItemColumnContainer>
      )}

      {(nftMeta?.attributes || nftMeta?.traits) && (
        <AttributeContainer>
          <AttributeHeaderContainer>
            <Typography variant="h4">{t('pages.Wallet.NFTDetail.Entry.ethereum.components.NFTInfoItem.index.attributes')}</Typography>
          </AttributeHeaderContainer>
          {nftMeta.attributes?.map((item) => (
            <ItemContainer key={item.trait_type}>
              <ItemTitleContainer>
                <Typography variant="h5">{item.trait_type || ''}</Typography>
              </ItemTitleContainer>
              <ItemRightContainer>
                <Typography variant="h5">{item.value || ''}</Typography>
              </ItemRightContainer>
            </ItemContainer>
          ))}
          {nftMeta.traits?.map((item) => (
            <ItemContainer key={item.trait_type}>
              <ItemTitleContainer>
                <Typography variant="h5">{item.trait_type || ''}</Typography>
              </ItemTitleContainer>
              <ItemRightContainer>
                {httpsRegex.test(String(item.value)) ? (
                  <URLButton type="button" onClick={() => window.open(String(item.value))}>
                    <Typography variant="h5">{item.value || ''}</Typography>
                  </URLButton>
                ) : (
                  <Typography variant="h5">{item.value || ''}</Typography>
                )}
              </ItemRightContainer>
            </ItemContainer>
          ))}
        </AttributeContainer>
      )}
    </>
  );
}

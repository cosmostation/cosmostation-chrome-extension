import { useCallback, useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayCWTokenStandard } from '~/Popup/utils/cosmos';
import { httpsRegex } from '~/Popup/utils/regex';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

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
  chain: CosmosChain;
  nft: CosmosNFT;
};

export default function NFTInfoItem({ chain, nft }: NFTInfoItemProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { tokenType, address, tokenId, ownerAddress } = nft;

  const { data: nftMeta } = useNFTMetaSWR({ contractAddress: address, tokenId, chain });

  const shorterOwnerAddress = useMemo(() => shorterAddress(ownerAddress, 14), [ownerAddress]);
  const shorterContractAddress = useMemo(() => shorterAddress(address, 14), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 14), [tokenId]);

  const shorterSourceURL = useMemo(() => shorterAddress(nftMeta?.sourceURL || '', 20), [nftMeta?.sourceURL]);
  const shorterCollectionExternalURL = useMemo(() => shorterAddress(nftMeta?.collectionInfo?.external_url, 20), [nftMeta?.collectionInfo?.external_url]);

  const displayTokenStandard = useMemo(() => toDisplayCWTokenStandard(tokenType), [tokenType]);

  const handleOnClickCopy = useCallback(
    (copyString?: string) => {
      if (copyString && copy(copyString)) {
        enqueueSnackbar(t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.copied'));
      }
    },
    [enqueueSnackbar, t],
  );

  return (
    <>
      {shorterOwnerAddress && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.ownerAddress')}</Typography>
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
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.contractAddress')}</Typography>
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
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.tokenId')}</Typography>
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
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.tokenType')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Typography variant="h5">{displayTokenStandard}</Typography>
        </ItemRightContainer>
      </ItemContainer>

      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.source')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          {httpsRegex.test(nftMeta?.sourceURL || '') ? (
            <URLButton type="button" onClick={() => window.open(nftMeta?.sourceURL || '')}>
              <Typography variant="h5">{shorterSourceURL || '-'}</Typography>
            </URLButton>
          ) : (
            <>
              <Typography variant="h5">{shorterSourceURL || '-'}</Typography>

              <StyledIconButton onClick={() => handleOnClickCopy(nftMeta?.sourceURL || '')}>
                <Copy16Icon />
              </StyledIconButton>
            </>
          )}
        </ItemRightContainer>
      </ItemContainer>

      {nftMeta?.description && (
        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.description')}</Typography>
          </ItemTitleContainer>
          <ItemValueContainer>{nftMeta.description}</ItemValueContainer>
        </ItemColumnContainer>
      )}

      {nftMeta?.attributes && nftMeta.attributes.length > 1 && (
        <AttributeContainer>
          <AttributeHeaderContainer>
            <Typography variant="h4">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.attributes')}</Typography>
          </AttributeHeaderContainer>
          {nftMeta.attributes.map((item) => (
            <ItemContainer key={item.key}>
              <ItemTitleContainer>
                <Typography variant="h5">{item.key}</Typography>
              </ItemTitleContainer>
              <ItemRightContainer>
                <Tooltip title={JSON.stringify(item.value)} placement="top" arrow>
                  <Typography variant="h5">{JSON.stringify(item.value)}</Typography>
                </Tooltip>
              </ItemRightContainer>
            </ItemContainer>
          ))}
        </AttributeContainer>
      )}

      {(nftMeta?.collectionInfo || nftMeta?.contractInfo) && (
        <AttributeContainer>
          <AttributeHeaderContainer>
            <Typography variant="h4">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.collection')}</Typography>
          </AttributeHeaderContainer>
          {nftMeta.contractInfo && (
            <>
              <ItemContainer>
                <ItemTitleContainer>
                  <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.name')}</Typography>
                </ItemTitleContainer>
                <ItemRightContainer>
                  <Typography variant="h5">{nftMeta.contractInfo.name}</Typography>
                </ItemRightContainer>
              </ItemContainer>

              <ItemContainer>
                <ItemTitleContainer>
                  <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.symbol')}</Typography>
                </ItemTitleContainer>
                <ItemRightContainer>
                  <Typography variant="h5">{nftMeta.contractInfo.symbol}</Typography>
                </ItemRightContainer>
              </ItemContainer>
              {nftMeta.mintedNFTsCount?.count && (
                <ItemContainer>
                  <ItemTitleContainer>
                    <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.numberOfNFT')}</Typography>
                  </ItemTitleContainer>
                  <ItemRightContainer>
                    <Typography variant="h5">{nftMeta.mintedNFTsCount.count}</Typography>
                  </ItemRightContainer>
                </ItemContainer>
              )}
            </>
          )}
          {nftMeta?.collectionInfo && (
            <>
              <ItemColumnContainer>
                <ItemTitleContainer>
                  <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.description')}</Typography>
                </ItemTitleContainer>
                <ItemValueContainer>{nftMeta.collectionInfo.description}</ItemValueContainer>
              </ItemColumnContainer>
              {nftMeta.collectionInfo.external_url && (
                <ItemContainer>
                  <ItemTitleContainer>
                    <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.url')}</Typography>
                  </ItemTitleContainer>
                  <ItemRightContainer>
                    <URLButton type="button" onClick={() => window.open(nftMeta.collectionInfo?.external_url)}>
                      <Typography variant="h5">{shorterCollectionExternalURL}</Typography>
                    </URLButton>
                  </ItemRightContainer>
                </ItemContainer>
              )}
            </>
          )}
        </AttributeContainer>
      )}
    </>
  );
}

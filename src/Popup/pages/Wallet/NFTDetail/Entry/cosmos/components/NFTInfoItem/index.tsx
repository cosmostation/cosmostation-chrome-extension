import { useCallback, useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useCollectionInfoSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useCollectionInfoSWR';
import { useContractInfoSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useContractInfoSWR';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { useNFTURISWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTURISWR';
import { useNumTokensSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNumTokensSWR';
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

  const { data: nftMetaSourceURI } = useNFTURISWR({ contractAddress: address, tokenId, chain });

  const { data: nftMeta } = useNFTMetaSWR({ contractAddress: address, tokenId, chain });

  const { data: nftCollectionInfo } = useCollectionInfoSWR(chain, address);

  const { data: nftContractInfo } = useContractInfoSWR(chain, address);

  const { data: mintedNFTsCount } = useNumTokensSWR(chain, address);

  const shorterOwnerAddress = useMemo(() => shorterAddress(ownerAddress, 14), [ownerAddress]);
  const shorterContractAddress = useMemo(() => shorterAddress(address, 14), [address]);
  const shorterTokenId = useMemo(() => shorterAddress(tokenId, 14), [tokenId]);

  const shorterSourceURL = useMemo(() => shorterAddress(nftMetaSourceURI?.token_uri || '', 20), [nftMetaSourceURI]);
  const shorterCollectionExternalURL = useMemo(() => shorterAddress(nftCollectionInfo?.external_url, 20), [nftCollectionInfo]);

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
          {httpsRegex.test(nftMetaSourceURI?.token_uri || '') ? (
            <URLButton type="button" onClick={() => window.open(nftMetaSourceURI?.token_uri || '')}>
              <Typography variant="h5">{shorterSourceURL || '-'}</Typography>
            </URLButton>
          ) : (
            <>
              <Typography variant="h5">{shorterSourceURL || '-'}</Typography>

              <StyledIconButton onClick={() => handleOnClickCopy(shorterSourceURL)}>
                <Copy16Icon />
              </StyledIconButton>
            </>
          )}
        </ItemRightContainer>
      </ItemContainer>

      {nftMeta?.metaData?.description && (
        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.description')}</Typography>
          </ItemTitleContainer>
          <ItemValueContainer>{nftMeta.metaData.description}</ItemValueContainer>
        </ItemColumnContainer>
      )}

      {nftMeta?.metaData?.attributes && (
        <AttributeContainer>
          <AttributeHeaderContainer>
            <Typography variant="h4">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.attributes')}</Typography>
          </AttributeHeaderContainer>
          {nftMeta.metaData.attributes.map((item) => (
            <ItemContainer key={item.trait_type}>
              <ItemTitleContainer>
                <Typography variant="h5">{item.trait_type || ''}</Typography>
              </ItemTitleContainer>
              <ItemRightContainer>
                <Typography variant="h5">{item.value || ''}</Typography>
              </ItemRightContainer>
            </ItemContainer>
          ))}
        </AttributeContainer>
      )}

      {(nftCollectionInfo || nftContractInfo) && (
        <AttributeContainer>
          <AttributeHeaderContainer>
            <Typography variant="h4">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.collection')}</Typography>
          </AttributeHeaderContainer>
          {nftContractInfo && (
            <>
              <ItemContainer>
                <ItemTitleContainer>
                  <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.name')}</Typography>
                </ItemTitleContainer>
                <ItemRightContainer>
                  <Typography variant="h5">{nftContractInfo.name}</Typography>
                </ItemRightContainer>
              </ItemContainer>

              <ItemContainer>
                <ItemTitleContainer>
                  <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.symbol')}</Typography>
                </ItemTitleContainer>
                <ItemRightContainer>
                  <Typography variant="h5">{nftContractInfo.symbol}</Typography>
                </ItemRightContainer>
              </ItemContainer>
              {mintedNFTsCount?.count && (
                <ItemContainer>
                  <ItemTitleContainer>
                    <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.numberOfNFT')}</Typography>
                  </ItemTitleContainer>
                  <ItemRightContainer>
                    <Typography variant="h5">{mintedNFTsCount.count}</Typography>
                  </ItemRightContainer>
                </ItemContainer>
              )}
            </>
          )}
          {nftCollectionInfo && (
            <>
              <ItemColumnContainer>
                <ItemTitleContainer>
                  <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.description')}</Typography>
                </ItemTitleContainer>
                <ItemValueContainer>{nftCollectionInfo.description}</ItemValueContainer>
              </ItemColumnContainer>
              {nftCollectionInfo.external_url && (
                <ItemContainer>
                  <ItemTitleContainer>
                    <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.cosmos.components.NFTInfoItem.index.url')}</Typography>
                  </ItemTitleContainer>
                  <ItemRightContainer>
                    <URLButton type="button" onClick={() => window.open(nftCollectionInfo.external_url)}>
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

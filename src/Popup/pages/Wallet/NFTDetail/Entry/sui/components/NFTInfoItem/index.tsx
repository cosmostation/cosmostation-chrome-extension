import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { SuiNFTMeta } from '~/types/nft/nftMeta';

import { ItemColumnContainer, ItemContainer, ItemRightContainer, ItemTitleContainer, ItemValueContainer, StyledIconButton, URLButton } from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';

type NFTInfoItemProps = {
  nftMeta: SuiNFTMeta;
};

export default function NFTInfoItem({ nftMeta }: NFTInfoItemProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { description, creator, link, projectUrl, objectId, ownerAddress } = nftMeta;

  const shorterOwnerAddress = useMemo(() => shorterAddress(ownerAddress, 14), [ownerAddress]);
  const shorterObjectId = useMemo(() => shorterAddress(objectId, 14), [objectId]);
  const shorterCreatorAddress = useMemo(() => shorterAddress(creator, 14), [creator]);

  const shorterLink = useMemo(() => shorterAddress(link, 20), [link]);
  const shorterProjectUrl = useMemo(() => shorterAddress(projectUrl, 20), [projectUrl]);

  const handleOnClickCopy = (copyString?: string) => {
    if (copyString && copy(copyString)) {
      enqueueSnackbar(t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.copied'));
    }
  };

  return (
    <>
      {shorterOwnerAddress && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5" lineHeight="1.3rem">
              {t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.ownerAddress')}
            </Typography>
          </ItemTitleContainer>

          <ItemRightContainer>
            <Tooltip title={ownerAddress || ''} placement="top" arrow>
              <Typography variant="h5" lineHeight="1.3rem">
                {shorterOwnerAddress}
              </Typography>
            </Tooltip>

            <StyledIconButton onClick={() => handleOnClickCopy(ownerAddress)}>
              <Copy16Icon />
            </StyledIconButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5" lineHeight="1.3rem">
            {t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.objectId')}
          </Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Tooltip title={objectId || ''} placement="top" arrow>
            <Typography variant="h5" lineHeight="1.3rem">
              {shorterObjectId}
            </Typography>
          </Tooltip>

          <StyledIconButton onClick={() => handleOnClickCopy(objectId)}>
            <Copy16Icon />
          </StyledIconButton>
        </ItemRightContainer>
      </ItemContainer>

      {shorterCreatorAddress && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5" lineHeight="1.3rem">
              {t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.creator')}
            </Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <Tooltip title={creator || ''} placement="top" arrow>
              <Typography variant="h5" lineHeight="1.3rem">
                {shorterCreatorAddress}
              </Typography>
            </Tooltip>

            <StyledIconButton onClick={() => handleOnClickCopy(creator)}>
              <Copy16Icon />
            </StyledIconButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {link && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5" lineHeight="1.3rem">
              {t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.url')}
            </Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(link)}>
              <Typography variant="h5" lineHeight="1.3rem">
                {shorterLink}
              </Typography>
            </URLButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {projectUrl && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5" lineHeight="1.3rem">
              {t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.url')}
            </Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(projectUrl)}>
              <Typography variant="h5" lineHeight="1.3rem">
                {shorterProjectUrl}
              </Typography>
            </URLButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {description && (
        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5" lineHeight="1.3rem">
              {t('pages.Wallet.NFTDetail.Entry.sui.components.NFTInfoItem.index.description')}
            </Typography>
          </ItemTitleContainer>
          <ItemValueContainer>{description}</ItemValueContainer>
        </ItemColumnContainer>
      )}
    </>
  );
}

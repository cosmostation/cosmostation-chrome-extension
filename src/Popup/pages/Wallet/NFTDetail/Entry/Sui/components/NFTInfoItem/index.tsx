import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';

import { ItemColumnContainer, ItemContainer, ItemRightContainer, ItemTitleContainer, ItemValueContainer, StyledIconButton, URLButton } from './styled';

import Copy16Icon from '~/images/icons/Copy16.svg';
import Explorer16Icon from '~/images/icons/Explorer16.svg';

type NFTMetaType = {
  name?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  projectUrl?: string;
  creator?: string;
  objectId?: string;
  ownerAddress?: string;
  objectFieldData?: Record<string, unknown>;
};

type NFTInfoItemProps = {
  nftMeta: NFTMetaType;
};

export default function NFTInfoItem({ nftMeta }: NFTInfoItemProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { description, creator, link, projectUrl, objectId, ownerAddress } = nftMeta;

  const shorterCurrentAddress = useMemo(() => shorterAddress(ownerAddress, 14), [ownerAddress]);
  const shorterObjectId = useMemo(() => shorterAddress(objectId, 14), [objectId]);

  const handleOnClickCopy = (copyString?: string) => {
    if (copyString && copy(copyString)) {
      enqueueSnackbar(t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.copied'));
    }
  };

  return (
    <>
      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.ownerAddress')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Typography variant="h5">{shorterCurrentAddress}</Typography>

          <StyledIconButton onClick={() => handleOnClickCopy(ownerAddress)}>
            <Copy16Icon />
          </StyledIconButton>
        </ItemRightContainer>
      </ItemContainer>

      <ItemContainer>
        <ItemTitleContainer>
          <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.objectId')}</Typography>
        </ItemTitleContainer>
        <ItemRightContainer>
          <Typography variant="h5">{shorterObjectId}</Typography>

          <StyledIconButton onClick={() => handleOnClickCopy(objectId)}>
            <Copy16Icon />
          </StyledIconButton>
        </ItemRightContainer>
      </ItemContainer>

      {creator && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.creator')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <Typography variant="h5">{shorterAddress(creator)}</Typography>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {link && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.link')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <Typography variant="h5">{link}</Typography>

            <StyledIconButton onClick={() => window.open(link)}>
              <Explorer16Icon />
            </StyledIconButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {projectUrl && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.projectUrl')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(projectUrl)}>
              <Typography variant="h5">{projectUrl}</Typography>
            </URLButton>
            {/* NOTE Choose url button style
            <Typography variant="h5">{projectUrl}</Typography>

            <StyledIconButton onClick={() => window.open(projectUrl)}>
              <Explorer16Icon />
            </StyledIconButton>  */}
          </ItemRightContainer>
        </ItemContainer>
      )}

      {description && (
        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.description')}</Typography>
          </ItemTitleContainer>
          <ItemValueContainer>
            <Typography variant="h5">{description}</Typography>
          </ItemValueContainer>
        </ItemColumnContainer>
      )}
    </>
  );
}

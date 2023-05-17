import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { SuiNFTMetaType } from '~/types/nft/nftMeta';

import {
  // AttributeContainer,
  // AttributeHeaderContainer,
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
  nftMeta: SuiNFTMetaType;
};

export default function NFTInfoItem({ nftMeta }: NFTInfoItemProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { description, creator, link, projectUrl, objectId, ownerAddress } = nftMeta;

  const shorterOwnerAddress = useMemo(() => shorterAddress(ownerAddress, 14), [ownerAddress]);
  const shorterObjectId = useMemo(() => shorterAddress(objectId, 14), [objectId]);

  const shorterLink = useMemo(() => shorterAddress(link, 20), [link]);
  const shorterProjectUrl = useMemo(() => shorterAddress(projectUrl, 20), [projectUrl]);

  const handleOnClickCopy = (copyString?: string) => {
    if (copyString && copy(copyString)) {
      enqueueSnackbar(t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.copied'));
    }
  };

  // const objectFieldKeys = useMemo(() => (objectFieldData ? Object.keys(objectFieldData) : []), [objectFieldData]);

  return (
    <>
      {shorterOwnerAddress && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.ownerAddress')}</Typography>
          </ItemTitleContainer>

          <ItemRightContainer>
            <Typography variant="h5">{shorterOwnerAddress}</Typography>

            <StyledIconButton onClick={() => handleOnClickCopy(ownerAddress)}>
              <Copy16Icon />
            </StyledIconButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

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
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.url')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(link)}>
              <Typography variant="h5">{shorterLink}</Typography>
            </URLButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {projectUrl && (
        <ItemContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.url')}</Typography>
          </ItemTitleContainer>
          <ItemRightContainer>
            <URLButton type="button" onClick={() => window.open(projectUrl)}>
              <Typography variant="h5">{shorterProjectUrl}</Typography>
            </URLButton>
          </ItemRightContainer>
        </ItemContainer>
      )}

      {description && (
        <ItemColumnContainer>
          <ItemTitleContainer>
            <Typography variant="h5">{t('pages.Wallet.NFTDetail.Entry.Sui.components.NFTInfoItem.index.description')}</Typography>
          </ItemTitleContainer>
          <ItemValueContainer>{description}</ItemValueContainer>
        </ItemColumnContainer>
      )}
      {/* 
      {objectFieldKeys && objectFieldData && (
        <AttributeContainer>
          <AttributeHeaderContainer>
            <Typography variant="h4">Attributes</Typography>
          </AttributeHeaderContainer>

          {objectFieldKeys.map((item) => (
            <ItemContainer key={item}>
              <ItemTitleContainer>
                <Typography variant="h5">{item}</Typography>
              </ItemTitleContainer>
              <ItemRightContainer>
                <Typography variant="h5">1</Typography>
              </ItemRightContainer>
            </ItemContainer>
          ))}
        </AttributeContainer>
      )} */}
    </>
  );
}

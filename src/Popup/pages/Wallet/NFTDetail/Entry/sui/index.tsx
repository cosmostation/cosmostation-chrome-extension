import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { convertIpfs } from '~/Popup/utils/nft';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import { getNFTMeta } from '~/Popup/utils/sui';
import type { Path } from '~/types/route';

import NFTInfoItem from './components/NFTInfoItem';
import {
  BottomContainer,
  Container,
  ContentContainer,
  NFTEditionMarkContainer,
  NFTImageContainer,
  NFTInfoBodyContainer,
  NFTInfoContainer,
  NFTInfoHeaderContainer,
  NFTInfoHeaderTextContainer,
  NFTInfoLeftHeaderContainer,
  StyledIconButton,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';

export default function Sui() {
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { explorerURL } = currentSuiNetwork;

  const params = useParams();

  const { nftObjects } = useNFTObjectsSWR({});

  const currentNFTObject = useMemo(() => nftObjects.find((item) => isEqualsIgnoringCase(item.data?.objectId, params.id)), [nftObjects, params]);

  const nftMeta = useMemo(() => getNFTMeta(currentNFTObject), [currentNFTObject]);

  const { name, imageURL, objectId, rarity } = nftMeta;

  const errorMessage = useMemo(() => {
    if (!(currentNFTObject?.data?.content?.dataType === 'moveObject' && currentNFTObject?.data?.content.hasPublicTransfer)) {
      return t('pages.Wallet.NFTDetail.Entry.sui.index.untransferableObject');
    }

    return '';

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNFTObject?.data?.content?.dataType, t]);

  return (
    <>
      <Container>
        <ContentContainer>
          <NFTImageContainer>
            <Image src={convertIpfs(imageURL)} defaultImgSrc={unknownNFTImg} />
          </NFTImageContainer>
          <NFTInfoContainer>
            <NFTInfoHeaderContainer>
              <NFTInfoLeftHeaderContainer>
                <NFTInfoHeaderTextContainer>
                  <Tooltip title={name || objectId || ''} placement="top" arrow>
                    <Typography variant="h3">{name || objectId || ''}</Typography>
                  </Tooltip>
                </NFTInfoHeaderTextContainer>

                {rarity && (
                  <NFTEditionMarkContainer>
                    <Typography variant="h6">{rarity}</Typography>
                  </NFTEditionMarkContainer>
                )}
              </NFTInfoLeftHeaderContainer>

              <StyledIconButton onClick={() => window.open(`${explorerURL || ''}/object/${objectId || ''}`)}>
                <ExplorerIcon />
              </StyledIconButton>
            </NFTInfoHeaderContainer>

            <NFTInfoBodyContainer>
              <NFTInfoItem nftMeta={nftMeta} />
            </NFTInfoBodyContainer>
          </NFTInfoContainer>
        </ContentContainer>
        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button type="button" disabled={!!errorMessage} onClick={() => navigate(`/wallet/nft-send/${objectId || ''}` as unknown as Path)}>
                {t('pages.Wallet.NFTDetail.Entry.sui.index.send')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      );
    </>
  );
}

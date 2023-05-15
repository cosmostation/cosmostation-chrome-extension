import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { getObjectDisplay, getObjectOwner } from '@mysten/sui.js';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import NFTImage from '~/Popup/components/common/NFTImage';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

import NFTInfoItem from './components/NFTInfoItem';
import {
  BottomContainer,
  Container,
  ContentContainer,
  NFTImageContainer,
  NFTInfoBodyContainer,
  NFTInfoContainer,
  NFTInfoHeaderContainer,
  NFTInfoHeaderTextContainer,
  StyledIconButton,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';

export default function Sui() {
  const { t } = useTranslation();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { explorerURL, networkName } = currentSuiNetwork;

  const params = useParams();

  const { nftObjects } = useNFTObjectsSWR({});

  const filteredNFTObject = useMemo(() => nftObjects.find((item) => isEqualsIgnoringCase(item.data?.objectId, params.id)), [nftObjects, params]);

  const nftMeta = useMemo(() => {
    if (filteredNFTObject?.data && filteredNFTObject.data?.content?.dataType === 'moveObject') {
      const { name, description, creator, image_url, link, project_url } = getObjectDisplay(filteredNFTObject).data || {};

      const objectOwner = getObjectOwner(filteredNFTObject);
      return {
        name: name || '',
        description: description || '',
        imageUrl: image_url || '',
        link: link || '',
        projectUrl: project_url || '',
        creator: creator || '',
        objectId: filteredNFTObject.data.objectId || '',
        ownerAddress:
          objectOwner && objectOwner !== 'Immutable' && 'AddressOwner' in objectOwner
            ? objectOwner.AddressOwner
            : objectOwner && objectOwner !== 'Immutable' && 'ObjectOwner' in objectOwner
            ? objectOwner.ObjectOwner
            : '',
        objectFieldData: { ...filteredNFTObject.data?.content.fields },
      };
    }
    return {};
  }, [filteredNFTObject]);

  const { name, imageUrl, objectId } = nftMeta;

  const errorMessage = useMemo(() => {
    if (!(filteredNFTObject?.data?.content?.dataType === 'moveObject' && filteredNFTObject?.data?.content.hasPublicTransfer)) {
      return t('pages.Wallet.NFTDetail.Entry.Sui.index.untransferableObject');
    }

    return '';

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNFTObject?.data?.content?.dataType, t]);

  return (
    <>
      <Container>
        <ContentContainer>
          <NFTImageContainer> {imageUrl ? <NFTImage src={imageUrl} /> : <NFTImage src={unknownNFTImg} />}</NFTImageContainer>
          <NFTInfoContainer>
            <NFTInfoHeaderContainer>
              <NFTInfoHeaderTextContainer>
                <Typography variant="h3">{name || objectId}</Typography>
              </NFTInfoHeaderTextContainer>

              <StyledIconButton onClick={() => window.open(`${explorerURL || ''}/object/${objectId || ''}?network=${networkName.toLowerCase()}`)}>
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
              <Button
                type="button"
                disabled={!!errorMessage}
                // onClick={async () => {
                //   if (swapAminoTx) {
                //     await enQueue({
                //       messageId: '',
                //       origin: '',
                //       channel: 'inApp',
                //       message: {
                //         method: 'cos_signAmino',
                //         params: {
                //           chainName: chain.chainName,
                //           doc: { ...swapAminoTx, fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: currentCeilFeeAmount }], gas: currentGas } },
                //         },
                //       },
                //     });
                //   }
                // }}
              >
                {t('pages.Wallet.NFTDetail.Entry.Sui.index.send')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      );
    </>
  );
}

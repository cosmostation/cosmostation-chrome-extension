import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { getObjectDisplay } from '@mysten/sui.js';

import { SUI } from '~/constants/chain/sui/sui';
import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
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

  const chain = SUI;
  const { explorerURL, networkName } = currentSuiNetwork;
  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const params = useParams();

  const { nftObjects } = useNFTObjectsSWR({});

  const filteredNFTObject = useMemo(() => nftObjects.find((item) => isEqualsIgnoringCase(item.data?.objectId, params.id)), [nftObjects, params]);

  const nftMeta = useMemo(() => {
    if (filteredNFTObject?.data && filteredNFTObject.data?.content?.dataType === 'moveObject') {
      const { name, description, creator, image_url, link, project_url } = getObjectDisplay(filteredNFTObject).data || {};

      return {
        name: name || '',
        description: description || '',
        imageUrl: image_url || '',
        link: link || '',
        projectUrl: project_url || '',
        creator: creator || '',
        objectId: filteredNFTObject.data.objectId || '',
        ownerAddress: currentAddress,
        objectFieldData: { ...filteredNFTObject.data?.content.fields },
      };
    }
    return {};
  }, [currentAddress, filteredNFTObject]);

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
          <NFTImageContainer> {imageUrl ? <Image src={imageUrl} /> : <Image src={unknownNFTImg} />}</NFTImageContainer>
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

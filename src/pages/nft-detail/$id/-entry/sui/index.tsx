import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import Tooltip from '@/components/common/Tooltip';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';
import { useCurrentAccountAddresses } from '@/hooks/useCurrentAccountAddresses';
import { Route as NFTSend } from '@/pages/wallet/nft-send/$id';
import { shorterAddress } from '@/utils/string';

import {
  ChainContainer,
  ChainImage,
  ContentsContainer,
  DescriptionContainer,
  DetailContainer,
  DetailRowContainer,
  Divider,
  NFTImage,
  NFTImageContainer,
  NFTNameContainer,
  RedirectIconContainer,
  StickyFooterInnerBody,
  TopContainer,
  TopFirstContainer,
} from './styled';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

type SuiProps = {
  id: string;
};

export default function Sui({ id }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chainList } = useChainList();

  const { data: currentAccountAddresses } = useCurrentAccountAddresses();
  const { currentAccountAddNFTsWithMeta } = useCurrentAccountAddedNFTsWithMetaData();

  const selectedNFT = currentAccountAddNFTsWithMeta.sui.find((nft) => nft.id === id);

  const nftImage = selectedNFT?.image;
  const nftName = selectedNFT?.name;
  const nftDescription = '-';

  const nftObjectId = selectedNFT?.objectId;
  const shorterNFTObjectId = shorterAddress(nftObjectId, 14);

  const formattedNFTName = nftName || shorterNFTObjectId;

  const ownerAddress = currentAccountAddresses?.find(
    (address) => address.chainId === selectedNFT?.chainId && address.chainType === selectedNFT.chainType,
  )?.address;
  const shorterOwnerAddress = shorterAddress(ownerAddress, 14);

  const chain = chainList.suiChains?.find((chain) => chain.id === selectedNFT?.chainId && chain.chainType === selectedNFT.chainType);

  const errorMessage = (() => {
    if (!(selectedNFT?.originObject?.data?.content?.dataType === 'moveObject' && selectedNFT?.originObject?.data?.content.hasPublicTransfer)) {
      return t('pages.nft-detail.$id.entry.sui.index.untransferableObject');
    }

    return '';
  })();

  return (
    <>
      <BaseBody>
        <ContentsContainer>
          <NFTImageContainer>
            <NFTImage src={nftImage} />
          </NFTImageContainer>
          <TopContainer>
            <TopFirstContainer>
              <NFTNameContainer>
                <Base1300Text variant="h2_B">{formattedNFTName}</Base1300Text>
              </NFTNameContainer>
              <IconButton
                onClick={() => {
                  window.open(`${chain?.explorer?.url || ''}/object/${selectedNFT?.objectId || ''}`, '_blank');
                }}
              >
                <RedirectIconContainer>
                  <ExplorerIcon />
                </RedirectIconContainer>
              </IconButton>
            </TopFirstContainer>
            <DescriptionContainer>
              <Base1000Text variant="b3_R_Multiline">{nftDescription}</Base1000Text>
            </DescriptionContainer>
          </TopContainer>

          <Divider />

          <DetailContainer
            sx={{
              margin: '1.2rem 0',
            }}
          >
            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.sui.index.network')}</Base1000Text>
              <ChainContainer>
                <ChainImage src={chain?.image} />
                <Base1300Text variant="b3_M">{chain?.name}</Base1300Text>
              </ChainContainer>
            </DetailRowContainer>
            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.sui.index.owner')}</Base1000Text>

              <Base1300Text variant="b3_M">{shorterOwnerAddress}</Base1300Text>
            </DetailRowContainer>
            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.sui.index.objectId')}</Base1000Text>
              <Tooltip title={nftObjectId} placement="top">
                <div>
                  <Base1300Text variant="b3_M">{shorterNFTObjectId}</Base1300Text>
                </div>
              </Tooltip>
            </DetailRowContainer>
          </DetailContainer>
        </ContentsContainer>
      </BaseBody>
      <StickyFooterInnerBody>
        <Tooltip title={errorMessage} varient="error" placement="top">
          <div>
            <Button
              onClick={() => {
                navigate({
                  to: NFTSend.to,
                  params: {
                    id,
                  },
                });
              }}
              disabled={!!errorMessage}
            >
              {t('pages.nft-detail.$id.entry.sui.index.nftSend')}
            </Button>
          </div>
        </Tooltip>
      </StickyFooterInnerBody>
    </>
  );
}

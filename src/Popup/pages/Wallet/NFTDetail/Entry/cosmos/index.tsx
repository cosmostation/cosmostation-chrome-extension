import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import unreadableNFTImg from '~/images/etc/unreadableNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import InformContainer from '~/Popup/components/common/InformContainer';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTMetaSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTMetaSWR';
import { useNFTOwnerSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTOwnerSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Path } from '~/types/route';

import NFTInfoItem from './components/NFTInfoItem';
import {
  BottomContainer,
  Container,
  ContentContainer,
  NFTContainer,
  NFTImageContainer,
  NFTInfoBodyContainer,
  NFTInfoContainer,
  NFTInfoHeaderContainer,
  NFTInfoHeaderTextContainer,
  NFTInfoLeftHeaderContainer,
  StyledIconButton,
} from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { explorerURL } = chain;

  const params = useParams();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { currentCosmosNFTs } = useCurrentCosmosNFTs();

  const currentNFT = useMemo(() => currentCosmosNFTs.find((item) => isEqualsIgnoringCase(item.id, params.id)) || null, [currentCosmosNFTs, params.id]);

  const { data: nftMeta } = useNFTMetaSWR({ contractAddress: currentNFT?.address || '', tokenId: currentNFT?.tokenId || '', chain });

  const isOwnedNFT = useNFTOwnerSWR({ contractAddress: currentNFT?.address || '', ownerAddress: currentAddress, tokenId: currentNFT?.tokenId || '', chain });

  const errorMessage = useMemo(() => {
    if (isOwnedNFT.error) {
      return t('pages.Wallet.NFTDetail.Entry.cosmos.index.networkError');
    }
    if (!isOwnedNFT.isOwnedNFT) {
      return t('pages.Wallet.NFTDetail.Entry.cosmos.index.notOwnedNFT');
    }

    return '';
  }, [isOwnedNFT.error, isOwnedNFT.isOwnedNFT, t]);

  return (
    <Container>
      <ContentContainer>
        <NFTContainer>
          <NFTImageContainer>
            {nftMeta?.imageURL ? <Image src={nftMeta?.imageURL} defaultImgSrc={unknownNFTImg} /> : <Image src={unreadableNFTImg} />}
          </NFTImageContainer>
          <NFTInfoContainer>
            <NFTInfoHeaderContainer>
              <NFTInfoLeftHeaderContainer>
                <NFTInfoHeaderTextContainer>
                  <Tooltip title={nftMeta?.name || ''} placement="top" arrow>
                    <Typography variant="h3">{nftMeta?.name}</Typography>
                  </Tooltip>
                </NFTInfoHeaderTextContainer>
              </NFTInfoLeftHeaderContainer>
              <StyledIconButton onClick={() => window.open(`${explorerURL || ''}/wasm/contract/${currentNFT?.address || ''}`)}>
                <ExplorerIcon />
              </StyledIconButton>
            </NFTInfoHeaderContainer>
            {currentNFT && (
              <NFTInfoBodyContainer>
                <NFTInfoItem nft={currentNFT} chain={chain} />
              </NFTInfoBodyContainer>
            )}
          </NFTInfoContainer>
        </NFTContainer>

        <InformContainer varient="info">
          <Typography variant="h6">{t('pages.Wallet.NFTDetail.Entry.cosmos.index.information')}</Typography>
        </InformContainer>
      </ContentContainer>

      <BottomContainer>
        <Tooltip varient="error" title={errorMessage} placement="top" arrow>
          <div>
            <Button type="button" disabled={!!errorMessage} onClick={() => navigate(`/wallet/nft-send/${currentNFT?.id || ''}` as unknown as Path)}>
              {t('pages.Wallet.NFTDetail.Entry.cosmos.index.send')}
            </Button>
          </div>
        </Tooltip>
      </BottomContainer>
    </Container>
  );
}

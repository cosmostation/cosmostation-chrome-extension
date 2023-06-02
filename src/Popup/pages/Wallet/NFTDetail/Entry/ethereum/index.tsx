import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import unknownNFTImg from '~/images/etc/unknownNFT.png';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetNFTOwnerSWR } from '~/Popup/hooks/SWR/ethereum/NFT/useGetNFTOwnerSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumChain } from '~/types/chain';
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

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { explorerURL } = currentEthereumNetwork;

  const params = useParams();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { currentEthereumNFTs } = useCurrentEthereumNFTs();

  const currentNFTObject = useMemo(
    () => currentEthereumNFTs.find((item) => isEqualsIgnoringCase(item.id, params.id)) || null,
    [currentEthereumNFTs, params.id],
  );

  const { name, imageURL, rarity, address, id, tokenId } = currentNFTObject || {};

  const { data: isOwnedNFT } = useGetNFTOwnerSWR({ contractAddress: address, ownerAddress: currentAddress, tokenId }, { suspense: true });

  const errorMessage = useMemo(() => {
    if (!isOwnedNFT) {
      return t('pages.Wallet.NFTDetail.Entry.ethereum.index.notOwnedNFT');
    }
    if (!name) {
      return t('pages.Wallet.NFTDetail.Entry.ethereum.index.untransferableObject');
    }

    return '';
  }, [isOwnedNFT, name, t]);

  return (
    <>
      <Container>
        <ContentContainer>
          <NFTImageContainer>
            <Image src={imageURL} defaultImgSrc={unknownNFTImg} />
          </NFTImageContainer>
          <NFTInfoContainer>
            <NFTInfoHeaderContainer>
              <NFTInfoLeftHeaderContainer>
                <NFTInfoHeaderTextContainer>
                  <Tooltip title={name || ''} placement="top" arrow>
                    <Typography variant="h3">{name || ''}</Typography>
                  </Tooltip>
                </NFTInfoHeaderTextContainer>

                {rarity && (
                  <NFTEditionMarkContainer>
                    <Typography variant="h6">{rarity}</Typography>
                  </NFTEditionMarkContainer>
                )}
              </NFTInfoLeftHeaderContainer>
              <StyledIconButton onClick={() => window.open(`${explorerURL || ''}/token/${address || ''}?a=${currentAddress}`)}>
                <ExplorerIcon />
              </StyledIconButton>
            </NFTInfoHeaderContainer>
            {currentNFTObject && (
              <NFTInfoBodyContainer>
                <NFTInfoItem nftMeta={currentNFTObject} />
              </NFTInfoBodyContainer>
            )}
          </NFTInfoContainer>
        </ContentContainer>
        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button type="button" disabled={!!errorMessage} onClick={() => navigate(`/wallet/nft-send/${id || ''}` as unknown as Path)}>
                {t('pages.Wallet.NFTDetail.Entry.ethereum.index.send')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      );
    </>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gt } from 'lodash';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import Tooltip from '@/components/common/Tooltip';
import { useGetNFTBalance } from '@/hooks/evm/nft/useGetNFTBalance';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';
import { Route as NFTSend } from '@/pages/wallet/nft-send/$id';
import { toDisplayTokenId, toDisplayTokenStandard } from '@/utils/nft';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import {
  AttributesContainer,
  ChainContainer,
  ChainImage,
  ContentsContainer,
  DescriptionContainer,
  DetailContainer,
  DetailRowContainer,
  DetailRowLabelContainer,
  Divider,
  ItemLeftContainer,
  NFTImage,
  NFTImageContainer,
  NFTNameContainer,
  RedirectIconContainer,
  StickyFooterInnerBody,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
  TopContainer,
  TopFirstContainer,
} from './styled';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

type EVMProps = {
  id: string;
};

export default function EVM({ id }: EVMProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chainList } = useChainList();

  const { currentAccountAddNFTsWithMeta } = useCurrentAccountAddedNFTsWithMetaData();

  const selectedNFT = currentAccountAddNFTsWithMeta.evm.find((nft) => nft.id === id);

  const { data: currentNFTBalance } = useGetNFTBalance({
    chainId: selectedNFT && getUniqueChainIdWithManual(selectedNFT.chainId, selectedNFT.chainType),
    contractAddress: selectedNFT?.contractAddress,
    tokenId: selectedNFT?.tokenId,
    ownerAddress: selectedNFT?.ownerAddress,
    tokenStandard: selectedNFT?.tokenType,
  });

  const nftImage = selectedNFT?.image;
  const nftName = selectedNFT?.name;
  const nftDescription = selectedNFT?.metaData?.description || '-';

  const nftContractAddress = selectedNFT?.contractAddress;
  const shorterNFTContractAddress = shorterAddress(nftContractAddress, 14);
  const nftTokenId = selectedNFT?.tokenId;

  const formattedNFTName = nftName || toDisplayTokenId(nftTokenId);

  const tokenType = selectedNFT?.tokenType;
  const displayTokenType = toDisplayTokenStandard(tokenType);

  const ownerAddress = selectedNFT?.ownerAddress;
  const shorterOwnerAddress = shorterAddress(ownerAddress, 14);

  const chain = chainList.evmChains?.find((chain) => chain.id === selectedNFT?.chainId && chain.chainType === selectedNFT.chainType);

  const errorMessage = useMemo(() => {
    if (!selectedNFT?.isOwned) {
      return t('pages.nft-detail.$id.entry.evm.index.notOwnedNFT');
    }

    return '';
  }, [selectedNFT, t]);
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
                  window.open(`${chain?.explorer?.url || ''}/token/${nftContractAddress}?a=${ownerAddress}`, '_blank');
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
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.evm.index.network')}</Base1000Text>
              <ChainContainer>
                <ChainImage src={chain?.image} />
                <Base1300Text variant="b3_M">{chain?.name}</Base1300Text>
              </ChainContainer>
            </DetailRowContainer>
            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.evm.index.owner')}</Base1000Text>

              <Base1300Text variant="b3_M">{shorterOwnerAddress}</Base1300Text>
            </DetailRowContainer>
            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.evm.index.contractAddress')}</Base1000Text>
              <Tooltip title={nftContractAddress} placement="top">
                <div>
                  <Base1300Text variant="b3_M">{shorterNFTContractAddress}</Base1300Text>
                </div>
              </Tooltip>
            </DetailRowContainer>

            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.evm.index.tokenId')}</Base1000Text>
              <Tooltip title={nftTokenId} placement="top">
                <div>
                  <Base1300Text variant="b3_M">{nftTokenId}</Base1300Text>
                </div>
              </Tooltip>
            </DetailRowContainer>

            <DetailRowContainer>
              <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.evm.index.tokenStandard')}</Base1000Text>
              <Base1300Text variant="b3_M">{displayTokenType}</Base1300Text>
            </DetailRowContainer>

            {tokenType === 'ERC1155' && (
              <DetailRowContainer>
                <Base1000Text variant="b3_R">{t('pages.nft-detail.$id.entry.evm.index.balance')}</Base1000Text>
                <Base1300Text variant="b3_M">{gt(currentNFTBalance, '0') ? currentNFTBalance || '-' : '-'}</Base1300Text>
              </DetailRowContainer>
            )}
          </DetailContainer>

          {(selectedNFT?.metaData?.attributes && selectedNFT.metaData.attributes.length > 1) ||
            (selectedNFT?.metaData?.traits && selectedNFT.metaData.traits.length > 1 && (
              <AttributesContainer>
                <StyledAccordion>
                  <StyledAccordionSummary aria-controls={'advanced-option-aria-control'} id={'advanced-option-id'}>
                    <ItemLeftContainer>
                      <Base1300Text variant="h3_B">{t('pages.nft-detail.$id.entry.evm.index.attributes')}</Base1300Text>
                    </ItemLeftContainer>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    <DetailContainer>
                      {selectedNFT.metaData.attributes?.map((item) => {
                        return (
                          <DetailRowContainer key={item.trait_type}>
                            <DetailRowLabelContainer>
                              <Base1000Text variant="b3_R">{item.trait_type}</Base1000Text>
                            </DetailRowLabelContainer>

                            <Tooltip title={JSON.stringify(item.value)} placement="top" arrow>
                              <div>
                                <DetailRowLabelContainer>
                                  <Base1300Text variant="b3_M">{JSON.stringify(item.value)}</Base1300Text>
                                </DetailRowLabelContainer>
                              </div>
                            </Tooltip>
                          </DetailRowContainer>
                        );
                      })}
                      {selectedNFT.metaData.traits?.map((item) => {
                        return (
                          <DetailRowContainer key={item.trait_type}>
                            <DetailRowLabelContainer>
                              <Base1000Text variant="b3_R">{item.trait_type}</Base1000Text>
                            </DetailRowLabelContainer>

                            <Tooltip title={JSON.stringify(item.value)} placement="top" arrow>
                              <div>
                                <DetailRowLabelContainer>
                                  <Base1300Text variant="b3_M">{JSON.stringify(item.value)}</Base1300Text>
                                </DetailRowLabelContainer>
                              </div>
                            </Tooltip>
                          </DetailRowContainer>
                        );
                      })}
                    </DetailContainer>
                  </StyledAccordionDetails>
                </StyledAccordion>
              </AttributesContainer>
            ))}
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
              {t('pages.nft-detail.$id.entry.evm.index.nftSend')}
            </Button>
          </div>
        </Tooltip>
      </StickyFooterInnerBody>
    </>
  );
}

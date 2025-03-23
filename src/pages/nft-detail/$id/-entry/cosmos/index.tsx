import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import Tooltip from '@/components/common/Tooltip';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';
import { toDisplayCWTokenStandard, toDisplayTokenId } from '@/utils/nft';
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

type CosmosProps = {
  id: string;
};

export default function Cosmos({ id }: CosmosProps) {
  const { chainList } = useChainList();

  const { currentAccountAddNFTsWithMeta } = useCurrentAccountAddedNFTsWithMetaData();

  const selectedNFT = currentAccountAddNFTsWithMeta.cosmos.find((nft) => nft.id === id);

  const nftImage = selectedNFT?.image;
  const nftName = selectedNFT?.name;
  const nftDescription = selectedNFT?.metaData?.description;

  const nftContractAddress = selectedNFT?.contractAddress;
  const shorterNFTContractAddress = shorterAddress(nftContractAddress, 14);
  const nftTokenId = selectedNFT?.tokenId;

  const formattedNFTName = nftName || toDisplayTokenId(nftTokenId);

  const tokenType = selectedNFT?.tokenType;
  const displayTokenType = toDisplayCWTokenStandard(tokenType);

  const ownerAddress = selectedNFT?.ownerAddress;
  const shorterOwnerAddress = shorterAddress(ownerAddress, 14);

  const chain = chainList.cosmosChains?.find((chain) => chain.id === selectedNFT?.chainId && chain.chainType === selectedNFT.chainType);
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
                  window.open(`${chain?.explorer?.url || ''}/wasm/contract/${nftContractAddress}`, '_blank');
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
              <Base1000Text variant="b3_R">Network</Base1000Text>
              <ChainContainer>
                <ChainImage src={chain?.image} />
                <Base1300Text variant="b3_M">{chain?.name}</Base1300Text>
              </ChainContainer>
            </DetailRowContainer>
            <DetailRowContainer>
              <Base1000Text variant="b3_R">Owner</Base1000Text>

              <Base1300Text variant="b3_M">{shorterOwnerAddress}</Base1300Text>
            </DetailRowContainer>
            <DetailRowContainer>
              <Base1000Text variant="b3_R">Contract Address</Base1000Text>
              <Base1300Text variant="b3_M">{shorterNFTContractAddress}</Base1300Text>
            </DetailRowContainer>

            <DetailRowContainer>
              <Base1000Text variant="b3_R">Token ID</Base1000Text>
              <Base1300Text variant="b3_M">{nftTokenId}</Base1300Text>
            </DetailRowContainer>

            <DetailRowContainer>
              <Base1000Text variant="b3_R">Token Standard</Base1000Text>
              <Base1300Text variant="b3_M">{displayTokenType}</Base1300Text>
            </DetailRowContainer>
          </DetailContainer>

          {selectedNFT?.metaData?.attributes && selectedNFT.metaData.attributes.length > 1 && (
            <AttributesContainer>
              <StyledAccordion>
                <StyledAccordionSummary aria-controls={'advanced-option-aria-control'} id={'advanced-option-id'}>
                  <ItemLeftContainer>
                    <Base1300Text variant="h3_B">Attributes</Base1300Text>
                  </ItemLeftContainer>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                  <DetailContainer>
                    {selectedNFT.metaData.attributes.map((item) => {
                      return (
                        <DetailRowContainer key={item.key}>
                          <DetailRowLabelContainer>
                            <Base1000Text variant="b3_R">{item.key}</Base1000Text>
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
          )}
        </ContentsContainer>
      </BaseBody>
      <StickyFooterInnerBody>
        <Button>NFT Send</Button>
      </StickyFooterInnerBody>
    </>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import { useChainList } from '@/hooks/useChainList';
import type { DappEcosystemInfo, SocialKey } from '@/types/registry/dapp';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Body,
  ChainContainer,
  ChainImage,
  ChainName,
  Container,
  ContentsContainer,
  DappDescriptionContainer,
  DappNameContainer,
  DappTopContainer,
  DescriptionText,
  Divider,
  Footer,
  FooterContentsContainer,
  GridContainer,
  Header,
  HeaderTitle,
  LabelContainer,
  PinButton,
  PinnedIconContainer,
  SectionContainer,
  SocialButtonWrapper,
  StyledBottomSheet,
  StyledButton,
  ThumbnailImageContainer,
  TypeBadge,
} from './styled';

import DiscordIcon from '@/assets/images/icons/Discord18.svg';
import GithubIcon from '@/assets/images/icons/Github18.svg';
import RedditIcon from '@/assets/images/icons/Reddit18.svg';
import TelegramIcon from '@/assets/images/icons/Telegram18.svg';
import TwitterIcon from '@/assets/images/icons/Twitter18.svg';
import UnFavoriteIcon from '@/assets/images/icons/UnFavorite16.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';
import ExplorerIcon from 'assets/images/icons/Explorer14.svg';

import dappDefaultImage from 'assets/images/default/dappDefault.png';

const socialIconMappping = {
  github: <GithubIcon />,
  telegram: <TelegramIcon />,
  twitter: <TwitterIcon />,
  discord: <DiscordIcon />,
  reddit: <RedditIcon />,
};

type DappDetailBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  dappInfo: DappEcosystemInfo;
};

export default function DappDetailBottomSheet({ dappInfo, onClose, ...remainder }: DappDetailBottomSheetProps) {
  const { t } = useTranslation();
  const { pinnedDappIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();

  const chainInfos = useMemo(
    () =>
      dappInfo.chains?.map((chainId) => {
        return flatChainList.find((chain) => chain.id === chainId);
      }),
    [dappInfo.chains, flatChainList],
  );

  const isPinned = useMemo(() => pinnedDappIds.includes(dappInfo.id), [dappInfo.id, pinnedDappIds]);

  const supportedSocials = dappInfo.socials ? (Object.keys(dappInfo.socials) as SocialKey[]) : [];

  const handleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  const handleConfirm = () => {
    window.open(dappInfo.link, '_blank');

    onClose?.({}, 'backdropClick');
  };

  const onPinButtonClick = () => {
    if (isPinned) {
      updateExtensionStorageStore(
        'pinnedDappIds',
        pinnedDappIds.filter((id) => id !== dappInfo.id),
      );
    } else {
      updateExtensionStorageStore('pinnedDappIds', [...pinnedDappIds, dappInfo.id]);
    }
  };

  return (
    <StyledBottomSheet {...remainder} onClose={handleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{dappInfo.link}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'backdropClick');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <ContentsContainer>
            <ThumbnailImageContainer src={dappInfo.thumbnail} defaultImgSrc={dappDefaultImage} />

            <DappDescriptionContainer>
              <DappTopContainer>
                <DappNameContainer>
                  <Base1300Text variant="h2_B">{dappInfo.name}</Base1300Text>
                  <TypeBadge>
                    <Base1300Text variant="c2_B">{dappInfo.type}</Base1300Text>
                  </TypeBadge>
                </DappNameContainer>
                <PinButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinButtonClick();
                  }}
                >
                  <PinnedIconContainer data-is-active={isPinned}>
                    <UnFavoriteIcon />
                  </PinnedIconContainer>
                </PinButton>
              </DappTopContainer>
              <DescriptionText variant="b3_R_Multiline">{dappInfo.description}</DescriptionText>
            </DappDescriptionContainer>

            <Divider />
            <SectionContainer>
              <LabelContainer>
                <Base1300Text variant="b2_B">{t('pages.dapp-list.components.DappDetailBottomSheet.index.supportedNetwork')}</Base1300Text>
              </LabelContainer>
              <GridContainer>
                {chainInfos?.map((chain) => {
                  return (
                    <ChainContainer key={chain?.id}>
                      <ChainImage src={chain?.image} />
                      <ChainName>
                        <Base1000Text variant="b4_M">{chain?.name}</Base1000Text>
                      </ChainName>
                    </ChainContainer>
                  );
                })}
              </GridContainer>
            </SectionContainer>

            <Divider />
            <SectionContainer>
              <LabelContainer>
                <Base1300Text variant="b2_B">{t('pages.dapp-list.components.DappDetailBottomSheet.index.socialInfo')}</Base1300Text>
              </LabelContainer>

              <SocialButtonWrapper>
                {supportedSocials.map((social) => {
                  return (
                    <IconButton key={social} onClick={() => window.open(dappInfo.socials?.[social], '_blank')}>
                      {socialIconMappping[social]}
                    </IconButton>
                  );
                })}
              </SocialButtonWrapper>
            </SectionContainer>
          </ContentsContainer>
        </Body>
        <Footer>
          <Button onClick={handleConfirm}>
            {
              <FooterContentsContainer>
                <Base1300Text variant="h3_B">{t('pages.dapp-list.components.DappDetailBottomSheet.index.goToDapp')}</Base1300Text>
                <ExplorerIcon />
              </FooterContentsContainer>
            }
          </Button>
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}

import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';

import {
  Container,
  ContentsContainer,
  ContentsInfoContainer,
  ContentsLeftContainer,
  ContentsRightContainer,
  DeleteIconButton,
  TotalTxContainer,
  WebsiteImageContainer,
} from './styled';

import DeleteIcon from '@/assets/images/icons/TrashBin20.svg';

type DappItemProps = {
  websiteName: string;
  websiteImage: string;
  totalTxCount: string;
};

export default function DappItem({ websiteName, websiteImage, totalTxCount }: DappItemProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <ContentsContainer>
        <ContentsLeftContainer>
          <WebsiteImageContainer>
            <Image src={websiteImage} />
          </WebsiteImageContainer>
          <ContentsInfoContainer>
            <Base1300Text variant="b2_M">{websiteName}</Base1300Text>
            <TotalTxContainer>
              <Base1000Text variant="b4_R">{t('pages.manage-dapps.components.DappItem.index.totalTx')}</Base1000Text>
              &nbsp;
              <Base1000Text variant="b4_M">
                {t('pages.manage-dapps.components.DappItem.index.transaction', {
                  totalTxCount: totalTxCount,
                })}
              </Base1000Text>
            </TotalTxContainer>
          </ContentsInfoContainer>
        </ContentsLeftContainer>

        <ContentsRightContainer>
          <DeleteIconButton>
            <DeleteIcon />
          </DeleteIconButton>
        </ContentsRightContainer>
      </ContentsContainer>
    </Container>
  );
}

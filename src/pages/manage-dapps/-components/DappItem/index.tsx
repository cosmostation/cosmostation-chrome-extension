import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';

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

import WebsiteDefaultImg from 'assets/images/default/websiteDefault.png';

type DappItemProps = {
  origin: string;
  websiteName: string;
  totalTxCount: number;
  onClickDelete: () => void;
};

export default function DappItem({ origin, websiteName, totalTxCount, onClickDelete }: DappItemProps) {
  const { t } = useTranslation();

  const { siteIconURL } = useSiteIconURL(origin);

  return (
    <Container>
      <ContentsContainer>
        <ContentsLeftContainer>
          <WebsiteImageContainer>
            <Image src={siteIconURL} defaultImgSrc={WebsiteDefaultImg} />
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
          <DeleteIconButton onClick={onClickDelete}>
            <DeleteIcon />
          </DeleteIconButton>
        </ContentsRightContainer>
      </ContentsContainer>
    </Container>
  );
}

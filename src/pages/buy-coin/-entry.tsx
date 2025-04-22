import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Image from '@/components/common/Image';
import TextButton from '@/components/common/TextButton';
import { MOONPAY_API_KEY, MOONPAY_API_URL } from '@/constants/common';
import { useGetMoonpaySignature } from '@/hooks/useGetMoonpaySignature';
import { buildRequestUrl } from '@/utils/fetch';

import {
  ContentsContainer,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  FooterContainer,
  LabelContainer,
  OptionButtonWrapper,
} from './-styled';

import moonpayLogoImage from '@/assets/images/logos/moonpayLogo.png';

export default function Entry() {
  const { t } = useTranslation();
  const { data } = useGetMoonpaySignature();

  return (
    <>
      <BaseBody>
        <>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.buy-coin.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.buy-coin.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <ContentsContainer>
            <LabelContainer>
              <Base1300Text variant="h4_B">{t('pages.buy-coin.entry.platform')}</Base1300Text>
              <Base1000Text variant="h4_B">{1}</Base1000Text>
            </LabelContainer>
            <OptionButtonWrapper>
              <BaseOptionButton
                onClick={() => {
                  window.open(
                    buildRequestUrl(MOONPAY_API_URL, undefined, {
                      apiKey: MOONPAY_API_KEY,
                      signature: data?.signature || '',
                    }),
                    '_blank',
                  );
                }}
                leftContent={<Image src={moonpayLogoImage} />}
                leftSecondHeader={<Base1300Text variant="b2_B">{t('pages.buy-coin.entry.moonpay')}</Base1300Text>}
                leftSecondBody={
                  <Base1300Text
                    sx={{
                      textAlign: 'left',
                    }}
                    variant="b4_R_Multiline"
                  >
                    {t('pages.buy-coin.entry.moonpayDescription')}
                  </Base1300Text>
                }
              />
            </OptionButtonWrapper>
          </ContentsContainer>
        </>
      </BaseBody>
      <BaseFooter>
        <FooterContainer
          style={{
            display: 'none',
          }}
        >
          <Base1300Text variant="b3_R">{t('pages.buy-coin.entry.needGuide')}</Base1300Text>
          <TextButton
            onClick={() => {
              window.open(MOONPAY_API_URL, '_blank');
            }}
            variant="hyperlink"
            typoVarient="b2_M"
          >
            {t('pages.buy-coin.entry.goToGuide')}
          </TextButton>
        </FooterContainer>
      </BaseFooter>
    </>
  );
}

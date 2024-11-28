import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

export default function Entry() {
  const { t } = useTranslation();

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.set-password.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R">{t('pages.account.set-password.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button type="button">{t('pages.account.set-password.index.next')}</Button>
      </BaseFooter>
    </>
  );
}

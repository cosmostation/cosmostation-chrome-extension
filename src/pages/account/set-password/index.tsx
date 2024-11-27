import { useTranslation } from 'react-i18next';
import { createFileRoute } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Button from '@/components/common/Button';
import TextButton from '@/components/common/TextButton';
import Header from '@/components/Header';
import Navigator from '@/components/Header/components/Navigator';

import { CautionContainer, Container, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

export const Route = createFileRoute('/account/set-password/')({
  component: SetPassword,
});
function SetPassword() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      header={<Header leftContent={<Navigator isHideHomeButton />} />}
      footer={
        <>
          <CautionContainer>
            {/* Notice 컴포넌트 컴포넌트화 필요 */}
            <TextButton variant="hyperlink">{t('account.initial.button')}</TextButton>
          </CautionContainer>
          <Button type="button">{t('account.initial.button')}</Button>
        </>
      }
    >
      <Container>
        <DescriptionContainer>
          <DescriptionTitle variant="h2_B">{t('account.setPassword.title')}</DescriptionTitle>
          <DescriptionSubTitle variant="b3_R">{t('account.setPassword.description')}</DescriptionSubTitle>
        </DescriptionContainer>
      </Container>
    </BaseLayout>
  );
}

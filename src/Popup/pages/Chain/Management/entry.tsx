import MenuButton from '~/Popup/components/MenuButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();

  const { t } = useTranslation();
  return (
    <Container>
      <ListContainer>
        <MenuButton onClick={() => navigate('/chain/management/use', { isDuplicateCheck: true })}>
          {t('pages.Chain.Management.entry.chainManagement')}
        </MenuButton>
        <MenuButton>{t('pages.Chain.Management.entry.addChain')}</MenuButton>
      </ListContainer>
    </Container>
  );
}

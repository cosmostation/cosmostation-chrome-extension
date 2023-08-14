import { useParams } from 'react-router-dom';

import MenuButton from '~/Popup/components/MenuButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useParams();

  const { t } = useTranslation();
  return (
    <Container>
      <MenuButton onClick={() => navigate('/chain/ethereum/network/add', { isDuplicateCheck: true })}>
        {t('pages.Chain.Management.entry.addEthereumNetwork')}
      </MenuButton>
      <MenuButton onClick={() => navigate('/chain/cosmos/chain/add', { isDuplicateCheck: true })}>
        {t('pages.Chain.Management.entry.addCosmosChain')}
      </MenuButton>
    </Container>
  );
}

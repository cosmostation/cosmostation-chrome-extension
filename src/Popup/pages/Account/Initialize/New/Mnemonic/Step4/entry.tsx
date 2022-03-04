import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import SelectChain from '~/Popup/pages/Account/Initialize/components/SelectChain';
import { newAccountState } from '~/Popup/recoils/newAccount';

import { BottomContainer, Container, SelectChainContainer } from './styled';

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();

  const newAccount = useRecoilValue(newAccountState);

  useEffect(() => {
    if (!newAccount.accountName || !newAccount.mnemonic) {
      navigateBack(-4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <SelectChainContainer>
        <SelectChain />
      </SelectChainContainer>
      <BottomContainer>
        <Button onClick={() => navigate('/account/initialize/new/mnemonic/step5')}>Next</Button>
      </BottomContainer>
    </Container>
  );
}

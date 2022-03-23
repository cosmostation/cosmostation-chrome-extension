import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import logoImg from '~/images/etc/logo.png';
import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import OutlineButton from '~/Popup/components/common/OutlineButton';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';

import { BottomButtonContainer, BottomContainer, Container } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  return (
    <Container>
      <BottomContainer>
        <BottomButtonContainer>
          <OutlineButton>Cancel</OutlineButton>
          <Button>Confirm</Button>
        </BottomButtonContainer>
      </BottomContainer>
    </Container>
  );
}

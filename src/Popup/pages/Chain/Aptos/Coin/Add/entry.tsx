import { useState } from 'react';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { ButtonContainer, Container, Div, WarningContainer, WarningIconContainer, WarningTextContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const [resourceTarget, setResourceTarget] = useState('');
  const { t } = useTranslation();

  const { enQueue } = useCurrentQueue();

  const splitedResourceTarget = resourceTarget.split('::');

  const { data: coinInfo } = useAccountResourceSWR(
    { resourceType: '0x1::coin::CoinInfo', resourceTarget, address: splitedResourceTarget[0] },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      refreshInterval: 0,
      isPaused: () => !splitedResourceTarget?.[0] || !splitedResourceTarget?.[1] || !splitedResourceTarget?.[2],
    },
  );

  const handleOnChangeResourceTarget = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setResourceTarget(event.currentTarget.value);
  };

  return (
    <Container>
      <WarningContainer>
        <WarningIconContainer>
          <Info16Icon />
        </WarningIconContainer>
        <WarningTextContainer>
          <Typography variant="h6">{t('pages.Chain.Aptos.Coin.Add.entry.warning')}</Typography>
        </WarningTextContainer>
      </WarningContainer>
      <Div sx={{ marginBottom: '3.2rem' }}>
        <Input
          type="text"
          placeholder={t('pages.Chain.Aptos.Coin.Add.entry.addressPlaceholder')}
          onChange={handleOnChangeResourceTarget}
          value={resourceTarget}
        />
      </Div>

      <Div sx={{ marginBottom: '0.8rem' }}>
        <Input type="text" readOnly placeholder={t('pages.Chain.Aptos.Coin.Add.entry.name')} value={coinInfo?.data.name || ''} />
      </Div>

      <Div sx={{ marginBottom: '0.8rem' }}>
        <Input type="text" readOnly placeholder={t('pages.Chain.Aptos.Coin.Add.entry.symbol')} value={coinInfo?.data.symbol || ''} />
      </Div>

      <Div>
        <Input type="text" readOnly placeholder={t('pages.Chain.Aptos.Coin.Add.entry.decimals')} value={coinInfo?.data.decimals || ''} />
      </Div>
      <ButtonContainer>
        <Button
          type="submit"
          disabled={!coinInfo}
          onClick={async () => {
            await enQueue({
              messageId: '',
              origin: '',
              channel: 'inApp',
              message: {
                method: 'aptos_signAndSubmitTransaction',
                params: [{ type: 'entry_function_payload', arguments: [], function: '0x1::managed_coin::register', type_arguments: [resourceTarget] }],
              },
            });
          }}
        >
          {t('pages.Chain.Aptos.Coin.Add.entry.submitButton')}
        </Button>
      </ButtonContainer>
    </Container>
  );
}

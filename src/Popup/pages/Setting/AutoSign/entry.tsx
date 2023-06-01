import { useEffect, useRef } from 'react';
import { Typography } from '@mui/material';

import { COSMOS_CHAINS } from '~/constants/chain';
import Image from '~/Popup/components/common/Image';
import SettingAccordion from '~/Popup/components/SettingAccordion';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentAutoSigns } from '~/Popup/hooks/useCurrent/useCurrentAutoSigns';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { getSiteIconURL } from '~/Popup/utils/common';
import { timeToString } from '~/Popup/utils/string';

import {
  AutoSignItemChainContainer,
  AutoSignItemChainImageContainer,
  AutoSignItemChainTextContainer,
  AutoSignItemContainer,
  AutoSignItemEndTimeContainer,
  AutoSignItemOriginContainer,
  AutoSignItemOriginImageContainer,
  AutoSignItemOriginTextContainer,
  AutoSignListContainer,
  Container,
  ListContainer,
  StyledIconButton,
} from './styled';

import Close16Icon from '~/images/icons/Close16.svg';

export default function Entry() {
  const { extensionStorage } = useExtensionStorage();

  const ref = useRef<HTMLDivElement>(null);

  const { accounts, accountName } = extensionStorage;

  const { currentAccount } = useCurrentAccount();
  const { currentAutoSigns, removeAutoSign } = useCurrentAutoSigns(true);
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  const allChains = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains];

  const accountsWithName = accounts.map((account) => ({ ...account, name: accountName[account.id] }));

  useEffect(() => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }, []);

  return (
    <Container>
      <ListContainer>
        {accountsWithName.map((account) => {
          const accountAutoSigns = currentAutoSigns.filter((autoSign) => autoSign.accountId === account.id);

          if (accountAutoSigns.length === 0) {
            return null;
          }

          const isCurrentAccount = currentAccount.id === account.id;

          return (
            <SettingAccordion key={account.id} account={account} defaultExpanded={isCurrentAccount} ref={isCurrentAccount ? ref : undefined}>
              <AutoSignListContainer>
                {accountAutoSigns.map((autoSign) => {
                  const chain = allChains.find((item) => autoSign.chainId === item.id)!;
                  const faviconURL = (() => {
                    try {
                      return getSiteIconURL(new URL(autoSign.origin).host);
                    } catch {
                      return undefined;
                    }
                  })();
                  return (
                    <AutoSignItemContainer key={autoSign.id}>
                      <StyledIconButton
                        onClick={async () => {
                          await removeAutoSign(autoSign);
                        }}
                      >
                        <Close16Icon />
                      </StyledIconButton>
                      <AutoSignItemChainContainer>
                        <AutoSignItemChainImageContainer>
                          <Image src={chain.imageURL} />
                        </AutoSignItemChainImageContainer>
                        <AutoSignItemChainTextContainer>
                          <Typography variant="h5">{chain.chainName}</Typography>
                        </AutoSignItemChainTextContainer>
                      </AutoSignItemChainContainer>
                      <AutoSignItemOriginContainer>
                        {faviconURL && (
                          <AutoSignItemOriginImageContainer>
                            <Image src={faviconURL} />
                          </AutoSignItemOriginImageContainer>
                        )}
                        <AutoSignItemOriginTextContainer>
                          <Typography variant="h6">{autoSign.origin}</Typography>
                        </AutoSignItemOriginTextContainer>
                      </AutoSignItemOriginContainer>
                      <AutoSignItemEndTimeContainer>
                        <Typography variant="h6">End Time: {timeToString(autoSign.startTime + autoSign.duration)}</Typography>
                      </AutoSignItemEndTimeContainer>
                    </AutoSignItemContainer>
                  );
                })}
              </AutoSignListContainer>
            </SettingAccordion>
          );
        })}
      </ListContainer>
    </Container>
  );
}

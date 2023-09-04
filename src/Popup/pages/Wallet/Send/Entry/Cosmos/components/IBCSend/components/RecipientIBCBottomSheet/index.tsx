import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

import ChainButtonItem from './components/ChainButtonItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

export type RecipientIBC = {
  chain: CosmosChain;
  channel: string;
  port: string;
};

type RecipientIBCListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  recipientList: RecipientIBC[];
  selectedRecipientIBC?: RecipientIBC;
  onClickChain?: (selectedRecipientIBC: RecipientIBC) => void;
};

export default function RecipientIBCListBottomSheet({
  selectedRecipientIBC,
  onClickChain,
  onClose,
  recipientList,
  ...remainder
}: RecipientIBCListBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');

  const filteredRecipientList = useMemo(
    () => (search.length > 1 ? recipientList?.filter((item) => item.chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) || [] : recipientList),
    [search, recipientList],
  );

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        setSearch('');
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.components.RecipientIBCBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              setSearch('');
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <StyledInput
          startAdornment={
            <InputAdornment position="start">
              <StyledSearch20Icon />
            </InputAdornment>
          }
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.components.RecipientIBCBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <AssetList>
          {filteredRecipientList.map((item) => {
            const isActive =
              selectedRecipientIBC?.chain.id === item.chain.id && selectedRecipientIBC?.channel === item.channel && selectedRecipientIBC?.port === item.port;

            return (
              <ChainButtonItem
                isActive={isActive}
                key={item.chain.id}
                ref={isActive ? ref : undefined}
                recipientIBCInfo={item}
                onClickChain={(clickedChain) => {
                  onClickChain?.(clickedChain);
                  setSearch('');

                  onClose?.({}, 'backdropClick');
                }}
              />
            );
          })}
        </AssetList>
      </Container>
    </StyledBottomSheet>
  );
}

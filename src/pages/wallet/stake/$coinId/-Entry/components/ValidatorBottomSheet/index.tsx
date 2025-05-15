import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import { VirtualizedList } from '@/components/common/VirtualizedList';
import Search from '@/components/Search';
import type { Validator } from '@/components/ValidatorSelectBox';

import ValidatorButton from './components/ValidatorItem';
import { Container, FilterContaienr, Header, HeaderTitle, StyledBottomSheet, StyledButton, SubHeaderContaienr } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type ValidatorBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentValidatorId?: string;
  validatorList?: Validator[];
  onClickItem: (address: string) => void;
};

export default function ValidatorBottomSheet({ currentValidatorId, validatorList, onClose, onClickItem, ...remainder }: ValidatorBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const filteredValidatorList = useMemo(() => {
    if (!!search && debouncedSearch.length > 1) {
      return (
        validatorList?.filter((validator) => {
          const condition = [validator.validatorName, validator.validatorAddress];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return validatorList || [];
  }, [debouncedSearch, search, validatorList]);

  const handleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledBottomSheet {...remainder} onClose={handleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.wallet.stake.$coinId.components.ValidatorBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={handleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <FilterContaienr>
          <Search
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
            placeholder={t('pages.wallet.stake.$coinId.components.ValidatorBottomSheet.index.searchPlaceholder')}
            isPending={isDebouncing}
            onClear={() => {
              setSearch('');
              cancel();
            }}
            disableFilter
          />
        </FilterContaienr>
        <SubHeaderContaienr>
          <Base1000Text variant="b4_M">{t('pages.wallet.stake.$coinId.components.ValidatorBottomSheet.index.validator')}</Base1000Text>
          <Base1000Text variant="b4_M">{t('pages.wallet.stake.$coinId.components.ValidatorBottomSheet.index.commisson')}</Base1000Text>
        </SubHeaderContaienr>
        <VirtualizedList
          items={filteredValidatorList}
          estimateSize={() => 62}
          renderItem={(item) => {
            const isActive = item.validatorAddress === currentValidatorId;
            return (
              <ValidatorButton
                key={item.validatorAddress}
                ref={isActive ? ref : undefined}
                isActive={isActive}
                validatorAddress={item.validatorAddress}
                validatorName={item.validatorName}
                votingPower={item.votingPower}
                commission={item.commission}
                validatorImage={item.validatorImage}
                status={item.status}
                onClick={() => {
                  onClickItem(item.validatorAddress);
                  handleClose();
                }}
              />
            );
          }}
          overscan={5}
          isFixed={true}
        />
      </Container>
    </StyledBottomSheet>
  );
}

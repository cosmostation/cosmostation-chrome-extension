import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import type { Validator } from '@/components/ValidatorSelectBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import ValidatorButton from './components/ValidatorItem';
import { Body, Container, FilterContaienr, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, SubHeaderContaienr } from './styled';

import SearchIcon from '@/assets/images/icons/Search18.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';

type ValidatorBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentUnstakingCoinId: string;
  currentValidatorId?: string;
  validatorList?: Validator[];
  onClickItem: (address: string) => void;
};

export default function ValidatorBottomSheet({
  currentUnstakingCoinId,
  currentValidatorId,
  validatorList,
  onClose,
  onClickItem,
  ...remainder
}: ValidatorBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const { data } = useAccountAssets();

  const [search, setSearch] = useState('');

  const filteredValidatorList = validatorList?.filter((validator) => validator.validatorName.toLowerCase().indexOf(search.toLowerCase()) > -1) || [];

  const currentUnstakingCoin = data?.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === currentUnstakingCoinId);

  // FIXME 비즈니스 로직 추가 필요
  const stakedAmount = '400';

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
            <Typography variant="h2_B">
              {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.components.ValidatorBottomSheet.index.title')}
            </Typography>
          </HeaderTitle>
          <StyledButton onClick={handleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <FilterContaienr>
          <StyledInput
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            placeholder={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.components.ValidatorBottomSheet.index.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />
        </FilterContaienr>
        <SubHeaderContaienr>
          <Base1000Text variant="b4_M">
            {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.components.ValidatorBottomSheet.index.validator')}
          </Base1000Text>
          <Base1000Text variant="b4_M">
            {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.components.ValidatorBottomSheet.index.staked')}
          </Base1000Text>
        </SubHeaderContaienr>
        <Body>
          {filteredValidatorList.map((item) => {
            const isActive = item.validatorAddress === currentValidatorId;
            return (
              <ValidatorButton
                key={item.validatorAddress}
                ref={isActive ? ref : undefined}
                isActive={isActive}
                validatorAddress={item.validatorAddress}
                validatorName={item.validatorName}
                validatorImage={item.validatorImage}
                stakedAmount={stakedAmount}
                decimals={currentUnstakingCoin?.asset.decimals || 0}
                onClick={() => {
                  onClickItem(item.validatorAddress);
                  handleClose();
                }}
              />
            );
          })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

import type { Chain } from '@/types/chain';

import OptionButton from './components/OptionButton';
import {
  Body,
  Container,
  CustomNetworkButton,
  CustomNetworkTextContaienr,
  FilterContaienr,
  Header,
  HeaderTitle,
  ManageAssetsContaienr,
  NetworkCounts,
  NetworkInfoContainer,
  StyledBottomSheet,
  StyledButton,
  StyledInput,
  SwtichCoinType,
} from './styled';
import Base1300Text from '../common/Base1300Text';
import IconTextButton from '../common/IconTextButton';

import SearchIcon from '@/assets/images/icons/Search18.svg';
import ChangeIcon from 'assets/images/icons/Change14.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';
import CustomNetworkIcon from 'assets/images/icons/CustomNetwork28.svg';

import GridMenuImage from 'assets/images/GridMenu.png';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainList: Chain[];
  currentChainId?: string;
  disableAllNetwork?: boolean;
  title?: string;
  searchPlaceholder?: string;
  customType?: 'normal' | 'manageAssets';
  onClickChain: (id: string) => void;
};

export default function ChainListBottomSheet({
  currentChainId,
  chainList,
  onClose,
  onClickChain,
  disableAllNetwork = false,
  title,
  searchPlaceholder,
  customType = 'normal',
  ...remainder
}: ChainListBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');

  const AllNetworkOptionId = '';

  const filteredChainList = chainList?.filter((chain) => chain.name.toLowerCase().indexOf(search.toLowerCase()) > -1);

  const chainsCount = String(chainList.length);

  const handleClose = () => {
    setSearch('');
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
            <Typography variant="h2_B">{title || t('components.ChainListBottomSheet.index.title')}</Typography>
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
            placeholder={searchPlaceholder || t('components.ChainListBottomSheet.index.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />
        </FilterContaienr>
        {customType === 'manageAssets' && (
          <ManageAssetsContaienr>
            <CustomNetworkButton
              leftContent={<CustomNetworkIcon />}
              leftSecondBody={
                <CustomNetworkTextContaienr>
                  <Base1300Text variant="b3_M_Multiline">{t('components.ChainListBottomSheet.index.customNetwork')}</Base1300Text>
                </CustomNetworkTextContaienr>
              }
            />
            <NetworkInfoContainer>
              <Base1300Text variant="b3_M">
                {t('components.ChainListBottomSheet.index.network')}
                &nbsp;
                <NetworkCounts>{chainsCount}</NetworkCounts>
              </Base1300Text>

              <IconTextButton leadingIcon={<ChangeIcon />}>
                <SwtichCoinType>
                  <Typography variant="b3_M">{t('components.ChainListBottomSheet.index.switchCoinType')}</Typography>
                </SwtichCoinType>
              </IconTextButton>
            </NetworkInfoContainer>
          </ManageAssetsContaienr>
        )}
        <Body>
          {!disableAllNetwork && (
            <OptionButton
              key={'all-network'}
              isActive={!currentChainId}
              onClick={() => {
                onClickChain(AllNetworkOptionId);
                onClose?.({}, 'backdropClick');
              }}
              name={t('components.ChainListBottomSheet.index.allNetwork')}
              image={GridMenuImage}
              id={AllNetworkOptionId}
            />
          )}
          {filteredChainList?.map((item) => {
            const isActive = currentChainId === item.id;

            return (
              <OptionButton
                key={String(item.chainId).concat(item.chainType).concat(item.id)}
                isActive={isActive}
                ref={isActive ? ref : undefined}
                onSelectChain={(id) => {
                  onClickChain(id);
                  handleClose();
                }}
                name={item.name}
                image={item.image}
                id={item.id}
              />
            );
          })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}

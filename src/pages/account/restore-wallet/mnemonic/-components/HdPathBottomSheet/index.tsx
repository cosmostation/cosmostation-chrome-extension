import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import StandardInput from '@/components/common/StandardInput';
import { useChainList } from '@/hooks/useChainList';
import type { AptosChain, BitcoinChain, CosmosChain, EvmChain, SuiChain } from '@/types/chain';
import { isNumber } from '@/utils/string';

import type { HdPathIndexForm } from './-useSchema';
import { useSchema } from './-useSchema';
import ChainPathInfo from './components/ChainPathInfo';
import {
  Body,
  ChainInfoContainer,
  ChainInfoTitle,
  ConfirmButton,
  DescriptionText,
  FormContainer,
  Header,
  HeaderTitle,
  StyledBottomSheet,
  StyledButton,
} from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type HdPathBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentHdPathIndex: string;
  onChangeHdPathIndex?: (val: string) => void;
};

export default function HdPathBottomSheet({ currentHdPathIndex, onClose, onChangeHdPathIndex, ...remainder }: HdPathBottomSheetProps) {
  const { t } = useTranslation();
  const { flatChainList } = useChainList();

  const { restoreAccountForm } = useSchema();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<HdPathIndexForm>({
    resolver: joiResolver(restoreAccountForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      hdPathIndex: currentHdPathIndex,
    },
  });

  const { hdPathIndex } = watch();
  const isButtonDisabled = !hdPathIndex;

  const majorNetworkIds = ['cosmos', 'bitcoin', 'ethereum'];
  const majorNetwork = majorNetworkIds
    .map((id) => flatChainList.find((chain) => chain.id === id))
    .filter((chain): chain is CosmosChain | EvmChain | SuiChain | AptosChain | BitcoinChain => chain !== undefined);

  const submit = async (data: HdPathIndexForm) => {
    onChangeHdPathIndex?.(data.hdPathIndex);

    reset(data);
    onClose?.({}, 'backdropClick');
  };

  const onCloseHandler = () => {
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onCloseHandler}>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.header')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={onCloseHandler}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <DescriptionText variant="b3_R_Multiline">
            {t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.description')}
          </DescriptionText>
          <StandardInput
            label={t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.lastHdPath')}
            error={!!errors.hdPathIndex}
            helperText={errors.hdPathIndex?.message}
            type="number"
            slotProps={{
              input: {
                ...register('hdPathIndex', {
                  setValueAs: (v: string) => (v && isNumber(v) ? v : ''),
                }),
              },
            }}
          />

          <ChainInfoTitle variant="b3_M">{t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.majorChains')}</ChainInfoTitle>
          <ChainInfoContainer>
            {majorNetwork.map((network) => {
              const { name, image, id } = network || {};
              const defaultHdPath = network?.accountTypes.find(({ isDefault }) => isDefault === null)?.hdPath || '';

              return <ChainPathInfo key={id} chainName={name} chainImage={image || ''} fullHdPath={defaultHdPath} currentHdPathIndex={hdPathIndex} />;
            })}
          </ChainInfoContainer>
          <ConfirmButton type="submit" disabled={isButtonDisabled}>
            {t('pages.account.restore-wallet.mnemonic.components.HdPathBottomSheet.index.confirm')}
          </ConfirmButton>
        </Body>
      </FormContainer>
    </StyledBottomSheet>
  );
}

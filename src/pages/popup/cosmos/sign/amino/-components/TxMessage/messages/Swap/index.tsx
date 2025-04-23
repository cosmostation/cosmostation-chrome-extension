import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import PaginationControls from '@/components/PaginationControls';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import {
  AddressContainer,
  AmountContainer,
  Container,
  DetailWrapper,
  Divider,
  LabelContainer,
  MsgTitle,
  MsgTitleContainer,
  SymbolText,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import type { CosmosChain } from '@/types/chain';
import type { Msg, MsgSwapExactAmountIn } from '@/types/cosmos/amino';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { isSameChain } from '@/utils/queryParamGenerator';

type SwapProps = {
  msg: Msg<MsgSwapExactAmountIn>;
  chain: CosmosChain;
  currentStep: number;
  totalSteps: number;
  onPageChange?: (page: number) => void;
};

export default function Swap({ msg, chain, currentStep, totalSteps, onPageChange }: SwapProps) {
  const { t } = useTranslation();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const isMultipleMsgs = totalSteps > 1;

  const coinList = useMemo(
    () => accountAllAssets?.allCosmosAccountAssets.filter((asset) => isSameChain(asset.chain, chain)),
    [accountAllAssets?.allCosmosAccountAssets, chain],
  );

  const { value } = msg;

  const { token_in, token_out_min_amount, routes } = value;

  const inputCoin = useMemo(() => coinList?.find((item) => item.asset.id === token_in.denom), [coinList, token_in.denom]);
  const inputCoinSymbol = inputCoin?.asset.symbol || 'Unknown';

  const outputCoin = useMemo(() => coinList?.find((item) => item.asset.id === routes[routes.length - 1].token_out_denom), [coinList, routes]);
  const outputCoinSymbol = outputCoin?.asset.symbol || 'Unknown';

  const routesDisplayDenomList = useMemo(
    () =>
      [
        inputCoin?.asset.symbol || 'Unknown',
        ...routes
          .map(({ token_out_denom }) => token_out_denom)
          .map((item) => coinList?.find((chainAsset) => chainAsset.asset.id === item)?.asset.symbol || 'Unknown'),
      ].join(' / '),
    [coinList, inputCoin?.asset.symbol, routes],
  );

  const routesPoolIdList = useMemo(() => routes.map(({ pool_id }) => pool_id).join(' / '), [routes]);

  const inputDisplayAmount = useMemo(() => toDisplayDenomAmount(token_in.amount, inputCoin?.asset.decimals || 0), [inputCoin?.asset.decimals, token_in.amount]);

  const outputDisplayAmount = useMemo(
    () => toDisplayDenomAmount(token_out_min_amount, outputCoin?.asset.decimals || 0),
    [outputCoin?.asset.decimals, token_out_min_amount],
  );

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Swap'}</MsgTitle>
        {isMultipleMsgs && onPageChange && <PaginationControls currentPage={currentStep} totalPages={totalSteps} onPageChange={onPageChange} />}
      </MsgTitleContainer>
      <Divider />
      <DetailWrapper>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.6rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Swap.index.input')}
          </Base1000Text>
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
              {inputDisplayAmount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b2_B">{inputCoinSymbol}</SymbolText>
          </AmountContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.6rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Swap.index.output')}
          </Base1000Text>
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isApporximation isDisableHidden>
              {outputDisplayAmount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b2_B">{outputCoinSymbol}</SymbolText>
          </AmountContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Swap.index.routes')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{routesDisplayDenomList}</Base1300Text>
          </AddressContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.Swap.index.poolId')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{routesPoolIdList}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}

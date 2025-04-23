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
  AmountWrapper,
  Container,
  DetailWrapper,
  Divider,
  LabelContainer,
  MsgTitle,
  MsgTitleContainer,
  SymbolText,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import type { CosmosChain } from '@/types/chain';
import type { Msg, MsgSend } from '@/types/cosmos/direct';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { isSameChain } from '@/utils/queryParamGenerator';

type SendProps = {
  msg: Msg<MsgSend>;
  chain: CosmosChain;
  currentStep: number;
  totalSteps: number;
  onPageChange?: (page: number) => void;
};

export default function Send({ msg, chain, currentStep, totalSteps, onPageChange }: SendProps) {
  const { t } = useTranslation();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const coinList = useMemo(
    () => accountAllAssets?.allCosmosAccountAssets.filter((asset) => isSameChain(asset.chain, chain)),
    [accountAllAssets?.allCosmosAccountAssets, chain],
  );

  const { value } = msg;

  const { amount, from_address, to_address } = value;

  const isMultipleMsgs = totalSteps > 1;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Send'}</MsgTitle>
        {isMultipleMsgs && onPageChange && <PaginationControls currentPage={currentStep} totalPages={totalSteps} onPageChange={onPageChange} />}
      </MsgTitleContainer>
      <Divider />
      <DetailWrapper>
        {amount.length > 0 && (
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.6rem',
              }}
            >
              {t('pages.popup.cosmos.sign.direct.components.TxMessage.messages.Send.index.sendAmount')}
            </Base1000Text>
            <AmountWrapper>
              {amount.map((amountItem, index) => {
                const coinAsset = coinList?.find((coin) => coin.asset.id === amountItem.denom)?.asset;

                const displayAmount = toDisplayDenomAmount(amountItem.amount || '0', coinAsset?.decimals || 0);
                const symbol = coinAsset?.symbol || 'UNKNOWN';
                return (
                  <AmountContainer key={index}>
                    <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
                      {displayAmount}
                    </BalanceDisplay>
                    &nbsp;
                    <SymbolText variant="b2_B">{symbol}</SymbolText>
                  </AmountContainer>
                );
              })}
            </AmountWrapper>
          </LabelContainer>
        )}

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.direct.components.TxMessage.messages.Send.index.from')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{from_address}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.direct.components.TxMessage.messages.Send.index.to')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{to_address}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}

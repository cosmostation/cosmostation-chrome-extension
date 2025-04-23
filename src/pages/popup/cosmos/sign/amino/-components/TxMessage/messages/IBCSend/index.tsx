import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'js-yaml';

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
  MemoContainer,
  MsgTitle,
  MsgTitleContainer,
  SymbolText,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import type { CosmosChain } from '@/types/chain';
import type { Msg, MsgTransfer } from '@/types/cosmos/amino';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { isSameChain } from '@/utils/queryParamGenerator';
import { isJsonString } from '@/utils/string';

type IBCSendProps = {
  msg: Msg<MsgTransfer>;
  chain: CosmosChain;
  currentStep: number;
  totalSteps: number;
  onPageChange?: (page: number) => void;
};

export default function IBCSend({ msg, chain, currentStep, totalSteps, onPageChange }: IBCSendProps) {
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

  const { receiver, sender, source_channel, token, memo } = value;

  const sendTokenAsset = useMemo(() => coinList?.find((coin) => coin.asset.id === token.denom)?.asset, [coinList, token.denom]);

  const displaySendAmount = toDisplayDenomAmount(token.amount || '0', sendTokenAsset?.decimals || 0);
  const sendSymbol = sendTokenAsset?.symbol || 'UNKNOWN';

  const memoData = useMemo(() => {
    if (isJsonString(memo)) {
      const parsedMemo = JSON.parse(memo) as string;
      return YAML.dump(parsedMemo, { indent: 4 });
    }
    return memo;
  }, [memo]);

  const isMultipleMsgs = totalSteps > 1;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# IBC Send'}</MsgTitle>
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
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.IBCSend.index.sendAmount')}
          </Base1000Text>
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
              {displaySendAmount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b2_B">{sendSymbol}</SymbolText>
          </AmountContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.IBCSend.index.from')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{sender}</Base1300Text>
          </AddressContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.IBCSend.index.to')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{receiver}</Base1300Text>
          </AddressContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.IBCSend.index.channel')}
          </Base1000Text>
          <Base1300Text variant="b3_M">{source_channel}</Base1300Text>
        </LabelContainer>

        {memoData && (
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.cosmos.sign.amino.components.TxMessage.messages.IBCSend.index.memo')}
            </Base1000Text>
            <MemoContainer>
              <Base1300Text variant="b3_M">{memoData}</Base1300Text>
            </MemoContainer>
          </LabelContainer>
        )}
      </DetailWrapper>
    </Container>
  );
}

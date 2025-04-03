import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toChecksumAddress } from 'ethereumjs-util';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useCurrentEVMNetwork } from '@/hooks/evm/useCurrentEvmNetwork';
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
import { toDisplayDenomAmount } from '@/utils/numbers';
import { isSameChain } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase, toHex } from '@/utils/string';

import type { TxMessageProps } from '../../index';

type SendProps = TxMessageProps;

export default function Send({ tx }: SendProps) {
  const { t } = useTranslation();
  const { currentEVMNetwork } = useCurrentEVMNetwork();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      currentEVMNetwork &&
      accountAllAssets?.allEVMAccountAssets.find(
        (asset) => isSameChain(asset.chain, currentEVMNetwork) && isEqualsIgnoringCase(asset.asset.id, NATIVE_EVM_COIN_ADDRESS),
      ),
    [accountAllAssets?.allEVMAccountAssets, currentEVMNetwork],
  );

  const symbol = nativeAccountAsset?.asset.symbol || 'UNKNOWN';

  const { from, to } = tx;

  const fromAddress = useMemo(() => toChecksumAddress(toHex(from, { addPrefix: true })), [from]);
  const toAddress = useMemo(() => toChecksumAddress(toHex(to, { addPrefix: true })), [to]);

  const amount = useMemo(() => toHex(tx.value, { addPrefix: true }), [tx.value]);

  const displayAmount = useMemo(() => {
    try {
      return toDisplayDenomAmount(BigInt(amount).toString(10), nativeAccountAsset?.asset.decimals || 0);
    } catch {
      return '0';
    }
  }, [amount, nativeAccountAsset?.asset.decimals]);

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Send'}</MsgTitle>
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
            {t('pages.popup.evm.transaction.components.TxMessage.messages.Send.index.sendAmount')}
          </Base1000Text>
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
              {displayAmount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b2_B">{symbol}</SymbolText>
          </AmountContainer>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.Send.index.from')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{fromAddress}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.evm.transaction.components.TxMessage.messages.Send.index.to')}
          </Base1000Text>
          <AddressContainer>
            <Base1300Text variant="b3_M">{toAddress}</Base1300Text>
          </AddressContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { networks, Psbt } from 'bitcoinjs-lib';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import PaginationControls from '@/components/PaginationControls';
import { useCurrentBitcoinNetwork } from '@/hooks/bitcoin/useCurrentBitcoinNetwork';
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
import { decodedPsbt, formatPsbtHex } from '@/utils/bitcoin/tx';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { isSameChain } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { InOutputContainer } from './styled';

export type TxMessageProps = {
  psbtHex: string;
  currentStep?: number;
  totalSteps?: number;
  onPageChange?: (page: number) => void;
  title?: string;
};

export default function TxMessage({ psbtHex, currentStep, totalSteps, title, onPageChange }: TxMessageProps) {
  const { t } = useTranslation();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const nativeAccountAsset = useMemo(
    () => currentBitcoinNetwork && accountAllAssets?.bitcoinAccountAssets.find((item) => isSameChain(item.chain, currentBitcoinNetwork)),
    [accountAllAssets?.bitcoinAccountAssets, currentBitcoinNetwork],
  );

  const decimals = nativeAccountAsset?.asset.decimals || 8;

  const network = useMemo(() => (currentBitcoinNetwork?.isTestnet ? networks.testnet : networks.bitcoin), [currentBitcoinNetwork?.isTestnet]);

  const parsedPsbt = useMemo(() => {
    try {
      const formattedPsbtHex = formatPsbtHex(psbtHex);

      const psbt = Psbt.fromHex(formattedPsbtHex, {
        network,
      });

      return psbt;
    } catch {
      return null;
    }
  }, [network, psbtHex]);

  const decodedPsbtData = useMemo(
    () =>
      parsedPsbt &&
      decodedPsbt({
        psbt: parsedPsbt,
        psbtNetwork: network,
      }),
    [parsedPsbt, network],
  );

  const isMultipleMsgs = totalSteps ? totalSteps > 1 : false;

  const isShowPagination = isMultipleMsgs && !!totalSteps && !!onPageChange;

  return (
    <Container>
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{`# ${title}`}</MsgTitle>
        {isShowPagination && <PaginationControls currentPage={currentStep || 0} totalPages={totalSteps} onPageChange={onPageChange} />}
      </MsgTitleContainer>
      <Divider />
      <DetailWrapper>
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.bitcoin.components.TxMessage.index.inputs')}
          </Base1000Text>
          <AmountWrapper
            sx={{
              width: '100%',
            }}
          >
            {decodedPsbtData?.inputInfos.length &&
              decodedPsbtData.inputInfos.length > 0 &&
              decodedPsbtData.inputInfos.map((input, index) => {
                const shortAddress = shorterAddress(input.address, 14);

                const displayAmount = toDisplayDenomAmount(input.value || '0', decimals);
                const symbolColor = nativeAccountAsset?.asset && ('color' in nativeAccountAsset.asset ? nativeAccountAsset?.asset.color : undefined);

                return (
                  <InOutputContainer key={index}>
                    <AddressContainer>
                      <Base1300Text variant="b3_M">{shortAddress}</Base1300Text>
                    </AddressContainer>

                    <AmountContainer>
                      <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
                        {displayAmount}
                      </BalanceDisplay>
                      &nbsp;
                      <SymbolText data-symbol-color={symbolColor} variant="b2_B">
                        {nativeAccountAsset?.asset.symbol}
                      </SymbolText>
                    </AmountContainer>
                  </InOutputContainer>
                );
              })}
          </AmountWrapper>
        </LabelContainer>

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.bitcoin.components.TxMessage.index.outputs')}
          </Base1000Text>
          <AmountWrapper
            sx={{
              width: '100%',
            }}
          >
            {decodedPsbtData?.outputInfos.length &&
              decodedPsbtData.outputInfos.length > 0 &&
              decodedPsbtData.outputInfos.map((output, index) => {
                const shortAddress = shorterAddress(output?.address, 14);

                const displayAmount = toDisplayDenomAmount(output?.value || '0', decimals);
                const symbolColor = nativeAccountAsset?.asset && ('color' in nativeAccountAsset.asset ? nativeAccountAsset?.asset.color : undefined);

                return (
                  <InOutputContainer key={index}>
                    <AddressContainer>
                      <Base1300Text variant="b3_M">{shortAddress}</Base1300Text>
                    </AddressContainer>

                    <AmountContainer>
                      <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
                        {displayAmount}
                      </BalanceDisplay>
                      &nbsp;
                      <SymbolText data-symbol-color={symbolColor} variant="b2_B">
                        {nativeAccountAsset?.asset.symbol}
                      </SymbolText>
                    </AmountContainer>
                  </InOutputContainer>
                );
              })}
          </AmountWrapper>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}

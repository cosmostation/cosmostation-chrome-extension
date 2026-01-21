import { useTranslation } from 'react-i18next';
import YAML from 'js-yaml';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Tooltip from '@/components/common/Tooltip';
import PaginationControls from '@/components/PaginationControls';
import {
  AmountContainer,
  Container,
  DetailWrapper,
  Divider,
  IconContainer,
  LabelContainer,
  LabelTitleContainer,
  MemoContainer,
  MsgTitle,
  MsgTitleContainer,
  SymbolText,
} from '@/pages/popup/-components/CommonTxMessageStyle';
import type { TokenChange } from '@/utils/solana/parseTx';
import type { ParsedInstruction } from '@/utils/solana/transaction';

import InfoIcon from '@/assets/images/icons/Information14.svg';

type CustomProps = {
  msgs: ParsedInstruction[][];
  currentStep: number;
  tokenChanges?: TokenChange[];
  onPageChange?: (page: number) => void;
};

export default function TxMessage({ msgs, tokenChanges, currentStep, onPageChange }: CustomProps) {
  const { t } = useTranslation();

  const totalSteps = msgs.length || 0;

  const isMultipleMsgs = totalSteps > 1;

  const msg = msgs[currentStep].length === 1 ? msgs[currentStep][0] : msgs[currentStep];

  const doc = YAML.dump(msg, { indent: 4 });

  return (
    <Container
      style={{
        marginTop: '0.8rem',
      }}
    >
      <MsgTitleContainer>
        <MsgTitle variant="h3_B">{'# Transaction'}</MsgTitle>
        {isMultipleMsgs && onPageChange && <PaginationControls currentPage={currentStep} totalPages={totalSteps} onPageChange={onPageChange} />}
      </MsgTitleContainer>
      <Divider />
      <DetailWrapper>
        {tokenChanges && (
          <LabelContainer>
            <LabelTitleContainer
              style={{
                marginBottom: '0.4rem',
              }}
            >
              <Base1000Text variant="b3_R">{t('pages.popup.solana.transaction.components.TxMessage.index.expectedChanges')}</Base1000Text>
              <Tooltip
                title={t('pages.popup.solana.transaction.components.TxMessage.index.expectedChangesDescription')}
                varient={'basic'}
                placement="top"
                style={{ height: '1.6rem', marginLeft: '0.4rem' }}
                slotProps={{ tooltip: { sx: { maxWidth: '22rem !important' } } }}
              >
                <IconContainer>
                  <InfoIcon />
                </IconContainer>
              </Tooltip>
            </LabelTitleContainer>
            {tokenChanges.map((item) => {
              return (
                <AmountContainer key={item.mint}>
                  <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6} isDisableHidden>
                    {String(item.amount)}
                  </BalanceDisplay>
                  &nbsp;
                  <SymbolText variant="b2_B">{item.symbol || 'UNDEFINED'}</SymbolText>
                </AmountContainer>
              );
            })}
          </LabelContainer>
        )}
        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              marginBottom: '0.4rem',
            }}
          >
            {t('pages.popup.cosmos.sign.direct.components.TxMessage.messages.Custom.index.data')}
          </Base1000Text>
          <MemoContainer>
            <Base1300Text variant="b3_M">{doc}</Base1300Text>
          </MemoContainer>
        </LabelContainer>
      </DetailWrapper>
    </Container>
  );
}

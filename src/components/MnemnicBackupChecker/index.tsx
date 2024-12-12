import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonRow, Container, FirstRow, MnemonicButton, SecondRow, ThirdRow, TopContainer } from './styled';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';

export type CheckWord = {
  index: number;
  word: string;
};

type MnemnicBackupCheckerProps = {
  mnemonic: string;
  checkWords: CheckWord[];
  onClickFirstAnswer: (word: string) => void;
  onClickSecondAnswer: (word: string) => void;
  onClickThirdAnswer: (word: string) => void;
};

export default function MnemnicBackupChecker({ mnemonic, checkWords, onClickFirstAnswer, onClickSecondAnswer, onClickThirdAnswer }: MnemnicBackupCheckerProps) {
  const { t } = useTranslation();

  const [firstSelectedMnemonic, setFirstSelectedMnemonic] = useState('');
  const [secondSelectedMnemonic, setSecondSelectedMnemonic] = useState('');
  const [thirdSelectedMnemonic, setThirdSelectedMnemonic] = useState('');

  const splitedMnemonic = useMemo(() => mnemonic.split(' '), [mnemonic]);

  const mnemonicRows = useMemo(() => {
    const shuffleArray = (array: string[]) => array.sort(() => Math.random() - 0.5);

    const wrongAnswerWords = splitedMnemonic.filter((item) => !checkWords.map(({ word }) => word).includes(item));

    const randomWrongAnswerWords = shuffleArray(wrongAnswerWords);

    const [firstRowWordParts, seconRowWordParts, thirdRowWordParts] = [
      randomWrongAnswerWords.slice(0, 2),
      randomWrongAnswerWords.slice(2, 4),
      randomWrongAnswerWords.slice(4, 6),
    ];

    const firstRowWords = shuffleArray([checkWords[0].word, ...firstRowWordParts]);
    const secondRowWords = shuffleArray([checkWords[1].word, ...seconRowWordParts]);
    const thirdRowWords = shuffleArray([checkWords[2].word, ...thirdRowWordParts]);

    return {
      firstRowWords,
      secondRowWords,
      thirdRowWords,
    };
  }, [checkWords, splitedMnemonic]);

  return (
    <Container>
      <FirstRow>
        <TopContainer>
          <Base1300Text variant="h4_B">{t('components.MnemonicBackupChecker.index.phrase')}</Base1300Text>
          &nbsp;
          <Base1000Text variant="h4_B">{`#${checkWords[0].index + 1}`}</Base1000Text>
        </TopContainer>
        <ButtonRow>
          {mnemonicRows.firstRowWords.map((item) => (
            <MnemonicButton
              key={item}
              isSelected={firstSelectedMnemonic === item}
              onClick={() => {
                setFirstSelectedMnemonic(item);
                onClickFirstAnswer(item);
              }}
              variant="primaryHoverGray"
            >
              <Base1300Text variant="b3_M">{item}</Base1300Text>
            </MnemonicButton>
          ))}
        </ButtonRow>
      </FirstRow>
      <SecondRow>
        <TopContainer>
          <Base1300Text variant="h4_B">{t('components.MnemonicBackupChecker.index.phrase')}</Base1300Text>
          &nbsp;
          <Base1000Text variant="h4_B">{`#${checkWords[1].index + 1}`}</Base1000Text>
        </TopContainer>
        <ButtonRow>
          {mnemonicRows.secondRowWords.map((item) => (
            <MnemonicButton
              key={item}
              isSelected={secondSelectedMnemonic === item}
              onClick={() => {
                setSecondSelectedMnemonic(item);
                onClickSecondAnswer(item);
              }}
              variant="primaryHoverGray"
            >
              <Base1300Text variant="b3_M">{item}</Base1300Text>
            </MnemonicButton>
          ))}
        </ButtonRow>
      </SecondRow>
      <ThirdRow>
        <TopContainer>
          <Base1300Text variant="h4_B">{t('components.MnemonicBackupChecker.index.phrase')}</Base1300Text>
          &nbsp;
          <Base1000Text variant="h4_B">{`#${checkWords[2].index + 1}`}</Base1000Text>
        </TopContainer>
        <ButtonRow>
          {mnemonicRows.thirdRowWords.map((item) => (
            <MnemonicButton
              key={item}
              isSelected={thirdSelectedMnemonic === item}
              onClick={() => {
                setThirdSelectedMnemonic(item);
                onClickThirdAnswer(item);
              }}
              variant="primaryHoverGray"
            >
              <Base1300Text variant="b3_M">{item}</Base1300Text>
            </MnemonicButton>
          ))}
        </ButtonRow>
      </ThirdRow>
    </Container>
  );
}

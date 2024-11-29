import { Container, IndexText, TextContainer, WordText } from './styled';

type MnemonicWordProps = {
  index: number;
  word: string;
  isViewMnemonic?: boolean;
};

export default function MnemonicWord({ index, word, isViewMnemonic }: MnemonicWordProps) {
  console.log('🚀 ~ MnemonicWord ~ isViewMnemonic:', isViewMnemonic);

  return (
    <Container>
      <TextContainer>
        <IndexText variant="h5n_M">{index}</IndexText>
        <WordText variant="b3_M">{word}</WordText>
      </TextContainer>
    </Container>
  );
}

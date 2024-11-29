import { Container, IndexText, IndexTextContainer, TextContainer, WordText, WordTextContainer } from './styled';

type MnemonicWordProps = {
  index: number;
  word: string;
  isViewMnemonic?: boolean;
};

export default function MnemonicWord({ index, word, isViewMnemonic }: MnemonicWordProps) {
  return (
    <Container>
      <TextContainer>
        <IndexTextContainer>
          <IndexText variant="h5n_M">{index}</IndexText>
        </IndexTextContainer>
        <WordTextContainer>
          <WordText variant="b3_M" is-view-mnemonic={isViewMnemonic}>
            {word}
          </WordText>
        </WordTextContainer>
      </TextContainer>
    </Container>
  );
}

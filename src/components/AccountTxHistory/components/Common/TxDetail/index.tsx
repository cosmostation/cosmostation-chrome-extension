import { BottomRowLeftContainer, RowContainer, RowLeftContainer, RowRightContainer, TxButton } from './styled';

type TxDetailProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  leftTop?: JSX.Element;
  leftBottom?: JSX.Element;
  rightTop?: JSX.Element;
  rightBottom?: JSX.Element;
};

export default function TxDetail({ leftTop, leftBottom, rightTop, rightBottom, ...remainder }: TxDetailProps) {
  return (
    <TxButton {...remainder}>
      <RowContainer>
        <RowLeftContainer>{leftTop}</RowLeftContainer>
        <RowRightContainer>{rightTop}</RowRightContainer>
      </RowContainer>
      <RowContainer>
        <BottomRowLeftContainer>{leftBottom}</BottomRowLeftContainer>
        <RowRightContainer>{rightBottom}</RowRightContainer>
      </RowContainer>
    </TxButton>
  );
}

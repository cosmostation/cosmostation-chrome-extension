import { formatDateForHistory } from '@/utils/date';

import { Container, DateContainer, DateDivider, DateText } from './styled';

import CalendarIcon from '@/assets/images/icons/Calendar14.svg';

type DateLineProps = {
  date: string;
};

export default function DateLine({ date }: DateLineProps) {
  const formattedDate = formatDateForHistory(date);

  return (
    <Container>
      <DateDivider />
      <DateContainer>
        <CalendarIcon />
        <DateText variant="h7n_R">{formattedDate}</DateText>
      </DateContainer>
      <DateDivider />
    </Container>
  );
}

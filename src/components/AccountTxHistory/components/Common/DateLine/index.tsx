import { Container, DateContainer, DateDivider, DateText } from './styled';

import CalendarIcon from '@/assets/images/icons/Calendar14.svg';

type DateLineProps = {
  date: string;
  hideCalendarIcon?: boolean;
};

export default function DateLine({ date, hideCalendarIcon = false }: DateLineProps) {
  return (
    <Container>
      <DateDivider />
      <DateContainer>
        {hideCalendarIcon ? null : <CalendarIcon />}
        <DateText variant="h7n_R">{date}</DateText>
      </DateContainer>
      <DateDivider />
    </Container>
  );
}

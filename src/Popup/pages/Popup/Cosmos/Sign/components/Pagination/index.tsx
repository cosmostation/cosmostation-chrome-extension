import { Typography } from '@mui/material';

import { Button, Container, PageContainer } from './styled';

import ArrowBack from '~/images/icons/ArrowBack.svg';
import ArrowForward from '~/images/icons/ArrowForward.svg';

type PaginationProps = {
  currentPage: number;
  totalPage: number;
  onChange: (nextPage: number) => void;
};

export default function Pagination({ currentPage, totalPage, onChange }: PaginationProps) {
  return (
    <Container>
      <Button type="button" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
        <ArrowBack />
      </Button>
      <PageContainer>
        <Typography variant="h6">
          {currentPage} / {totalPage}
        </Typography>
      </PageContainer>
      <Button type="button" disabled={currentPage === totalPage} onClick={() => onChange(currentPage + 1)}>
        <ArrowForward />
      </Button>
    </Container>
  );
}

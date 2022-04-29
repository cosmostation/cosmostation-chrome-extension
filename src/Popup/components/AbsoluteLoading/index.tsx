import { Loading, StyledCircularProgress } from './styled';

type AbsoluteLoadingProps = {
  className?: string;
  size?: string;
};

export default function AbsoluteLoading({ className, size }: AbsoluteLoadingProps) {
  return (
    <Loading className={className}>
      <StyledCircularProgress size={size} />
    </Loading>
  );
}

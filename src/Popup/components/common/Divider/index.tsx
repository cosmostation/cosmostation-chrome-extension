import { StyledDivider } from './styled';

type DividerProps = {
  className?: string;
};

export default function Divider({ className }: DividerProps) {
  return <StyledDivider className={className} />;
}

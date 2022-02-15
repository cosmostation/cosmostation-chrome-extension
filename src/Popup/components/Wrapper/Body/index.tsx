import { Body as BaseBody } from './styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Body({ children }: LayoutProps) {
  return <BaseBody>{children}</BaseBody>;
}

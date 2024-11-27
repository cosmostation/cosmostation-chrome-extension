import { PopupLayout } from './styled';

type AppLayoutProps = {
  children: JSX.Element;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <PopupLayout>{children}</PopupLayout>;
}

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';

import { Body as BaseBody, Container } from './styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Body({ children }: LayoutProps) {
  const { chromeStorage } = useChromeStorage();
  const { inMemory } = useInMemory();
  return (
    <BaseBody>
      <Container>{children}</Container>
    </BaseBody>
  );
}

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';

import { Body, Container } from './styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { chromeStorage } = useChromeStorage();
  const { inMemory } = useInMemory();
  return (
    <Body>
      <Container>
        {children}
        <div>
          <div style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', width: '30rem' }}>
            {JSON.stringify(chromeStorage, undefined, 3)}
          </div>
          <div style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', width: '30rem' }}>
            {JSON.stringify(inMemory, undefined, 3)}
          </div>
        </div>
      </Container>
    </Body>
  );
}

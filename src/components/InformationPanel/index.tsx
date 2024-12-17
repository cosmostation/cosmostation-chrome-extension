import { BodyText, Container, TopContainer } from './styled';

import InformationIcon from '@/assets/images/icons/InforMation14.svg';

type InformationPanelProps = {
  title: JSX.Element;
  body: JSX.Element;
  varitant: 'caution' | 'info' | 'error';
  children?: React.ReactNode;
  icon?: JSX.Element;
};

export default function InformationPanel({ title, body, varitant, icon, children }: InformationPanelProps) {
  const displayedIcon = (() => {
    if (icon) {
      return icon;
    }

    return <InformationIcon />;
  })();

  return (
    <Container>
      <TopContainer variant={varitant}>
        {displayedIcon}
        {title}
      </TopContainer>
      <BodyText>{body}</BodyText>
      {children}
    </Container>
  );
}

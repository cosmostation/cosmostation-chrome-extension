import Body from './Body';
import Init from './Init';
import Routes from './Routes';

type WrapperType = {
  children: JSX.Element;
};

export default function Wrapper({ children }: WrapperType) {
  return (
    <Body>
      <Init>
        <Routes>{children}</Routes>
      </Init>
    </Body>
  );
}

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter/index.tsx';

import { Container } from './-styled.tsx';

type EntryProps = {
  coinId: string;
  txHash: string;
};

export default function Entry({ coinId, txHash }: EntryProps) {
  console.log('🚀 ~ Entry ~ coinId:', coinId);
  console.log('🚀 ~ Entry ~ txHash:', txHash);

  return (
    <>
      <BaseBody>
        <Container>
          <>f</>
        </Container>
      </BaseBody>
      <BaseFooter>
        <>fd</>
      </BaseFooter>
    </>
  );
}

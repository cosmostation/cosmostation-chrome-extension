import { useUpdateAddress } from '@/hooks/update/useUpdateAddress';
import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import { useUpdateBaseData } from '@/hooks/update/useUpdateParams';

type RefetchControllerProps = {
  children: JSX.Element;
};

export default function RefetchController({ children }: RefetchControllerProps) {
  useUpdateBaseData();
  useUpdateAddress();
  useUpdateBalance();

  return <>{children}</>;
}

import { useUpdateAddress } from '@/hooks/update/useUpdateAddress';
import { useUpdateAutoLockAt } from '@/hooks/update/useUpdateAutoLockAt';
import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import { useUpdateBaseData } from '@/hooks/update/useUpdateParams';

type RefetchControllerProps = {
  children: JSX.Element;
};

export default function RefetchController({ children }: RefetchControllerProps) {
  useUpdateBaseData();
  useUpdateAddress();
  useUpdateBalance();
  useUpdateAutoLockAt();

  return <>{children}</>;
}

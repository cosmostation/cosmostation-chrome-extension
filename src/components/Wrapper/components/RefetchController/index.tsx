import { useTxWatcher } from '@/hooks/common/useTxWatcher';
import { useUpdateAccountInfo } from '@/hooks/update/useUpdateAccountInfo';
import { useUpdateAddress } from '@/hooks/update/useUpdateAddress';
import { useUpdateAutoLockAt } from '@/hooks/update/useUpdateAutoLockAt';
import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import { useUpdateBaseData } from '@/hooks/update/useUpdateParams';
import { useUpdateStaking } from '@/hooks/update/useUpdateStaking';

type RefetchControllerProps = {
  children: JSX.Element;
};

export default function RefetchController({ children }: RefetchControllerProps) {
  useUpdateBaseData();
  useUpdateAddress();
  useUpdateBalance();
  useUpdateStaking();
  useUpdateAccountInfo();
  useUpdateAutoLockAt();
  useTxWatcher();

  return <>{children}</>;
}

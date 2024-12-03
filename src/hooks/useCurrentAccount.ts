import { useCurrentAccountStore } from '@/zustand/hooks/useCurrentAccountStore';

export function useCurrentAccount() {
  const { account, updateCurrentAccount } = useCurrentAccountStore((state) => state);

  const currentAccount = account;

  const setCurrentAccount = async (id: string) => {
    await updateCurrentAccount(id);
  };

  return { currentAccount, setCurrentAccount };
}

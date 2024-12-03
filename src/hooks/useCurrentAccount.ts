import { useCurrentAccountStore } from '@/zustand/hooks/useCurrentAccountStore';

export function useCurrentAccount() {
  const { account, updateCurrentAccount, removeAccount: deleteAccount } = useCurrentAccountStore((state) => state);

  const currentAccount = account;

  const setCurrentAccount = async (id: string) => {
    await updateCurrentAccount(id);
  };

  const removeAccount = async (id: string) => {
    await deleteAccount(id);
  };

  return { currentAccount, setCurrentAccount, removeAccount };
}

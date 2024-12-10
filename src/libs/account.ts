import type { Account, AccountAddress } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { aesDecrypt } from '@/utils/crypto';
import { getExtensionLocalStorage, getExtensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';

export async function getAccount(id: string) {
  const { accounts } = await chrome.storage.local.get<ExtensionStorage>('accounts');

  const account = accounts?.find((account) => account.id === id);

  if (!account) {
    throw new Error('Account not found');
  }

  return account;
}

export async function getPassword() {
  const password = await getExtensionSessionStorage('password');

  if (!password) {
    throw new Error('Password not found');
  }

  const { encryptedPassword, key, timestamp } = password;

  const decryptedPassword = aesDecrypt(encryptedPassword, `${key}${timestamp}`);

  return decryptedPassword;
}

// test
export async function addAccount(account: Account) {
  const storedAccounts = await getExtensionLocalStorage('accounts');

  const updatedAccounts = [...storedAccounts, account];

  await setExtensionLocalStorage('accounts', updatedAccounts);
}

export async function getAccountAddress(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-address`);

  const address = storage[`${id}-address`];

  return address;
}

// test chainId와 chainType이 중복되는 리스트를 반환하는 함수 => accountType이 여러개인
export async function getTest(id: string) {
  const addresses = await getAccountAddress(id);
  const params = await getExtensionLocalStorage('paramsV11');

  const aa = Object.values(params);

  const aaa = aa.filter((item) => {
    if (item.params.chainlist_params?.account_type) {
      if (item.params.chainlist_params.account_type.length > 1) {
        return true;
      }
    } else {
      return false;
    }
  });

  const aaaa = addresses.filter((item) =>
    aaa.some((i) => i.params.chainlist_params.api_name === item.chainId && i.params.chainlist_params.chain_type.includes(item.chainType)),
  );

  const aaaaa = aaaa.reduce(
    (acc, item) => {
      const { chainId } = item;

      // 만약 acc에 해당 chainId가 없다면, 빈 배열로 초기화
      if (!acc[chainId]) {
        acc[chainId] = [];
      }

      // chainId와 chainType이 같은 항목을 배열에 추가
      acc[chainId].push(item);

      return acc;
    },
    {} as Record<string, AccountAddress[]>,
  );
  // TODO 카바같은경우 chainType이 evm인 아이템도 포함되어있음.
  // TODO 1. 어카운트 타입이 2개 인 아이템에서 서로 다른 chainType을 가졌다면 해당 키 삭제
  // TODO 2. 어카운트 타입이 3개 이상인 아이템에서 서로 다른 chainType을 가졌다면  소수 chainType을 가진 아이템 삭제

  console.log('🚀 ~ aaaaa ~ aaaaa:', aaaaa);
}

// paramsv11에서 accountType이 여러개인 아이템 필터링,

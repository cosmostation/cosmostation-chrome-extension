import type { AddressInfo } from '@/types/extension';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useAddressBook() {
  const { addressBookList, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const addAddressItem = async (addressItem: AddressInfo) => {
    const storedAddressBookList = await getExtensionLocalStorage('addressBookList');

    const updatedAddressBookList = [...storedAddressBookList, addressItem];

    await updateExtensionStorageStore('addressBookList', updatedAddressBookList);
  };

  const removeAddressItem = async (id: string) => {
    const storedAddressBookList = await getExtensionLocalStorage('addressBookList');
    const updatedAddressBookList = storedAddressBookList.filter((item) => item.id !== id);

    await updateExtensionStorageStore('addressBookList', updatedAddressBookList);
  };

  const editAddressItem = async (addressItem: AddressInfo) => {
    const storedAddressBookList = await getExtensionLocalStorage('addressBookList');

    const updatedAddressBookList = storedAddressBookList.map((item) => {
      if (item.id === addressItem.id) {
        return addressItem;
      }

      return item;
    });

    await updateExtensionStorageStore('addressBookList', updatedAddressBookList);
  };

  return { addressBookList, addAddressItem, removeAddressItem, editAddressItem };
}

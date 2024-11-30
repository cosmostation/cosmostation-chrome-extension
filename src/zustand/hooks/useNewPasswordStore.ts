import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import type { NewPasswordState, NewPasswordStore } from '@/types/store/newPassword';
import { aesEncrypt } from '@/utils/crypto';

const initialState: NewPasswordState = {
  password: '',
  key: '',
  timestamp: 0,
};

export const useNewPasswordStore = create<NewPasswordStore>()((set) => ({
  ...initialState,
  updateNewPassword: async (password) => {
    set((state) =>
      produce(state, (draft) => {
        const timestamp = new Date().getTime();
        const key = uuidv4();
        const encryptedPassword = aesEncrypt(password, `${key}${timestamp}`);

        draft.key = key;
        draft.password = encryptedPassword;
        draft.timestamp = timestamp;
      }),
    );
  },
}));

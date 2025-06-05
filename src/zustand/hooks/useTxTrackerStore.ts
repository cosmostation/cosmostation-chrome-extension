import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { UniqueChainId } from '@/types/chain';

export type TrackedTx = {
  txHash: string;
  chainId: UniqueChainId;
  address: string;
  addedAt: number;
  retryCount: number;
  type?: 'staking' | 'send' | 'nft';
};

type TxTrackerState = {
  txs: TrackedTx[];
  addTx: (tx: TrackedTx) => void;
  removeTx: (txHash: string) => void;
  updateTx: (txHash: string, partial: Partial<TrackedTx>) => void;
};

export const useTxTrackerStore = create<TxTrackerState>()(
  immer((set) => ({
    txs: [],
    addTx: (tx) =>
      set((state) => {
        const exists = state.txs.some((t) => t.txHash === tx.txHash && t.chainId === tx.chainId);
        if (!exists) {
          state.txs.push(tx);
        }
      }),
    removeTx: (txHash) =>
      set((state) => {
        state.txs = state.txs.filter((tx) => tx.txHash !== txHash);
      }),
    updateTx: (txHash, partial) =>
      set((state) => {
        const tx = state.txs.find((tx) => tx.txHash === txHash);
        if (!tx) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { txHash: _, ...rest } = partial;
        Object.assign(tx, rest);
      }),
  })),
);

import Lottie from 'lottie-react';

import { useLoadingOverlayStore } from '@/zustand/hooks/useLoadingOverlayStore';

import Backdrop from '../components/Backdrop';

import animationData from '@/assets/animation/loading.json';

export default function LoadingOverlay() {
  const isShow = useLoadingOverlayStore((state) => state.loading);

  if (!isShow) {
    return null;
  }

  return (
    <Backdrop>
      <Lottie animationData={animationData} loop={true} />
    </Backdrop>
  );
}

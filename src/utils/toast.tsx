import { toast } from 'react-toastify';

import Toast from '@/components/common/ToastContainer/components/Toast';

export function toastError(title: string) {
  toast.error((toastProps) => {
    return <Toast toastContentProps={toastProps} title={title} />;
  });
}

export function toastSuccess(title: string) {
  toast.success((toastProps) => {
    return <Toast toastContentProps={toastProps} title={title} />;
  });
}

export function toastDefault(title: string) {
  toast((toastProps) => {
    return <Toast toastContentProps={toastProps} title={title} />;
  });
}

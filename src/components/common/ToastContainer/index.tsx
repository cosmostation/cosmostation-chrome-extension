import { StyledToastContainer } from './styled';

import 'react-toastify/dist/ReactToastify.css';

export default function ToastContainer() {
  return (
    <StyledToastContainer limit={3} draggable closeOnClick hideProgressBar={true} icon={false} closeButton={false} autoClose={2000} position="bottom-center" />
  );
}

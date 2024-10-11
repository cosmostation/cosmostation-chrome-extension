import { useLocation } from '@tanstack/react-router';

export default function NotFound() {
  const aa = useLocation();

  console.log('🚀 ~ Index ~ aa:', aa.pathname);

  return (
    <div className="p-2">
      <h3>Not Found!</h3>
    </div>
  );
}

import { useLocation } from '@tanstack/react-router';

export default function Home() {
  const aa = useLocation();

  console.log('🚀 ~ Index ~ aa:', aa.pathname);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}

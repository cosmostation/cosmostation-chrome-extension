import { Route } from '@/routes/profile';
import { Link, useLocation } from '@tanstack/react-router';

export default function Home() {
  const aa = useLocation();

  console.log('🚀 ~ Index ~ aa:', aa.pathname);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link
          to="/"
          className="[&.active]:font-bold"
          activeProps={{
            style: {
              fontWeight: 'bold',
              color: 'purple',
            },
          }}
        >
          {({ isActive }) => {
            return (
              <>
                <span>{isActive ? 'active' : 'inactive'}</span>
              </>
            );
          }}
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          go Home
        </Link>{' '}
        <Link
          to="/layoutB"
          className="[&.active]:font-bold"
          activeProps={{
            style: {
              fontWeight: 'bold',
            },
          }}
        >
          go Layout B
        </Link>{' '}
        {/* NOTE 상위 폴더가 있지만 패스앞단에 안두고 같은 폴더로 구성하고 싶을떄 */}
        <Link to="/testA" className="[&.active]:font-bold">
          go test A
        </Link>{' '}
        <Link to="/profile" className="[&.active]:font-bold">
          go profile index
        </Link>{' '}
        <Link to="/profile/profileA" className="[&.active]:font-bold">
          go profile/profileA
        </Link>{' '}
        {/* NOTE 플레인 스트링값 사용 지양 원할때 */}
        <Link to={Route.to} className="[&.active]:font-bold">
          go profile/profileA with Route.to
        </Link>{' '}
        {/* NOTE 동적 링크 */}
        <Link to="/posts/$postId" className="[&.active]:font-bold" params={{ postId: 'testId' }}>
          pass params postId(testId)
        </Link>{' '}
        <Link
          to="/search"
          className="[&.active]:font-bold"
          search={{
            q: 'test',
            page: '1',
            list: ['a', 'b'],
            json: { a: 'a', b: 'b' },
          }}
        >
          use search query
        </Link>{' '}
      </div>
    </div>
  );
}

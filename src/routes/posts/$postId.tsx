import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  component: PostsPostId,
  beforeLoad: async () => {
    return {
      beforeLoad: 'pass from beforeLoad',
    };
  },
  loader: async ({ params, context }) => {
    const aaa = context.beforeLoad;

    return {
      postId123: params.postId,
      getBeforeLoad: aaa,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
});

function PostsPostId() {
  const { postId } = Route.useParams();
  const { postId123, getBeforeLoad } = Route.useLoaderData();

  return (
    <div>
      Post ID: {postId}
      <>loaderData: {postId123}</>
      <>loaderData: {getBeforeLoad}</>
    </div>
  );
}

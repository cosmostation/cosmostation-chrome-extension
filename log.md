# 로그

## vite 컨피규레이션

### 환경 변수 설정

환경변수를 정의합니다. vite-env.d.ts 파일에 정의해놓아야 타입스크립트에서 오류가 발생하지 않습니다.

```ts
define: {
  __APP_BROWSER__: JSON.stringify('chrome'),
  __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  __APP_MODE__: JSON.stringify(mode),
  __APP_DEV_WEBSOCKET_PORT__: JSON.stringify(webSocketPort),
},
```

---

## 라우터 설정

라우터 설정값 초기화, 프리로딩 + 캐싱 옵션값 설정가능

```ts
const router = createRouter({
  routeTree,
  history: createHashHistory(),
});
```

- \_\_root.tsx 이 파일은 다른 라우트들의 엔트리 포인트 역할을 하는 파일, 다른 루트들을 모두 랩하는 역할
- createRootRoute에 component로 넘어가는 컴포넌트에는 전역적으로 적용되는 컴포넌트들을 넣어주면 된다.

- `<Outlet />` 여기에는 자식 라우트('/', '/about')들이 렌더링됨

이것을 사용하는 이유

```ts
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

TanStack Router provides amazing support for TypeScript, even for things you wouldn't expect like bare imports straight from the library! To make this possible, you must register your router's types using TypeScripts' Declaration Merging feature. This is done by extending the Register interface on @tanstack/react-router with a router property that has the type of your router instance:

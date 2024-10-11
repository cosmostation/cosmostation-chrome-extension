import './App.css';

import { lazy } from 'react';

const Compom = lazy(() => import('./Compom'));

function App() {
  return <Compom />;
}

export default App;

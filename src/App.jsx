import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/AuthPage/AuthPage';
import LandingPage from './pages/LandingPage/LandingPage';

function App() {

  return (
    <>
      <Routes>
        <Route path = '/' element = {<HomePage />} />
        <Route path = '/auth' element = {<AuthPage />} />
        <Route path = '/LandingPage' element = {<LandingPage />} />
      </Routes>

    </>
  );
}

export default App;

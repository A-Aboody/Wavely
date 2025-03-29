import { Route, Routes } from 'react-router-dom';
import CreatePage from './pages/CreatePage/CreatePage';
import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/AuthPage/AuthPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import UploadsPage from './pages/UploadsPage/UploadsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import PageLayout from './layouts/PageLayout/PageLayout';
import { NavbarProvider } from './context/NavbarContext';

function App() {
  return (
    <NavbarProvider>
      <PageLayout>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/create' element={<CreatePage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/uploads' element={<UploadsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/auth' element={<AuthPage />} />
        </Routes>
      </PageLayout>
    </NavbarProvider>
  );
}

export default App;
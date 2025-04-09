import { Route, Routes } from 'react-router-dom';
import CreatePage from './pages/CreatePage/CreatePage';
import HomePage from './pages/HomePage/HomePage';
import AuthPage from './pages/AuthPage/AuthPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import UploadsPage from './pages/UploadsPage/UploadsPage';
import InboxPage from './pages/InboxPage/InboxPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import PageLayout from './layouts/PageLayout/PageLayout';
import { NavbarProvider } from './context/NavbarContext';
import { WaveProvider } from './context/WaveContext';
import { ProfileProvider } from './context/ProfileContext';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <WaveProvider>
        <NavbarProvider>
          <ProfileProvider>
            <PageLayout>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/create' element={<CreatePage />} />
                <Route path="/profile/:username?" element={<ProfilePage />} />
                <Route path='/uploads' element={<UploadsPage />} />
                <Route path='/inbox' element={<InboxPage />} />
                <Route path='/settings' element={<SettingsPage />} />
                <Route path='/auth' element={<AuthPage />} />
              </Routes>
            </PageLayout>
          </ProfileProvider>
        </NavbarProvider>
      </WaveProvider>
    </UserProvider>
  );
}

export default App;
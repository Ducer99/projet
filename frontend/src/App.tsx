import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSimple from './pages/RegisterSimple';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from './pages/CompleteProfile';
import FamilyAttachment from './pages/FamilyAttachment';
import ForgotPassword from './pages/ForgotPassword';
import FamilySetup from './pages/FamilySetup';
import Dashboard from './pages/Dashboard';
import FamilyTreeVisualization from './pages/FamilyTreeVisualization';
import RelationsExplainer from './pages/RelationsExplainer';
import PersonProfile from './pages/PersonProfile';
import PersonsList from './pages/PersonsList';
import PublicPersonsList from './pages/PublicPersonsList';
import MyProfile from './pages/MyProfile';
import AddMember from './pages/AddMember';
import EditMember from './pages/EditMember';
import EventsCalendar from './pages/EventsCalendar';
import EventForm from './pages/EventForm';
import WeddingsList from './pages/WeddingsList';
import WeddingForm from './pages/WeddingForm';
import AlbumsList from './pages/AlbumsList';
import AlbumDetail from './pages/AlbumDetail';
import AlbumForm from './pages/AlbumForm';
import PollsList from './pages/PollsList';
import PollDetail from './pages/PollDetail';
import CreatePoll from './pages/CreatePoll';
import LanguageSettings from './pages/LanguageSettings';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Box minH="100vh">
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-simple" element={<RegisterSimple />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/family-attachment" element={<FamilyAttachment />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/family-setup" element={<FamilySetup />} />
            <Route path="/find-id" element={<PublicPersonsList />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/family-tree"
              element={
                <PrivateRoute>
                  <FamilyTreeVisualization />
                </PrivateRoute>
              }
            />
            <Route
              path="/relations-explainer"
              element={
                <PrivateRoute>
                  <RelationsExplainer />
                </PrivateRoute>
              }
            />
            <Route
              path="/persons"
              element={
                <PrivateRoute>
                  <PersonsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/person/:id"
              element={
                <PrivateRoute>
                  <PersonProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <PrivateRoute>
                  <MyProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/language-settings"
              element={
                <PrivateRoute>
                  <LanguageSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-member"
              element={
                <PrivateRoute>
                  <AddMember />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-member/:id"
              element={
                <PrivateRoute>
                  <EditMember />
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <EventsCalendar />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/new"
              element={
                <PrivateRoute>
                  <EventForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/edit/:id"
              element={
                <PrivateRoute>
                  <EventForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/weddings"
              element={
                <PrivateRoute>
                  <WeddingsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/weddings/new"
              element={
                <PrivateRoute>
                  <WeddingForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/weddings/edit/:id"
              element={
                <PrivateRoute>
                  <WeddingForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums"
              element={
                <PrivateRoute>
                  <AlbumsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums/new"
              element={
                <PrivateRoute>
                  <AlbumForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums/:id"
              element={
                <PrivateRoute>
                  <AlbumDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/polls"
              element={
                <PrivateRoute>
                  <PollsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/polls/create"
              element={
                <PrivateRoute>
                  <CreatePoll />
                </PrivateRoute>
              }
            />
            <Route
              path="/polls/:id"
              element={
                <PrivateRoute>
                  <PollDetail />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </AuthProvider>
    </Router>
  );
}

export default App;

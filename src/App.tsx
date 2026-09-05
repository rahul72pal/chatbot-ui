import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout wrappers
import AppLayout from './layouts/AppLayout';

// Protection Wrapper
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LLMSetup from './pages/LLMSetup';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import Documents from './pages/Documents';
import ApiModels from './pages/ApiModels';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import DedicatedPreview from './pages/DedicatedPreview';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public SaaS Home & Authentication & Standalone Preview Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        <Route path="/preview/:botId" element={<DedicatedPreview />} />
        <Route path="/chatbot/:botId/preview" element={<DedicatedPreview />} />
        
        {/* LLM Setup Intermediary Route */}
        <Route 
          path="/llm-setup" 
          element={
            <ProtectedRoute>
              <LLMSetup />
            </ProtectedRoute>
          } 
        />

        {/* Private Workspace Application Layout */}
        <Route 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chatbots" element={<Dashboard />} />
          <Route path="builder" element={<Builder />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="conversations/:conversationId" element={<ConversationDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="api-models" element={<ApiModels />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

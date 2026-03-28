
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FormView from './pages/FormView';
import Responses from './pages/Responses';
import Templates from './pages/Templates';
import MyForms from './pages/MyForms';
import AllResponses from './pages/AllResponses';
import Settings from './pages/Settings';
import './App.css'; // You can keep this or remove if index.css is enough

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/form/:id" element={<FormView />} />
        <Route path="/form/:id/responses" element={<Responses />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/forms" element={<MyForms />} />
        <Route path="/responses" element={<AllResponses />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<Navigate to="/login" replace />} />
        {/* Default route redirects to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

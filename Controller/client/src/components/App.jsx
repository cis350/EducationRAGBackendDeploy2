import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from '../api/ThemeContext';
import Signup from '../api/Signup';
import Login from '../api/Login';
import Chat from './Chat';
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FAQ from './FAQ'; // Import the FAQ component


/**
 * The main application component that sets up the routing and global theme context.
 * Includes protected and public routes.
 * 
 * @returns {JSX.Element} The application component structured with a theme provider and router.
 */
function App() {
  return (
    <div>
      <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Login />} />
          <Route path='/faq' element={<FAQ />} />
          <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} /> {/* Protect this route */}
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
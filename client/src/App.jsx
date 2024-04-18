import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './ThemeContext';
import Signup from './Signup';
import Login from './Login';
import Chat from './Chat';
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FAQ from './FAQ'; // Import the FAQ component

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
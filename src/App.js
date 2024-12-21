import logo from './logo.svg';
import './App.css';
import LoginPage from './Components/Auth/LoginPage'
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from './Components/Auth/Register';

function App() {
  const [authorized, setAuthorized] = useState(false);

  // {authenticated && <Route path="/authorizedContent" element={<AuthContent/>} />}

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

      </Routes>
    </div>
  );
}

export default App;

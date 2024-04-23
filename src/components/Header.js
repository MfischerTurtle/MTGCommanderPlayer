import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { storeTokenInSession, clearTokenFromSession } from '../utils/tokenUtils';
import '../../src/App.css'; 

let BASE_URL = process.env.REACT_APP_BASE_URL; 

if (process.env.NODE_ENV === 'development') {
  BASE_URL = process.env.REACT_APP_BASE_URL;
} else {
  BASE_URL = process.env.APTIBLE_MONGODB_URI;
}

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const checkLoginStatus = async () => {
    try {
      const token = sessionStorage.getItem('token'); 
      console.log('Retrieved token:', token); 
  
      const response = await axios.get(`${BASE_URL}/check-login`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      
      setIsLoggedIn(response.data.isLoggedIn);
    } catch (error) {
      console.error('this didnt work:', error);
    }
  };
  
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
    
      await axios.post(`${BASE_URL}/logout`);
  
      clearTokenFromSession();
  
      setIsLoggedIn(false); 
    } catch (error) {
      console.error('Error logging out:', error);
      setErrorMessage('Error logging out');
    }
  };

  const handleLogin = () => {
    setShowModal(true); 
  };

  const handleLoginSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username: username,
        password: password
      });
      console.log('Login response:', response); 
      if (response && response.data && response.data.token) {
        console.log('Login successful'); 
        setIsLoggedIn(true); 
        setShowModal(false); 
        storeTokenInSession(response.data.token);
        console.log('Token stored in session:', response.data.token); 
        window.location.href = `/profile/${username}`;
      } else {
        console.error('Login failed:', response); 
        setErrorMessage('Login failed. Please try again.'); 
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <li>
              <button onClick={handleLogin}>Login</button>
            </li>
          )}
        </ul>
      </nav>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Login</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLoginSubmit}>Login</button>
          </div>
        </div>
      )}
    </header>
    
  );
};

export default Header;

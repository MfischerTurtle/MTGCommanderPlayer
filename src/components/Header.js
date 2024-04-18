import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { storeTokenInSession, clearTokenFromSession } from '../utils/tokenUtils';
import '../../src/App.css'; 

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const checkLoginStatus = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Retrieve the token from session storage
      console.log('Retrieved token:', token); // Log the retrieved token
  
      const response = await axios.get(`${BASE_URL}/check-login`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
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
      // Make a request to the logout endpoint (if needed)
      await axios.post(`${BASE_URL}/logout`);
  
      // Clear the token from session storage
      clearTokenFromSession();
  
      // Update the state to reflect logged out state
      setIsLoggedIn(false); // Assuming setIsLoggedIn is a state updater function
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
      console.log('Login response:', response); // Log the response object
      if (response && response.data && response.data.token) {
        console.log('Login successful'); 
        setIsLoggedIn(true); 
        setShowModal(false); 
        storeTokenInSession(response.data.token); // Store the token in session storage
        console.log('Token stored in session:', response.data.token); // Log the token
        // Redirect to profile page with the username
        window.location.href = `/profile/${username}`;
      } else {
        console.error('Login failed:', response); // Log the response if it doesn't contain the expected data
        setErrorMessage('Login failed. Please try again.'); // Set a generic error message
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

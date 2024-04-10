import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Replace this with your backend URL

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, {
        username: username,
        password: password
      });
      console.log(response.data.message); // Output success message
      // Optionally, you can redirect the user to another page after successful registration
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username: username,
        password: password
      });
      console.log(response.data.message); // Output success message
      // Optionally, you can redirect the user to another page after successful login
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const SignUp = () => {
  return (
    <div>
      <Register />
      <Login />
    </div>
  );
};

export default SignUp;

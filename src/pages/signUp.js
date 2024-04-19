import React, { useState } from 'react';
import axios from 'axios';

let BASE_URL = process.env.APTIBLE_APP_BASE_URL; 

if (process.env.NODE_ENV === 'development') {
 
BASE_URL = process.env.REACT_APP_BASE_URL;
  
}; 
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
      console.log(response.data.message); 
    } catch (error) {
      console.error('Error registering user:', error);
      const errorMessage = error.response?.data?.error || 'An unknown error occurred';
      setErrorMessage(errorMessage);
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


const SignUp = () => {
  return (
    <div>
      <Register />
    </div>
  );
};

export default SignUp;

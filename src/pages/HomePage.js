import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Homepage</h1>
      <p>This is a simple homepage for your React application.</p>
      <Link to="/search">Go to Search Page</Link>
      <Link to="/signup">Sign Up today</Link>
    </div>
  );
};

export default HomePage;
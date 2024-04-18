import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext'
import Header from './components/Header';
import Home from './pages/HomePage';
import CardSearch from './pages/CardSearch';
import SignUp from './pages/signUp';
import Profile from './pages/Profile';
import { isValidToken, } from './utils/tokenUtils'; // Import token utility functions

const AppRouter = () => {
  // Check if a valid session token exists on initial load
  useEffect(() => {
    if (!isValidToken()) {
      // Handle token validation logic or redirect to login page if needed
    }
  }, []);

  

  return (
    <Router>
      <AuthProvider>
      <Header /> {/* Pass the handleLogout function to the Header component */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<CardSearch />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile/:username" element={<Profile/>} /> {/* Pass the handleLogout function to the Profile component */}
      </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;


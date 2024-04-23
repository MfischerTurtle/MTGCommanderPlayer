import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext'
import Header from './components/Header';
import Home from './pages/HomePage';
import CardSearch from './pages/CardSearch';
import SignUp from './pages/signUp';
import Profile from './pages/Profile';
import { isValidToken, } from './utils/tokenUtils'; 

const AppRouter = () => {
  useEffect(() => {
    if (!isValidToken()) { 
    }
  }, []);

  

  return (
    <Router>
      <AuthProvider>
      <Header /> 
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


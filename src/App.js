import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/HomePage'; // Update import path
import CardSearch from './pages/CardSearch'; // Update import path

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} /> {/* Use 'element' prop instead of 'component' */}
        <Route path="/search" element={<CardSearch />} /> {/* Use 'element' prop instead of 'component' */}
      </Routes>
    </Router>
  );
};

export default AppRouter;

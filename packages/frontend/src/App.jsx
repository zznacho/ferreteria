import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
        } />
        <Route path="/products" element={
          isAuthenticated ? <Products /> : <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { localDB } from './db/database';
import { syncManager } from './services/syncService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize local database
    localDB.load().then(() => {
      console.log('Local database initialized');
    });

    // Start sync service
    syncManager.startAutoSync();

    return () => {
      syncManager.stopAutoSync();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          } />
          <Route path="/products" element={
            isAuthenticated ? <Products /> : <Navigate to="/login" />
          } />
          <Route path="/sales" element={
            isAuthenticated ? <Sales /> : <Navigate to="/login" />
          } />
          <Route path="/sales/new" element={
            isAuthenticated ? <NewSale /> : <Navigate to="/login" />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import Layout from './components/Layout';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          isAuthenticated ? (
            <Layout>
              <Navigate to="/dashboard" />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/products" element={
          isAuthenticated ? (
            <Layout>
              <Products />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/sales" element={
          isAuthenticated ? (
            <Layout>
              <Sales />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/sales/new" element={
          isAuthenticated ? (
            <Layout>
              <NewSale />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
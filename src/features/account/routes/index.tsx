import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { MyAccount } from '../components/MyAccount';

export const AccountRoutes = () => {
  return (
    <Routes>
      <Route index element={<MyAccount />} />
    </Routes>
  );
};
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { InventoryControl } from '../components/InventoryControl';

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<InventoryControl />} />
    </Routes>
  );
};
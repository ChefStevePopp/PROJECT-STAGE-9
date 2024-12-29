import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { TeamManagement } from '../components/TeamManagement';

export const TeamRoutes = () => {
  return (
    <Routes>
      <Route index element={<TeamManagement />} />
    </Routes>
  );
};

export default TeamRoutes;
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ScheduleManager } from "../components/sections/ScheduleManager";

export const ScheduleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ScheduleManager />} />
    </Routes>
  );
};

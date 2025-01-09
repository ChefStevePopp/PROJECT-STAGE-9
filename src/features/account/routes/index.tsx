import React from "react";
import { Routes, Route } from "react-router-dom";
import { MyAccount } from "../components/MyAccount";

export const AccountRoutes: React.FC = () => {
  console.log("AccountRoutes mounted"); // Debug log
  return (
    <Routes>
      <Route path="/" element={<MyAccount />} />
    </Routes>
  );
};

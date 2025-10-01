// src/pages/DashboardPage.tsx
import React from "react";
import UserDashboard from "./DashboardUser/UserDashboard";

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Aquí puedes añadir un Navbar o Sidebar global */}
      <UserDashboard />
    </div>
  );
};

export default DashboardPage;

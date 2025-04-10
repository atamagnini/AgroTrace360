/* eslint-disable */

'use client';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Campo from './pages/addFields';
import Landing from './pages/welcome';
import OverviewField from "./pages/overviewField";
import Crops from "./pages/crops";
import Catalogue from "./pages/catalogue";
import Tracking from "./pages/tracking";
import Reports from "./pages/reports";
import Calendar from "./pages/calendar";
import CropDetails from "./pages/crop-details";
import Dashboard from "./pages/dashboard";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /* if (!isClient) {
    return null;
  } */

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/:id/addFields" element={<Campo />} />
        <Route path="/:id/overviewField" element={<OverviewField />} />
        <Route path="/:id/crops" element={<Crops />} />
        <Route path="/:id/catalogue" element={<Catalogue />} />
        <Route path="/:id/tracking" element={<Tracking />} />
        <Route path="/:id/reports" element={<Reports />} />
        <Route path="/:id/calendar" element={<Calendar />} />
        <Route path="/:id/dashboard" element={<Dashboard />} />
        <Route path="/:id/crop-details/:cropId" element={<CropDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
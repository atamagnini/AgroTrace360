import Image from "next/image";
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

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  // Enable client-only rendering to prevent SSR issues
  useEffect(() => {
    setIsClient(true); // Ensures this code only runs on the client
  }, []);

  if (!isClient) {
    // If on server, render nothing
    return null;
  }

  // Only one <BrowserRouter> in the app, defined here
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
        <Route path="/:id/crop-details/:cropId" element={<CropDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EnseignantAbsencesPage from './pages/EnseignantAbsencesPage';
import EnseignantJustificationsPage from './pages/EnseignantJustificationsPage';
import EtudiantJustificationsPage from './pages/EtudiantJustificationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/enseignant/absences" element={<EnseignantAbsencesPage />} />
        <Route path="/enseignant/justifications" element={<EnseignantJustificationsPage />} />
        <Route path="/etudiant/justifications" element={<EtudiantJustificationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

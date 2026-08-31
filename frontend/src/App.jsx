import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UnitsPage from './pages/UnitsPage';
import BookingsPage from './pages/BookingsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="page-layout flex-col min-h-screen bg-[#070d1a] text-[#f0f6ff]">
        <Navbar />
        <main className="main-content flex-1">
          <Routes>
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="*" element={<Navigate to="/units" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

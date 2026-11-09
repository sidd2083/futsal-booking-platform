import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Logo } from '@/components/common/Logo';

// Pages
import { HomePage } from '@/pages/public/HomePage';
import { SportSelectPage } from '@/pages/booking/SportSelectPage';
import { FutsalBookingPage } from '@/pages/booking/FutsalBookingPage';
import { OrderDetailsPage } from '@/pages/booking/OrderDetailsPage';
import { CustomerBookingsPage } from '@/pages/customer/CustomerBookingsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';

// Loading screen shown while Firebase Auth initialises (prevents layout flicker)
const AuthLoadingScreen: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-4">
    <Logo size="lg" className="animate-pulse" />
    <div className="flex gap-1.5 mt-2">
      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <p className="text-xs text-surface-400 font-medium tracking-wide">Loading Maya Sports Centre…</p>
  </div>
);

// Inner app — rendered only after auth is ready
const AppInner: React.FC = () => {
  const { loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<SportSelectPage />} />
          <Route path="/book/futsal" element={<FutsalBookingPage />} />
          <Route path="/order/:orderId" element={<OrderDetailsPage />} />
          <Route path="/booking/order/:orderId" element={<OrderDetailsPage />} />
          <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;

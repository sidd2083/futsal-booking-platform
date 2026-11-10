import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { PWAProvider } from '@/context/PWAContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Pages
import { HomePage } from '@/pages/public/HomePage';
import { SportSelectPage } from '@/pages/booking/SportSelectPage';
import { FutsalBookingPage } from '@/pages/booking/FutsalBookingPage';
import { OrderDetailsPage } from '@/pages/booking/OrderDetailsPage';
import { CustomerBookingsPage } from '@/pages/customer/CustomerBookingsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <PWAProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-1 w-full min-w-0 pb-16 md:pb-0">
                <ErrorBoundary>
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
                </ErrorBoundary>
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          </BrowserRouter>
        </PWAProvider>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;

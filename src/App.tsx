import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { PWAProvider } from '@/context/PWAContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ScrollToTop } from '@/components/common/ScrollToTop';

// Immediate Load
import { HomePage } from '@/pages/public/HomePage';

// Code-split Lazy Load for Instant Initial Speed
const SportSelectPage = React.lazy(() =>
  import('@/pages/booking/SportSelectPage').then((m) => ({ default: m.SportSelectPage }))
);
const FutsalBookingPage = React.lazy(() =>
  import('@/pages/booking/FutsalBookingPage').then((m) => ({ default: m.FutsalBookingPage }))
);
const OrderDetailsPage = React.lazy(() =>
  import('@/pages/booking/OrderDetailsPage').then((m) => ({ default: m.OrderDetailsPage }))
);
const CustomerBookingsPage = React.lazy(() =>
  import('@/pages/customer/CustomerBookingsPage').then((m) => ({ default: m.CustomerBookingsPage }))
);
const AdminDashboardPage = React.lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Loading...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <PWAProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-1 w-full min-w-0 pb-16 md:pb-0">
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
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

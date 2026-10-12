import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HospitalityPage } from './pages/HospitalityPage';
import { CatholicMinistryPage } from './pages/CatholicMinistryPage';
import { ProductsPage } from './pages/ProductsPage';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { InquiryPage } from './pages/InquiryPage';
import { NotFoundPage, RouteErrorPage } from './pages/NotFoundPage';

// The staff portal is code-split so public visitors never download it.
const admin = () => import('./pages/admin');

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about/:tab?', element: <AboutPage /> },
      { path: 'hospitality/:section?', element: <HospitalityPage /> },
      { path: 'ministry/:section?', element: <CatholicMinistryPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'inquiry', element: <InquiryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin',
    errorElement: <RouteErrorPage />,
    lazy: async () => ({ Component: (await admin()).AdminRoot }),
    children: [
      { path: 'login', lazy: async () => ({ Component: (await admin()).LoginPage }) },
      { path: 'reset-password', lazy: async () => ({ Component: (await admin()).ResetPasswordPage }) },
      {
        lazy: async () => ({ Component: (await admin()).AdminShell }),
        children: [
          { index: true, lazy: async () => ({ Component: (await admin()).DashboardPage }) },
          { path: 'inquiries', lazy: async () => ({ Component: (await admin()).InquiriesPage }) },
          { path: 'inquiries/:id', lazy: async () => ({ Component: (await admin()).InquiryDetailPage }) },
          { path: 'calendar', lazy: async () => ({ Component: (await admin()).CalendarPage }) },
          { path: 'content/:resource', lazy: async () => ({ Component: (await admin()).ContentPage }) },
          { path: 'staff', lazy: async () => ({ Component: (await admin()).StaffPage }) },
          { path: 'settings', lazy: async () => ({ Component: (await admin()).SettingsPage }) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

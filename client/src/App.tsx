import { lazy, Suspense, useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { LoadingScreen } from './components/LoadingComponents';
import { ErrorBoundary } from './utils/errorTracking';
import { initGA, trackPageView } from './utils/analytics';
import { performanceMonitor } from './utils/performanceMonitoring';

// Lazy load all page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AmazingCalculator = lazy(() => import('./components/MultiStepCalculator'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const IntakePage = lazy(() => import('./pages/IntakePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const GatedIntakePortal = lazy(() => import('./pages/GatedIntakePortal'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EmailTest = lazy(() => import('./pages/EmailTest'));

// Create a loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingScreen />
  </div>
);

function App() {
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const [location] = useLocation();

  // Initialize analytics and monitoring
  useEffect(() => {
    initGA();
    performanceMonitor.initWebVitals();
  }, []);

  // Track page views
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <Switch>
        <Route path="/">
          <LandingPage />
        </Route>
        <Route path="/calculator">
          <AmazingCalculator />
        </Route>
        <Route path="/checkout">
          <CheckoutPage calculationResults={calculationResults} />
        </Route>
        <Route path="/success">
          <SuccessPage />
        </Route>
        <Route path="/intake">
          <IntakePage />
        </Route>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/intake-portal">
          <GatedIntakePortal />
        </Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route>
          {/* 404 fallback */}
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Return to home
              </a>
            </div>
          </div>
        </Route>
        </Switch>
      </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;

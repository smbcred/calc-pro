import { Route, Switch } from 'wouter';
import LandingPage from './pages/LandingPage';
import CreditCalculator from './components/CreditCalculator';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import IntakePage from './pages/IntakePage';
import LoginPage from './pages/LoginPage';
import GatedIntakePortal from './pages/GatedIntakePortal';
import Dashboard from './pages/Dashboard';
import EmailTest from './pages/EmailTest';
import { useState } from 'react';

function App() {
  const [calculationResults, setCalculationResults] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/">
          <LandingPage />
        </Route>
        <Route path="/calculator">
          <CreditCalculator onResultsReady={setCalculationResults} />
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
    </div>
  );
}

export default App;

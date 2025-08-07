import { Route, Switch } from "wouter";
import CreditCalculator from "./components/CreditCalculator";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/">
          <CreditCalculator />
        </Route>
        <Route path="/checkout">
          <CheckoutPage />
        </Route>
        <Route>
          {/* 404 fallback */}
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Return to calculator
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;

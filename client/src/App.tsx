import { Switch, Route, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Integrations from "@/pages/Integrations";
import Settings from "@/pages/Settings";
import RaciMatrix from "@/pages/RaciMatrix";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function App() {
  const [location, setLocation] = useLocation();
  
  // Redirect to RACI Matrix if on the home page
  useEffect(() => {
    if (location === "/") {
      setLocation("/raci-matrix");
    }
  }, [location, setLocation]);
  
  return (
    <>
      <Switch>
        <Route path="/" component={RaciMatrix} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/raci-matrix" component={RaciMatrix} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/settings" component={Settings} />
        <Route path="/help">
          {() => <Redirect to="/raci-matrix" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;

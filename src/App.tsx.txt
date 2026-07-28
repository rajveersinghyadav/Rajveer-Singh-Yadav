import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppProvider } from './lib/state';

// Pages
import ChartPage from './pages/ChartPage';
import QuotesPage from './pages/QuotesPage';
import AiChatPage from './pages/AiChatPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center font-mono">
        <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
        <p className="text-sm text-muted-foreground">System path not found.</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 border border-border rounded hover:bg-secondary transition-colors text-xs uppercase tracking-widest">
          Return to Cockpit
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={ChartPage} />
          <Route path="/quotes" component={QuotesPage} />
          <Route path="/ai" component={AiChatPage} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </AppProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Transactions from './components/Transactions/Transactions';
import Customers from './components/Customers/Customers';
import ExchangeRates from './components/ExchangeRates/ExchangeRates';
import Agents from './components/Agents/Agents';
import WhatsApp from './components/WhatsApp/WhatsApp';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/exchange-rates" element={<ExchangeRates />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

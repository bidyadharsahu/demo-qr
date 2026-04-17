import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QRMenu from './pages/QRMenu';
import DeliveryConnect from './pages/DeliveryConnect';
import Login from './pages/Login';
import OrderingApp from './pages/OrderingApp';
import Pricing from './pages/Pricing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/qr-menu" element={<QRMenu />} />
        <Route path="/connect-online-delivery-portals-to-pos" element={<DeliveryConnect />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu/:tenant" element={<OrderingApp />} />
      </Routes>
      <Footer />
      <ChatbotWidget />
    </>
  );
}

export default App;

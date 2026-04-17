import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QRMenu from './pages/QRMenu';
import DeliveryConnect from './pages/DeliveryConnect';
import Login from './pages/Login';
import OrderingApp from './pages/OrderingApp';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/qr-menu" element={<QRMenu />} />
        <Route path="/connect-online-delivery-portals-to-pos" element={<DeliveryConnect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu/:tenant" element={<OrderingApp />} />
      </Routes>
    </>
  );
}

export default App;

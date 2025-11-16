import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import NotFound from './pages/NotFound';
import './App.css';
import { ThemeProvider } from './components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Minca Inventory
            </Link>
            <div className="flex gap-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/productos"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Productos
              </Link>
              <Link
                to="/inventario"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Inventario
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/inventario" element={<Inventory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    </ThemeProvider>
  );
}

export default App;

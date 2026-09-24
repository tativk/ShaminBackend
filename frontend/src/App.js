import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import { WishlistProvider } from "./context/WishlistContext";


const App = () => {
  return (
    <WishlistProvider>
      <BrowserRouter>

        <ScrollToTop />

        <div className="App">
          <AppRoutes />
        </div>

      </BrowserRouter>
    </WishlistProvider>
  );
};

export default App;
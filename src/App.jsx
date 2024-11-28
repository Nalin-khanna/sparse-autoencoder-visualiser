import { useState } from "react";
import "./App.css";
import SparseAutoencoder from "./Autoencoder";
import { ThemeProvider } from "./context/theme";
function App() {
  return (
    <ThemeProvider>
      <div className="h-screen p-5 overflow-hidden">
        <SparseAutoencoder />
      </div>
    </ThemeProvider>
  );
}

export default App;

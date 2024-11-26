import { useState } from 'react'
import './App.css'
import SparseAutoencoder from './Autoencoder'
function App() {
  return (
    <div className="h-screen overflow-hidden">
      <SparseAutoencoder />
    </div>
  )
}

export default App

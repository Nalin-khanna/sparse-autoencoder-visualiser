import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <p className="mx-auto">
        Sparse Autoencoder Visualiser
      </p>
    </>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  
         <Navbar />
      
      <p className="read-the-docs">
       Powered by Google ADK + A2A
      </p>


    </>
  )
}

export default App

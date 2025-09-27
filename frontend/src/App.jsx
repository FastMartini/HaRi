import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
         <Navbar />
         <Hero />  
        
      <p className="read-the-docs">
       Powered by Google ADK + A2A
      </p>
    </>
  );
}
export default App
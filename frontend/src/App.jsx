import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import RoleSelect from './components/RoleSelect/RoleSelect'
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard'

export default function App() {
  const [stage, setStage] = useState('hero')   // 'hero' | 'role' | 'employee'
  const [anim, setAnim] = useState('in')       // 'in' | 'out'

  function swap(next) {
    setAnim('out')
    setTimeout(() => { setStage(next); setAnim('in') }, 280)
  }

  return (
    <>
      <Navbar />
      <div className={`view ${anim}`}>
        {stage === 'hero' && <Hero onGetStarted={() => swap('role')} />}
        {stage === 'role' && <RoleSelect onSelect={(who) => {
          if (who === 'employee') swap('employee')
          // else if (who === 'employer') swap('employer') // future
        }} />}
        {stage === 'employee' && <EmployeeDashboard />}
      </div>
      <p className="read-the-docs">Powered by Google ADK + A2A</p>
    </>
  )
}

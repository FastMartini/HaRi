import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import RoleSelect from './components/RoleSelect/RoleSelect'
import LockGate from './components/LockGate/LockGate'
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard'
import EmployerDashboard from './components/EmployerDashboard/EmployerDashboard'

export default function App() {
  const [stage, setStage] = useState('hero')   // 'hero' | 'role' | 'lock' | 'employee' | 'employer'
  const [anim, setAnim] = useState('in')
  const swap = (next) => { setAnim('out'); setTimeout(() => { setStage(next); setAnim('in') }, 280) }

  return (
    <>
      <Navbar />
      <div className={`view ${anim}`}>
        {stage==='hero' && <Hero onGetStarted={()=>swap('role')} />}
        {stage==='role' && <RoleSelect onSelect={(w)=>{
          if (w==='employee') swap('lock')
          if (w==='employer') swap('employer')
        }} />}
        {stage==='lock' && <LockGate onUnlock={()=>swap('employee')} />}
        {stage==='employee' && <EmployeeDashboard />}
        {stage==='employer' && <EmployerDashboard />}
      </div>
      <p className="read-the-docs">Powered by Google ADK + A2A</p>
    </>
  )
}
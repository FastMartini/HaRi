import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import RoleSelect from './components/RoleSelect/RoleSelect'
import LockGate from './components/LockGate/LockGate'
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard'
import EmployerDashboard from './components/EmployerDashboard/EmployerDashboard'
import EmployerTest from './components/EmployerTest/EmployerTest'   // NEW

export default function App() {
  const [stage, setStage] = useState('hero') // add 'employerTest' option
  const [anim, setAnim] = useState('in')

  function swap(next){
    setAnim('out')
    setTimeout(()=>{ setStage(next); setAnim('in') }, 280)
  }

  return (
    <>
      <Navbar />
      <div className={`view ${anim}`}>
        {stage==='hero' && <Hero onGetStarted={()=>swap('role')} />}
        {stage==='role' && <RoleSelect onSelect={(w)=>{
          if(w==='employee') swap('lock')
          if(w==='employer') swap('employer')
        }}/>}
        {stage==='lock' && <LockGate onUnlock={()=>swap('employee')} />}
        {stage==='employee' && <EmployeeDashboard />}
        {stage==='employer' && <EmployerDashboard onConfirm={()=>swap('employerTest')} />}
        {stage==='employerTest' && <EmployerTest />}
      </div>
      <p className="read-the-docs">Powered by Google ADK + A2A</p>
    </>
  )
}
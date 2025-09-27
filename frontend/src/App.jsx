import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import RoleSelect from './components/RoleSelect/RoleSelect'

export default function App() {
  const [stage, setStage] = useState('hero') // 'hero' | 'role'
  const [anim, setAnim] = useState('in')     // 'in' | 'out'

  function toRoleSelect() {
    // play exit animation on hero, then switch
    setAnim('out')
    setTimeout(() => { setStage('role'); setAnim('in') }, 280)
  }

  return (
    <>
      <Navbar />

      <div className={`view ${anim}`}>
        {stage === 'hero' && <Hero onGetStarted={toRoleSelect} />}
        {stage === 'role' && <RoleSelect />}
        <p className="read-the-docs">Powered by Google ADK + A2A</p>
      </div>

    
    </>
  )
}

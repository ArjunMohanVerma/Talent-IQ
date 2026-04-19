import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import {Route, Routes } from 'react-router'

function App() {
  return (
    <Routes>
      <header>
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal"/>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </Routes>
  )
}

export default App
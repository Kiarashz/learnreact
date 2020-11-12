import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import Users from './components/Users'

function App() {
  const [users, setUsers] = useState()
  const fake = ""

  useEffect(
    () => {
      fetch('/api/users')
      .then(res=> res.json())
      .then(setUsers)
    }, [fake]
  )

  return (
    <div className="App">
      <Users users={users} />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

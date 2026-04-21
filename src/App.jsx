import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { WorkerSafetyVerification } from '@/components/WorkerSafetyVerification';
import { EquipmentDetection } from '@/components/EquipmentDetection';
import './Login.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "IEEE@ieee.org" && password === "IEEE1234") {
      setLoggedIn(true);
    } else {
      alert("Incorrect username or password");
    }
  };

  if (!loggedIn) {
    return (
      <div className="login-wrapper">
        <div className="center-container">
          <div className="login-box">
            <h1>PREVENTEC Login</h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      onLogout={() => setLoggedIn(false)} 
      username={username}
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'safety' && <WorkerSafetyVerification />}
      {currentView === 'equipment' && <EquipmentDetection />}
    </Layout>
  );
}

export default App;

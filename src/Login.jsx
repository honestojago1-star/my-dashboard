import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');

    if (isRegistering) {
      if (storedUsers[username]) {
        setError('Username already exists.');
        return;
      }
      storedUsers[username] = password;
      localStorage.setItem('users', JSON.stringify(storedUsers));
      onLoginSuccess(username);
    } else {
      if (!storedUsers[username] || storedUsers[username] !== password) {
        setError('Invalid username or password.');
        return;
      }
      onLoginSuccess(username);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      minHeight: '100vh',
      backgroundColor: '#0c0c0e',
      fontFamily: 'Consolas, Monaco, monospace',
      boxSizing: 'border-box',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#141416',
        border: '1px solid #27272a',
        padding: '32px',
        borderRadius: '4px',
        boxSizing: 'border-box',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        textAlign: 'left'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '8px',
          textAlign: 'center',
          fontFamily: 'inherit'
        }}>
          &gt; {isRegistering ? 'create account' : 'sign in'}
        </h2>
        <p style={{
          fontSize: '12px',
          color: '#6e6e77',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          {isRegistering ? 'enter details to register' : 'welcome back'}
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '10px',
            fontSize: '11px',
            marginBottom: '16px',
            borderRadius: '2px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8e8e96', marginBottom: '6px' }}>
              username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. 1"
              required
              style={{
                width: '100%',
                backgroundColor: '#0c0c0e',
                border: '1px solid #27272a',
                color: '#ffffff',
                padding: '10px 12px',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                borderRadius: '2px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8e8e96', marginBottom: '6px' }}>
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                backgroundColor: '#0c0c0e',
                border: '1px solid #27272a',
                color: '#ffffff',
                padding: '10px 12px',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                borderRadius: '2px'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#22c55e',
              color: '#0c0c0e',
              border: 'none',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderRadius: '2px',
              marginTop: '8px'
            }}
          >
            {isRegistering ? 'Register & Enter' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#8e8e96',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit'
            }}
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
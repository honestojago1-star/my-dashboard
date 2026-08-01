import React, { useState } from 'react';
import { supabase } from './supabase';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const cleanUsername = username.trim();

    try {
      if (isRegistering) {
        // 1. Check if username already exists in Supabase
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          setError('Username already exists.');
          setLoading(false);
          return;
        }

        // 2. Insert new user into Supabase table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ username: cleanUsername, password: password, balance: 0 }]);

        if (insertError) {
          setError('Failed to create account: ' + insertError.message);
          setLoading(false);
          return;
        }

        onLoginSuccess(cleanUsername);
      } else {
        // 3. Login logic: Fetch user from Supabase
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .eq('password', password)
          .maybeSingle();

        if (fetchError || !user) {
          setError('Invalid username or password.');
          setLoading(false);
          return;
        }

        onLoginSuccess(user.username);
      }
    } catch (err) {
      setError('Connection error. Check environment variables.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0c0c0e',
      fontFamily: 'Consolas, Monaco, monospace',
      color: '#ffffff',
      boxSizing: 'border-box',
      zIndex: 9999
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#141416',
        border: '1px solid #27272a',
        padding: '32px',
        borderRadius: '4px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', margin: '0 0 8px 0' }}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ fontSize: '12px', color: '#6e6e77', marginBottom: '24px', textAlign: 'center', margin: '0 0 24px 0' }}>
          {isRegistering ? 'Register to access your dashboard' : 'Enter credentials to log in'}
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '10px',
            fontSize: '12px',
            marginBottom: '16px',
            borderRadius: '2px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#8e8e96', marginBottom: '6px' }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%',
                backgroundColor: '#0c0c0e',
                border: '1px solid #27272a',
                color: '#fff',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#8e8e96', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                backgroundColor: '#0c0c0e',
                border: '1px solid #27272a',
                color: '#fff',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#22c55e',
              color: '#0c0c0e',
              border: 'none',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              borderRadius: '2px'
            }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Log In')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit'
            }}
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

export default function DepositTab({ currentUser }) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copied, setCopied] = useState(false);

  // Mock wallet addresses generated per user/crypto
  // In a production app, these would come from your backend API
  const walletAddresses = {
    BTC: `bc1q${currentUser.toLowerCase()}x90a82348n7392817349182374`,
    ETH: `0x71C${currentUser.toUpperCase()}8392019283746501293847561`,
    USDT: `0x71C${currentUser.toUpperCase()}8392019283746501293847561` // ERC-20
  };

  const currentAddress = walletAddresses[selectedCrypto] || walletAddresses.BTC;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{
        backgroundColor: '#141416',
        border: '1px solid #27272a',
        padding: '24px',
        borderRadius: '4px'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginTop: 0, marginBottom: '8px' }}>
          Deposit Funds
        </h2>
        <p style={{ fontSize: '12px', color: '#8e8e96', marginBottom: '20px' }}>
          Select a cryptocurrency below to generate your account's dedicated deposit address.
        </p>

        {/* Crypto Asset Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '8px', textTransform: 'uppercase' }}>
            Select Asset
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['BTC', 'ETH', 'USDT'].map((asset) => (
              <button
                key={asset}
                onClick={() => setSelectedCrypto(asset)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: selectedCrypto === asset ? 'rgba(34, 197, 94, 0.15)' : '#0c0c0e',
                  border: `1px solid ${selectedCrypto === asset ? '#22c55e' : '#27272a'}`,
                  color: selectedCrypto === asset ? '#22c55e' : '#a1a1aa',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  fontFamily: 'inherit'
                }}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>

        {/* Address Display Box */}
        <div style={{
          backgroundColor: '#0c0c0e',
          border: '1px solid #27272a',
          padding: '16px',
          borderRadius: '2px',
          marginBottom: '20px'
        }}>
          <label style={{ display: 'block', fontSize: '10px', color: '#6e6e77', marginBottom: '6px', textTransform: 'uppercase' }}>
            Your Dedicated {selectedCrypto} Deposit Address
          </label>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              readOnly
              value={currentAddress}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#22c55e',
                fontFamily: 'monospace',
                fontSize: '11px',
                outline: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                backgroundColor: copied ? '#22c55e' : '#1a1d24',
                color: copied ? '#0c0c0e' : '#a1a1aa',
                border: '1px solid #27272a',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderRadius: '2px',
                whiteSpace: 'nowrap'
              }}
            >
              {copied ? 'Copied! ✓' : 'Copy Address'}
            </button>
          </div>
        </div>

        {/* Deposit Instructions & Warnings */}
        <div style={{
          backgroundColor: 'rgba(234, 179, 8, 0.05)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          padding: '12px 14px',
          borderRadius: '2px',
          fontSize: '11px',
          color: '#eab308',
          lineHeight: '1.5'
        }}>
          <strong>Important Instructions:</strong>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px' }}>
            <li>Send only <strong>{selectedCrypto}</strong> to this specific address.</li>
            <li>Deposits require 1 to 3 network confirmations before updating your balance.</li>
            <li>Minimum deposit amount: <strong>$10.00 equivalent</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
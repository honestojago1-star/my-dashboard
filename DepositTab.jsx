import React, { useState } from 'react';

export default function DepositTab({ currentUser }) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copied, setCopied] = useState(false);

  const walletAddresses = {
    BTC: `bc1q${currentUser?.toLowerCase() || 'user'}x90a82348n7392817349182374`,
    ETH: `0x71C${currentUser?.toUpperCase() || 'USER'}8392019283746501293847561`,
    USDT: `0x71C${currentUser?.toUpperCase() || 'USER'}8392019283746501293847561`
  };

  const currentAddress = walletAddresses[selectedCrypto] || walletAddresses.BTC;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* MAINTENANCE OVERLAY */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(12, 12, 14, 0.94)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        
        {/* TOP CAUTION TAPE BANNER */}
        <div style={{
          position: 'absolute',
          top: '24px',
          width: '120%',
          backgroundColor: '#eab308',
          color: '#000000',
          fontWeight: '900',
          fontSize: '11px',
          letterSpacing: '2px',
          textAlign: 'center',
          padding: '6px 0',
          transform: 'rotate(-3deg)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          borderTop: '2px solid #000',
          borderBottom: '2px solid #000',
          backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 15px, #eab308 15px, #eab308 30px)',
        }}>
          <span style={{ backgroundColor: '#eab308', padding: '0 10px' }}>⚠️ CAUTION — UNDER MAINTENANCE — CAUTION ⚠️</span>
        </div>

        {/* RED X ICON */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid #ef4444',
          color: '#ef4444',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '16px',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
        }}>
          ✕
        </div>

        {/* MESSAGE */}
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0', textAlign: 'center' }}>
          Under Maintenance
        </h3>
        
        <p style={{ fontSize: '12px', color: '#a1a1aa', textAlign: 'center', maxWidth: '360px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          For any deposits, please message{' '}
          <a
            href="https://t.me/jeremyhoffer"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#38bdf8', fontWeight: 'bold', textDecoration: 'none' }}
          >
            @jeremyhoffer
          </a>{' '}
          on Telegram.
        </p>

        {/* TELEGRAM BUTTON */}
        <a
          href="https://t.me/jeremyhoffer"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#0088cc',
            color: '#ffffff',
            padding: '10px 18px',
            fontSize: '12px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '2px',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Message @jeremyhoffer →
        </a>

        {/* BOTTOM CAUTION TAPE BANNER */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          width: '120%',
          backgroundColor: '#eab308',
          color: '#000000',
          fontWeight: '900',
          fontSize: '11px',
          letterSpacing: '2px',
          textAlign: 'center',
          padding: '6px 0',
          transform: 'rotate(3deg)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          borderTop: '2px solid #000',
          borderBottom: '2px solid #000',
          backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 15px, #eab308 15px, #eab308 30px)',
        }}>
          <span style={{ backgroundColor: '#eab308', padding: '0 10px' }}>⚠️ DEPOSITS TEMPORARILY DISABLED ⚠️</span>
        </div>

      </div>

      {/* INACTIVE BACKGROUND CARD */}
      <div style={{
        backgroundColor: '#141416',
        border: '1px solid #27272a',
        padding: '24px',
        borderRadius: '4px',
        opacity: 0.25,
        pointerEvents: 'none',
        minHeight: '320px'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginTop: 0, marginBottom: '8px' }}>
          Deposit Funds
        </h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          {['BTC', 'ETH', 'USDT'].map((asset) => (
            <button key={asset} style={{ flex: 1, padding: '10px', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#a1a1aa' }}>
              {asset}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
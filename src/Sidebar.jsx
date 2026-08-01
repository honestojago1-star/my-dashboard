import React from 'react';
import { Wallet, ShoppingBag, Trophy, Send, Crown, MessageSquare, CreditCard, FileText, DollarSign, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeItem, setActiveItem, isOwner }) {
  const menuData = [
    ...(isOwner ? [{
      category: 'ADMINISTRATION',
      items: [
        { id: 'owner-panel', label: 'Owner Panel', icon: ShieldAlert, goldText: true },
      ],
    }] : []),
    {
      category: 'MAIN',
      items: [
        { id: 'deposit', label: 'Deposit Cash', icon: Wallet },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'ranks', label: 'Ranks', icon: Trophy },
      ],
    },
    {
      category: 'CHANNEL',
      items: [
        { id: 'telegram', label: 'Telegram Channel', icon: Send },
        { id: 'vip', label: 'VIP Group Chat', icon: Crown, goldText: true },
      ],
    },
    {
      category: 'SUPPORT',
      items: [
        { id: 'tickets', label: 'Tickets', icon: MessageSquare },
      ],
    },
    {
      category: 'FEATURED',
      items: [
        { id: 'live-cards', label: 'Live Cards', icon: CreditCard, goldIcon: true },
        { id: 'live-logs', label: 'Live Logs', icon: FileText, goldIcon: true },
        { id: 'live-leads', label: 'Live Leads', icon: DollarSign, goldIcon: true },
      ],
    },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      backgroundColor: '#0a0a0c',
      color: '#8e95a5',
      padding: '16px',
      borderRight: '1px solid #1a1d24',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {menuData.map((group, groupIdx) => (
          <div key={groupIdx} style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              color: '#4a505e',
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '8px'
            }}>
              {group.category}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <li key={item.id} style={{ marginBottom: '4px' }}>
                    <button
                      onClick={() => setActiveItem(item.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        backgroundColor: isActive ? '#1a1d24' : 'transparent',
                        color: isActive ? '#ffffff' : (item.goldText ? '#fbbf24' : '#8e95a5'),
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        fontSize: '12px'
                      }}
                    >
                      <Icon size={14} color={isActive || item.goldIcon || item.goldText ? '#fbbf24' : '#8e95a5'} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
import React, { useState, useEffect } from 'react';
import Login from './Login';
import Sidebar from './Sidebar';
import { supabase } from './supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('deposit');
  const [purchases, setPurchases] = useState([]);
  const [userOrders, setUserOrders] = useState({});
  const [balances, setBalances] = useState({});
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [cart, setCart] = useState([]);

  // Modal & Overlay State ('review' | 'loading' | 'success' | 'revealing')
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState('review');
  const [lastPurchasedItems, setLastPurchasedItems] = useState([]);

  // Live Cards State
  const [liveCards, setLiveCards] = useState([]);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cvv: '',
    bin: '',
    type: 'CREDIT',
    level: 'TRADITIONAL',
    issuer: 'U.S. BANK NATIONAL ASSOCIATION-CREDIT',
    city: '',
    state: '',
    zip: '',
    exp: '',
    country: 'USA',
    base: '🎰 10% CHANCE OF $1000 🎰',
    price: '1.00'
  });

  // Balance adjustment state for Owner
  const [selectedUser, setSelectedUser] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [notice, setNotice] = useState({ text: '', isError: false });

  const isOwner = currentUser === 'Admin';

// Initial Load: Fetch users, balances, and global inventory from Supabase
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        // 1. Fetch Users & Balances from Supabase
        const { data: usersData, error: userError } = await supabase
          .from('users')
          .select('username, balance');

        if (userError) {
          console.error('Error fetching users from Supabase:', userError.message);
        } else if (usersData) {
          const userList = usersData.map((user) => user.username);
          setRegisteredUsers(userList);

          if (userList.length > 0) {
            setSelectedUser(userList[0]);
          }

          const initialBalances = {};
          usersData.forEach((user) => {
            initialBalances[user.username] = user.balance || 0;
          });
          setBalances(initialBalances);
        }

        // 2. Fetch Global Inventory from Supabase
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .order('id', { ascending: false });

        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError.message);
        } else if (inventoryData) {
          if (typeof setInventoryItems !== 'undefined') {
            setInventoryItems(inventoryData);
          } else if (typeof setLiveCards !== 'undefined') {
            setLiveCards(inventoryData);
          }
        }
      } catch (err) {
        console.error('Unexpected error loading initial data:', err);
      }
    }

    // Function call matches definition
    loadDataFromSupabase();

    // Load persistent local orders safely
    try {
      const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '{}');
      setUserOrders(storedOrders);
    } catch (err) {
      console.error('Error parsing stored orders:', err);
    }
  }, [currentUser]);

  // Handle adding a new Live Card (Owner only)
  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.cardNumber || !newCard.state) return;

    const calculatedBin = newCard.bin.trim() || newCard.cardNumber.trim().substring(0, 6);

    const cardToAdd = {
      ...newCard,
      bin: calculatedBin,
      id: Date.now()
    };

    const updatedCards = [cardToAdd, ...liveCards];
    setLiveCards(updatedCards);
    localStorage.setItem('liveCards', JSON.stringify(updatedCards));

    setNotice({ text: 'Live card added successfully!', isError: false });
    setTimeout(() => setNotice({ text: '', isError: false }), 4000);

    setNewCard({
      cardNumber: '',
      cvv: '',
      bin: '',
      type: 'CREDIT',
      level: 'TRADITIONAL',
      issuer: 'U.S. BANK NATIONAL ASSOCIATION-CREDIT',
      city: '',
      state: '',
      zip: '',
      exp: '',
      country: 'USA',
      base: '🎰 10% CHANCE OF $1000 🎰',
      price: '1.00'
    });
  };

  // Handle deleting a Live Card
  const handleDeleteCard = (cardId) => {
    const updatedCards = liveCards.filter((card) => card.id !== cardId);
    setLiveCards(updatedCards);
    localStorage.setItem('liveCards', JSON.stringify(updatedCards));

    setCart((prevCart) => prevCart.filter((item) => item.id !== cardId));

    setNotice({ text: 'Live card removed from inventory.', isError: true });
    setTimeout(() => setNotice({ text: '', isError: false }), 4000);
  };

  // Checkbox Toggle Individual
  const toggleSelectCard = (id) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter((cardId) => cardId !== id));
    } else {
      setSelectedCards([...selectedCards, id]);
    }
  };

  // Checkbox Toggle All
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCards(liveCards.map((c) => c.id));
    } else {
      setSelectedCards([]);
    }
  };

  // Cart Functions
  const addToCart = (card) => {
    if (cart.some((item) => item.id === card.id)) {
      setNotice({ text: 'Card is already in your cart.', isError: true });
      setTimeout(() => setNotice({ text: '', isError: false }), 3000);
      return;
    }
    setCart((prevCart) => [...prevCart, card]);
    setNotice({ text: `Added BIN ${card.bin} to cart!`, isError: false });
    setTimeout(() => setNotice({ text: '', isError: false }), 3000);
  };

  const addSelectedToCart = () => {
    if (selectedCards.length === 0) return;
    const cardsToAdd = liveCards.filter(
      (c) => selectedCards.includes(c.id) && !cart.some((item) => item.id === c.id)
    );
    setCart((prevCart) => [...prevCart, ...cardsToAdd]);
    setSelectedCards([]);
    setNotice({ text: `Added ${cardsToAdd.length} selected item(s) to cart!`, isError: false });
    setTimeout(() => setNotice({ text: '', isError: false }), 3000);
  };

  const removeFromCart = (cardId) => {
    const updatedCart = cart.filter((item) => item.id !== cardId);
    setCart(updatedCart);
    if (updatedCart.length === 0) {
      setShowCheckoutModal(false);
    }
  };

  // Trigger pre-checkout loading screen before opening confirmation modal
  const handleInitiateCheckout = () => {
    setIsPreparingCheckout(true);

    setTimeout(() => {
      setIsPreparingCheckout(false);
      setCheckoutStage('review');
      setShowCheckoutModal(true);
    }, 1000);
  };

  const handleBuySingleCard = (card) => {
    if (!cart.some((item) => item.id === card.id)) {
      setCart((prevCart) => [...prevCart, card]);
    }
    handleInitiateCheckout();
  };

  // CONFIRM & EXECUTE CHECKOUT WITH ANIMATED STAGES
  const handleConfirmCheckout = () => {
    if (cart.length === 0) return;

    const totalCost = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const userBalance = balances[currentUser] || 0;

    if (userBalance < totalCost) {
      setNotice({ text: `Insufficient balance ($${userBalance.toFixed(2)}). Total cost is $${totalCost.toFixed(2)}.`, isError: true });
      setShowCheckoutModal(false);
      setTimeout(() => setNotice({ text: '', isError: false }), 4000);
      return;
    }

    setCheckoutStage('loading');

    setTimeout(() => {
      // Deduct Balance
      const newBal = userBalance - totalCost;
      const updatedBalances = { ...balances, [currentUser]: newBal };
      setBalances(updatedBalances);
      localStorage.setItem('userBalances', JSON.stringify(updatedBalances));

      // Save items to user's purchased orders
      const currentUserOrders = userOrders[currentUser] || [];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newOrders = cart.map((item) => ({ ...item, purchasedAt: timestamp }));
      const updatedUserOrders = { ...userOrders, [currentUser]: [...newOrders, ...currentUserOrders] };
      setUserOrders(updatedUserOrders);
      localStorage.setItem('userOrders', JSON.stringify(updatedUserOrders));

      // Remove purchased items from active inventory
      const cartIds = cart.map((item) => item.id);
      const remainingCards = liveCards.filter((card) => !cartIds.includes(card.id));
      setLiveCards(remainingCards);
      localStorage.setItem('liveCards', JSON.stringify(remainingCards));

      // Snapshot items and set to Success stage
      setLastPurchasedItems([...cart]);
      setCart([]);
      setSelectedCards([]);
      setCheckoutStage('success');

      setTimeout(() => {
        setCheckoutStage('revealing');
      }, 1200);

    }, 2000);
  };

const handleModifyBalance = async (type) => {
    if (!selectedUser || !amountInput || isNaN(amountInput)) return;

    const numericAmount = parseFloat(amountInput);
    if (numericAmount <= 0) return;

    const currentBal = balances[selectedUser] || 0;
    const updatedBal = type === 'add' 
      ? currentBal + numericAmount 
      : Math.max(0, currentBal - numericAmount);

    // 1. Save new balance directly to Supabase table
    const { error } = await supabase
      .from('users')
      .update({ balance: updatedBal })
      .eq('username', selectedUser);

    if (error) {
      setNotice({ text: `Failed to update balance: ${error.message}`, isError: true });
      setTimeout(() => setNotice({ text: '', isError: false }), 4000);
      return;
    }

    // 2. Update local state
    const updatedBalances = { ...balances, [selectedUser]: updatedBal };
    setBalances(updatedBalances);

    setNotice({
      text: `Successfully ${type === 'add' ? 'added to' : 'removed from'} ${selectedUser}'s balance!`,
      isError: false
    });
    setAmountInput('');
    setTimeout(() => setNotice({ text: '', isError: false }), 4000);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={(username) => setCurrentUser(username)} />;
  }

  const userCurrentBalance = balances[currentUser] || 0;
  const myOrders = userOrders[currentUser] || [];
  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const renderCardsTable = () => (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={addSelectedToCart}
          style={{
            backgroundColor: '#0c0c0e',
            border: '1px solid #27272a',
            color: '#8e8e96',
            padding: '6px 12px',
            fontSize: '11px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            borderRadius: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🛒</span> add selected ({selectedCards.length})
        </button>
      </div>

      <div style={{
        backgroundColor: '#070708',
        border: '1px solid #1a1d24',
        borderRadius: '2px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          textAlign: 'left',
          color: '#a1a1aa',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1d24', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '10px 6px', width: '3%' }}>
                <input 
                  type="checkbox" 
                  checked={selectedCards.length === liveCards.length && liveCards.length > 0}
                  onChange={toggleSelectAll}
                  style={{ accentColor: '#27272a', cursor: 'pointer' }} 
                />
              </th>
              <th style={{ padding: '10px 6px', width: '7%' }}>BIN</th>
              <th style={{ padding: '10px 6px', width: '6%' }}>TYPE</th>
              <th style={{ padding: '10px 6px', width: '9%' }}>LEVEL</th>
              <th style={{ padding: '10px 6px', width: '22%' }}>ISSUER</th>
              <th style={{ padding: '10px 6px', width: '6%' }}>CITY</th>
              <th style={{ padding: '10px 6px', width: '5%' }}>STATE</th>
              <th style={{ padding: '10px 6px', width: '6%' }}>ZIP</th>
              <th style={{ padding: '10px 6px', width: '5%' }}>EXP</th>
              <th style={{ padding: '10px 6px', width: '6%' }}>COUNTRY</th>
              <th style={{ padding: '10px 6px', width: '13%' }}>BASE</th>
              <th style={{ padding: '10px 6px', width: '12%', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {liveCards.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ padding: '28px', textAlign: 'center', color: '#52525b' }}>
                  No live cards available in inventory. Use the Owner Panel to add cards.
                </td>
              </tr>
            ) : (
              liveCards.map((card) => {
                const isSelected = selectedCards.includes(card.id);
                const isInCart = cart.some((item) => item.id === card.id);
                return (
                  <tr key={card.id} style={{ borderBottom: '1px solid #1a1d24', backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '10px 6px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelectCard(card.id)}
                        style={{ accentColor: '#27272a', cursor: 'pointer' }} 
                      />
                    </td>
                    <td style={{ padding: '10px 6px', color: '#ffffff', fontWeight: 'bold' }}>{card.bin}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff', fontWeight: 'bold' }}>{card.type}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.level}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.issuer}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.city || '-'}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff' }}>{card.state}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff' }}>{card.zip}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff' }}>{card.exp}</td>
                    <td style={{ padding: '10px 6px', color: '#ffffff' }}>{card.country}</td>
                    <td style={{ padding: '10px 6px', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.base}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                        <button 
                          onClick={() => addToCart(card)}
                          style={{
                            backgroundColor: isInCart ? '#1a1d24' : '#0c0c0e',
                            border: '1px solid #27272a',
                            color: isInCart ? '#22c55e' : '#a1a1aa',
                            padding: '4px 6px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            borderRadius: '2px'
                          }}
                        >
                          {isInCart ? 'Added ✓' : 'Add'}
                        </button>
                        <button 
                          onClick={() => handleBuySingleCard(card)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #22c55e',
                            color: '#22c55e',
                            padding: '4px 8px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            borderRadius: '2px'
                          }}
                        >
                          Buy ${card.price}
                        </button>

                        {isOwner && (
                          <button 
                            onClick={() => handleDeleteCard(card.id)}
                            title="Delete Card"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.05)',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              padding: '4px 6px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              borderRadius: '2px'
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0c0c0e',
      fontFamily: 'Consolas, Monaco, monospace',
      boxSizing: 'border-box'
    }}>
      <Sidebar activeItem={activeTab} setActiveItem={setActiveTab} isOwner={isOwner} />

      <main style={{
        flex: 1,
        padding: '24px 32px',
        color: '#ffffff',
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #1a1d24', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'lowercase', margin: 0 }}>{activeTab}</h1>
              {isOwner && (
                <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#eab308', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  OWNER PANEL
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#6e6e77', marginTop: '4px', margin: 0 }}>
              logged in as: <span style={{ color: isOwner ? '#eab308' : '#22c55e', fontWeight: 'bold' }}>{currentUser}</span> | balance: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>${userCurrentBalance.toFixed(2)}</span>
            </p>
          </div>

          <button onClick={() => setCurrentUser(null)} style={{ backgroundColor: '#141416', border: '1px solid #27272a', color: '#a1a1aa', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            log out
          </button>
        </div>

        {/* Global Notice */}
        {notice.text && (
          <div style={{ 
            backgroundColor: notice.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
            border: `1px solid ${notice.isError ? '#ef4444' : '#22c55e'}`, 
            color: notice.isError ? '#ef4444' : '#22c55e', 
            padding: '10px 14px', 
            fontSize: '12px', 
            marginBottom: '20px' 
          }}>
            {notice.text}
          </div>
        )}

        {/* DEPOSIT TAB */}
        {activeTab === 'deposit' && (
          <DepositTab currentUser={currentUser} />
        )}

        {/* TELEGRAM TAB */}
        {activeTab === 'telegram' && (
          <TelegramTab />
        )}

        {/* OWNER EXCLUSIVE PANEL */}
        {isOwner && activeTab === 'owner-panel' && (
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#141416', border: '1px solid #27272a', padding: '20px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#eab308', marginBottom: '14px', marginTop: 0 }}>
                &gt; add live card (owner only)
              </h2>
              
              <form onSubmit={handleAddCard} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#eab308', marginBottom: '4px', fontWeight: 'bold' }}>
                    FULL CARD NUMBER (HIDDEN UNTIL PURCHASED)
                  </label>
                  <input type="text" placeholder="4111222233334444" value={newCard.cardNumber} onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })} required style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #eab308', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#eab308', marginBottom: '4px', fontWeight: 'bold' }}>CVV</label>
                  <input type="text" placeholder="123" value={newCard.cvv} onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })} required style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #eab308', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>EXP</label>
                  <input type="text" placeholder="07/31" value={newCard.exp} onChange={(e) => setNewCard({ ...newCard, exp: e.target.value })} required style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>BIN</label>
                  <input type="text" placeholder="Auto 6-digits" value={newCard.bin} onChange={(e) => setNewCard({ ...newCard, bin: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>TYPE</label>
                  <input type="text" value={newCard.type} onChange={(e) => setNewCard({ ...newCard, type: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>LEVEL</label>
                  <input type="text" value={newCard.level} onChange={(e) => setNewCard({ ...newCard, level: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>CITY</label>
                  <input type="text" placeholder="Newark" value={newCard.city} onChange={(e) => setNewCard({ ...newCard, city: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>STATE</label>
                  <input type="text" placeholder="New Jersey" value={newCard.state} onChange={(e) => setNewCard({ ...newCard, state: e.target.value })} required style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>ZIP</label>
                  <input type="text" placeholder="07866" value={newCard.zip} onChange={(e) => setNewCard({ ...newCard, zip: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#38bdf8', marginBottom: '4px', fontWeight: 'bold' }}>BASE (CUSTOM TEXT)</label>
                  <input type="text" placeholder="🎰 10% CHANCE OF $1000 🎰" value={newCard.base} onChange={(e) => setNewCard({ ...newCard, base: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #38bdf8', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>PRICE ($)</label>
                  <input type="text" placeholder="1.00" value={newCard.price} onChange={(e) => setNewCard({ ...newCard, price: e.target.value })} style={{ width: '100%', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#fff', padding: '8px', fontSize: '11px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                  <button type="submit" style={{ backgroundColor: '#eab308', color: '#0c0c0e', border: 'none', padding: '9px 18px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>
                    + publish live card
                  </button>
                </div>
              </form>
            </div>

            {/* Balance Tool */}
            <div style={{ backgroundColor: '#141416', border: '1px solid #27272a', padding: '20px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#eab308', marginBottom: '10px', marginTop: 0 }}>&gt; manage user balance</h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>select target user</label>
                  <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#ffffff', padding: '8px 12px', fontSize: '11px', fontFamily: 'inherit', outline: 'none', minWidth: '160px' }}>
                    {registeredUsers.length === 0 && <option value="">No users registered</option>}
                    {registeredUsers.map((user) => (
                      <option key={user} value={user}>{user} (Bal: ${ (balances[user] || 0).toFixed(2) })</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8e8e96', marginBottom: '4px' }}>amount ($)</label>
                  <input type="number" step="0.01" placeholder="100.00" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} style={{ backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#ffffff', padding: '8px 12px', fontSize: '11px', fontFamily: 'inherit', outline: 'none', width: '110px' }} />
                </div>
                <button type="button" onClick={() => handleModifyBalance('add')} style={{ backgroundColor: '#22c55e', color: '#0c0c0e', border: 'none', padding: '9px 16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>+ add balance</button>
                <button type="button" onClick={() => handleModifyBalance('remove')} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '9px 16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}>- remove balance</button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE CARDS VIEW */}
        {(activeTab === 'live-cards' || (isOwner && activeTab === 'owner-panel')) && (
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#ffffff', marginTop: 0 }}>
              &gt; live cards table
            </h2>
            {renderCardsTable()}
          </div>
        )}

        {/* ORDERS PAGE */}
        {activeTab === 'orders' && (
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#ffffff', marginTop: 0 }}>
              &gt; my purchased items ({myOrders.length})
            </h2>
            <div style={{ backgroundColor: '#070708', border: '1px solid #1a1d24', borderRadius: '2px', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', color: '#a1a1aa' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1d24', color: '#52525b', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 10px' }}>CARD NUMBER</th>
                    <th style={{ padding: '8px 10px' }}>EXP</th>
                    <th style={{ padding: '8px 10px' }}>CVV</th>
                    <th style={{ padding: '8px 10px' }}>CITY</th>
                    <th style={{ padding: '8px 10px' }}>STATE</th>
                    <th style={{ padding: '8px 10px' }}>ZIP</th>
                    <th style={{ padding: '8px 10px' }}>PRICE</th>
                    <th style={{ padding: '8px 10px' }}>PURCHASED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '28px', textAlign: 'center', color: '#52525b' }}>
                        You have not purchased any items yet.
                      </td>
                    </tr>
                  ) : (
                    myOrders.map((order, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1a1d24' }}>
                        <td style={{ padding: '8px 10px', color: '#22c55e', fontWeight: 'bold', fontFamily: 'monospace' }}>
                          {order.cardNumber}
                        </td>
                        <td style={{ padding: '8px 10px', color: '#ffffff' }}>{order.exp}</td>
                        <td style={{ padding: '8px 10px', color: '#eab308', fontWeight: 'bold' }}>{order.cvv}</td>
                        <td style={{ padding: '8px 10px', color: '#ffffff' }}>{order.city || '-'}</td>
                        <td style={{ padding: '8px 10px', color: '#ffffff' }}>{order.state}</td>
                        <td style={{ padding: '8px 10px', color: '#ffffff' }}>{order.zip}</td>
                        <td style={{ padding: '8px 10px', color: '#22c55e' }}>${order.price}</td>
                        <td style={{ padding: '8px 10px', color: '#6e6e77' }}>{order.purchasedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEFAULT TAB PLACEHOLDER */}
        {activeTab !== 'live-cards' && activeTab !== 'owner-panel' && activeTab !== 'orders' && activeTab !== 'deposit' && activeTab !== 'telegram' && (
          <div style={{ backgroundColor: '#141416', border: '1px solid #27272a', padding: '20px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>
              currently viewing section: <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{activeTab}</span>
            </p>
          </div>
        )}
      </main>

      {/* FLOATING SHOPPING CART DRAWER */}
      {cart.length > 0 && !showCheckoutModal && !isPreparingCheckout && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '320px',
          backgroundColor: '#0e0e11',
          border: '1px solid #22c55e',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          padding: '16px',
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #1a1d24' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e' }}>
              🛒 Cart ({cart.length})
            </span>
            <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>
              clear all
            </button>
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '6px 0', borderBottom: '1px solid #141416' }}>
                <div>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>BIN: {item.bin}</span>
                  <span style={{ color: '#6e6e77', marginLeft: '6px' }}>({item.state})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#22c55e' }}>${item.price}</span>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px' }}>
            <span style={{ color: '#a1a1aa' }}>Total:</span>
            <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '14px' }}>${cartTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleInitiateCheckout}
            style={{
              width: '100%',
              backgroundColor: '#22c55e',
              color: '#0c0c0e',
              border: 'none',
              padding: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Checkout All (${cartTotal.toFixed(2)}) →
          </button>
        </div>
      )}

      {/* PRE-CHECKOUT LOADING SCREEN OVERLAY */}
      {isPreparingCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(12, 12, 14, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10001,
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #27272a',
            borderTop: '3px solid #22c55e',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: 'bold' }}>Preparing Cart...</div>
        </div>
      )}

      {/* MULTI-STAGE CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#141416',
            border: '1px solid #27272a',
            padding: '24px',
            borderRadius: '4px',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.9)',
            boxSizing: 'border-box'
          }}>
            
            {/* STAGE 1: CONFIRMATION */}
            {checkoutStage === 'review' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px', textAlign: 'center' }}>
                  Are you sure?
                </h2>
                <p style={{ fontSize: '12px', color: '#8e8e96', textAlign: 'center', marginBottom: '16px' }}>
                  Review items before completing your order.
                </p>

                <div style={{
                  backgroundColor: '#0c0c0e',
                  border: '1px solid #27272a',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '8px 12px',
                  marginBottom: '16px'
                }}>
                  {cart.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#6e6e77', fontSize: '11px' }}>
                      Cart is empty.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #1a1d24',
                        fontSize: '11px'
                      }}>
                        <div>
                          <span style={{ color: '#ffffff', fontWeight: 'bold' }}>BIN {item.bin}</span>
                          <span style={{ color: '#6e6e77', marginLeft: '6px' }}>({item.type} - {item.state})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>${item.price}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              padding: '2px 6px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              borderRadius: '2px',
                              fontFamily: 'inherit'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#070708',
                  border: '1px solid #1a1d24',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Total:</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>${cartTotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: '#0c0c0e',
                      border: '1px solid #27272a',
                      color: '#a1a1aa',
                      padding: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      borderRadius: '2px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCheckout}
                    disabled={cart.length === 0}
                    style={{
                      flex: 1,
                      backgroundColor: cart.length === 0 ? '#1a1d24' : '#22c55e',
                      color: cart.length === 0 ? '#52525b' : '#0c0c0e',
                      border: 'none',
                      padding: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      borderRadius: '2px'
                    }}
                  >
                    Confirm & Pay (${cartTotal.toFixed(2)})
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: LOADING */}
            {checkoutStage === 'loading' && (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid #27272a',
                  borderTop: '3px solid #22c55e',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h3 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 6px' }}>Processing Payment...</h3>
                <p style={{ fontSize: '11px', color: '#6e6e77', margin: 0 }}>Deducting account balance & issuing keys...</p>
              </div>
            )}

            {/* STAGE 3: SUCCESS */}
            {checkoutStage === 'success' && (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ fontSize: '40px', color: '#22c55e', marginBottom: '8px' }}>✓</div>
                <h3 style={{ fontSize: '16px', color: '#ffffff', fontWeight: 'bold', margin: '0 0 4px' }}>Payment Successful!</h3>
                <p style={{ fontSize: '11px', color: '#8e8e96', margin: 0 }}>Unlocking items...</p>
              </div>
            )}

            {/* STAGE 4: SUMMARY / REVEAL SCREEN */}
            {checkoutStage === 'revealing' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <span style={{ color: '#22c55e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Complete</span>
                  <h2 style={{ fontSize: '16px', color: '#ffffff', margin: '4px 0 0' }}>Purchased Items</h2>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lastPurchasedItems.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#070708', border: '1px solid #22c55e', padding: '10px 12px', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '12px' }}>BIN: {item.bin} ({item.type})</span>
                        <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '11px' }}>${item.price}</span>
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#22c55e', fontWeight: 'bold' }}>
                        Card Number: {item.cardNumber}
                      </div>
                      <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '2px' }}>
                        EXP: {item.exp} | CVV: {item.cvv} | State: {item.state}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setShowCheckoutModal(false); setActiveTab('orders'); }}
                  style={{
                    width: '100%',
                    backgroundColor: '#22c55e',
                    color: '#0c0c0e',
                    border: 'none',
                    padding: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderRadius: '2px'
                  }}
                >
                  View All Orders →
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Inline Deposit Tab Component with Caution Tape Maintenance Screen
function DepositTab({ currentUser }) {
  return (
    <div style={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* OVERLAY WITH CAUTION TAPE & X */}
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
        overflow: 'hidden',
        minHeight: '340px'
      }}>
        
        {/* TOP CAUTION TAPE */}
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
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid #ef4444',
          color: '#ef4444',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '14px',
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

        {/* TELEGRAM LINK BUTTON */}
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
            fontFamily: 'inherit'
          }}
        >
          Message @jeremyhoffer →
        </a>

        {/* BOTTOM CAUTION TAPE */}
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
      <div style={{ backgroundColor: '#141416', border: '1px solid #27272a', padding: '24px', borderRadius: '4px', opacity: 0.25, pointerEvents: 'none', minHeight: '340px' }}>
        <h2 style={{ fontSize: '16px', color: '#ffffff', marginTop: 0 }}>Deposit Funds</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          {['BTC', 'ETH', 'USDT'].map((a) => (
            <button key={a} style={{ flex: 1, padding: '10px', backgroundColor: '#0c0c0e', border: '1px solid #27272a', color: '#a1a1aa' }}>{a}</button>
          ))}
        </div>
      </div>

    </div>
  );
}

// Inline Telegram Tab Component
function TelegramTab() {
  return (
    <div style={{ maxWidth: '600px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{
        backgroundColor: '#141416',
        border: '1px solid #27272a',
        padding: '24px',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginTop: 0, marginBottom: '12px' }}>
          Join Our Community
        </h2>
        
        <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '20px' }}>
          Join our Telegram channel to get the latest updates and announcements!
        </p>

        <a
          href="https://t.me/realfasteats"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#0088cc',
            color: '#ffffff',
            padding: '10px 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '2px',
            fontFamily: 'inherit'
          }}
        >
          Join our Telegram!
        </a>
      </div>
    </div>
  );
}
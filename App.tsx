import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PostAdForm from './components/PostAdForm';
import AdminDashboard from './components/AdminDashboard';
import AdDetailPage from './components/AdDetailPage';
import UserProfilePage from './components/UserProfilePage';
import ChatPage from './components/ChatPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { View, AdSenseConfig, User } from './types';
import { spendCredit, addCredits, followUser, unfollowUser, getUserById, login, register } from './services/userService';
import { getUnreadCount, startConversation } from './services/chatService';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);


  // This would be fetched from a global state/context in a real app
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
    enabled: true, 
    clientId: 'ca-pub-XXXXXXXXXXXXXXXX',
    slotId: '1234567890',
  });

  const fetchCurrentUserData = async () => {
     if (!currentUser) return;
     const user = getUserById(currentUser.id); // In a real app, this would be a more robust fetch
     setCurrentUser(user || null);
     return user;
  }

  // Poll for unread messages to simulate real-time notifications
  useEffect(() => {
    if (currentUser) {
        const interval = setInterval(async () => {
            const count = await getUnreadCount(currentUser.id);
            setTotalUnreadCount(count);
        }, 3000); // Check every 3 seconds

        // Initial check
        getUnreadCount(currentUser.id).then(setTotalUnreadCount);

        return () => clearInterval(interval);
    }
  }, [currentUser]);
  
  const resetViews = () => {
      setSelectedAdId(null);
      setSelectedUserId(null);
      setEditingAdId(null);
      setSelectedConversationId(null);
  }

  const attemptLogin = async (email: string, pass: string): Promise<string | void> => {
    setLoading(true);
    try {
        const user = await login(email, pass);
        if (user) {
            const { password_hash, ...clientUser } = user;
            setCurrentUser(clientUser);
            setView('home');
        } else {
            return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        }
    } finally {
        setLoading(false);
    }
  };

  const attemptSignUp = async (name: string, email: string, pass: string): Promise<string | void> => {
      setLoading(true);
      try {
          const result = await register(name, email, pass);
          if ('error' in result) {
              return result.error;
          } else {
              const { password_hash, ...clientUser } = result;
              setCurrentUser(clientUser);
              setView('home');
          }
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
    resetViews();
  };

  const handleSetView = (newView: View) => {
    resetViews();
    setView(newView);
  }
  
  const handleSelectAd = (id: number) => {
    resetViews();
    setSelectedAdId(id);
  }
  
  const handleSelectUser = (id: number) => {
      resetViews();
      setSelectedUserId(id);
  }
  
  const handleEditAd = (id: number) => {
      resetViews();
      setEditingAdId(id);
      setView('postAd');
  }
  
  const handleStartChat = async (otherUserId: number) => {
      if (!currentUser) return;
      const conversation = await startConversation(currentUser.id, otherUserId);
      resetViews();
      setSelectedConversationId(conversation.id);
      setView('chat');
  }

  const handleBack = () => {
    resetViews();
    setView('home');
  }
  
  const handleAdPosted = () => {
      if (editingAdId) { // If we were editing
          handleSelectUser(currentUser!.id); // Go back to user profile
      } else { // If we were creating
          setView('home');
      }
      resetViews();
  }

  const handleSpendCredits = async (amount: number) => {
      if(currentUser) {
         const updatedUser = await spendCredit(currentUser.id, amount);
         setCurrentUser(updatedUser);
      }
  }

  const handleAddCredits = async (amount: number) => {
      if(currentUser) {
          const updatedUser = await addCredits(currentUser.id, amount);
          setCurrentUser(updatedUser);
      }
  }

  const handleFollow = async (targetUserId: number) => {
      if (!currentUser) return;
      // Optimistic update
      setCurrentUser(u => u ? { ...u, following: [...u.following, targetUserId] } : null);
      try {
          await followUser(currentUser.id, targetUserId);
          await fetchCurrentUserData(); // re-sync
      } catch (e) {
        // Revert on failure
        fetchCurrentUserData();
      }
  };
  
  const handleUnfollow = async (targetUserId: number) => {
      if (!currentUser) return;
      // Optimistic update
      setCurrentUser(u => u ? { ...u, following: u.following.filter(id => id !== targetUserId) } : null);
      try {
          await unfollowUser(currentUser.id, targetUserId);
          await fetchCurrentUserData(); // re-sync
      } catch (e) {
        // Revert on failure
        fetchCurrentUserData();
      }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }
    
    if (view === 'login') {
        return <LoginPage onAttemptLogin={attemptLogin} onSetView={handleSetView} />;
    }
    
    if (view === 'signup') {
        return <SignUpPage onAttemptSignUp={attemptSignUp} onSetView={handleSetView} />;
    }

    if (!currentUser) {
        return <LandingPage onSetView={handleSetView} />;
    }

    const showAds = adSenseConfig.enabled && !currentUser?.isPremium;

    if (view === 'chat' && currentUser) {
        return <ChatPage 
            currentUser={currentUser} 
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onBack={handleBack}
            onSelectUser={handleSelectUser}
        />;
    }

    if (selectedUserId && currentUser) {
        return <UserProfilePage 
            userId={selectedUserId} 
            currentUser={currentUser}
            onBack={handleBack} 
            onSelectAd={handleSelectAd}
            onEditAd={handleEditAd}
            onAddCredits={handleAddCredits}
            onSpendCredits={handleSpendCredits}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onStartChat={handleStartChat}
        />;
    }

    if (selectedAdId) {
        return <AdDetailPage 
            adId={selectedAdId} 
            onBack={handleBack} 
            onSelectUser={handleSelectUser}
            onStartChat={handleStartChat}
            currentUser={currentUser}
        />;
    }

    switch (view) {
      case 'home':
        return <HomePage showAds={showAds} onSelectAd={handleSelectAd} />;
      case 'postAd':
        return <PostAdForm 
            onAdPosted={handleAdPosted} 
            currentUser={currentUser} 
            editingAdId={editingAdId}
            onSpendCredits={handleSpendCredits}
        />;
      case 'admin':
        // Protect this route
        if (currentUser.role === 'admin') {
            return <AdminDashboard />;
        }
        return <HomePage showAds={showAds} onSelectAd={handleSelectAd} />;
      default:
        return <HomePage showAds={showAds} onSelectAd={handleSelectAd} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header 
        onSetView={handleSetView} 
        onSelectUser={handleSelectUser} 
        currentUser={currentUser}
        unreadCount={totalUnreadCount}
        onLogout={handleLogout}
        currentView={view}
      />
      <main>
        {renderContent()}
      </main>
      <footer className="bg-slate-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} سوق هرج. جميع الحقوق محفوظة.</p>
          <p className="text-sm mt-1">منصة إعلانات مبوبة حديثة للعراق.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

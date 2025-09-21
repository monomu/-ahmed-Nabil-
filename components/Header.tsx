import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, AdminIcon, BellIcon, XIcon, ChevronDownIcon, WalletIcon, ChatBubbleIcon, HeartIcon, LogoutIcon } from './icons';
import type { View, User } from '../types';

interface HeaderProps {
  onSetView: (view: View) => void;
  onSelectUser: (userId: number) => void;
  currentUser: User | null;
  unreadCount: number;
  onLogout: () => void;
  currentView: View;
}

const Header: React.FC<HeaderProps> = ({ onSetView, onSelectUser, currentUser, unreadCount, onLogout, currentView }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, userMenuRef]);
  
  const handleUserMenuClick = (e: React.MouseEvent<HTMLButtonElement>, action: 'profile' | 'admin' | 'logout') => {
      e.preventDefault();
      if(action === 'profile' && currentUser) {
          onSelectUser(currentUser.id);
      } else if (action === 'admin') {
          onSetView('admin');
      } else if (action === 'logout') {
          onLogout();
      }
      setIsUserMenuOpen(false);
  }

  const handleChatClick = () => {
      if (currentView === 'chat') {
          onSetView('home');
      } else {
          onSetView('chat');
      }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onSetView(currentUser ? 'home' : 'landing')}
          title="الصفحة الرئيسية"
        >
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            ج
          </div>
          <h1 className="text-2xl font-bold text-teal-700 hidden sm:block">سوق هرج</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            {currentUser ? (
                <>
                    <button 
                        onClick={handleChatClick}
                        className="relative text-slate-600 hover:text-teal-700 transition-colors" 
                        title="الرسائل"
                    >
                        <ChatBubbleIcon className="w-6 h-6"/>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="relative" ref={notificationRef}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="text-slate-600 hover:text-teal-700 transition-colors" 
                            title="الإشعارات"
                        >
                            <BellIcon className="w-6 h-6"/>
                        </button>
                        {showNotifications && (
                            <div className="absolute left-0 mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-1 p-3 border-b border-slate-100">
                                    <h4 className="font-bold text-slate-800">الإشعارات</h4>
                                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-4 h-4"/></button>
                                </div>
                                <div>
                                    <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                                        <li className="hover:bg-slate-50 transition-colors">
                                            <a href="#" className="flex items-start gap-3 p-3">
                                                <div className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><HeartIcon className="w-4 h-4" /></div>
                                                <div>
                                                    <p className="text-sm text-slate-700">أعجب <span className="font-bold">أبو محمد</span> بإعلانك <span className="font-bold text-teal-600">"سيارة حديثة للبيع"</span>.</p>
                                                    <p className="text-xs text-slate-400 mt-1">قبل 5 دقائق</p>
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                  
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-bold text-slate-600">
                        <WalletIcon className="w-5 h-5 text-amber-500" />
                        <span>{currentUser.credits}</span>
                    </div>
                    <div className="relative" ref={userMenuRef}>
                      <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 text-slate-700 font-bold hover:bg-slate-100 p-2 rounded-lg"
                      >
                        <span>{currentUser.name}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isUserMenuOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2">
                          <button onClick={(e) => handleUserMenuClick(e, 'profile')} className="w-full text-right block px-4 py-2 text-slate-700 hover:bg-slate-100">ملفي الشخصي</button>
                          {currentUser.role === 'admin' && (
                             <button onClick={(e) => handleUserMenuClick(e, 'admin')} className="w-full text-right block px-4 py-2 text-slate-700 hover:bg-slate-100">لوحة التحكم</button>
                          )}
                          <div className="my-2 border-t border-slate-100"></div>
                          <button onClick={(e) => handleUserMenuClick(e, 'logout')} className="w-full text-right flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50">
                            <LogoutIcon className="w-5 h-5"/>
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                        onClick={() => onSetView('postAd')}
                        className="flex items-center gap-2 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-amber-600 transition-transform transform hover:scale-105"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">أضف إعلان</span>
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => onSetView('login')} className="font-bold text-slate-600 hover:text-teal-700 transition-colors">
                        تسجيل الدخول
                    </button>
                    <button onClick={() => onSetView('signup')} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition-transform transform hover:scale-105">
                        إنشاء حساب
                    </button>
                </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;

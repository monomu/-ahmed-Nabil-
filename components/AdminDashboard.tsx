import React, { useEffect, useState, useCallback } from 'react';
import { Ad, AdSenseConfig, User } from '../types';
import { getAllAdsForAdmin, deleteAd } from '../services/adService';
import { getUsers, toggleUserVerification, toggleUserPremium, updateUser, addCredits } from '../services/userService';
import Spinner from './Spinner';
import { TrashIcon, UsersIcon, SettingsIcon, AdminIcon, VerifiedIcon, PremiumIcon, PencilIcon, XIcon, WalletIcon } from './icons';

type AdminTab = 'ads' | 'users' | 'settings';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('ads');

    const renderContent = () => {
        switch(activeTab) {
            case 'ads':
                return <AdManagement />;
            case 'users':
                return <UserManagement />;
            case 'settings':
                return <SettingsManagement />;
            default:
                return null;
        }
    }

    const TabButton: React.FC<{tabName: AdminTab, icon: React.ReactNode, label: string}> = ({ tabName, icon, label}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === tabName ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-200'}`}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6">لوحة التحكم</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-64">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex md:flex-col gap-2">
                        <TabButton tabName="ads" label="إدارة الإعلانات" icon={<AdminIcon className="w-6 h-6"/>} />
                        <TabButton tabName="users" label="إدارة المستخدمين" icon={<UsersIcon className="w-6 h-6"/>} />
                        <TabButton tabName="settings" label="الإعدادات" icon={<SettingsIcon className="w-6 h-6"/>} />
                    </div>
                </aside>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const AdManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [adToDelete, setAdToDelete] = useState<number | null>(null);

    const fetchAds = useCallback(() => {
        setLoading(true);
        getAllAdsForAdmin().then(data => {
            setAds(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const handleConfirmDelete = async () => {
        if (adToDelete === null) return;

        const originalAds = ads;
        // Optimistically update UI
        setAds(currentAds => currentAds.filter(ad => ad.id !== adToDelete));
        
        const idToDelete = adToDelete;
        setAdToDelete(null); // Close modal right away

        try {
            await deleteAd(idToDelete);
        } catch (error) {
            console.error('Failed to delete ad:', error);
            setAds(originalAds); // Revert on failure
            alert('فشل حذف الإعلان.');
        }
    };

    return (
        <>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">إدارة الإعلانات</h3>
            {loading ? (
                <div className="flex justify-center items-center py-10"><Spinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">العنوان</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الناشر</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">السعر</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">تاريخ النشر</th>
                                <th className="relative px-2 sm:px-6 py-3"><span className="sr-only">إجراء</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {ads.map(ad => (
                                <tr key={ad.id}>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ad.title}</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500">{ad.author.name}</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500">{ad.price.toLocaleString()} د.ع</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500">{ad.postedAt.toLocaleDateString('ar-IQ')}</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setAdToDelete(ad.id)} className="text-red-600 hover:text-red-900" title="حذف الإعلان"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        {adToDelete !== null && (
            <ConfirmationModal
                onClose={() => setAdToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
            >
                <p>هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </ConfirmationModal>
        )}
        </>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false);
    const [creditingUser, setCreditingUser] = useState<User | null>(null);


    const fetchUsers = useCallback(() => {
        getUsers().then(data => {
            setUsers(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };
    
    const handleOpenAddCreditsModal = (user: User) => {
        setCreditingUser(user);
        setIsAddCreditsModalOpen(true);
    };

    const handleCloseAddCreditsModal = () => {
        setIsAddCreditsModalOpen(false);
        setCreditingUser(null);
    };

    const handleAddCredits = async (userId: number, amount: number) => {
        const originalUsers = [...users];
        
        try {
            const updatedUser = await addCredits(userId, amount);
            setUsers(currentUsers => currentUsers.map(u => u.id === userId ? updatedUser : u));
        } catch (error) {
            console.error('Failed to add credits:', error);
            alert('فشل إضافة الرصيد.');
            setUsers(originalUsers);
        } finally {
            handleCloseAddCreditsModal();
        }
    };

    const handleUpdateUser = async (updatedUser: User) => {
        const originalUsers = [...users];
        // Optimistic update
        setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        handleCloseEditModal();

        try {
            await updateUser(updatedUser.id, { name: updatedUser.name, email: updatedUser.email });
        } catch (error) {
            console.error('Failed to update user:', error);
            setUsers(originalUsers);
            alert('فشل تحديث المستخدم.');
        }
    };
    
    const handleToggleVerified = async (id: number) => {
        const originalUsers = users;
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === id ? { ...user, isVerified: !user.isVerified } : user
            )
        );
        try {
            await toggleUserVerification(id);
        } catch (error) {
            console.error('Failed to toggle verification:', error);
            setUsers(originalUsers);
            alert('فشل تحديث حالة التوثيق.');
        }
    };
    
    const handleTogglePremium = async (id: number) => {
        const originalUsers = users;
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === id ? { ...user, isPremium: !user.isPremium } : user
            )
        );
        try {
            await toggleUserPremium(id);
        } catch (error) {
            console.error('Failed to toggle premium status:', error);
            setUsers(originalUsers);
            alert('فشل تحديث حالة العضوية المميزة.');
        }
    };

    return (
        <>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">إدارة المستخدمين</h3>
            {loading ? (
                <div className="flex justify-center items-center py-10"><Spinner /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الاسم</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">البريد الإلكتروني</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الرصيد</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-bold">{user.credits}</td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            {user.isVerified && <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full"><VerifiedIcon className="w-3 h-3"/> موثق</span>}
                                            {user.isPremium && <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold leading-none text-amber-800 bg-amber-100 rounded-full"><PremiumIcon className="w-3 h-3"/> بريميوم</span>}
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleToggleVerified(user.id)} className={`px-3 py-1 text-xs rounded-md ${user.isVerified ? 'bg-slate-200 text-slate-700' : 'bg-blue-500 text-white'}`}>{user.isVerified ? 'إلغاء التوثيق' : 'توثيق'}</button>
                                            <button onClick={() => handleTogglePremium(user.id)} className={`px-3 py-1 text-xs rounded-md ${user.isPremium ? 'bg-slate-200 text-slate-700' : 'bg-amber-500 text-white'}`}>{user.isPremium ? 'إلغاء البريميوم' : 'ترقية'}</button>
                                            <button onClick={() => handleOpenEditModal(user)} className="p-1 text-slate-500 hover:text-teal-600" title="تعديل المستخدم"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleOpenAddCreditsModal(user)} className="p-1 text-slate-500 hover:text-green-600" title="إضافة رصيد"><WalletIcon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        {isEditModalOpen && editingUser && (
            <EditUserModal user={editingUser} onClose={handleCloseEditModal} onSave={handleUpdateUser} />
        )}
        {isAddCreditsModalOpen && creditingUser && (
            <AddCreditsModal user={creditingUser} onClose={handleCloseAddCreditsModal} onSave={handleAddCredits} />
        )}
        </>
    );
};

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onSave: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...user, name, email });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">تعديل بيانات المستخدم</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">الاسم</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">إلغاء</button>
                        <button type="submit" className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700">حفظ التغييرات</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AddCreditsModalProps {
    user: User;
    onClose: () => void;
    onSave: (userId: number, amount: number) => void;
}

const AddCreditsModal: React.FC<AddCreditsModalProps> = ({ user, onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const creditAmount = parseInt(amount, 10);
        if (isNaN(creditAmount) || creditAmount <= 0) {
            setError('الرجاء إدخال رقم صحيح أكبر من صفر.');
            return;
        }
        setError('');
        onSave(user.id, creditAmount);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">إضافة رصيد</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-slate-600 mb-1">المستخدم: <span className="font-bold">{user.name}</span></p>
                        <p className="text-slate-600 mb-4">الرصيد الحالي: <span className="font-bold">{user.credits}</span></p>
                    </div>
                    <div>
                        <label htmlFor="credits" className="block text-sm font-bold text-slate-700 mb-1">المبلغ المراد إضافته</label>
                        <input type="number" id="credits" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="e.g., 50"/>
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">إلغاء</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700">إضافة الرصيد</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm, title, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="text-slate-600 mb-6">
                    {children}
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">إلغاء</button>
                    <button type="button" onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700">تأكيد الحذف</button>
                </div>
            </div>
        </div>
    );
};

const SettingsManagement = () => {
    // In a real app, this config would be fetched and updated via an API
    const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
        enabled: true,
        clientId: 'ca-pub-XXXXXXXXXXXXXXXX',
        slotId: '1234567890',
    });
    const [isMaintenance, setIsMaintenance] = useState(false);

    const handleSaveAdSense = (newConfig: AdSenseConfig) => {
        setAdSenseConfig(newConfig);
        alert('تم حفظ إعدادات AdSense! (محاكاة)');
    };
    
    const handleSaveSettings = () => {
        alert('تم حفظ الإعدادات العامة! (محاكاة)');
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">الإعدادات العامة</h3>
                <div className="space-y-4">
                     <div className="flex items-center">
                        <label htmlFor="maintenance-mode" className="mr-3 block text-sm font-medium text-slate-700">
                            وضع الصيانة
                        </label>
                        <input
                            type="checkbox"
                            id="maintenance-mode"
                            checked={isMaintenance}
                            onChange={(e) => setIsMaintenance(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition"
                    >
                        حفظ الإعدادات
                    </button>
                </div>
            </div>
            <AdSenseManager config={adSenseConfig} onConfigChange={handleSaveAdSense} />
        </div>
    );
}

const AdSenseManager: React.FC<{config: AdSenseConfig, onConfigChange: (newConfig: AdSenseConfig) => void}> = ({ config, onConfigChange }) => {
    const [localConfig, setLocalConfig] = useState<AdSenseConfig>(config);
    
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">إدارة إعلانات Google AdSense</h3>
            <div className="space-y-4">
                <div className="flex items-center">
                     <label htmlFor="adsense-enabled" className="mr-3 block text-sm font-medium text-slate-700">
                        تفعيل إعلانات AdSense
                    </label>
                    <input
                        type="checkbox"
                        id="adsense-enabled"
                        checked={localConfig.enabled}
                        onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                </div>
                <div>
                    <label htmlFor="client-id" className="block text-sm font-bold text-slate-700 mb-1">معرف العميل (Client ID)</label>
                    <input
                        type="text" id="client-id" value={localConfig.clientId}
                        onChange={(e) => setLocalConfig({ ...localConfig, clientId: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    />
                </div>
                <div>
                    <label htmlFor="slot-id" className="block text-sm font-bold text-slate-700 mb-1">معرف الوحدة الإعلانية (Slot ID)</label>
                    <input
                        type="text" id="slot-id" value={localConfig.slotId}
                        onChange={(e) => setLocalConfig({ ...localConfig, slotId: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="1234567890"
                    />
                </div>
                <button
                    onClick={() => onConfigChange(localConfig)}
                    className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition"
                >
                    حفظ الإعدادات
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;

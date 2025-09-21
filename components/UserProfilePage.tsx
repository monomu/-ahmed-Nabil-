import React, { useEffect, useState, useCallback } from 'react';
import { getUserById } from '../services/userService';
import { getAdsByUserId, updateAdStatus, deleteAd, promoteAd } from '../services/adService';
import { User, Ad } from '../types';
import Spinner from './Spinner';
import { VerifiedIcon, PremiumIcon, ArrowRightIcon, PlusIcon, WalletIcon, EditIcon, SoldIcon, TrashIcon, XIcon, StarIcon, ChatBubbleIcon, UserPlusIcon, UserCheckIcon, WhatsAppIcon } from './icons';
import AdCard from './AdCard';

interface UserProfilePageProps {
    userId: number;
    currentUser: User;
    onBack: () => void;
    onSelectAd: (adId: number) => void;
    onEditAd: (adId: number) => void;
    onAddCredits: (amount: number) => void;
    onSpendCredits: (amount: number) => void;
    onFollow: (targetUserId: number) => void;
    onUnfollow: (targetUserId: number) => void;
    onStartChat: (otherUserId: number) => void;
}

const PROMOTION_COST = 5;

const BuyCreditsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const whatsappNumber = "+9647701234567"; // Example number
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أرغب في شحن رصيد في حسابي على سوق هرج.')}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">شراء رصيد</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="text-slate-600 mb-6 space-y-3">
                   <p>لشحن رصيدك، يرجى التواصل معنا مباشرة عبر واتساب لمناقشة طرق الدفع المتاحة.</p>
                   <p className="font-bold text-lg text-center" dir="ltr">{whatsappNumber}</p>
                </div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 py-3 px-4 text-white rounded-lg font-bold transition-all bg-green-500 hover:bg-green-600">
                    <WhatsAppIcon className="w-6 h-6"/>
                    <span>التواصل عبر واتساب</span>
                </a>
            </div>
        </div>
    );
};


const UserProfilePage: React.FC<UserProfilePageProps> = ({ 
    userId, currentUser, onBack, onSelectAd, onEditAd, onAddCredits, onSpendCredits, onFollow, onUnfollow, onStartChat 
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adToDelete, setAdToDelete] = useState<number | null>(null);
    const [adToPromote, setAdToPromote] = useState<number | null>(null);
    const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);

    const isOwnProfile = userId === currentUser.id;
    const isFollowing = currentUser.following.includes(userId);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userData = getUserById(userId);
            if (!userData) {
                throw new Error('المستخدم غير موجود.');
            }
            // Use currentUser data if it's our own profile to ensure state is up to date
            setUser(isOwnProfile ? currentUser : userData);
            const userAds = await getAdsByUserId(userId);
            setAds(userAds);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحميل الملف الشخصي.');
        } finally {
            setLoading(false);
        }
    }, [userId, isOwnProfile, currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkAsSold = async (adId: number) => {
        const originalAds = [...ads];
        setAds(currentAds => currentAds.map(ad => ad.id === adId ? { ...ad, status: 'sold' } : ad));
        try {
            await updateAdStatus(adId, 'sold');
        } catch (error) {
            setAds(originalAds);
            alert("فشل تحديث حالة الإعلان");
        }
    };
    
    const handleConfirmDelete = async () => {
        if (adToDelete === null) return;
        const originalAds = [...ads];
        setAds(currentAds => currentAds.filter(ad => ad.id !== adToDelete));
        const id = adToDelete;
        setAdToDelete(null);
        try {
            await deleteAd(id);
        } catch (error) {
            setAds(originalAds);
            alert("فشل حذف الإعلان");
        }
    };

    const handleConfirmPromote = async () => {
        if (adToPromote === null) return;
        
        if (currentUser.credits < PROMOTION_COST) {
            setAdToPromote(null); // Close promotion modal
            setIsBuyCreditsModalOpen(true); // Open buy credits modal
            return;
        }

        const originalAds = [...ads];
        const adId = adToPromote;
        
        // Optimistic UI update
        setAds(currentAds => currentAds.map(ad => ad.id === adId ? { ...ad, isPromoted: true } : ad));
        setAdToPromote(null);

        try {
            await onSpendCredits(PROMOTION_COST);
            await promoteAd(adId);
        } catch (error) {
            console.error("Promotion failed:", error);
            setAds(originalAds); // Revert on failure
            alert("فشل ترويج الإعلان.");
        }
    };


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-500">{error}</div>;
    }
    
    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-teal-700 font-bold mb-6">
                <ArrowRightIcon className="w-5 h-5 transform rotate-180"/>
                <span>العودة</span>
            </button>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{user.name}</h1>
                            {user.isVerified && <span className="flex items-center gap-1 px-2 py-1 text-sm font-bold leading-none text-blue-800 bg-blue-100 rounded-full"><VerifiedIcon className="w-4 h-4"/> موثق</span>}
                            {user.isPremium && <span className="flex items-center gap-1 px-2 py-1 text-sm font-bold leading-none text-amber-800 bg-amber-100 rounded-full"><PremiumIcon className="w-4 h-4"/> بريميوم</span>}
                        </div>
                        <p className="text-slate-500">{user.email}</p>
                        <p className="text-slate-500 text-sm mt-1">عضو منذ: {user.joinedAt.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="text-center">
                                <span className="font-bold text-lg text-slate-800">{user.followers.length}</span>
                                <span className="text-sm text-slate-500 block">متابعون</span>
                            </div>
                             <div className="text-center">
                                <span className="font-bold text-lg text-slate-800">{user.following.length}</span>
                                <span className="text-sm text-slate-500 block">يتابع</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        {isOwnProfile ? (
                            <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 text-lg font-bold text-slate-700">
                                    <WalletIcon className="w-6 h-6 text-amber-500"/>
                                    <span>الرصيد: {user.credits}</span>
                                </div>
                                <button onClick={() => setIsBuyCreditsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>شراء رصيد</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => onStartChat(user.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition">
                                    <ChatBubbleIcon className="w-5 h-5" />
                                    <span>رسالة</span>
                                </button>
                                {isFollowing ? (
                                    <button onClick={() => onUnfollow(user.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition">
                                        <UserCheckIcon className="w-5 h-5"/>
                                        <span>تتابع</span>
                                    </button>
                                ) : (
                                    <button onClick={() => onFollow(user.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-teal-600 transition">
                                        <UserPlusIcon className="w-5 h-5"/>
                                        <span>متابعة</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">إعلانات {user.name}</h2>
                {ads.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ads.map(ad => (
                            <div key={ad.id} className="relative">
                                <AdCard ad={ad} onSelect={() => onSelectAd(ad.id)} />
                                {isOwnProfile && (
                                     <div className="absolute top-2 left-2 flex flex-col gap-2">
                                        <button onClick={() => onEditAd(ad.id)} title="تعديل" className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:bg-blue-500 hover:text-white shadow-md transition-all"><EditIcon className="w-5 h-5"/></button>
                                        {ad.status === 'active' && <button onClick={() => handleMarkAsSold(ad.id)} title="تمييز كمباع" className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:bg-green-500 hover:text-white shadow-md transition-all"><SoldIcon className="w-5 h-5"/></button>}
                                        {ad.status === 'active' && !ad.isPromoted && <button onClick={() => setAdToPromote(ad.id)} title="ترويج الإعلان" className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:bg-amber-500 hover:text-white shadow-md transition-all"><StarIcon className="w-5 h-5"/></button>}
                                        <button onClick={() => setAdToDelete(ad.id)} title="حذف" className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:bg-red-500 hover:text-white shadow-md transition-all"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-slate-700">لا توجد إعلانات لعرضها</h3>
                        <p className="text-slate-500 mt-2">لم يقم هذا المستخدم بنشر أي إعلانات بعد.</p>
                    </div>
                )}
            </div>

            {isBuyCreditsModalOpen && <BuyCreditsModal onClose={() => setIsBuyCreditsModalOpen(false)} />}

            {/* Deletion Modal */}
            {adToDelete !== null && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">تأكيد الحذف</h2>
                            <button onClick={() => setAdToDelete(null)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="text-slate-600 mb-6">
                           <p>هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setAdToDelete(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">إلغاء</button>
                            <button type="button" onClick={handleConfirmDelete} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700">تأكيد الحذف</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Promotion Modal */}
            {adToPromote !== null && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">ترويج الإعلان</h2>
                            <button onClick={() => setAdToPromote(null)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="text-slate-600 mb-6">
                           <p>سيتم ترويج هذا الإعلان ليظهر في أعلى نتائج البحث. هذه العملية ستكلف <span className="font-bold text-amber-600">{PROMOTION_COST} نقاط رصيد</span>.</p>
                           <p className="mt-2">رصيدك الحالي: <span className="font-bold">{currentUser.credits}</span></p>
                           <p className="mt-2 font-bold text-teal-700">هل أنت متأكد من المتابعة؟</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setAdToPromote(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">إلغاء</button>
                            <button type="button" onClick={handleConfirmPromote} className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600" disabled={currentUser.credits < PROMOTION_COST}>
                                {currentUser.credits < PROMOTION_COST ? 'رصيد غير كاف' : 'تأكيد الترويج'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;

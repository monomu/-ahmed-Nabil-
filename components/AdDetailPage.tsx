import React, { useEffect, useState, useRef } from 'react';
import { getAdById } from '../services/adService';
import { Ad, User } from '../types';
import Spinner from './Spinner';
import { LocationIcon, MoneyIcon, HeartIcon, WhatsAppIcon, ChatBubbleIcon, ArrowRightIcon, VerifiedIcon, SoldIcon } from './icons';

interface AdDetailPageProps {
    adId: number;
    onBack: () => void;
    onSelectUser: (userId: number) => void;
    onStartChat: (otherUserId: number) => void;
    currentUser: User | null;
}

const AdDetailPage: React.FC<AdDetailPageProps> = ({ adId, onBack, onSelectUser, onStartChat, currentUser }) => {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        setLoading(true);
        getAdById(adId).then(data => {
            if (data) {
                setAd(data);
                setLikeCount(data.likes);
            } else {
                setError('لم يتم العثور على الإعلان المطلوب.');
            }
            setLoading(false);
        }).catch(() => {
            setError('حدث خطأ أثناء تحميل الإعلان.');
            setLoading(false);
        });
    }, [adId]);

    const handleLikeClick = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const scrollToImage = (index: number) => {
        if (carouselRef.current) {
            carouselRef.current.scrollTo({
                left: carouselRef.current.offsetWidth * index,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        if (carouselRef.current) {
            const index = Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth);
            setCurrentImageIndex(index);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-500">{error}</div>;
    }

    if (!ad) {
        return null;
    }
    
    const whatsappLink = `https://wa.me/${ad.phoneNumber.replace(/\D/g, '')}`;
    const isSold = ad.status === 'sold';
    const isOwnAd = currentUser?.id === ad.author.id;

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-teal-700 font-bold mb-4">
                <ArrowRightIcon className="w-5 h-5 transform rotate-180"/>
                <span>العودة</span>
            </button>
            
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{ad.title}</h1>
                {isSold && (
                     <span className="flex-shrink-0 flex items-center gap-2 bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                        <SoldIcon className="w-4 h-4" />
                        تم البيع
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 flex-wrap">
                <div className="flex items-center gap-1">
                    <LocationIcon className="w-4 h-4" />
                    <span>{ad.governorate}</span>
                </div>
                <span className="mx-1">|</span>
                <div className="flex items-center gap-2">
                    <span>نُشر بواسطة:</span>
                    <button onClick={() => onSelectUser(ad.author.id)} className="font-bold text-teal-600 hover:underline">
                      {ad.author.name}
                    </button>
                    {ad.author.isVerified && (
                        <span className="flex items-center gap-1 text-blue-600 font-bold" title="بائع موثوق">
                            <VerifiedIcon className="w-4 h-4" />
                            <span>موثوق</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="relative group aspect-[4/3] bg-slate-100">
                        <div
                            ref={carouselRef}
                            onScroll={handleScroll}
                            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
                        >
                            {ad.images.map((img, index) => (
                                <div key={index} className="w-full h-full flex-shrink-0 snap-center">
                                    <img
                                        src={img}
                                        alt={`${ad.title} - صورة ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                         {isSold && <div className="absolute inset-0 bg-white bg-opacity-30"></div>}
                        
                        {ad.images.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                {ad.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => scrollToImage(index)}
                                        aria-label={`الانتقال للصورة ${index + 1}`}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            currentImageIndex === index ? 'bg-white scale-125 shadow-md' : 'bg-white/60 hover:bg-white'
                                        }`}
                                    ></button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ad Details */}
                    <div className="p-8 flex flex-col">
                        <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 mb-6">
                            {ad.price.toLocaleString()} د.ع
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 border-b pb-2">الوصف</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                        </div>
                        
                        <div className="mt-auto space-y-4">
                            <button onClick={handleLikeClick} className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-colors border-2 ${isLiked ? 'bg-red-50 border-red-500 text-red-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
                                <HeartIcon className="w-6 h-6" solid={isLiked}/>
                                <span>{isLiked ? 'تم الإعجاب' : 'إعجاب'} ({likeCount.toLocaleString()})</span>
                            </button>
                           {!isOwnAd && (
                             <div className="grid grid-cols-2 gap-3">
                                <a href={isSold ? undefined : whatsappLink} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3 px-4 text-white rounded-lg font-bold transition-all transform ${isSold ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 hover:scale-105'}`}>
                                    <WhatsAppIcon className="w-6 h-6"/>
                                    <span>واتساب</span>
                                </a>
                                <button onClick={() => onStartChat(ad.author.id)} disabled={isSold} className={`flex items-center justify-center gap-2 py-3 px-4 text-white rounded-lg font-bold transition-all transform ${isSold ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}>
                                    <ChatBubbleIcon className="w-6 h-6"/>
                                    <span>دردشة</span>
                                 </button>
                            </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdDetailPage;
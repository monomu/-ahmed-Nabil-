import React, { useState } from 'react';
import { Ad } from '../types';
import { LocationIcon, MoneyIcon, HeartIcon, StarIcon } from './icons';

interface AdCardProps {
  ad: Ad;
  onSelect: () => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onSelect }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(ad.likes);

  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `قبل ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `قبل ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `قبل ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `قبل ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `قبل ${Math.floor(interval)} دقيقة`;
    return `قبل ${Math.floor(seconds)} ثانية`;
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click event from firing
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div onClick={onSelect} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-2xl hover:border-teal-400 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer flex flex-col">
       {ad.isPromoted && (
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-bold px-4 py-1.5 flex items-center justify-center gap-2">
          <StarIcon className="w-5 h-5" />
          <span>إعلان مميز</span>
        </div>
      )}
      <div className="relative h-56">
        <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" src={ad.images[0]} alt={ad.title} />
        {ad.status === 'sold' && (
             <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-lg transform -rotate-12">تم البيع</span>
            </div>
        )}
        <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">{timeAgo(ad.postedAt)}</div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-teal-700 transition-colors">{ad.title}</h3>
        <div className="mt-2 flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-1">
                <LocationIcon className="w-4 h-4 text-slate-400" />
                <span>{ad.governorate}</span>
            </div>
            <div className="flex items-center gap-1 text-teal-600 font-bold">
                <MoneyIcon className="w-5 h-5" />
                <span>{ad.price.toLocaleString()} د.ع</span>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end mt-auto">
             <button onClick={handleLikeClick} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                <HeartIcon className={`w-5 h-5 ${isLiked ? 'text-red-500' : ''}`} solid={isLiked} />
                <span className="text-sm font-medium">{likeCount.toLocaleString()}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
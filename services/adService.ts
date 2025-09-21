
import { Ad, Governorate, User } from '../types';
import { IRAQI_GOVERNORATES } from '../constants';
import { getUserById } from './userService';


// Helper to join ad with user data
const joinAdWithAuthor = (ad: Omit<Ad, 'author'>): Ad => {
    const authorData = getUserById(ad.userId);
    const author = authorData || { id: 0, name: 'مستخدم محذوف', email: '', isVerified: false, isPremium: false, joinedAt: new Date(), credits: 0, followers: [], following: [], role: 'user' };
    
    // FIX: The `getUserById` function already returns a user object without the password hash.
    // The check for and deletion of `password_hash` was redundant and caused a TypeScript error.

    return { ...ad, author };
};


let adsData: Omit<Ad, 'author'>[] = [];

let nextId = 1;

export const getAds = async (filter?: { governorate?: Governorate, searchTerm?: string }): Promise<Ad[]> => {
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  let filteredAds = adsData;
  if (filter?.governorate) {
    filteredAds = filteredAds.filter(ad => ad.governorate === filter.governorate);
  }
  if (filter?.searchTerm) {
    const term = filter.searchTerm.toLowerCase();
    filteredAds = filteredAds.filter(ad => ad.title.toLowerCase().includes(term) || ad.description.toLowerCase().includes(term));
  }
  const joinedAds = filteredAds.map(joinAdWithAuthor);
  // Sort by promoted first, then by date
  return [...joinedAds].sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return b.postedAt.getTime() - a.postedAt.getTime();
  });
};

export const getAdById = async (id: number): Promise<Ad | undefined> => {
    await new Promise(res => setTimeout(res, 300));
    const ad = adsData.find(ad => ad.id === id);
    return ad ? joinAdWithAuthor(ad) : undefined;
}

export const addAd = async (adData: Omit<Ad, 'id' | 'postedAt' | 'author' | 'likes' | 'status' | 'isPromoted'>): Promise<Ad> => {
  await new Promise(res => setTimeout(res, 1000));
  const newAdData: Omit<Ad, 'author'> = {
    ...adData,
    id: nextId++,
    postedAt: new Date(),
    likes: 0,
    status: 'active',
    isPromoted: false,
  };
  adsData.unshift(newAdData);
  return joinAdWithAuthor(newAdData);
};

export const updateAd = async (adId: number, adData: Omit<Ad, 'id' | 'postedAt' | 'author' | 'likes' | 'status' | 'userId' | 'images' | 'isPromoted'>): Promise<Ad> => {
    await new Promise(res => setTimeout(res, 1000));
    let updatedAd: Omit<Ad, 'author'> | undefined;
    adsData = adsData.map(ad => {
        if (ad.id === adId) {
            updatedAd = { ...ad, ...adData };
            return updatedAd;
        }
        return ad;
    });
    if (!updatedAd) throw new Error("Ad not found");
    return joinAdWithAuthor(updatedAd);
};

export const updateAdStatus = async (adId: number, status: 'active' | 'sold'): Promise<void> => {
    await new Promise(res => setTimeout(res, 300));
    adsData = adsData.map(ad => ad.id === adId ? { ...ad, status } : ad);
};

export const promoteAd = async (adId: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 300));
    adsData = adsData.map(ad => ad.id === adId ? { ...ad, isPromoted: true } : ad);
};

export const deleteAd = async (id: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 500));
    adsData = adsData.filter(ad => ad.id !== id);
};

export const getAllAdsForAdmin = async (): Promise<Ad[]> => {
    await new Promise(res => setTimeout(res, 500));
    const joinedAds = adsData.map(joinAdWithAuthor);
    return [...joinedAds].sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
}

export const getAdsByUserId = async (userId: number): Promise<Ad[]> => {
    await new Promise(res => setTimeout(res, 500));
    const userAds = adsData.filter(ad => ad.userId === userId);
    const joinedAds = userAds.map(joinAdWithAuthor);
    return [...joinedAds].sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return b.postedAt.getTime() - a.postedAt.getTime();
    });
}

import { User } from '../types';

// FIX: Export the 'users' array so it can be accessed by other services like chatService.
export let users: User[] = [
    {
        id: 1,
        name: "مالك الموقع",
        email: "admin@souq.com",
        password_hash: "admin123", // In a real app, this would be a proper hash
        role: 'admin',
        isVerified: true,
        isPremium: true,
        joinedAt: new Date(),
        credits: 9999,
        followers: [],
        following: [],
    }
];

let nextId = 2;

export const login = async (email: string, password_hash: string): Promise<User | null> => {
    await new Promise(res => setTimeout(res, 500));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password_hash);
    return user ? { ...user } : null; // Return a copy
};

export const register = async (name: string, email: string, password_hash: string): Promise<User | { error: string }> => {
    await new Promise(res => setTimeout(res, 500));
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { error: "هذا البريد الإلكتروني مسجل بالفعل." };
    }
    const newUser: User = {
        id: nextId++,
        name,
        email,
        password_hash,
        role: 'user',
        isVerified: false,
        isPremium: false,
        joinedAt: new Date(),
        credits: 5, // Welcome bonus credits
        followers: [],
        following: [],
    };
    users.push(newUser);
    return { ...newUser }; // Return a copy
};

export const getUsers = async (): Promise<Omit<User, 'password_hash'>[]> => {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    // Return copies without password
    return users.map(u => {
        const { password_hash, ...user } = u;
        return user;
    }).sort((a, b) => a.id - b.id);
};

export const getUserById = (id: number): Omit<User, 'password_hash'> | undefined => {
    const user = users.find(u => u.id === id);
    if (!user) return undefined;
    // Return a copy without password
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
}

export const toggleUserVerification = async (id: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 300));
    users = users.map(u => u.id === id ? { ...u, isVerified: !u.isVerified } : u);
};

export const toggleUserPremium = async (id: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 300));
    users = users.map(u => u.id === id ? { ...u, isPremium: !u.isPremium } : u);
};

export const updateUser = async (id: number, data: { name: string, email: string }): Promise<User> => {
    await new Promise(res => setTimeout(res, 400));
    let updatedUser: User | undefined;
    users = users.map(u => {
        if (u.id === id) {
            updatedUser = { ...u, name: data.name, email: data.email };
            return updatedUser;
        }
        return u;
    });
    if (!updatedUser) {
        throw new Error('User not found');
    }
    const { password_hash, ...sanitizedUser } = updatedUser;
    return sanitizedUser;
};

export const spendCredit = async (userId: number, amount: number = 1): Promise<User> => {
    await new Promise(res => setTimeout(res, 100));
    let updatedUser: User | undefined;
    users = users.map(u => {
        if (u.id === userId && u.credits >= amount) {
            updatedUser = { ...u, credits: u.credits - amount };
            return updatedUser;
        }
        return u;
    });
    if (!updatedUser) throw new Error("User not found or insufficient credits");
    const { password_hash, ...sanitizedUser } = updatedUser;
    return sanitizedUser;
};

export const addCredits = async (userId: number, amount: number): Promise<User> => {
    await new Promise(res => setTimeout(res, 500));
    let updatedUser: User | undefined;
    users = users.map(u => {
        if (u.id === userId) {
            updatedUser = { ...u, credits: u.credits + amount };
            return updatedUser;
        }
        return u;
    });
    if (!updatedUser) throw new Error("User not found");
    const { password_hash, ...sanitizedUser } = updatedUser;
    return sanitizedUser;
};

export const followUser = async (currentUserId: number, targetUserId: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 200));
    users = users.map(u => {
        if (u.id === currentUserId) {
            // Prevent duplicates
            if (!u.following.includes(targetUserId)) {
                 return { ...u, following: [...u.following, targetUserId] };
            }
        }
        if (u.id === targetUserId) {
            // Prevent duplicates
            if (!u.followers.includes(currentUserId)) {
                return { ...u, followers: [...u.followers, currentUserId] };
            }
        }
        return u;
    });
};

export const unfollowUser = async (currentUserId: number, targetUserId: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 200));
    users = users.map(u => {
        if (u.id === currentUserId) {
            return { ...u, following: u.following.filter(id => id !== targetUserId) };
        }
        if (u.id === targetUserId) {
            return { ...u, followers: u.followers.filter(id => id !== currentUserId) };
        }
        return u;
    });
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, UserCredential } from 'firebase/auth';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from '../lib/firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface DBUser {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  joinedAt: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  dbUser: DBUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (name: string, email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  syncWithDB: (fbUser: FirebaseUser) => Promise<void>;
  refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase authenticated user details with MongoDB
  const syncWithDB = async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken(true); // force refresh to get latest claim
      const response = await axios.post(
        `${API_URL}/auth/sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setDbUser(response.data);
    } catch (error) {
      console.error('Failed to sync authenticated user with MongoDB backend:', error);
      // Fallback for mock/local testing if server is booting
      setDbUser({
        _id: 'local-mongodb-id',
        firebaseUid: fbUser.uid,
        name: fbUser.displayName || 'Valued Guest',
        email: fbUser.email || '',
        role: ['admin@atithi.com', 'atithi804@gmail.com'].includes((fbUser.email || '').toLowerCase()) ? 'admin' : 'user',
        joinedAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        await syncWithDB(user);
      } else {
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Set Firebase display name
      if (credential.user) {
        await updateProfile(credential.user, { displayName: name });
      }
      return credential;
    } finally {
      setLoading(false);
    }
  };
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      return credential;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setDbUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await axios.post(`${API_URL}/auth/send-password-reset`, { email });
  };

  const resendVerification = async () => {
    if (currentUser) {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_URL}/auth/send-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } else {
      throw new Error('No authenticated user found');
    }
  };

  const refreshAuthStatus = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await auth.currentUser.reload();
        const updatedUser = auth.currentUser;
        // Construct a new user object to force state update in React
        setCurrentUser({ ...updatedUser } as FirebaseUser);
        await syncWithDB(updatedUser);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        dbUser,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerification,
        syncWithDB,
        refreshAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Auth provider that creates a local anonymous user.
 * No Firebase dependency — works fully offline.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create a local anonymous user identity
    let anonId = localStorage.getItem('safereport_anon_id');
    if (!anonId) {
      anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('safereport_anon_id', anonId);
    }

    setUser({
      uid: anonId,
      isAnonymous: true,
      displayName: 'Anonymous',
    });
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

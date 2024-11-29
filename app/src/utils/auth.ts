// utils/auth.ts
export const setAuth = (role: string, userDetails: any) => {
  localStorage.setItem('auth', JSON.stringify({ role, userDetails }));
};

export const getAuth = () => {
  const authData = localStorage.getItem('auth');
  return authData ? JSON.parse(authData) : null;
};

export const logout = () => {
  localStorage.removeItem('auth');
};

export const isAuthenticated = () => {
  return getAuth() !== null;
};

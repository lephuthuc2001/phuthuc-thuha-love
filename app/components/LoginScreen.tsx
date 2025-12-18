'use client';

import { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
  correctCredential: string;
}

export default function LoginScreen({ onLogin, correctCredential }: LoginScreenProps) {
  const [credential, setCredential] = useState('');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCredentialInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Auto-format DD-MM-YYYY
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length > 4) {
      value = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + '-' + value.slice(2);
    }
    
    setCredential(value);
    
    if (value.length === 10) {
      if (value === correctCredential) {
        setError(false);
        setIsSuccess(true);
        // Add a small delay for better UX
        setTimeout(() => {
          onLogin();
        }, 1500);
      } else {
        setError(true);
        setTimeout(() => setError(false), 500);
      }
    } else {
      setError(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-1000 ${isSuccess ? 'bg-white/50 backdrop-blur-sm' : ''}`}>
      <div className={`glass-card p-8 rounded-3xl max-w-md w-full text-center shadow-2xl transform transition-all duration-700 ${
        isSuccess ? 'scale-110 opacity-0 translate-y-[-20px]' : 'hover:scale-105'
      }`}>
        <div className="mb-6">
          <i className={`fas fa-heart text-5xl animate-pulse ${isSuccess ? 'text-green-500' : 'text-pink-500'}`}></i>
        </div>
        <h2 className="text-3xl font-bold text-pink-600 mb-2 script-font">
          {isSuccess ? 'Welcome Home ❤️' : 'Welcome, my Love'}
        </h2>
        <p className="text-gray-700 mb-6">
          {isSuccess ? 'Unlocking our memories...' : 'Please enter our special date to verify it\'s you ❤️'}
        </p>
        
        <div className="relative">
          <input 
            type="text" 
            value={credential}
            onChange={handleCredentialInput}
            disabled={isSuccess}
            placeholder="DD-MM-YYYY" 
            maxLength={10}
            className={`w-full bg-white/50 border-2 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-pink-200 placeholder-pink-300 transition-all font-mono ${
              error ? 'border-red-400 animate-shake' : 
              isSuccess ? 'border-green-400 text-green-600 bg-green-50' : 'border-pink-200 text-pink-600'
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {isSuccess ? (
              <i className="fas fa-check text-green-500 text-xl"></i>
            ) : (
              <i className="fas fa-key text-pink-400"></i>
            )}
          </div>
        </div>
        <p className={`text-red-500 text-sm mt-3 h-5 transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}>
          Incorrect date, please try again
        </p>
      </div>
    </div>
  );
}

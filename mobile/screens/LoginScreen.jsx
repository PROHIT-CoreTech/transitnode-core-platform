import React, { useState, useContext } from 'react';
import { DriverAuthContext } from '../context/DriverAuthContext';
import { getTranslation } from '../config/languageConfig';
import TouchButton from '../components/Common/TouchButton';
import LanguageButton from '../components/Common/LanguageButton';

// Multi-language credential validation portal
const LoginScreen = () => {
  const { language } = useContext(DriverAuthContext);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    // Implement login
    console.log('Logging in...', phone, pin);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-900 justify-between">
      <div className="flex justify-center space-x-4 mt-8">
        <LanguageButton langCode="en" label="English" />
        <LanguageButton langCode="mr" label="मराठी" />
        <LanguageButton langCode="hi" label="हिंदी" />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TransitNode</h1>
          <p className="text-gray-400">{getTranslation(language, 'login')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm font-medium ml-1 mb-1 block">
              {getTranslation(language, 'phone_number')}
            </label>
            <input
              type="tel"
              className="w-full bg-gray-800 text-white rounded-xl px-5 py-4 border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-lg"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm font-medium ml-1 mb-1 block">
              {getTranslation(language, 'enter_pin')}
            </label>
            <input
              type="password"
              className="w-full bg-gray-800 text-white rounded-xl px-5 py-4 border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-lg tracking-widest"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
        </div>

        <TouchButton onClick={handleLogin} className="mt-8">
          {getTranslation(language, 'submit')}
        </TouchButton>
      </div>
    </div>
  );
};

export default LoginScreen;

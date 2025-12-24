
import React, { useState, useEffect } from 'react';
import { AppConfig, configService } from '../services/configService';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: AppConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [config, setConfig] = useState<AppConfig>({ shortcutToken: '', geminiApiKey: '' });

  useEffect(() => {
    if (isOpen) {
      setConfig(configService.getConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    configService.setConfig(config);
    onConfigSaved(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border dark:border-slate-700 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Configuración</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Shortcut API Token</label>
              <input
                type="password"
                value={config.shortcutToken}
                onChange={(e) => setConfig({ ...config, shortcutToken: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 py-2.5 px-4 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Gemini API Key</label>
              <input
                type="password"
                value={config.geminiApiKey}
                onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 py-2.5 px-4 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-bold py-3 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

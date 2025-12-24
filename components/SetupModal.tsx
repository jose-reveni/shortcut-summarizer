
import React, { useState } from 'react';
import { AppConfig, configService } from '../services/configService';

interface SetupModalProps {
    isOpen: boolean;
    onConfigSaved: (config: AppConfig) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onConfigSaved }) => {
    const [shortcutToken, setShortcutToken] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!shortcutToken || !geminiApiKey) {
            alert('Por favor, rellena ambas claves.');
            return;
        }

        const newConfig = { shortcutToken, geminiApiKey };
        configService.setConfig(newConfig);
        onConfigSaved(newConfig);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 transition-all">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-2 leading-tight">Bienvenido a Shortcut AI</h2>
                        <p className="text-indigo-100 text-sm font-medium">Configura tus credenciales para empezar a generar changelogs increíbles.</p>
                    </div>
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Shortcut API Token</label>
                            <input
                                type="password"
                                value={shortcutToken}
                                onChange={(e) => setShortcutToken(e.target.value)}
                                placeholder="Introduzca su token de Shortcut"
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                            />
                            <p className="mt-1.5 text-[10px] text-gray-400 dark:text-slate-500">Puedes encontrarlo en Settings &gt; API Tokens</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Gemini API Key</label>
                            <input
                                type="password"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="Introduzca su clave de Gemini"
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                            />
                            <p className="mt-1.5 text-[10px] text-gray-400 dark:text-slate-500">Obtén una en Google AI Studio (aistudio.google.com)</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleSave}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            Comenzar Ahora
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </button>
                        <p className="mt-4 text-center text-[10px] text-gray-400 dark:text-slate-500 px-4">
                            Tus claves se guardan localmente en el navegador y nunca se comparten fuera de las solicitudes a Shortcut y Google.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


import React, { useState, useMemo, useEffect } from 'react';
import { ShortcutStory, LoadingState, WeekRange } from './types';
import { ShortcutService } from './services/shortcutService';
import { generateChangelog } from './services/geminiService';
import { configService, AppConfig } from './services/configService';
import { Settings } from './components/Settings';
import { StoryList } from './components/StoryList';
import { SetupModal } from './components/SetupModal';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(configService.getConfig());
  const [stories, setStories] = useState<ShortcutStory[]>([]);
  const [changelog, setChangelog] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(!configService.isConfigured());

  // Update setup modal visibility when config changes externally (e.g. from settings)
  useEffect(() => {
    setIsSetupOpen(!configService.isConfigured());
  }, [config]);

  const handleConfigSaved = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setIsSetupOpen(false);
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Generar las últimas 5 semanas (Lunes a Domingo)
  const weekOptions = useMemo(() => {
    const options: WeekRange[] = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7));

      // Ajustar al lunes de esa semana
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      // Domingo de esa semana
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const label = i === 0 ? 'Esta semana' : i === 1 ? 'Semana pasada' : `Semana del ${monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;

      options.push({
        label,
        start: monday.toISOString(),
        end: sunday.toISOString()
      });
    }
    return options;
  }, []);

  const [selectedWeek, setSelectedWeek] = useState<WeekRange>(weekOptions[0]);

  const handleGenerate = async () => {
    if (!config.shortcutToken) {
      setIsSetupOpen(true);
      return;
    }

    setLoadingState(LoadingState.FETCHING_STORIES);
    setProgressMessage(`Buscando historias (${selectedWeek.label})...`);
    setError(null);
    setStories([]);
    setChangelog('');

    try {
      const shortcutService = new ShortcutService(config.shortcutToken);
      const fetchedStories = await shortcutService.getCompletedStories(selectedWeek.start, selectedWeek.end);

      if (!fetchedStories || fetchedStories.length === 0) {
        setLoadingState(LoadingState.IDLE);
        setError(`No se encontraron historias para el periodo: ${selectedWeek.label}`);
        return;
      }

      setStories(fetchedStories);
      setLoadingState(LoadingState.GENERATING_CHANGELOG);
      setProgressMessage('Gemini está analizando los datos...');

      const generatedContent = await generateChangelog(fetchedStories, config.geminiApiKey);

      setChangelog(generatedContent);
      setLoadingState(LoadingState.IDLE);
      setProgressMessage('');
    } catch (err: any) {
      setError(err.message || "Error inesperado durante el proceso.");
      setLoadingState(LoadingState.ERROR);
      setProgressMessage('');
    }
  };

  const isWorking = loadingState === LoadingState.FETCHING_STORIES || loadingState === LoadingState.GENERATING_CHANGELOG;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-100 dark:shadow-none">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Shortcut AI</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">Generador de Changelog</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-slate-400"
            title={theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-slate-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Parámetros</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Seleccionar Periodo</label>
                <div className="relative">
                  <select
                    value={selectedWeek.start}
                    onChange={(e) => {
                      const week = weekOptions.find(w => w.start === e.target.value);
                      if (week) setSelectedWeek(week);
                    }}
                    className="w-full appearance-none bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all font-medium"
                  >
                    {weekOptions.map((option) => (
                      <option key={option.start} value={option.start}>{option.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.707 6.586 4.293 8.122l5 5z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isWorking}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${isWorking
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95'
                }`}
            >
              {!isWorking ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar Reporte
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg text-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Atención
                </div>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          <StoryList stories={stories} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[600px] flex flex-col overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${changelog ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                <h3 className="font-bold text-gray-800 dark:text-white">Resultado IA</h3>
                {changelog && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase ml-2">{selectedWeek.label}</span>}
              </div>
              {changelog && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(changelog);
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-all bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg"
                >
                  Copiar Markdown
                </button>
              )}
            </div>

            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar relative">
              {isWorking ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-full max-w-md bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full animate-[shimmer_2s_infinite] w-full origin-left"></div>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{progressMessage}</p>
                </div>
              ) : changelog ? (
                <div className="prose prose-indigo dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-slate-300 font-sans leading-relaxed">
                    {changelog}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-full mb-4 text-gray-300 dark:text-slate-700">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Selecciona una semana y genera el changelog.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={handleConfigSaved}
      />

      <SetupModal
        isOpen={isSetupOpen}
        onConfigSaved={handleConfigSaved}
      />
    </div>
  );
};

export default App;

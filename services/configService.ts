
export interface AppConfig {
    shortcutToken: string;
    geminiApiKey: string;
}

const STORAGE_KEYS = {
    SHORTCUT_TOKEN: 'shortcut_token',
    GEMINI_API_KEY: 'gemini_api_key'
};

export const configService = {
    getConfig(): AppConfig {
        return {
            shortcutToken: localStorage.getItem(STORAGE_KEYS.SHORTCUT_TOKEN) || (process.env as any).SHORTCUT_TOKEN || '',
            geminiApiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || (process.env as any).GEMINI_API_KEY || ''
        };
    },

    setConfig(config: AppConfig) {
        localStorage.setItem(STORAGE_KEYS.SHORTCUT_TOKEN, config.shortcutToken);
        localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, config.geminiApiKey);
    },

    isConfigured(): boolean {
        const config = this.getConfig();
        return !!config.shortcutToken && !!config.geminiApiKey;
    },

    clearConfig() {
        localStorage.removeItem(STORAGE_KEYS.SHORTCUT_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    }
};

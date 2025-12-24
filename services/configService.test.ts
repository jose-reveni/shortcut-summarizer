
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configService } from './configService';

describe('configService', () => {
    beforeEach(() => {
        const mockStore: Record<string, string> = {};
        const mockLocalStorage = {
            getItem: (key: string) => mockStore[key] || null,
            setItem: (key: string, value: string) => { mockStore[key] = value; },
            removeItem: (key: string) => { delete mockStore[key]; },
            clear: () => { for (const key in mockStore) delete mockStore[key]; },
            length: 0,
            key: (index: number) => Object.keys(mockStore)[index]
        };
        vi.stubGlobal('localStorage', mockLocalStorage);

        vi.stubGlobal('process', {
            env: {
                SHORTCUT_TOKEN: 'env_shortcut',
                GEMINI_API_KEY: 'env_gemini'
            }
        });
    });

    it('should return values from process.env if localStorage is empty', () => {
        const config = configService.getConfig();
        expect(config.shortcutToken).toBe('env_shortcut');
        expect(config.geminiApiKey).toBe('env_gemini');
    });

    it('should prioritize localStorage over process.env', () => {
        localStorage.setItem('shortcut_token', 'local_shortcut');
        localStorage.setItem('gemini_api_key', 'local_gemini');

        const config = configService.getConfig();
        expect(config.shortcutToken).toBe('local_shortcut');
        expect(config.geminiApiKey).toBe('local_gemini');
    });

    it('should return partially from env and partially from local if mixed', () => {
        localStorage.setItem('shortcut_token', 'local_shortcut');

        const config = configService.getConfig();
        expect(config.shortcutToken).toBe('local_shortcut');
        expect(config.geminiApiKey).toBe('env_gemini');
    });

    it('should return true for isConfigured if both keys exist', () => {
        expect(configService.isConfigured()).toBe(true);
    });

    it('should return false for isConfigured if any key is missing', () => {
        vi.stubGlobal('process', { env: {} });
        expect(configService.isConfigured()).toBe(false);
    });

    it('should save config to localStorage', () => {
        configService.setConfig({
            shortcutToken: 'new_shortcut',
            geminiApiKey: 'new_gemini'
        });

        expect(localStorage.getItem('shortcut_token')).toBe('new_shortcut');
        expect(localStorage.getItem('gemini_api_key')).toBe('new_gemini');
    });
});

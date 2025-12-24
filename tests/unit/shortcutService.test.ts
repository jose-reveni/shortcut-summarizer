import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShortcutService } from '../../services/shortcutService';

describe('ShortcutService', () => {
    const apiToken = 'fake-token';
    let service: ShortcutService;

    beforeEach(() => {
        service = new ShortcutService(apiToken);
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should fetch groups correctly', async () => {
        const mockGroups = [
            { id: '1', name: 'Frontend Team' },
            { id: '2', name: 'Backend Team' }
        ];

        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockGroups
        });

        // Accedemos a método privado para test para simplificar el ejemplo
        // @ts-ignore
        const groups = await service.getGroups();

        expect(fetch).toHaveBeenCalledWith('/api/shortcut/groups', expect.any(Object));
        expect(groups).toEqual({
            '1': 'Frontend Team',
            '2': 'Backend Team'
        });
    });

    it('should handle fetch errors in getGroups', async () => {
        (fetch as any).mockRejectedValue(new Error('Network error'));

        // @ts-ignore
        const groups = await service.getGroups();

        expect(groups).toEqual({});
    });

    it('should fetch stories and augment them with metadata', async () => {
        // Mock for getGroups, getEpics, getUsers inside getCompletedStories
        const mockResponse = (data: any) => ({
            ok: true,
            json: async () => data
        });

        (fetch as any).mockImplementation((url: string) => {
            if (url.includes('/groups')) return mockResponse([{ id: 'g1', name: 'Team A' }]);
            if (url.includes('/epics')) return mockResponse([{ id: 101, name: 'Epic X' }]);
            if (url.includes('/members')) return mockResponse([{ id: 'u1', profile: { name: 'User 1' } }]);
            if (url.includes('/stories/search')) return mockResponse([{ id: 1, name: 'Story 1', group_id: 'g1', epic_id: 101 }]);
            if (url.includes('/stories')) return mockResponse([]); // related stories for partial check
            return mockResponse({});
        });

        const stories = await service.getCompletedStories('2023-01-01', '2023-01-07');

        expect(stories.length).toBe(1);
        expect(stories[0].teamName).toBe('Team A');
        expect(stories[0].epicName).toBe('Epic X');
    });
});

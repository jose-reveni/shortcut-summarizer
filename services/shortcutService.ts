import { ShortcutStory } from '../types';

export class ShortcutService {
  private apiToken: string;
  private baseUrl = (import.meta as any).env?.DEV
    ? '/api/shortcut'
    : 'https://api.thebugging.com/cors-proxy?url=https://api.app.shortcut.com/api/v3';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async getGroups(): Promise<Record<string, string>> {
    const targetUrl = `${this.baseUrl}/groups`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'Shortcut-Token': this.apiToken,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return {};

      const groups = await response.json();
      return groups.reduce((acc: Record<string, string>, group: any) => {
        acc[group.id] = group.name;
        return acc;
      }, {});
    } catch (e) {
      console.error("Error al obtener grupos:", e);
      return {};
    }
  }

  private async getEpics(): Promise<Record<number, string>> {
    const targetUrl = `${this.baseUrl}/epics`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'Shortcut-Token': this.apiToken,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return {};

      const epics = await response.json();
      return epics.reduce((acc: Record<number, string>, epic: any) => {
        acc[epic.id] = epic.name;
        return acc;
      }, {});
    } catch (e) {
      console.error("Error al obtener epicas:", e);
      return {};
    }
  }

  private async getUsers(): Promise<Record<string, { name: string, avatar?: string }>> {
    const targetUrl = `${this.baseUrl}/members`; // Shortcut llama 'members' a los usuarios

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'Shortcut-Token': this.apiToken,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return {};

      const members = await response.json();
      return members.reduce((acc: Record<string, { name: string, avatar?: string, gravatar?: string }>, member: any) => {
        // En Shortcut API v3, cada miembro tiene un 'id' que es un UUID
        acc[member.id] = {
          name: member.profile?.name || member.profile?.mention_name || 'Usuario desconocido',
          avatar: member.profile?.display_icon?.url || undefined,
          gravatar: member.profile?.gravatar_hash || undefined
        };
        return acc;
      }, {});
    } catch (e) {
      console.error("Error al obtener miembros:", e);
      return {};
    }
  }

  private epicStoriesCache: Record<number, any[]> = {};
  private iterationStoriesCache: Record<number, any[]> = {};

  private async checkPartialStory(story: any): Promise<boolean> {
    const { id: currentStoryId, name, epic_id, iteration_id } = story;
    let relatedStories: any[] = [];

    try {
      if (epic_id) {
        if (!this.epicStoriesCache[epic_id]) {
          console.log(`[ShortcutService] Cargando historias para épica ${epic_id}...`);
          const response = await fetch(`${this.baseUrl}/epics/${epic_id}/stories`, {
            headers: { 'Shortcut-Token': this.apiToken, 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            this.epicStoriesCache[epic_id] = await response.json();
          }
        }
        relatedStories = this.epicStoriesCache[epic_id] || [];
      } else if (iteration_id) {
        if (!this.iterationStoriesCache[iteration_id]) {
          console.log(`[ShortcutService] Cargando historias para iteración ${iteration_id}...`);
          const response = await fetch(`${this.baseUrl}/iterations/${iteration_id}/stories`, {
            headers: { 'Shortcut-Token': this.apiToken, 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            this.iterationStoriesCache[iteration_id] = await response.json();
          }
        }
        relatedStories = this.iterationStoriesCache[iteration_id] || [];
      }

      const found = relatedStories.some((s: any) => {
        if (s.id === currentStoryId) return false;

        const sName = (s.name || '').trim().toLowerCase();
        const searchName = (name || '').trim().toLowerCase();

        // Coincidencia de nombre y que NO esté completada
        return sName === searchName && !s.completed;
      });

      if (found) {
        console.log(`[ShortcutService] ¡Parcial detectado para "${name}"!`);
      }

      return found;
    } catch (e) {
      console.error("Error al buscar historias parciales vinculadas:", e);
      return false;
    }
  }

  /**
   * Obtiene historias completadas en un rango de fechas específico.
   */
  async getCompletedStories(startDate: string, endDate: string): Promise<ShortcutStory[]> {
    const targetUrl = `${this.baseUrl}/stories/search`;

    console.log(`[ShortcutService] Buscando historias entre ${startDate} y ${endDate}`);

    // Limpiar caches al inicio de una nueva búsqueda
    this.epicStoriesCache = {};
    this.iterationStoriesCache = {};

    try {
      const [groupsMap, epicsMap, usersMap, storiesResponse] = await Promise.all([
        this.getGroups(),
        this.getEpics(),
        this.getUsers(),
        fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Shortcut-Token': this.apiToken,
          },
          body: JSON.stringify({
            completed_at_start: startDate,
            completed_at_end: endDate,
            archived: false,
          }),
        })
      ]);

      if (!storiesResponse.ok) {
        throw new Error(`Shortcut API Error: ${storiesResponse.status}`);
      }

      const rawStories = await storiesResponse.json();

      // Procesar en series de pequeños grupos para evitar saturar la API
      const BATCH_SIZE = 5;
      const finalStories: ShortcutStory[] = [];

      for (let i = 0; i < rawStories.length; i += BATCH_SIZE) {
        const batch = rawStories.slice(i, i + BATCH_SIZE);
        const processedBatch = await Promise.all(
          batch.map(async (story: any) => {
            const isPartial = await this.checkPartialStory(story);

            const ownerDetails = (story.owner_ids || []).map((id: string) => usersMap[id]).filter(Boolean);
            const ownerNames = ownerDetails.map(u => u.name);

            const ownerAvatars = ownerDetails.map(u => {
              if (u.avatar) {
                const separator = u.avatar.includes('?') ? '&' : '?';
                return `${u.avatar}${separator}token=${this.apiToken}`;
              }
              if (u.gravatar) return `https://www.gravatar.com/avatar/${u.gravatar}?s=200&d=retro`;
              return undefined;
            }).filter(Boolean) as string[];

            return {
              ...story,
              teamName: story.group_id ? (groupsMap[story.group_id] || 'Sin Equipo') : 'General',
              epicName: story.epic_id ? epicsMap[story.epic_id] : undefined,
              ownerNames: ownerNames.length > 0 ? ownerNames : undefined,
              ownerAvatars: ownerAvatars.length > 0 ? ownerAvatars : undefined,
              isPartial: isPartial
            };
          })
        );
        finalStories.push(...processedBatch);
      }

      return finalStories as ShortcutStory[];

    } catch (error: any) {
      console.error('[ShortcutService] Error en fetch:', error);
      throw error;
    }
  }
}

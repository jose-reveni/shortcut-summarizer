
export interface ShortcutStory {
  id: number;
  name: string;
  description: string;
  story_type: 'feature' | 'bug' | 'chore';
  completed_at: string;
  app_url: string;
  labels: Array<{ name: string }>;
  group_id?: string;
  epic_id?: number;
  owner_ids: string[];
  teamName?: string;
  epicName?: string;
  ownerNames?: string[];
  ownerAvatars?: string[];
  isPartial?: boolean;
}

export interface WeekRange {
  label: string;
  start: string; // ISO String
  end: string;   // ISO String
}

export interface ChangelogData {
  title: string;
  content: string;
  generatedAt: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  FETCHING_STORIES = 'FETCHING_STORIES',
  GENERATING_CHANGELOG = 'GENERATING_CHANGELOG',
  ERROR = 'ERROR',
}

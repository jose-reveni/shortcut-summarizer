
import React from 'react';
import { ShortcutStory } from '../types';

interface StoryListProps {
  stories: ShortcutStory[];
}

export const StoryList: React.FC<StoryListProps> = ({ stories }) => {
  if (stories.length === 0) return null;

  return (
    <div className="mt-8 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Historias por Equipo ({stories.length})
      </h3>
      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {stories.map((story) => (
          <div key={story.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${story.story_type === 'feature' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  story.story_type === 'bug' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-400'
                  }`}>
                  {story.story_type}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                  {story.teamName}
                </span>
                {story.isPartial && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 2" />
                    </svg>
                    Parcial
                  </span>
                )}
              </div>
              <a href={story.app_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-2">{story.name}</h4>

            <div className="space-y-2">
              {/* Epic Info */}
              {story.epicName && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-[10px] font-medium text-purple-700 dark:text-purple-400">
                    {story.epicName}
                  </span>
                </div>
              )}

              {/* Owners */}
              {(story.ownerNames && story.ownerNames.length > 0) && (
                <div className="flex items-center gap-2">
                  {story.ownerAvatars && story.ownerAvatars.length > 0 ? (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {story.ownerAvatars.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Avatar de ${story.ownerNames?.[idx] || 'dueñx'}`}
                          className="inline-block h-4 w-4 rounded-full ring-1 ring-white dark:ring-slate-800 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                    {story.ownerNames.join(', ')}
                  </span>
                </div>
              )}

              {/* Labels/Tags */}
              {story.labels && story.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {story.labels.map(label => (
                    <span key={label.name} className="text-[9px] bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-slate-700 transition-colors">
                      #{label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

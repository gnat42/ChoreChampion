import React, { useState } from 'react';
import { Chore } from '../types';
import { Button } from './Button';
import { Plus, Trash2, Sparkles, X } from 'lucide-react';
import { generateChoreSuggestions } from '../services/geminiService';

interface ChoreManagerProps {
  chores: Chore[];
  onAddChore: (chore: Omit<Chore, 'id'>) => void;
  onDeleteChore: (id: string) => void;
}

export const ChoreManager: React.FC<ChoreManagerProps> = ({ chores, onAddChore, onDeleteChore }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formState, setFormState] = useState<{
    title: string;
    points: number;
    icon: string;
  }>({ 
    title: '', 
    points: 50, 
    icon: '🧹',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddChore({
      title: formState.title,
      description: 'Custom chore',
      points: Number(formState.points),
      icon: formState.icon,
    });
    setFormState({ title: '', points: 50, icon: '🧹' });
    setIsAdding(false);
  };

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    const existingTitles = chores.map(c => c.title);
    const suggestions = await generateChoreSuggestions(existingTitles);
    
    suggestions.forEach(s => {
      if (s.title && s.points) {
        onAddChore({
          title: s.title,
          description: s.description || 'AI Generated',
          points: s.points,
          icon: s.icon || '✨',
        });
      }
    });
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-6 pb-32">
       <header className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Chore Library</h2>
          <p className="text-gray-500">Define tasks available for assignment.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="secondary" size="sm" onClick={handleAiSuggest} isLoading={isGenerating} disabled={isGenerating}>
                 <Sparkles size={16} className="mr-1 text-purple-500" />
                 {isGenerating ? 'Thinking...' : 'AI Suggest'}
             </Button>
        </div>
      </header>

      {/* Quick Add Form */}
      {isAdding ? (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl shadow-lg border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">New Chore Definition</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Chore Name</label>
            <input 
              required
              className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
              value={formState.title}
              onChange={e => setFormState({...formState, title: e.target.value})}
              placeholder="e.g. Wash Dishes"
            />
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Default Points</label>
                <input 
                  type="number"
                  required
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                  value={formState.points}
                  onChange={e => setFormState({...formState, points: parseInt(e.target.value)})}
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                <select 
                    className="px-3 py-2 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 h-[40px]"
                    value={formState.icon}
                    onChange={e => setFormState({...formState, icon: e.target.value})}
                >
                    <option>🧹</option>
                    <option>🧼</option>
                    <option>🗑️</option>
                    <option>🛏️</option>
                    <option>🧺</option>
                    <option>🐶</option>
                    <option>🪴</option>
                    <option>🍽️</option>
                    <option>🚗</option>
                </select>
             </div>
          </div>

          <Button type="submit" className="w-full">Add to Library</Button>
        </form>
      ) : (
        <Button variant="secondary" className="w-full border-dashed border-2 py-4 text-gray-500 hover:text-blue-600 hover:border-blue-300" onClick={() => setIsAdding(true)}>
            <Plus size={20} className="mr-2" /> Define New Chore
        </Button>
      )}

      {/* Chore Library List */}
      <div className="space-y-3">
        {chores.length === 0 && !isAdding && (
            <div className="text-center py-10 text-gray-400">
                <p>No chores defined.</p>
                <p className="text-sm">Add some chores to get started!</p>
            </div>
        )}
        
        {chores.map(chore => (
          <div key={chore.id} className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                     {chore.icon}
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-800">{chore.title}</h3>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{chore.points} pts</span>
                     </div>
                 </div>
             </div>
             
             <button 
                 onClick={() => onDeleteChore(chore.id)}
                 className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                 title="Delete from Library"
             >
                 <Trash2 size={18} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};
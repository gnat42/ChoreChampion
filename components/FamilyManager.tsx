import React, { useState } from 'react';
import { Person, Transaction, Chore, ChoreAssignment, ChoreFrequency } from '../types';
import { Button } from './Button';
import { Plus, Trash2, User, ChevronDown, ChevronUp, Calendar, RefreshCw, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface FamilyManagerProps {
  people: Person[];
  chores: Chore[];
  assignments: ChoreAssignment[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
  onAddAssignment: (assignment: Omit<ChoreAssignment, 'id'>) => void;
  onRemoveAssignment: (id: string) => void;
  onToggleAssignment: (id: string) => void;
}

export const FamilyManager: React.FC<FamilyManagerProps> = ({ 
    people, 
    chores, 
    assignments, 
    onAddPerson, 
    onRemovePerson,
    onAddAssignment,
    onRemoveAssignment,
    onToggleAssignment
}) => {
  const [newName, setNewName] = useState('');
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  
  // New Assignment State
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState<{
      choreId: string;
      frequency: ChoreFrequency;
      dueDate: string;
  }>({ choreId: '', frequency: 'WEEKLY', dueDate: '' });

  const handleSubmitPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddPerson(newName.trim());
      setNewName('');
    }
  };

  const handleAddAssignment = (e: React.FormEvent, personId: string) => {
      e.preventDefault();
      if (assignForm.choreId) {
          onAddAssignment({
              personId,
              choreId: assignForm.choreId,
              frequency: assignForm.frequency,
              dueDate: assignForm.dueDate || undefined,
              isActive: true
          });
          setIsAssigning(false);
          setAssignForm({ choreId: '', frequency: 'WEEKLY', dueDate: '' });
      }
  };

  const getAssignmentsForPerson = (personId: string) => {
      return assignments.filter(a => a.personId === personId);
  };

  const getChoreDetails = (choreId: string) => {
      return chores.find(c => c.id === choreId);
  };

  return (
    <div className="p-6 space-y-6 pb-32">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Family & Assignments</h2>
        <p className="text-gray-500">Manage your household team and their tasks.</p>
      </header>

      {/* Add Person Form */}
      <form onSubmit={handleSubmitPerson} className="flex gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New family member name..."
          className="flex-1 px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
        />
        <Button type="submit" disabled={!newName.trim()}>
          <Plus size={18} className="mr-1" /> Add
        </Button>
      </form>

      {/* People List */}
      <div className="grid gap-4">
        {people.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <User className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No family members yet.</p>
          </div>
        ) : (
          people.map((person) => {
            const isExpanded = expandedPersonId === person.id;
            const personAssignments = getAssignmentsForPerson(person.id);

            return (
              <div key={person.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-blue-100 border-blue-200' : 'border-gray-100'}`}>
                {/* Person Header */}
                <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedPersonId(isExpanded ? null : person.id)}>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{person.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 gap-3">
                      <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {person.balance} pts
                      </span>
                      <span className="text-gray-400">
                          {personAssignments.length} chores assigned
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded Section: Assignments */}
                {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Assigned Chores</h4>
                            {!isAssigning && (
                                <Button size="sm" variant="ghost" className="text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => setIsAssigning(true)}>
                                    <Plus size={14} className="mr-1"/> Assign Chore
                                </Button>
                            )}
                        </div>

                        {/* Assign Form */}
                        {isAssigning && (
                            <form onSubmit={(e) => handleAddAssignment(e, person.id)} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm mb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-semibold text-gray-700">New Assignment</span>
                                    <button type="button" onClick={() => setIsAssigning(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Select Task</label>
                                        <select 
                                            required
                                            className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={assignForm.choreId}
                                            onChange={e => setAssignForm({...assignForm, choreId: e.target.value})}
                                        >
                                            <option value="">-- Select from Library --</option>
                                            {chores.map(c => (
                                                <option key={c.id} value={c.id}>{c.icon} {c.title} ({c.points}pts)</option>
                                            ))}
                                        </select>
                                        {chores.length === 0 && <p className="text-xs text-red-400 mt-1">No chores in library. Go to Chores tab to add some.</p>}
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                                            <select 
                                                className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                                                value={assignForm.frequency}
                                                onChange={e => setAssignForm({...assignForm, frequency: e.target.value as ChoreFrequency})}
                                            >
                                                <option value="ONCE">One-time</option>
                                                <option value="DAILY">Daily</option>
                                                <option value="WEEKLY">Weekly</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                                            <input 
                                                type="date"
                                                className="w-full px-3 py-2 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                                                value={assignForm.dueDate}
                                                onChange={e => setAssignForm({...assignForm, dueDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" size="sm" className="w-full mt-2" disabled={!assignForm.choreId}>Save Assignment</Button>
                                </div>
                            </form>
                        )}

                        {/* List of Assignments */}
                        <div className="space-y-2">
                            {personAssignments.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-2">No chores assigned yet.</p>
                            ) : (
                                personAssignments.map(assignment => {
                                    const chore = getChoreDetails(assignment.choreId);
                                    if (!chore) return null; // Should not happen if data integrity is kept

                                    return (
                                        <div key={assignment.id} className={`flex items-center justify-between p-3 rounded-xl border ${assignment.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100 opacity-60'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl">{chore.icon}</div>
                                                <div>
                                                    <div className="font-semibold text-gray-800 text-sm">{chore.title}</div>
                                                    <div className="flex gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                                                        <span>{chore.points} pts</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <RefreshCw size={10} /> {assignment.frequency}
                                                        </span>
                                                        {assignment.dueDate && (
                                                            <span className="flex items-center gap-0.5">
                                                                <Calendar size={10} /> {new Date(assignment.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => onToggleAssignment(assignment.id)}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 ${assignment.isActive ? 'text-green-500' : 'text-gray-400'}`}
                                                >
                                                    {assignment.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <button 
                                                    onClick={() => onRemoveAssignment(assignment.id)}
                                                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Delete Person Area */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs"
                                onClick={() => {
                                    if(window.confirm(`Delete ${person.name} and all their history?`)) {
                                        onRemovePerson(person.id);
                                    }
                                }}
                             >
                                <Trash2 size={14} className="mr-1" /> Delete Person
                             </Button>
                        </div>
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
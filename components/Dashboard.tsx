import React, { useState } from 'react';
import { Person, Chore, ChoreAssignment, Transaction } from '../types';
import { Button } from './Button';
import { CheckCircle2, Award, ArrowRight, Calendar, Clock, RotateCw, History, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  people: Person[];
  chores: Chore[];
  assignments: ChoreAssignment[];
  history: Transaction[];
  onCompleteChore: (assignmentId: string) => void;
  onTabChange: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ people, chores, assignments, history, onCompleteChore, onTabChange }) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');

  // Update selected person if current selection is invalid
  React.useEffect(() => {
    if (!people.find(p => p.id === selectedPersonId) && people.length > 0) {
      setSelectedPersonId(people[0].id);
    }
  }, [people, selectedPersonId]);

  const activePerson = people.find(p => p.id === selectedPersonId);

  // Helper to determine if a chore assignment should be shown
  const isAssignmentAvailable = (assignment: ChoreAssignment) => {
    if (!assignment.isActive) return false;

    // Check Frequency/Completion
    if (!assignment.lastCompletedAt) return true; // Never done

    const lastDone = new Date(assignment.lastCompletedAt);
    const now = new Date();
    
    if (assignment.frequency === 'ONCE') return false; // Already done once (should be inactive, but double check)

    if (assignment.frequency === 'DAILY') {
        // Available if not done today
        return lastDone.getDate() !== now.getDate() ||
               lastDone.getMonth() !== now.getMonth() ||
               lastDone.getFullYear() !== now.getFullYear();
    }

    if (assignment.frequency === 'WEEKLY') {
        // Available if the start of the current week is after the last done date.
        // Simple logic: Reset on Sunday.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0,0,0,0);
        
        return lastDone < startOfWeek;
    }

    return true;
  };

  // Get active assignments for selected person
  const personAssignments = assignments.filter(a => a.personId === selectedPersonId);
  
  // Filter available assignments and join with Chore data
  const availableTasks = personAssignments
    .filter(isAssignmentAvailable)
    .map(assignment => {
        const chore = chores.find(c => c.id === assignment.choreId);
        return { assignment, chore };
    })
    .filter(item => item.chore !== undefined) // Safety check
    .sort((a, b) => {
        // Sort by due date if exists, then points
        if (a.assignment.dueDate && !b.assignment.dueDate) return -1;
        if (!a.assignment.dueDate && b.assignment.dueDate) return 1;
        if (a.assignment.dueDate && b.assignment.dueDate) return a.assignment.dueDate.localeCompare(b.assignment.dueDate);
        return (b.chore!.points) - (a.chore!.points);
    });

  // Get History for selected person
  const personHistory = history
      .filter(t => t.personId === selectedPersonId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
          <Award size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to ChoreChampion!</h2>
        <p className="text-gray-500 mb-8">Add your family members to start tracking chores and rewards.</p>
        <Button onClick={() => onTabChange('family')} size="lg">Add Family Members</Button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32">
       {/* User Selector Header */}
       <div className="mb-8 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
         <div className="flex space-x-4">
           {people.map(person => {
             const isSelected = person.id === selectedPersonId;
             return (
               <button
                 key={person.id}
                 onClick={() => setSelectedPersonId(person.id)}
                 className={`flex flex-col items-center space-y-2 min-w-[70px] transition-all duration-200 ${isSelected ? 'scale-110' : 'opacity-60 scale-100'}`}
               >
                 <div 
                   className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ${isSelected ? 'ring-blue-100' : 'ring-transparent'}`}
                   style={{ backgroundColor: person.color }}
                 >
                   {person.name.charAt(0).toUpperCase()}
                 </div>
                 <span className={`text-sm font-medium ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>
                   {person.name}
                 </span>
               </button>
             );
           })}
         </div>
       </div>

       {/* Balance Card */}
       {activePerson && (
         <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 mb-8 relative overflow-hidden transform transition-all">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
           <div className="relative z-10">
             <p className="text-blue-100 text-sm font-medium mb-1">Current Balance</p>
             <div className="flex items-baseline gap-2">
                <h1 className="text-5xl font-bold tracking-tight">{activePerson.balance}</h1>
                <span className="text-lg opacity-80">points</span>
             </div>
             <div className="mt-4 flex gap-2">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => onTabChange('redeem')}
                    className="bg-white/20 border-transparent text-white hover:bg-white/30 backdrop-blur-sm"
                >
                    Redeem Rewards <ArrowRight size={14} className="ml-1" />
                </Button>
             </div>
           </div>
         </div>
       )}

       {/* Chores List */}
       <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
         <CheckCircle2 className="mr-2 text-green-500" size={20} />
         My Tasks
       </h3>

       <div className="grid gap-3 mb-10">
         {availableTasks.length === 0 ? (
             <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-gray-400">No tasks available for {activePerson?.name}.</p>
                <div className="mt-4">
                  <Button variant="ghost" size="sm" onClick={() => onTabChange('family')} className="text-blue-600">
                      Manage Assignments
                  </Button>
                </div>
             </div>
         ) : (
            availableTasks.map(({ assignment, chore }) => {
                if (!chore) return null;
                const isOverdue = assignment.dueDate ? new Date(assignment.dueDate) < new Date() && !assignment.lastCompletedAt : false;
                
                return (
                <button
                  key={assignment.id}
                  onClick={() => onCompleteChore(assignment.id)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98] w-full"
                >
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">
                            {chore.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{chore.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">+{chore.points} pts</span>
                                {assignment.frequency !== 'ONCE' && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center">
                                        <RotateCw size={10} className="mr-1"/> 
                                        {assignment.frequency.toLowerCase()}
                                    </span>
                                )}
                                {assignment.dueDate && (
                                    <span className={`text-xs px-2 py-0.5 rounded-md flex items-center ${isOverdue ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                        <Clock size={10} className="mr-1"/> 
                                        {new Date(assignment.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-transparent group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                        <CheckCircle2 size={16} fill="currentColor" className="opacity-0 group-hover:opacity-100 text-white" />
                    </div>
                </button>
            )})
         )}
       </div>

       {/* Activity History */}
       <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
           <History className="mr-2 text-purple-500" size={20} />
           Recent Activity
       </h3>
       
       <div className="space-y-4">
           {personHistory.length === 0 ? (
               <p className="text-gray-400 text-center italic text-sm">No recent activity.</p>
           ) : (
               personHistory.map(item => (
                   <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'EARN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                               {item.type === 'EARN' ? <TrendingUp size={16}/> : <TrendingDown size={16} />}
                           </div>
                           <div>
                               <p className="text-sm font-semibold text-gray-800">{item.description}</p>
                               <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                           </div>
                       </div>
                       <span className={`font-bold ${item.type === 'EARN' ? 'text-green-600' : 'text-orange-600'}`}>
                           {item.type === 'EARN' ? '+' : '-'}{item.amount}
                       </span>
                   </div>
               ))
           )}
       </div>

    </div>
  );
};
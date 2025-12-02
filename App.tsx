import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FamilyManager } from './components/FamilyManager';
import { ChoreManager } from './components/ChoreManager';
import { RewardsRedemption } from './components/RewardsRedemption';
import { Person, Chore, Transaction, Tab, ChoreAssignment } from './types';
import { v4 as uuidv4 } from 'uuid';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  
  // State
  const [people, setPeople] = useState<Person[]>([]);
  const [chores, setChores] = useState<Chore[]>([]); // Master List
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([]); // Assignments
  const [history, setHistory] = useState<Transaction[]>([]);

  // Load data from local storage on mount
  useEffect(() => {
    const storedPeople = localStorage.getItem('cc_people');
    const storedChores = localStorage.getItem('cc_chores');
    const storedAssignments = localStorage.getItem('cc_assignments');
    const storedHistory = localStorage.getItem('cc_history');

    if (storedPeople) setPeople(JSON.parse(storedPeople));
    if (storedChores) {
        // Migration check for old data format: if old data had assigneeIds, we might want to wipe or just ignore.
        // For simplicity in this demo environment, we assume clean state or compatible structure, 
        // but let's try to parse.
        const parsed = JSON.parse(storedChores);
        setChores(parsed);
    }
    if (storedAssignments) setAssignments(JSON.parse(storedAssignments));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    localStorage.setItem('cc_people', JSON.stringify(people));
    localStorage.setItem('cc_chores', JSON.stringify(chores));
    localStorage.setItem('cc_assignments', JSON.stringify(assignments));
    localStorage.setItem('cc_history', JSON.stringify(history));
  }, [people, chores, assignments, history]);

  // --- ACTIONS ---

  // People
  const addPerson = (name: string) => {
    const newPerson: Person = {
      id: uuidv4(),
      name,
      balance: 0,
      color: COLORS[people.length % COLORS.length],
      avatarSeed: name
    };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setAssignments(assignments.filter(a => a.personId !== id)); // Cascade delete assignments
    setHistory(history.filter(h => h.personId !== id)); // Cascade delete history
  };

  // Chores (Master Library)
  const addChore = (choreData: Omit<Chore, 'id'>) => {
    const newChore: Chore = { 
        ...choreData, 
        id: uuidv4(),
    };
    setChores([...chores, newChore]);
  };

  const deleteChore = (id: string) => {
    setChores(chores.filter(c => c.id !== id));
    setAssignments(assignments.filter(a => a.choreId !== id)); // Cascade delete assignments
  };

  // Assignments
  const addAssignment = (data: Omit<ChoreAssignment, 'id'>) => {
      const newAssignment: ChoreAssignment = {
          ...data,
          id: uuidv4(),
      };
      setAssignments([...assignments, newAssignment]);
  };

  const removeAssignment = (id: string) => {
      setAssignments(assignments.filter(a => a.id !== id));
  };

  const toggleAssignment = (id: string) => {
      setAssignments(assignments.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  // Completion
  const completeChore = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const chore = chores.find(c => c.id === assignment.choreId);
    const person = people.find(p => p.id === assignment.personId);

    if (chore && person) {
        // Update Balance
        setPeople(people.map(p => 
            p.id === person.id ? { ...p, balance: p.balance + chore.points } : p
        ));
        
        // Update Assignment Status
        setAssignments(assignments.map(a => {
            if (a.id === assignmentId) {
                return { 
                    ...a, 
                    lastCompletedAt: new Date().toISOString(),
                    // If it was a one-time chore, mark it as inactive (done)
                    isActive: a.frequency === 'ONCE' ? false : a.isActive
                };
            }
            return a;
        }));
        
        // Log Transaction
        const transaction: Transaction = {
            id: uuidv4(),
            personId: person.id,
            choreId: chore.id,
            description: `Completed: ${chore.title}`,
            amount: chore.points,
            type: 'EARN',
            timestamp: new Date().toISOString()
        };
        setHistory([transaction, ...history]);
    }
  };

  const redeemPoints = (personId: string, amount: number, description: string) => {
      const person = people.find(p => p.id === personId);
      if (person && person.balance >= amount) {
          setPeople(people.map(p => 
            p.id === personId ? { ...p, balance: p.balance - amount } : p
          ));

          const transaction: Transaction = {
            id: uuidv4(),
            personId,
            description: `Redeemed: ${description}`,
            amount: amount,
            type: 'SPEND',
            timestamp: new Date().toISOString()
        };
        setHistory([transaction, ...history]);
      }
  };

  // Rendering based on Tab
  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return (
            <Dashboard 
                people={people} 
                chores={chores} 
                assignments={assignments}
                history={history}
                onCompleteChore={completeChore} 
                onTabChange={setActiveTab} 
            />
        );
      case Tab.FAMILY:
        return (
            <FamilyManager 
                people={people} 
                chores={chores}
                assignments={assignments}
                onAddPerson={addPerson} 
                onRemovePerson={removePerson}
                onAddAssignment={addAssignment}
                onRemoveAssignment={removeAssignment}
                onToggleAssignment={toggleAssignment}
            />
        );
      case Tab.CHORES:
        return (
            <ChoreManager 
                chores={chores} 
                onAddChore={addChore} 
                onDeleteChore={deleteChore} 
            />
        );
      case Tab.REDEEM:
        return <RewardsRedemption people={people} onRedeem={redeemPoints} />;
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
import React, { useState } from 'react';
import { Person } from '../types';
import { Button } from './Button';
import { Gift, MinusCircle } from 'lucide-react';

interface RewardsRedemptionProps {
  people: Person[];
  onRedeem: (personId: string, amount: number, description: string) => void;
}

export const RewardsRedemption: React.FC<RewardsRedemptionProps> = ({ people, onRedeem }) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const activePerson = people.find(p => p.id === selectedPersonId);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePerson && amount && reason) {
      const cost = parseInt(amount);
      if (cost > 0 && cost <= activePerson.balance) {
          onRedeem(activePerson.id, cost, reason);
          setAmount('');
          setReason('');
      } else {
          alert("Invalid amount or insufficient balance");
      }
    }
  };

  if (people.length === 0) return <div className="p-6 text-center text-gray-500">Add people first.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rewards Shop</h2>
        <p className="text-gray-500">Redeem hard-earned points.</p>
      </header>

      {/* Person Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {people.map(person => (
           <button
             key={person.id}
             onClick={() => setSelectedPersonId(person.id)}
             className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                selectedPersonId === person.id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-white text-gray-600 border border-gray-200'
             }`}
           >
             {person.name} ({person.balance})
           </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
         <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Deduct Points</h3>
            <p className="text-sm text-gray-500">
               {activePerson ? `${activePerson.name} has ${activePerson.balance} points available.` : 'Select a person'}
            </p>
         </div>

         <form onSubmit={handleRedeem} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Reward Description</label>
                <input 
                  required
                  placeholder="e.g. 1 Hour Screen Time"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cost (Points)</label>
                <input 
                  required
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 font-mono text-lg"
                />
            </div>

            <Button 
                type="submit" 
                variant="primary" 
                className="w-full bg-purple-600 hover:bg-purple-700 shadow-purple-200 py-3"
                disabled={!activePerson || !amount || parseInt(amount) > (activePerson?.balance || 0)}
            >
                Redeem Reward
            </Button>
         </form>
      </div>

      {/* Suggested Rewards (Static for now, could be dynamic) */}
      <div>
         <h4 className="font-bold text-gray-700 mb-3">Quick Redeem</h4>
         <div className="grid grid-cols-2 gap-3">
            {[
                { name: "30m TV", cost: 100 },
                { name: "Sweet Treat", cost: 50 },
                { name: "Stay Up Late", cost: 200 },
                { name: "Cash $5", cost: 500 },
            ].map((reward) => (
                <button
                    key={reward.name}
                    type="button"
                    disabled={!activePerson || activePerson.balance < reward.cost}
                    onClick={() => {
                        if(activePerson) onRedeem(activePerson.id, reward.cost, reward.name);
                    }}
                    className="p-3 bg-white border border-gray-100 rounded-xl text-left hover:border-purple-200 transition-colors disabled:opacity-50"
                >
                    <div className="font-semibold text-gray-800">{reward.name}</div>
                    <div className="text-xs text-purple-600 font-medium">{reward.cost} pts</div>
                </button>
            ))}
         </div>
      </div>
    </div>
  );
};

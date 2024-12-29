import React from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import type { TeamMember } from '@/shared/types';

interface RewardSystemProps {
  members: TeamMember[];
}

export const RewardSystem: React.FC<RewardSystemProps> = ({ members }) => {
  const sortedMembers = [...members].sort((a, b) => b.points - a.points);
  const topThree = sortedMembers.slice(0, 3);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Leaderboard
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {topThree.map((member, index) => (
          <div
            key={member.id}
            className="bg-gray-700 rounded-lg p-4 text-center transform hover:scale-105 transition-transform"
          >
            <div className="relative inline-block">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-full mx-auto mb-3"
              />
              {index === 0 && (
                <Award className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2" />
              )}
            </div>
            <h3 className="text-white font-medium">{member.name}</h3>
            <p className="text-gray-400 text-sm">{member.role}</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white">{member.points}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {sortedMembers.slice(3).map((member) => (
          <div
            key={member.id}
            className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="text-white">{member.name}</h4>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white">{member.points}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardSystem;
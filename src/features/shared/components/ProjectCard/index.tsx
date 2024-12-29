import React from 'react';
import { Calendar, Users } from 'lucide-react';
import type { TeamMember } from '@/shared/types';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  deadline: string;
  teamMembers: TeamMember[];
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{project.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            project.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'}`}>
          {project.status}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{project.deadline}</span>
          </div>
          
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-800"
                />
              ))}
              {project.teamMembers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-gray-800">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
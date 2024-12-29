import React from 'react';
import { HelpCircle, Book, MessageSquare, FileText } from 'lucide-react';

export const HelpSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Help & Support</h1>
        <button className="btn-primary">
          <MessageSquare className="w-5 h-5 mr-2" />
          Contact Support
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Book className="w-6 h-6 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Documentation</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Comprehensive guides and documentation for all features
          </p>
          <button className="btn-ghost w-full">View Documentation</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Tutorials</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Step-by-step tutorials and video guides
          </p>
          <button className="btn-ghost w-full">Watch Tutorials</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">FAQs</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Frequently asked questions and answers
          </p>
          <button className="btn-ghost w-full">Browse FAQs</button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Popular Articles</h2>
        <div className="space-y-4">
          {[
            'Getting Started Guide',
            'Inventory Management Best Practices',
            'Recipe Configuration Tips',
            'Team Management Essentials',
            'Understanding Reports'
          ].map((article, index) => (
            <button
              key={index}
              className="w-full text-left p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <h3 className="text-white font-medium">{article}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Learn more about {article.toLowerCase()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { ShieldPlus, Code, X } from 'lucide-react';
import { ProjectType } from '../types';

export function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const addProject = useProjectStore((state) => state.addProject);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim() && selectedType) {
      addProject(name.trim(), description.trim(), selectedType);
      navigate('/');
    }
  };

  const handleTypeSelect = (type: ProjectType) => {
    setSelectedType(type);
    setShowTypeModal(false);
  };

  if (showTypeModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-cyan-500/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Select Project Type</h2>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => handleTypeSelect('security-audit')}
              className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded-lg flex items-center space-x-4 transition-colors border border-cyan-500/20"
            >
              <ShieldPlus className="h-8 w-8 text-cyan-500" />
              <div className="text-left">
                <h3 className="font-semibold text-lg">Security Audit</h3>
                <p className="text-gray-400">Create a new security audit project with comprehensive checklist</p>
              </div>
            </button>
            <button
              onClick={() => handleTypeSelect('web-development')}
              className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded-lg flex items-center space-x-4 transition-colors border border-cyan-500/20"
            >
              <Code className="h-8 w-8 text-cyan-500" />
              <div className="text-left">
                <h3 className="font-semibold text-lg">Web Development</h3>
                <p className="text-gray-400">Create a new web development project with milestone tracking</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        {selectedType === 'security-audit' ? (
          <ShieldPlus className="h-8 w-8 text-cyan-500" />
        ) : (
          <Code className="h-8 w-8 text-cyan-500" />
        )}
        <h1 className="text-3xl font-bold">
          New {selectedType === 'security-audit' ? 'Security Audit' : 'Web Development'} Project
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-md font-medium transition-colors"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
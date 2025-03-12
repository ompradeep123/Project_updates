import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { ShieldCheck, Code, Trash2, Loader2 } from 'lucide-react';

export function ProjectList() {
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors border border-cyan-500/20"
          >
            <Link to={`/project/${project.id}`}>
              <div className="flex items-center space-x-3 mb-4">
                {project.type === 'security-audit' ? (
                  <ShieldCheck className="h-6 w-6 text-cyan-500" />
                ) : (
                  <Code className="h-6 w-6 text-cyan-500" />
                )}
                <h2 className="text-xl font-semibold">{project.name}</h2>
              </div>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <div className="text-sm text-gray-500">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </Link>
            <button
              onClick={(e) => handleDelete(e, project.id)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete project"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No projects yet. Create your first project!
          </div>
        )}
      </div>
    </div>
  );
}
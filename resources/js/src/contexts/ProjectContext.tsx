import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ProjectsAPI, type ApiProject } from '../api/client';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string, description: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Map API project to UI project
  const mapApiToProject = (p: ApiProject): Project => ({
    id: String(p.id),
    name: p.name,
    description: (p as any).description ?? '',
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await ProjectsAPI.list();
        setProjects(data.map(mapApiToProject));
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    })();
  }, []);

  const addProject = async (name: string, description: string) => {
    try {
      const created = await ProjectsAPI.create({ name, description });
      const proj = mapApiToProject(created);
      setProjects(prev => [...prev, proj]);
      setCurrentProject(proj);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await ProjectsAPI.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      if (currentProject?.id === id) setCurrentProject(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id'>>) => {
    try {
      const updated = await ProjectsAPI.update(id, {
        name: updates.name,
        description: updates.description,
        // optional: is_archived etc.
      } as any);
      const proj = mapApiToProject(updated);
      setProjects(prev => prev.map(p => (p.id === id ? proj : p)));
      if (currentProject?.id === id) setCurrentProject(proj);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };
  return (
    <ProjectContext.Provider value={{ projects, currentProject, addProject, deleteProject, updateProject, setCurrentProject }}>
      {children as ReactNode}
    </ProjectContext.Provider>
  );
}
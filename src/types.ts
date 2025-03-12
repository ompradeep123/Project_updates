export interface SecurityCheckItem {
  id: string;
  title: string;
  checked: boolean;
  comment: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  items: SecurityCheckItem[];
}

export type ProjectType = 'security-audit' | 'web-development';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  type: ProjectType;
  categories: ChecklistCategory[];
}

export interface WebDevMilestone {
  id: string;
  title: string;
  completed: boolean;
  tasks: SecurityCheckItem[];
}
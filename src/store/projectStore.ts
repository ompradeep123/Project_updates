import { create } from 'zustand';
import { Project, ChecklistCategory, ProjectType } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (name: string, description: string, type: ProjectType) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  toggleCheckItem: (projectId: string, categoryId: string, checkItemId: string) => Promise<void>;
  updateItemComment: (projectId: string, categoryId: string, checkItemId: string, comment: string) => Promise<void>;
}

const webDevChecklist: ChecklistCategory[] = [
  {
    id: 'planning',
    name: 'Project Planning',
    items: [
      { id: 'req1', title: 'Requirements Gathering and Documentation', checked: false, comment: '' },
      { id: 'req2', title: 'User Stories and Use Cases', checked: false, comment: '' },
      { id: 'req3', title: 'Technical Stack Selection', checked: false, comment: '' },
      { id: 'req4', title: 'Project Timeline and Milestones', checked: false, comment: '' },
      { id: 'req5', title: 'Budget Planning and Resource Allocation', checked: false, comment: '' },
    ],
  },
  {
    id: 'design',
    name: 'Design Phase',
    items: [
      { id: 'des1', title: 'Wireframes and Mockups', checked: false, comment: '' },
      { id: 'des2', title: 'UI/UX Design', checked: false, comment: '' },
      { id: 'des3', title: 'Design System and Style Guide', checked: false, comment: '' },
      { id: 'des4', title: 'Responsive Design Planning', checked: false, comment: '' },
      { id: 'des5', title: 'Accessibility Considerations', checked: false, comment: '' },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend Development',
    items: [
      { id: 'front1', title: 'Component Architecture', checked: false, comment: '' },
      { id: 'front2', title: 'Responsive Implementation', checked: false, comment: '' },
      { id: 'front3', title: 'State Management Setup', checked: false, comment: '' },
      { id: 'front4', title: 'Form Validation and Handling', checked: false, comment: '' },
      { id: 'front5', title: 'API Integration', checked: false, comment: '' },
      { id: 'front6', title: 'Error Handling and Loading States', checked: false, comment: '' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Development',
    items: [
      { id: 'back1', title: 'Database Schema Design', checked: false, comment: '' },
      { id: 'back2', title: 'API Endpoints Implementation', checked: false, comment: '' },
      { id: 'back3', title: 'Authentication System', checked: false, comment: '' },
      { id: 'back4', title: 'Data Validation and Sanitization', checked: false, comment: '' },
      { id: 'back5', title: 'Error Handling and Logging', checked: false, comment: '' },
    ],
  },
  {
    id: 'testing',
    name: 'Testing',
    items: [
      { id: 'test1', title: 'Unit Tests', checked: false, comment: '' },
      { id: 'test2', title: 'Integration Tests', checked: false, comment: '' },
      { id: 'test3', title: 'End-to-End Tests', checked: false, comment: '' },
      { id: 'test4', title: 'Performance Testing', checked: false, comment: '' },
      { id: 'test5', title: 'Cross-browser Testing', checked: false, comment: '' },
    ],
  },
  {
    id: 'deployment',
    name: 'Deployment',
    items: [
      { id: 'dep1', title: 'CI/CD Pipeline Setup', checked: false, comment: '' },
      { id: 'dep2', title: 'Environment Configuration', checked: false, comment: '' },
      { id: 'dep3', title: 'SSL Certificate Setup', checked: false, comment: '' },
      { id: 'dep4', title: 'Database Migration Plan', checked: false, comment: '' },
      { id: 'dep5', title: 'Backup Strategy Implementation', checked: false, comment: '' },
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    items: [
      { id: 'opt1', title: 'Code Optimization and Cleanup', checked: false, comment: '' },
      { id: 'opt2', title: 'Performance Optimization', checked: false, comment: '' },
      { id: 'opt3', title: 'SEO Implementation', checked: false, comment: '' },
      { id: 'opt4', title: 'Asset Optimization', checked: false, comment: '' },
      { id: 'opt5', title: 'Caching Strategy', checked: false, comment: '' },
    ],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    items: [
      { id: 'doc1', title: 'API Documentation', checked: false, comment: '' },
      { id: 'doc2', title: 'Code Documentation', checked: false, comment: '' },
      { id: 'doc3', title: 'User Documentation', checked: false, comment: '' },
      { id: 'doc4', title: 'Deployment Documentation', checked: false, comment: '' },
      { id: 'doc5', title: 'Maintenance Guidelines', checked: false, comment: '' },
    ],
  },
];

const securityChecklist: ChecklistCategory[] = [
  {
    id: 'info-gathering',
    name: 'Information Gathering',
    items: [
      { id: 'info1', title: 'DNS Information: Check for subdomains, DNS records, and external services', checked: false, comment: '' },
      { id: 'info2', title: 'WHOIS Lookup: Identify domain owner information, registrars, and expiration', checked: false, comment: '' },
      { id: 'info3', title: 'Technology Stack: Identify frameworks, libraries, and server software used', checked: false, comment: '' },
      { id: 'info4', title: 'Server Banners: Review HTTP/HTTPS headers for server and technology info', checked: false, comment: '' },
      { id: 'info5', title: 'Publicly Available Data: Search for exposed source code, configuration files, etc.', checked: false, comment: '' },
      { id: 'info6', title: 'Open Ports: Scan for unnecessary open ports', checked: false, comment: '' },
    ],
  },
  {
    id: 'auth',
    name: 'Authentication and Authorization',
    items: [
      { id: 'auth1', title: 'Login Pages: Check for brute-force vulnerability (rate limiting, CAPTCHA)', checked: false, comment: '' },
      { id: 'auth2', title: 'Weak Passwords: Test for weak or commonly used passwords', checked: false, comment: '' },
      { id: 'auth3', title: 'Session Management: Ensure secure session tokens (secure, HttpOnly, SameSite cookies)', checked: false, comment: '' },
      { id: 'auth4', title: 'Multi-factor Authentication (MFA): Test the implementation and ensure proper fallback mechanisms', checked: false, comment: '' },
      { id: 'auth5', title: 'Access Control: Test for privilege escalation (ensure users can\'t access unauthorized resources)', checked: false, comment: '' },
      { id: 'auth6', title: 'Account Lockout: Ensure accounts are locked after a defined number of failed login attempts', checked: false, comment: '' },
    ],
  },
  {
    id: 'input-validation',
    name: 'Input Validation',
    items: [
      { id: 'input1', title: 'Cross-Site Scripting (XSS): Test for reflected, stored, and DOM-based XSS', checked: false, comment: '' },
      { id: 'input2', title: 'SQL Injection: Check for vulnerable SQL queries (both direct and blind)', checked: false, comment: '' },
      { id: 'input3', title: 'Command Injection: Look for system command injections (shell injection)', checked: false, comment: '' },
      { id: 'input4', title: 'File Uploads: Ensure files are properly sanitized, and content type validation is in place', checked: false, comment: '' },
      { id: 'input5', title: 'Cross-Site Request Forgery (CSRF): Ensure anti-CSRF tokens are implemented for sensitive actions', checked: false, comment: '' },
    ],
  },
  {
    id: 'sensitive-data',
    name: 'Sensitive Data Exposure',
    items: [
      { id: 'data1', title: 'Data Encryption: Ensure sensitive data is encrypted (SSL/TLS for HTTPs, data at rest)', checked: false, comment: '' },
      { id: 'data2', title: 'Insecure Storage: Check for exposed credentials, API keys, or sensitive data in source code', checked: false, comment: '' },
      { id: 'data3', title: 'Password Storage: Check that passwords are hashed and salted (never stored as plaintext)', checked: false, comment: '' },
      { id: 'data4', title: 'HTTP Headers: Ensure proper HTTP security headers (Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, etc.)', checked: false, comment: '' },
      { id: 'data5', title: 'TLS Configuration: Ensure up-to-date cipher suites, protocol versions (TLS 1.2 or higher), and no weak encryption', checked: false, comment: '' },
    ],
  },
  {
    id: 'waf',
    name: 'Web Application Firewalls (WAF)',
    items: [
      { id: 'waf1', title: 'WAF Detection: Check if a Web Application Firewall is in place and properly configured', checked: false, comment: '' },
      { id: 'waf2', title: 'Bypass Attempts: Test for bypass techniques (e.g., encoding or fragmentation of malicious payloads)', checked: false, comment: '' },
    ],
  },
  {
    id: 'business-logic',
    name: 'Business Logic and Application Logic',
    items: [
      { id: 'logic1', title: 'Authentication Flaws: Test for bypassing authentication or session logic', checked: false, comment: '' },
      { id: 'logic2', title: 'State Management: Ensure the state transitions in workflows are handled correctly', checked: false, comment: '' },
      { id: 'logic3', title: 'Race Conditions: Look for opportunities to exploit timing issues or concurrency flaws', checked: false, comment: '' },
    ],
  },
  {
    id: 'error-handling',
    name: 'Error Handling',
    items: [
      { id: 'error1', title: 'Error Messages: Ensure error messages do not leak sensitive information', checked: false, comment: '' },
      { id: 'error2', title: 'Exception Handling: Verify that exceptions are caught and handled without revealing stack traces', checked: false, comment: '' },
      { id: 'error3', title: 'Default Error Pages: Ensure custom error pages are implemented to prevent information leaks', checked: false, comment: '' },
    ],
  },
  {
    id: 'third-party',
    name: 'Third-Party Services and APIs',
    items: [
      { id: 'third1', title: 'API Security: Check for proper authentication, rate limiting, and input validation in APIs', checked: false, comment: '' },
      { id: 'third2', title: 'Dependencies: Check for vulnerabilities in third-party libraries (e.g., using outdated packages)', checked: false, comment: '' },
      { id: 'third3', title: 'CORS Policy: Ensure proper Cross-Origin Resource Sharing (CORS) settings to avoid unauthorized cross-origin requests', checked: false, comment: '' },
    ],
  },
  {
    id: 'file-permissions',
    name: 'File Permissions and Directories',
    items: [
      { id: 'file1', title: 'Directory Listing: Ensure directory listings are disabled on web servers', checked: false, comment: '' },
      { id: 'file2', title: 'File Permissions: Verify the least privilege principle for files and directories', checked: false, comment: '' },
      { id: 'file3', title: 'Sensitive Files: Ensure sensitive files (e.g., .env, config.php) are not publicly accessible', checked: false, comment: '' },
    ],
  },
  {
    id: 'logging',
    name: 'Logging and Monitoring',
    items: [
      { id: 'log1', title: 'Log Files: Ensure logging is implemented and contains necessary information (without logging sensitive data)', checked: false, comment: '' },
      { id: 'log2', title: 'Error and Access Logs: Check for proper monitoring of access logs and error logs', checked: false, comment: '' },
      { id: 'log3', title: 'Intrusion Detection: Ensure that the system is monitored for unusual activity', checked: false, comment: '' },
    ],
  },
  {
    id: 'xssi',
    name: 'Cross-Site Script Inclusion (XSSI)',
    items: [
      { id: 'xssi1', title: 'JS Vulnerabilities: Ensure JavaScript libraries are free from known vulnerabilities', checked: false, comment: '' },
      { id: 'xssi2', title: 'DOM-based XSS: Test for DOM-based XSS where user input is reflected in client-side JS', checked: false, comment: '' },
    ],
  },
  {
    id: 'social',
    name: 'Social Engineering Tests',
    items: [
      { id: 'social1', title: 'Phishing: Test employees\' resistance to phishing attacks (email, social media, etc.)', checked: false, comment: '' },
      { id: 'social2', title: 'Pretexting: Test social engineering techniques involving impersonation', checked: false, comment: '' },
      { id: 'social3', title: 'Vishing: Test for susceptibility to voice-based social engineering', checked: false, comment: '' },
    ],
  },
  {
    id: 'dos',
    name: 'Denial of Service (DoS)',
    items: [
      { id: 'dos1', title: 'Rate Limiting: Test whether the application is protected against brute-force attacks or large-scale requests', checked: false, comment: '' },
      { id: 'dos2', title: 'Resource Exhaustion: Check if the application can be overwhelmed with excessive resource requests', checked: false, comment: '' },
    ],
  },
  {
    id: 'security-headers',
    name: 'Security Headers',
    items: [
      { id: 'headers1', title: 'Strict Transport Security (HSTS): Ensure HSTS is implemented to force HTTPS', checked: false, comment: '' },
      { id: 'headers2', title: 'X-Content-Type-Options: Set nosniff to prevent content type sniffing', checked: false, comment: '' },
      { id: 'headers3', title: 'Content Security Policy (CSP): Implement a CSP to mitigate XSS risks', checked: false, comment: '' },
      { id: 'headers4', title: 'X-Frame-Options: Ensure that the application cannot be embedded in a frame to prevent clickjacking', checked: false, comment: '' },
    ],
  },
  {
    id: 'backup',
    name: 'Backup and Recovery Plan',
    items: [
      { id: 'backup1', title: 'Backup Security: Ensure that backups are encrypted and stored securely', checked: false, comment: '' },
      { id: 'backup2', title: 'Disaster Recovery: Test the organization\'s ability to recover from an attack (ransomware, data breach)', checked: false, comment: '' },
    ],
  },
];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projects = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Project[];
      set({ projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      set({ loading: false });
    }
  },

  addProject: async (name, description, type) => {
    try {
      const newProject: Omit<Project, 'id'> = {
        name,
        description,
        type,
        createdAt: new Date().toISOString(),
        categories: type === 'security-audit' ? [...securityChecklist] : [...webDevChecklist],
      };
      
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const projectWithId = { ...newProject, id: docRef.id };
      set(state => ({ projects: [...state.projects, projectWithId] }));
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      set(state => ({
        projects: state.projects.filter(project => project.id !== projectId)
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  toggleCheckItem: async (projectId, categoryId, checkItemId) => {
    try {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedCategories = project.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === checkItemId
                  ? { ...item, checked: !item.checked }
                  : item
              ),
            }
          : category
      );

      await updateDoc(doc(db, 'projects', projectId), {
        categories: updatedCategories
      });

      set(state => ({
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, categories: updatedCategories }
            : p
        )
      }));
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  updateItemComment: async (projectId, categoryId, checkItemId, comment) => {
    try {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedCategories = project.categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === checkItemId
                  ? { ...item, comment }
                  : item
              ),
            }
          : category
      );

      await updateDoc(doc(db, 'projects', projectId), {
        categories: updatedCategories
      });

      set(state => ({
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, categories: updatedCategories }
            : p
        )
      }));
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },
}));
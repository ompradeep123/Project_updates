import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { 
  CheckCircle, 
  Circle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ToggleLeft, 
  ToggleRight, 
  FileDown,
  AlertTriangle
} from 'lucide-react';

export function ProjectDetail() {
  const { projectId } = useParams();
  const { projects, loading, fetchProjects, toggleCheckItem, updateItemComment } = useProjectStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [categoryStatus, setCategoryStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategoryStatus(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const calculateProgress = (categoryId: string) => {
    const category = project.categories.find((c) => c.id === categoryId);
    if (!category) return 0;
    const checkedItems = category.items.filter((item) => item.checked).length;
    return Math.round((checkedItems / category.items.length) * 100);
  };

  const handleCommentChange = async (
    categoryId: string,
    itemId: string,
    comment: string
  ) => {
    if (projectId) {
      await updateItemComment(projectId, categoryId, itemId, comment);
    }
  };

  const generateReport = () => {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let reportContent = `
SECURITY AUDIT REPORT
${project.name}
Generated on: ${reportDate}

EXECUTIVE SUMMARY
----------------
This security audit report provides a comprehensive assessment of the security posture of ${project.name}. 
The audit was conducted using industry-standard security testing methodologies and best practices.

HIGH-RISK FINDINGS
-----------------
${project.categories
  .filter(cat => categoryStatus[cat.id])
  .map(cat => {
    const issues = cat.items.filter(item => item.checked && item.comment);
    if (issues.length === 0) return '';
    return `
${cat.name}:
${issues.map(item => `- ${item.title}
  Finding: ${item.comment}`).join('\n')}
`
  }).filter(Boolean).join('\n')}

DETAILED ASSESSMENT
------------------
${project.categories.map(cat => `
${cat.name}
${'-'.repeat(cat.name.length)}
Progress: ${calculateProgress(cat.id)}%
Status: ${categoryStatus[cat.id] ? 'High Risk' : 'Low Risk'}

${cat.items.map(item => `
□ ${item.title}
  Status: ${item.checked ? '✓ Checked' : '✗ Unchecked'}
  ${item.comment ? `Notes: ${item.comment}` : ''}`).join('\n')}
`).join('\n')}

RECOMMENDATIONS
--------------
Based on the findings, we recommend prioritizing the remediation of issues in the following categories:
${project.categories
  .filter(cat => categoryStatus[cat.id])
  .map(cat => `- ${cat.name}`).join('\n')}

END OF REPORT
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-report-${project.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const highRiskCount = Object.values(categoryStatus).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-8 w-8 text-cyan-500" />
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {highRiskCount > 0 && (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <span>{highRiskCount} {highRiskCount === 1 ? 'Category' : 'Categories'} Need Action </span>
            </div>
          )}
          <button
            onClick={generateReport}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <FileDown className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>
      <p className="text-gray-400 mb-8">{project.description}</p>
      
      <div className="space-y-4">
        {project.categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800 rounded-lg border border-cyan-500/20 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4">
              <div
                className="flex-1 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <span className="text-sm text-cyan-500">
                    {calculateProgress(category.id)}% complete
                  </span>
                </div>
                {expandedCategories.includes(category.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div 
                className="ml-4 cursor-pointer"
                onClick={() => toggleCategoryStatus(category.id)}
              >
                {categoryStatus[category.id] ? (
                  <ToggleRight className="h-6 w-6 text-red-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
            
            {expandedCategories.includes(category.id) && (
              <div className="border-t border-cyan-500/20">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-cyan-500/10 last:border-b-0"
                  >
                    <div
                      className="flex items-center space-x-3 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => toggleCheckItem(project.id, category.id, item.id)}
                    >
                      {item.checked ? (
                        <CheckCircle className="h-6 w-6 text-cyan-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={item.checked ? 'text-cyan-500' : 'text-gray-300'}>
                        {item.title}
                      </span>
                    </div>
                    <div className="px-4 pb-4">
                      <textarea
                        className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Add notes or findings..."
                        rows={2}
                        value={item.comment}
                        onChange={(e) => handleCommentChange(category.id, item.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
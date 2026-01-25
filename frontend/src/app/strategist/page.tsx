'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common';
import { Button } from '../../components/common';
import { strategistAPI } from '../../api/strategist';
import { ResearchProject } from '@/types';
import { Brain, Search, MessageSquare, FileText, Plus, ArrowRight } from 'lucide-react';

export default function StrategistPage() {
  const [recentProjects, setRecentProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = async () => {
    try {
      const response = await strategistAPI.getResearchList();
      const projects = response.data || [];
      setRecentProjects(projects.slice(0, 6)); // Show latest 6
    } catch (error) {
      console.error('Failed to load recent projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewResearch = () => {
    window.location.href = '/strategist/research';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-antonio uppercase tracking-wide mb-2">
            AI Strategist
          </h1>
          <p className="text-text-muted text-lg">
            Deep market research, voice interviews, and GTM strategy reports powered by Claude AI
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartNewResearch}
          icon={<Plus size={20} />}
        >
          New Research
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="cursor-pointer" onClick={handleStartNewResearch}>
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gold bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <Search className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary font-antonio uppercase tracking-wide">
                Market Research
              </h3>
              <p className="text-sm text-text-muted mt-1">
                AI-powered competitive analysis and market insights
              </p>
            </div>
          </CardContent>
        </Card>

        <Card hover className="cursor-pointer opacity-60">
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <MessageSquare className="w-6 h-6 text-blue" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary font-antonio uppercase tracking-wide">
                Voice Interview
              </h3>
              <p className="text-sm text-text-muted mt-1">
                4-question brand strategy interview with Claude AI
              </p>
            </div>
          </CardContent>
        </Card>

        <Card hover className="cursor-pointer opacity-60">
          <CardContent className="flex items-center p-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-purple" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary font-antonio uppercase tracking-wide">
                GTM Reports
              </h3>
              <p className="text-sm text-text-muted mt-1">
                7-section go-to-market strategy reports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Research Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-surface rounded mb-2"></div>
                  <div className="h-3 bg-surface rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border-subtle hover:border-gold transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/strategist/research/${project.id}`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gold bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                      <Brain className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {project.businessUrl || project.name || 'Research Project'}
                      </h4>
                      <p className="text-sm text-text-muted">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-success bg-opacity-20 text-success'
                        : 'bg-warning bg-opacity-20 text-warning'
                    }`}>
                      {project.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No research projects yet
              </h3>
              <p className="text-text-muted mb-4">
                Start your first market research to unlock AI-powered insights
              </p>
              <Button variant="primary" onClick={handleStartNewResearch}>
                Start Research
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Strategist Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gold font-antonio">1</span>
              </div>
              <h3 className="font-bold text-text-primary font-antonio uppercase tracking-wide mb-2">
                Research
              </h3>
              <p className="text-sm text-text-muted">
                Submit your website URL and product description for AI analysis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue font-antonio">2</span>
              </div>
              <h3 className="font-bold text-text-primary font-antonio uppercase tracking-wide mb-2">
                Interview
              </h3>
              <p className="text-sm text-text-muted">
                Answer 4 strategic questions about your brand and goals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple font-antonio">3</span>
              </div>
              <h3 className="font-bold text-text-primary font-antonio uppercase tracking-wide mb-2">
                Strategy
              </h3>
              <p className="text-sm text-text-muted">
                Receive a comprehensive 7-section GTM strategy report
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
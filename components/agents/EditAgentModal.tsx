'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RiRobotLine } from '@remixicon/react';
import { workflowAPI, knowledgeBaseAPI } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  aiModel: string;
  isActive: boolean;
  workflowId: string | null;
  knowledgeBaseId?: string | null;
  blockCompetitorQuestions?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  workspaceId: string;
  agent: Agent | null;
}

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Meest capabel)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Snel & efficient)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
];

export function EditAgentModal({ isOpen, onClose, onSubmit, workspaceId, agent }: EditAgentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [blockCompetitorQuestions, setBlockCompetitorQuestions] = useState(false);
  const [workflowId, setWorkflowId] = useState('');
  const [knowledgeBaseId, setKnowledgeBaseId] = useState('');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false);

  // Load agent data when modal opens
  useEffect(() => {
    if (isOpen && agent) {
      setName(agent.name);
      setDescription(agent.description || '');
      setAiModel(agent.aiModel);
      setTemperature(agent.temperature || 0.7);
      setMaxTokens(agent.maxTokens || 1000);
      setSystemPrompt(agent.systemPrompt || '');
      setBlockCompetitorQuestions(agent.blockCompetitorQuestions || false);
      setWorkflowId(agent.workflowId || '');
      setKnowledgeBaseId(agent.knowledgeBaseId || '');
      loadWorkflows();
      loadKnowledgeBases();
    }
  }, [isOpen, agent]);

  const loadWorkflows = async () => {
    try {
      setIsLoadingWorkflows(true);
      const data = await workflowAPI.getWorkspaceWorkflows(workspaceId);
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const loadKnowledgeBases = async () => {
    try {
      setIsLoadingKnowledgeBases(true);
      const data = await knowledgeBaseAPI.getWorkspaceKBs(workspaceId);
      setKnowledgeBases(data);
    } catch (err) {
      console.error('Failed to load knowledge bases:', err);
    } finally {
      setIsLoadingKnowledgeBases(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        aiModel,
        temperature,
        maxTokens,
        systemPrompt: systemPrompt.trim(),
        blockCompetitorQuestions,
        workflowId: workflowId || undefined,
        knowledgeBaseId: knowledgeBaseId || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agent Bewerken" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <RiRobotLine size={32} className="text-primary" />
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-2">
          Wijzig de configuratie van je AI agent
        </p>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Agent Name */}
            <div>
              <label htmlFor="agent-name" className="block text-sm font-medium text-foreground mb-2">
                Agent Naam <span className="text-destructive">*</span>
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Customer Support Bot, Sales Assistant..."
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="agent-description" className="block text-sm font-medium text-foreground mb-2">
                Beschrijving
              </label>
              <textarea
                id="agent-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Korte beschrijving van de agent..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* AI Model */}
            <div>
              <label htmlFor="ai-model" className="block text-sm font-medium text-foreground mb-2">
                AI Model <span className="text-destructive">*</span>
              </label>
              <select
                id="ai-model"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                {AI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-foreground mb-2">
                Temperature: {temperature}
              </label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Precies (0)</span>
                <span>Gebalanceerd (1)</span>
                <span>Creatief (2)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label htmlFor="max-tokens" className="block text-sm font-medium text-foreground mb-2">
                Max Tokens
              </label>
              <input
                id="max-tokens"
                type="number"
                min="100"
                max="100000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>

            {/* Knowledge Base Selection */}
            <div>
              <label htmlFor="knowledge-base" className="block text-sm font-medium text-foreground mb-2">
                Knowledge Base (Optioneel)
              </label>
              <select
                id="knowledge-base"
                value={knowledgeBaseId}
                onChange={(e) => setKnowledgeBaseId(e.target.value)}
                disabled={isLoadingKnowledgeBases}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
              >
                <option value="">Geen knowledge base</option>
                {knowledgeBases.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground mt-1">
                De agent gebruikt deze data om vragen te beantwoorden
              </div>
            </div>

            {/* Workflow Selection */}
            <div>
              <label htmlFor="workflow" className="block text-sm font-medium text-foreground mb-2">
                Workflow (Optioneel)
              </label>
              <select
                id="workflow"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                disabled={isLoadingWorkflows}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
              >
                <option value="">Geen workflow</option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} {workflow.isActive ? '✓' : '(inactief)'}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground mt-1">
                Koppel een workflow voor geavanceerde automation
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* System Prompt */}
            <div>
              <label htmlFor="system-prompt" className="block text-sm font-medium text-foreground mb-2">
                System Prompt <span className="text-destructive">*</span>
              </label>
              <textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Definieer de persoonlijkheid en gedrag van je agent..."
                rows={20}
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                De basis instructies voor hoe de agent zich moet gedragen
              </div>
            </div>

            {/* Competitor Blocking */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockCompetitorQuestions}
                  onChange={(e) => setBlockCompetitorQuestions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">
                    Blokkeer vragen over concurrentie
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    De agent weigert vragen over concurrenten of andere partijen te beantwoorden
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Tip:</strong> Een goede system prompt is specifiek over de rol, tone of voice, en hoe de agent moet reageren op verschillende situaties.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !systemPrompt.trim() || isSubmitting}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Opslaan...' : 'Wijzigingen Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

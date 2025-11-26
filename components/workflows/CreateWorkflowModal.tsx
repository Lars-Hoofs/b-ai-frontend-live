'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RiFlowChart } from '@remixicon/react';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
}

export function CreateWorkflowModal({ isOpen, onClose, onSubmit }: CreateWorkflowModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
      });
      // Reset form
      setName('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nieuwe Workflow Aanmaken" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <RiFlowChart size={32} className="text-primary" />
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-2">
          Maak een workflow aan om complexe conversatie flows te automatiseren
        </p>

        {/* Workflow Name */}
        <div>
          <label htmlFor="workflow-name" className="block text-sm font-medium text-foreground mb-2">
            Workflow Naam <span className="text-destructive">*</span>
          </label>
          <input
            id="workflow-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bijv. Customer Onboarding, Lead Qualification..."
            required
            maxLength={100}
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="workflow-description" className="block text-sm font-medium text-foreground mb-2">
            Beschrijving
          </label>
          <textarea
            id="workflow-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschrijf het doel en de stappen van deze workflow..."
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {description.length}/500
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Let op:</strong> Na aanmaken kun je nodes en conditions toevoegen om de workflow flow te bouwen. De workflow moet geactiveerd worden voordat deze gebruikt kan worden.
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
            disabled={!name.trim() || isSubmitting}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Workflow aanmaken...' : 'Workflow Aanmaken'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

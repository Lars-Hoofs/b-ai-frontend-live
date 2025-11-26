'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RiTeamLine } from '@remixicon/react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; slug: string }) => void;
}

export function CreateTeamModal({ isOpen, onClose, onSubmit }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Only auto-generate if slug hasn't been manually edited
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    try {
      onSubmit({ 
        name: name.trim(), 
        slug: slug.trim(), 
        description: description.trim() 
      });
      // Reset form
      setName('');
      setSlug('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setSlug('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nieuw Team Aanmaken" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <RiTeamLine size={32} className="text-primary" />
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-2">
          Maak een nieuw team aan om je werkruimte te organiseren en samen te werken met je collega's
        </p>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Team Name */}
            <div>
              <label htmlFor="team-name" className="block text-sm font-medium text-foreground mb-2">
                Team Naam <span className="text-destructive">*</span>
              </label>
              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Bijv. Marketing Team, Development..."
                required
                maxLength={50}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {name.length}/50
              </div>
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="team-slug" className="block text-sm font-medium text-foreground mb-2">
                URL Slug <span className="text-destructive">*</span>
              </label>
              <input
                id="team-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="marketing-team"
                required
                maxLength={50}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-mono"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Unieke identifier (letters, cijfers, streepjes)
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label htmlFor="team-description" className="block text-sm font-medium text-foreground mb-2">
                Beschrijving
              </label>
              <textarea
                id="team-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Geef een korte beschrijving van het doel en de verantwoordelijkheden van dit team..."
                rows={7}
                maxLength={500}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {description.length}/500
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Let op:</strong> Je wordt automatisch de eigenaar van dit team. Je kunt later andere
            members toevoegen en rollen toewijzen.
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
            disabled={!name.trim() || !slug.trim() || isSubmitting}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Team aanmaken...' : 'Team Aanmaken'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

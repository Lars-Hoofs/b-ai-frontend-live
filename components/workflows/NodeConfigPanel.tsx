'use client';

import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { RiCloseLine, RiTimeLine, RiMessageLine, RiKeyLine, RiMailLine, RiCodeLine, RiSettings3Line, RiInformationLine, RiSearchLine, RiCheckboxCircleLine, RiLinkM, RiDatabase2Line, RiUserLine, RiBrainLine, RiSaveLine, RiDeleteBin6Line } from '@remixicon/react';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, config: any) => void;
  onDelete?: (nodeId: string) => void;
}

export function NodeConfigPanel({ node, onClose, onUpdate, onDelete }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (node) {
      let initialConfig = node.data.config || {};
      
      // Convert duration from milliseconds to user-friendly format
      if (node.data.type === 'TRIGGER_WAIT' && initialConfig.duration) {
        const durationMs = initialConfig.duration;
        // Determine best unit
        if (durationMs >= 3600000 && durationMs % 3600000 === 0) {
          initialConfig = { ...initialConfig, duration: durationMs / 3600000, unit: 'hours' };
        } else if (durationMs >= 60000 && durationMs % 60000 === 0) {
          initialConfig = { ...initialConfig, duration: durationMs / 60000, unit: 'minutes' };
        } else {
          initialConfig = { ...initialConfig, duration: durationMs / 1000, unit: 'seconds' };
        }
      }
      
      setConfig(initialConfig);
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    // Convert duration to milliseconds for backend
    let finalConfig = { ...config };
    
    if (node.data.type === 'TRIGGER_WAIT' && config.duration && config.unit) {
      const unitMultipliers: Record<string, number> = {
        seconds: 1000,
        minutes: 60000,
        hours: 3600000,
      };
      finalConfig.duration = config.duration * (unitMultipliers[config.unit] || 1000);
      // Remove unit field as backend only needs milliseconds
      delete finalConfig.unit;
    }
    
    onUpdate(node.id, finalConfig);
    onClose();
  };

  const renderConfigForm = () => {
    switch (node.data.type) {
      // TRIGGERS
      case 'TRIGGER_WAIT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <RiTimeLine size={16} className="inline mr-2" />
                Wachttijd
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={config.duration || ''}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 1 })}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <select
                  value={config.unit || 'seconds'}
                  onChange={(e) => setConfig({ ...config, unit: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="seconds">Seconden</option>
                  <option value="minutes">Minuten</option>
                  <option value="hours">Uren</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiTimeLine size={14} className="text-muted-foreground" />
                Wacht {config.duration || 5} {config.unit === 'hours' ? 'uur/uren' : config.unit === 'minutes' ? 'minuten' : 'seconden'} voordat de workflow verdergaat
              </p>
            </div>
          </div>
        );

      // CONDITIONS
      case 'CONDITION_CONTAINS':
      case 'CONDITION_KEYWORD':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <RiKeyLine size={16} className="inline mr-2" />
                Sleutelwoorden
              </label>
              <textarea
                rows={5}
                placeholder="Voer sleutelwoorden in, één per regel...\nBijvoorbeeld:\nhelp\nsupport\nvraag"
                value={(config.keywords || []).join('\n')}
                onChange={(e) => setConfig({ ...config, keywords: e.target.value.split('\n').filter(k => k.trim()) })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiSearchLine size={14} className="text-muted-foreground" />
                Bericht moet één van deze woorden bevatten om door te gaan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="caseSensitive"
                checked={config.caseSensitive || false}
                onChange={(e) => setConfig({ ...config, caseSensitive: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="caseSensitive" className="text-sm text-foreground">
                Hoofdlettergevoelig
              </label>
            </div>
          </div>
        );

      case 'CONDITION_EQUALS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Verwachte waarde
              </label>
              <input
                type="text"
                placeholder="Bijv: ja, akkoord, bevestig..."
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiCheckboxCircleLine size={14} className="text-muted-foreground" />
                De waarde moet exact overeenkomen om door te gaan
              </p>
            </div>
          </div>
        );

      // ACTIONS
      case 'ACTION_MESSAGE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <RiMessageLine size={16} className="inline mr-2" />
                Bericht Tekst
              </label>
              <textarea
                rows={6}
                placeholder="Typ je bericht hier...\nBijvoorbeeld: Bedankt voor je bericht! We helpen je graag verder."
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiInformationLine size={14} className="text-muted-foreground" />
                Je kunt variabelen gebruiken: {"{{user.name}}"}, {"{{message.content}}"}
              </p>
            </div>
          </div>
        );

      case 'ACTION_EMAIL':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <RiMailLine size={16} className="inline mr-2" />
                Ontvanger Email
              </label>
              <input
                type="email"
                placeholder="email@voorbeeld.nl"
                value={config.to || config.email || ''}
                onChange={(e) => setConfig({ ...config, to: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Onderwerp
              </label>
              <input
                type="text"
                placeholder="Nieuwe vraag van klant"
                value={config.subject || ''}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bericht
              </label>
              <textarea
                rows={4}
                placeholder="Er is een nieuwe vraag binnengekomen van een klant..."
                value={config.body || ''}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'ACTION_API_CALL':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <RiCodeLine size={16} className="inline mr-2" />
                API URL
              </label>
              <input
                type="url"
                placeholder="https://api.voorbeeld.com/endpoint"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiLinkM size={14} className="text-muted-foreground" />
                Vul de volledige URL in van je API endpoint
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Methode
              </label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => setConfig({ ...config, method: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="GET">GET - Data ophalen</option>
                <option value="POST">POST - Data versturen</option>
                <option value="PUT">PUT - Data updaten</option>
                <option value="DELETE">DELETE - Data verwijderen</option>
              </select>
            </div>
            {(config.method === 'POST' || config.method === 'PUT') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  rows={4}
                  placeholder='{\n  "naam": "waarde",\n  "email": "{{message.content}}"\n}'
                  value={config.body || ''}
                  onChange={(e) => setConfig({ ...config, body: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <RiCodeLine size={14} className="text-muted-foreground" />
                  JSON formaat - gebruik variabelen met {"{{variabele}}"} syntax
                </p>
              </div>
            )}
          </div>
        );

      case 'ACTION_SET_VARIABLE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <RiSettings3Line size={16} className="inline mr-2" />
                Variabele Naam
              </label>
              <input
                type="text"
                placeholder="klantNaam, emailAdres, status..."
                value={config.variableName || ''}
                onChange={(e) => setConfig({ ...config, variableName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiInformationLine size={14} className="text-muted-foreground" />
                Kies een duidelijke naam zonder spaties
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Waarde
              </label>
              <input
                type="text"
                placeholder="Jan Jansen, {{message.content}}, actief..."
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiSaveLine size={14} className="text-muted-foreground" />
                Deze waarde wordt opgeslagen voor later gebruik in de workflow
              </p>
            </div>
          </div>
        );

      // AI ACTIONS
      case 'AI_RESPONSE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Model
              </label>
              <select
                value={config.model || 'gpt-4o-mini'}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Snel & Goedkoop)</option>
                <option value="gpt-4o">GPT-4o (Krachtig)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Instructies (System Prompt)
              </label>
              <textarea
                rows={4}
                placeholder="Je bent een vriendelijke klantenservice medewerker...\nGeef altijd beleefde en heldere antwoorden."
                value={config.systemPrompt || config.prompt || ''}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value, prompt: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiBrainLine size={14} className="text-muted-foreground" />
                Beschrijf hoe de AI moet reageren op berichten
              </p>
            </div>
          </div>
        );

      case 'TRIGGER_INACTIVITY':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Inactiviteit Drempel (minuten)
              </label>
              <input
                type="number"
                min="1"
                placeholder="10"
                value={config.thresholdMinutes || ''}
                onChange={(e) => setConfig({ ...config, thresholdMinutes: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiTimeLine size={14} className="text-muted-foreground" />
                Trigger deze node na {config.thresholdMinutes || 10} minuten inactiviteit
              </p>
            </div>
          </div>
        );
      
      case 'CONDITION_VARIABLE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Variabele Naam
              </label>
              <input
                type="text"
                placeholder="status, emailBevestigd..."
                value={config.variable || ''}
                onChange={(e) => setConfig({ ...config, variable: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Verwachte Waarde
              </label>
              <input
                type="text"
                placeholder="actief, true, bevestigd..."
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'AI_SEARCH_KB':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Knowledge Base ID
              </label>
              <input
                type="text"
                placeholder="Kopieer ID van je knowledge base"
                value={config.knowledgeBaseId || ''}
                onChange={(e) => setConfig({ ...config, knowledgeBaseId: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Resultaten
              </label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="3"
                value={config.limit || ''}
                onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiDatabase2Line size={14} className="text-muted-foreground" />
                Zoek in je knowledge base voor relevante informatie
              </p>
            </div>
          </div>
        );

      case 'AI_EXTRACT_INFO':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Velden om te Extraheren
              </label>
              <textarea
                rows={3}
                placeholder="naam\nemail\ntelefoon\nadres"
                value={(config.fields || []).join('\n')}
                onChange={(e) => setConfig({ ...config, fields: e.target.value.split('\n').filter(f => f.trim()) })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiSearchLine size={14} className="text-muted-foreground" />
                Geef aan welke informatie je wilt extraheren uit het bericht
              </p>
            </div>
          </div>
        );

      case 'ACTION_ASSIGN_HUMAN':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Gebruiker ID (optioneel)
              </label>
              <input
                type="text"
                placeholder="Laat leeg voor automatische toewijzing"
                value={config.userId || ''}
                onChange={(e) => setConfig({ ...config, userId: e.target.value || null })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RiUserLine size={14} className="text-muted-foreground" />
                Wijs het gesprek toe aan een menselijke medewerker
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <RiInformationLine size={16} className="text-muted-foreground" />
            Geen configuratie nodig voor dit node type.
          </div>
        );
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{node.data.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{node.data.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <RiCloseLine size={20} />
        </button>
      </div>

      {/* Config Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfigForm()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('Weet je zeker dat je deze node wilt verwijderen?')) {
                onDelete(node.id);
                onClose();
              }
            }}
            className="w-full mb-3 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <RiDeleteBin6Line size={16} />
            Verwijder Node
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

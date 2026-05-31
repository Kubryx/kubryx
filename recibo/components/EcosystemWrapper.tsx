'use client';

import { useState } from 'react';
import EcosystemSidebar from './EcosystemSidebar';
import EcosystemPanel from './EcosystemPanel';
import { ECOSYSTEM_TOOLS } from '@/lib/ecosystem-tools';

export default function EcosystemWrapper() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTool = ECOSYSTEM_TOOLS.find(t => t.id === selectedId) ?? null;
  const isPanelOpen = selectedId !== null;

  const handleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleClose = () => setSelectedId(null);

  return (
    <>
      <EcosystemSidebar selectedId={selectedId} onSelect={handleSelect} />
      <EcosystemPanel tool={selectedTool} isOpen={isPanelOpen} onClose={handleClose} />
    </>
  );
}

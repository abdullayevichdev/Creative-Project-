import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { SPECIES_DATA } from '../data/speciesData';
import { SpeciesType } from '../types/marine';

interface SpeciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpeciesId?: SpeciesType | null;
}

export const SpeciesModal: React.FC<SpeciesModalProps> = ({
  isOpen,
  onClose,
  selectedSpeciesId,
}) => {
  const [activeSpecies, setActiveSpecies] = useState<SpeciesType>('clownfish');

  useEffect(() => {
    if (selectedSpeciesId) {
      setActiveSpecies(selectedSpeciesId);
    }
  }, [selectedSpeciesId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = SPECIES_DATA[activeSpecies] || SPECIES_DATA.clownfish;
  const speciesList = Object.values(SPECIES_DATA);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="species-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col md:flex-row bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close species guide"
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar list of species */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-4 overflow-y-auto max-h-48 md:max-h-[85vh]">
          <div className="flex items-center gap-2 mb-3 text-xs tracking-widest text-sky-400 font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Living Species ({speciesList.length})</span>
          </div>

          <div className="space-y-1">
            {speciesList.map((sp) => {
              const isSelected = sp.id === activeSpecies;
              return (
                <button
                  key={sp.id}
                  onClick={() => setActiveSpecies(sp.id as SpeciesType)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-150 flex flex-col cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30 font-medium'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{sp.commonName}</span>
                  <span className="text-[11px] text-slate-400 italic">{sp.scientificName}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Species Detail Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[85vh]">
          <div className="max-w-xl">
            {/* Header info */}
            <h2 id="species-title" className="text-2xl md:text-3xl font-serif text-white tracking-wide">
              {current.commonName}
            </h2>
            <p className="text-sm italic text-sky-300 font-mono mt-0.5">{current.scientificName}</p>

            {/* Clean unboxed metadata with separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 my-4">
              <span>{current.depthZone}</span>
              <span aria-hidden="true">·</span>
              <span>Lifespan: {current.lifespan}</span>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Ecology &amp; Morphology
              </h3>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed font-light">
                {current.description}
              </p>
            </div>

            {/* Diet & Nutrition */}
            <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/5">
              <h4 className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Natural Diet
              </h4>
              <p className="text-xs md:text-sm text-slate-300 font-light">{current.diet}</p>
            </div>

            {/* Habitat behavior note */}
            <div className="mt-5 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: current.accentColor }} />
              <span>Simulated with continuous organic locomotion and dynamic spine wave physics</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

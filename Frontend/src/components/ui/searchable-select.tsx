import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  searchString?: string; // Combine fields for better searching
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // allows overriding button classes
  required?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción...',
  disabled = false,
  className = "w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer flex justify-between items-center",
  required = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState({});

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      // Check if there's space below, otherwise render above
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 300; // estimated max height
      
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Render above
        setDropdownStyles({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 99999,
        });
      } else {
        // Render below
        setDropdownStyles({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 99999,
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      // Listen to scroll on any scrollable parent
      window.addEventListener('scroll', updatePosition, true); 
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value.toString() === value?.toString());

  const filteredOptions = options.filter(opt => {
    const term = searchTerm.toLowerCase();
    const searchString = opt.searchString?.toLowerCase() || opt.label.toLowerCase();
    return searchString.includes(term);
  });

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm(''); // reset search when opening
        }}
        className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${!selectedOption ? 'text-muted-foreground' : ''}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-muted-foreground ml-2 shrink-0" />
      </button>

      {/* Hidden input to handle required attribute for HTML form validation if needed */}
      {required && (
        <input 
          type="text" 
          required={required} 
          value={value} 
          onChange={() => {}} 
          className="absolute opacity-0 w-0 h-0 -z-10 pointer-events-none" 
        />
      )}

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyles}
          className="bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-72"
        >
          <div className="p-2 border-b border-border bg-card sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                autoFocus
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                }}
              />
            </div>
          </div>
          <ul className="overflow-y-auto flex-1 bg-card">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                No se encontraron resultados
              </li>
            ) : (
              filteredOptions.slice(0, 50).map(opt => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 hover:bg-secondary cursor-pointer text-sm transition-colors border-b border-border/50 last:border-0 ${value?.toString() === opt.value.toString() ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                >
                  <div className="font-semibold truncate">{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {opt.sublabel}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}

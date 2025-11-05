import React from 'react';

interface AccordionProps {
  id: string;
  title: string;
  isOpen: boolean;
  setIsOpen: (id: string) => void;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ id, title, isOpen, setIsOpen, children }) => {
  const toggleAccordion = () => {
    setIsOpen(isOpen ? '' : id);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={toggleAccordion}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-200 hover:bg-slate-700/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1500px]' : 'max-h-0'}`}
      >
        <div className="border-t border-slate-700">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
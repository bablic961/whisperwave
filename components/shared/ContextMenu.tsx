// components/shared/ContextMenu.tsx
'use client';

import { Fragment, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  children: ReactNode;
}

export function ContextMenu({ isOpen, onClose, position, children }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 w-48 rounded-xl border border-white/10 bg-[#1A1F3D] shadow-2xl shadow-black/50"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface ContextMenuItemProps {
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  danger?: boolean;
}

export function ContextMenuItem({ onClick, icon, children, danger = false }: ContextMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center space-x-3 px-4 py-2.5 text-sm text-[#A0AEC0] transition-colors hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] active:bg-[#00D4FF]/20"
    >
      {icon && <span className={danger ? 'text-[#EF4444]' : ''}>{icon}</span>}
      <span className={danger ? 'text-[#EF4444]' : ''}>{children}</span>
    </button>
  );
}

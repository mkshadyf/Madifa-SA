import { useEffect, useState, useCallback, RefObject } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type NavigationMap = Record<Direction, string>;

interface KeyboardNavigationOptions {
  navigationMap?: NavigationMap;
  elementRefs?: Record<string, RefObject<HTMLElement>>;
  onNavigate?: (direction: Direction, currentId: string, nextId: string) => void;
  onSelect?: (currentId: string) => void;
  disabled?: boolean;
  enableSubNavigation?: boolean;
  wrapNavigation?: boolean;
}

/**
 * A hook for handling keyboard navigation between elements
 */
export function useKeyboardNavigation({
  navigationMap = {},
  elementRefs = {},
  onNavigate,
  onSelect,
  disabled = false,
  enableSubNavigation = false,
  wrapNavigation = true
}: KeyboardNavigationOptions = {}) {
  const [currentFocusId, setCurrentFocusId] = useState<string | null>(null);
  const [isNavigatingByKeyboard, setIsNavigatingByKeyboard] = useState(false);

  // Track keyboard navigation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      // Enter keyboard navigation mode when using arrow keys or Tab
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        setIsNavigatingByKeyboard(true);
      }
    };

    // Exit keyboard navigation mode when using mouse
    const handleMouseMove = () => {
      if (isNavigatingByKeyboard) {
        setIsNavigatingByKeyboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [disabled, isNavigatingByKeyboard]);

  // Function to set focus to an element
  const focusElement = useCallback((id: string) => {
    if (!id || !elementRefs[id]?.current) return;
    
    // Set focus and update current focus ID
    elementRefs[id].current?.focus();
    setCurrentFocusId(id);
  }, [elementRefs]);

  // Handle directional navigation
  const handleNavigation = useCallback((direction: Direction) => {
    if (disabled || !currentFocusId) return;

    // Get the next element ID from the navigation map
    const nextElementId = navigationMap[direction]?.[currentFocusId];
    
    if (nextElementId) {
      // Focus the next element
      focusElement(nextElementId);
      
      // Call the onNavigate callback if provided
      if (onNavigate) {
        onNavigate(direction, currentFocusId, nextElementId);
      }
    } else if (wrapNavigation) {
      // Handle wrap-around navigation if enabled
      const currentIndex = Object.keys(elementRefs).indexOf(currentFocusId);
      if (currentIndex !== -1) {
        const elementIds = Object.keys(elementRefs);
        let nextIndex;
        
        // Calculate the next index based on direction
        if (direction === 'down' || direction === 'right') {
          nextIndex = (currentIndex + 1) % elementIds.length;
        } else { // up or left
          nextIndex = (currentIndex - 1 + elementIds.length) % elementIds.length;
        }
        
        const wrappedNextId = elementIds[nextIndex];
        focusElement(wrappedNextId);
        
        if (onNavigate) {
          onNavigate(direction, currentFocusId, wrappedNextId);
        }
      }
    }
  }, [disabled, currentFocusId, navigationMap, focusElement, onNavigate, wrapNavigation, elementRefs]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when in keyboard navigation mode
      if (!isNavigatingByKeyboard && !e.key.startsWith('Arrow')) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleNavigation('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleNavigation('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleNavigation('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNavigation('right');
          break;
        case 'Enter':
        case ' ': // Space key
          if (currentFocusId && onSelect) {
            e.preventDefault();
            onSelect(currentFocusId);
          }
          break;
        case 'Tab':
          // Allow default Tab behavior but update focus tracking
          setIsNavigatingByKeyboard(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, handleNavigation, currentFocusId, onSelect, isNavigatingByKeyboard]);

  // Function to manually set initial focus
  const setInitialFocus = useCallback((id: string) => {
    if (!disabled && elementRefs[id]?.current) {
      focusElement(id);
      setIsNavigatingByKeyboard(true);
    }
  }, [disabled, elementRefs, focusElement]);

  return {
    currentFocusId,
    isNavigatingByKeyboard,
    setInitialFocus,
    focusElement
  };
}
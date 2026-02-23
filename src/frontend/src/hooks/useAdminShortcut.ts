import { useEffect } from 'react';

interface UseAdminShortcutProps {
  isAuthenticated: boolean;
  isInsideApp: boolean;
  onNavigate: () => void;
}

/**
 * Custom hook that manages the Ctrl + Q keyboard shortcut for navigating to the Admin dashboard.
 * The shortcut only works when the user is authenticated and inside the application (not on landing page).
 * It is blocked when the active element is an input field, textarea, or contenteditable element.
 */
export function useAdminShortcut({ isAuthenticated, isInsideApp, onNavigate }: UseAdminShortcutProps) {
  useEffect(() => {
    // Only attach listener if user is authenticated and inside the app
    if (!isAuthenticated || !isInsideApp) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl + Q is pressed (or Cmd + Q on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
        // Check if the active element is an input field, textarea, or contenteditable
        const activeElement = document.activeElement;
        const isInputField = 
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          (activeElement instanceof HTMLElement && activeElement.isContentEditable);

        // If user is typing in an input field, ignore the shortcut
        if (isInputField) {
          return;
        }

        // Prevent default browser behavior for Ctrl + Q
        event.preventDefault();

        // Navigate to admin dashboard silently
        onNavigate();
      }
    };

    // Attach global keydown event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, isInsideApp, onNavigate]);
}

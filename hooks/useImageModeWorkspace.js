// pages/hooks/useImageModeWorkspace.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWorkspace } from '../components/WorkspaceProcessor';

export function useImageModeWorkspace() {
  const router = useRouter();
  const workspaceContext = useWorkspace();

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!url.includes('/ImageMode')) {
        workspaceContext.saveWorkspace();
      }
    };

    const handleBeforeUnload = (event) => {
      workspaceContext.saveWorkspace();
      // The following is for older browsers
      event.preventDefault();
      event.returnValue = '';
    };

    router.events.on('routeChangeStart', handleRouteChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      workspaceContext.saveWorkspace();
    };
  }, [router, workspaceContext]);

  // Return nothing as we're just setting up side effects
  return null;
}
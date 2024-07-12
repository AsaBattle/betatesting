// pages/hooks/useImageModeWorkspace.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWorkspace } from '../components/WorkspaceProcessor';
const alogger = require('../utils/alogger').default;

export function useImageModeWorkspace() {
  const router = useRouter();
  const workspaceContext = useWorkspace();

  useEffect(() => {
    const handleRouteChange = (url) => {
      alogger('Route changed:', url);

      if (!url.includes('/ImageMode')) {
        alogger('Saving workspace before navigating away, since url does not include /ImageMode');
        workspaceContext.saveWorkspace();
      }
    };

    const handleBeforeUnload = (event) => {
      alogger('Saving workspace before unloading page');
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
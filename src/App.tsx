/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { StudioLayout } from '../components/StudioLayout';

export default function App() {
  // Sync pathname to /studio if at root or keep route synchronized
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.history.replaceState(null, '', '/studio');
    }
  }, []);

  return <StudioLayout />;
}

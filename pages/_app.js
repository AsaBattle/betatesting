import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { SessionProvider } from 'next-auth/react';
import { WorkspaceProcessor } from '../components/WorkspaceProcessor';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <SessionProvider session={pageProps.session}>
        <WorkspaceProcessor>
          <Component {...pageProps} />
        </WorkspaceProcessor>
      </SessionProvider>
    </Provider>
  );
}

export default MyApp;
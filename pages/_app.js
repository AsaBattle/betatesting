// pages/_app.js
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { ThemeProvider } from '@mui/material/styles';
import '../styles/globals.css';
import { theme } from '../styles/theme';


function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;

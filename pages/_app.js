// pages/_app.js
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { ThemeProvider } from '@mui/material/styles';
import '../styles/globals.css';


function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
        <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;

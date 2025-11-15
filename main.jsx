import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/app.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoadingProvider } from "./src/loadingcontext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="992388111982-j9snf8coc87rjamrtavg26a8vm2f35jc.apps.googleusercontent.com">

      <LoadingProvider>
        <App />
      </LoadingProvider>

    </GoogleOAuthProvider>
  </StrictMode>
);

// lib/authConfig.ts
import { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    // Cole o 'ID do aplicativo (cliente)' do Portal do Azure aqui
    clientId: "SEU_CLIENT_ID_AQUI", 
    // Cole o 'ID do diretório (locatário)' do Portal do Azure aqui
    authority: "https://login.microsoftonline.com/SEU_TENANT_ID_AQUI",
    redirectUri: "http://localhost:3000", // Deve ser o mesmo URI cadastrado no Azure
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};
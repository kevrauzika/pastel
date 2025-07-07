// app/api/jornada-options/route.ts

import { NextResponse } from 'next/server';

async function getAccessToken() {
  const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET } = process.env;
  const tokenUrl = `https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`;
  const tokenParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: SHAREPOINT_CLIENT_ID!,
    client_secret: SHAREPOINT_CLIENT_SECRET!,
    scope: 'https://graph.microsoft.com/.default',
  });
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    body: tokenParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error('Falha na autenticação do aplicativo.');
  return tokenData.access_token;
}

export async function GET() {
  const { SHAREPOINT_SITE_ID, SHAREPOINT_LIST_ID } = process.env;
  if (!SHAREPOINT_SITE_ID || !SHAREPOINT_LIST_ID) {
    return NextResponse.json({ error: 'SITE_ID ou LIST_ID do SharePoint não configurados.' }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken();
    const apiUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/lists/${SHAREPOINT_LIST_ID}/columns`;
    const response = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${accessToken}` } });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Erro ao buscar colunas do Graph API.`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    // CORREÇÃO PRINCIPAL: Usa o 'displayName' para encontrar a coluna
    const jornadaColumn = data.value.find((column: any) => column.displayName === 'Jornada');

    if (jornadaColumn && jornadaColumn.choice) {
      return NextResponse.json(jornadaColumn.choice.choices);
    } else {
      return NextResponse.json({ error: "A coluna 'Jornada' não foi encontrada ou não é do tipo 'Escolha'." }, { status: 404 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno no servidor.', details: error.message }, { status: 500 });
  }
}
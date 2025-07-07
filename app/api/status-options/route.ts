import { NextResponse } from 'next/server';

// Função para obter o token (reutilizada)
async function getAccessToken() {
  const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET } = process.env;

  const tokenUrl = `https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`;
  
  const tokenParams = new URLSearchParams();
  tokenParams.append('grant_type', 'client_credentials');
  tokenParams.append('client_id', SHAREPOINT_CLIENT_ID!);
  tokenParams.append('client_secret', SHAREPOINT_CLIENT_SECRET!);
  tokenParams.append('scope', 'https://graph.microsoft.com/.default');

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
    
    // API para buscar as definições de TODAS as colunas da lista
    const apiUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/lists/${SHAREPOINT_LIST_ID}/columns`;

    const response = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Erro ao buscar colunas do Graph API.`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    // Encontra a coluna "Status" na resposta
    const statusColumn = data.value.find((column: any) => column.name === 'Status');

    if (statusColumn && statusColumn.choice) {
      // Retorna a lista de opções da coluna de escolha
      return NextResponse.json(statusColumn.choice.choices);
    } else {
      return NextResponse.json({ error: "A coluna 'Status' não foi encontrada ou não é uma coluna de escolha." }, { status: 404 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno no servidor.', details: error.message }, { status: 500 });
  }
}

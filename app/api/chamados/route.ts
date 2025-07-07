import { NextResponse } from 'next/server';

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
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error('Falha ao obter token do Graph API:', tokenData);
    throw new Error('Falha na autenticação do aplicativo. Verifique as credenciais.');
  }
  
  return tokenData.access_token;
}

export async function GET() {
  const { SHAREPOINT_SITE_ID, SHAREPOINT_LIST_ID } = process.env;

  if (!SHAREPOINT_SITE_ID || !SHAREPOINT_LIST_ID) {
    return NextResponse.json({ error: 'SITE_ID ou LIST_ID do SharePoint não configurados.' }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken();
    
    let allItems: any[] = [];
    let nextLink: string | undefined = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/lists/${SHAREPOINT_LIST_ID}/items?expand=fields&$top=999`;

    while (nextLink) {
      const spResponse: Response = await fetch(nextLink, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!spResponse.ok) {
        const errorText = await spResponse.text();
        console.error("Erro da API do Graph:", errorText);
        return NextResponse.json({ error: `Erro ao buscar dados do Graph API.`, details: errorText }, { status: spResponse.status });
      }

      const data = await spResponse.json();
      allItems = allItems.concat(data.value);
      
      nextLink = data['@odata.nextLink'];
    }
    
    // Mapear os dados para o formato esperado pelo front-end
    const chamadosFormatados = allItems.map((item: any) => {
      const fields = item.fields;
      return {
        id: `CH${fields.id}`,
        titulo: fields.Title,
        // --- CORREÇÃO AQUI ---
        // Enviando o valor do Status original, sem modificá-lo.
        status: fields.Status || 'Não definido',
        prioridade: fields.Criticidade?.toLowerCase() || 'não definida',
        squad: fields.Squad || 'Não definido',
        produto: fields.Produto || 'Não definido',
        dataAbertura: item.createdDateTime,
        responsavel: fields.TI?.[0] || 'Não atribuído'
      };
    });
    
    return NextResponse.json(chamadosFormatados);

  } catch (error: any) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json({ error: 'Erro interno no servidor.', details: error.message }, { status: 500 });
  }
}

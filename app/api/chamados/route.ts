// app/api/chamados/route.ts

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
  if (!tokenResponse.ok) {
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
    
    // --- CORREÇÃO DE FUSO HORÁRIO ---
    const hoje = new Date();
    // Zera a hora para o início do dia para evitar problemas com fuso horário
    hoje.setHours(0, 0, 0, 0); 
    
    const dateToFilter = new Date(hoje);
    dateToFilter.setMonth(dateToFilter.getMonth() - 3);
    const isoDate = dateToFilter.toISOString();

    let allItems: any[] = [];
    
    let nextLink: string | undefined = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/lists/${SHAREPOINT_LIST_ID}/items?$expand=fields&$filter=fields/Created ge '${isoDate}'&$top=999`;

    while (nextLink) {
      const spResponse: Response = await fetch(nextLink, { headers: { "Authorization": `Bearer ${accessToken}` } });
      if (!spResponse.ok) {
        const errorText = await spResponse.text();
        console.error("Erro da API do Graph:", errorText);
        return NextResponse.json({ error: `Erro ao buscar dados do Graph API.`, details: errorText }, { status: spResponse.status });
      }
      const data = await spResponse.json();
      allItems = allItems.concat(data.value);
      nextLink = data['@odata.nextLink'];
    }
    
    const chamadosFormatados = allItems.map((item: any) => {
      const fields = item.fields;
      return {
        id: `CH${fields.id}`,
        titulo: fields.Title,
        status: fields.Status || 'Não definido',
        prioridade: fields.Criticidade || 'Não definida',
        squad: fields.Jornada || 'Não definida',
        produto: fields.Produto || 'Não definido',
        dataAbertura: fields.Created,
        dataConclusao: fields.Status === 'Concluído' ? fields.Resolu_x00e7__x00e3_o : null,
        responsavel: fields.TI?.[0] || 'Não atribuído'
      };
    });
    
    return NextResponse.json(chamadosFormatados);

  } catch (error: any) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json({ error: 'Erro interno no servidor.', details: error.message }, { status: 500 });
  }
}
// NIBAgendas Router - Roteia requisições baseado no path

const API_HOST = 'nibagendas-api.command-systems.workers.dev';

const PAGES_ROUTES = {
  '/administracao': 'nibagendas-adm.pages.dev',
  '/paciente': 'nibagendas-paciente.pages.dev',
  '/medico': 'nibagendas-medico.pages.dev',
  '/documentacao': 'nibagendas-docs.pages.dev'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // === API PROXY ===
    // Todas as requisições /api/* vão para o Worker da API
    if (path.startsWith('/api')) {
      const apiUrl = new URL(request.url);
      apiUrl.hostname = API_HOST;
      apiUrl.pathname = path.replace('/api', '') || '/';
      
      const apiRequest = new Request(apiUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
      });
      
      return fetch(apiRequest);
    }

    // === PAGES PROXY ===
    // Roteia para os diferentes Pages baseado no path
    for (const [routePath, targetHost] of Object.entries(PAGES_ROUTES)) {
      if (path === routePath || path.startsWith(routePath + '/')) {
        // Remove o prefixo da rota do path
        let targetPath = path.replace(routePath, '') || '/';
        
        // Se for um arquivo estático (tem extensão), mantém o path
        // Se não tiver extensão, serve o index.html (SPA)
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(targetPath);
        
        const targetUrl = new URL(request.url);
        targetUrl.hostname = targetHost;
        targetUrl.pathname = targetPath;
        
        const proxyRequest = new Request(targetUrl.toString(), {
          method: request.method,
          headers: request.headers
        });
        
        let response = await fetch(proxyRequest);
        
        // Se não encontrou e não é arquivo estático, tenta servir index.html (SPA routing)
        if (response.status === 404 && !hasExtension) {
          targetUrl.pathname = '/';
          const spaRequest = new Request(targetUrl.toString(), {
            method: 'GET',
            headers: request.headers
          });
          response = await fetch(spaRequest);
        }
        
        // Clona a resposta para poder modificar headers se necessário
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    }

    // === ROOT REDIRECT ===
    // Redireciona a raiz para /administracao
    if (path === '/' || path === '') {
      return Response.redirect(url.origin + '/administracao', 302);
    }

    // === 404 ===
    return new Response(`
     <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Página não encontrada</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --primary-hover: #1d4ed8;
            --text-color: #1f2937;
            --text-muted: #6b7280;
            --bg-color: #f3f4f6;
            --card-bg: #ffffff;
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            :root {
                --primary-color: #3b82f6;
                --primary-hover: #60a5fa;
                --text-color: #f9fafb;
                --text-muted: #9ca3af;
                --bg-color: #111827;
                --card-bg: #1f2937;
            }
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            transition: background-color 0.3s ease;
        }

        .container {
            background-color: var(--card-bg);
            padding: 3rem 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
            max-width: 480px;
            width: 100%;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .container:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08);
        }

        .icon-container {
            margin-bottom: 1.5rem;
        }

        .icon-container svg {
            width: 120px;
            height: 120px;
            color: var(--primary-color);
            animation: float 6s ease-in-out infinite;
        }

        h1 {
            font-size: 1.875rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
            line-height: 1.25;
        }

        p {
            color: var(--text-muted);
            margin-bottom: 2rem;
            font-size: 1rem;
            line-height: 1.5;
        }

        .btn {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .btn:hover {
            background-color: var(--primary-hover);
            transform: scale(1.05);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .btn:active {
            transform: scale(0.95);
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon-container">
            <!-- SVG Ilustrativo de Fantasma/Erro -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 17v1m3-1v1m3-1v1M9 10h.01M15 10h.01M7.8 15h8.4a2 2 0 002-1.6l1-5a6 6 0 00-4-4.4 6 6 0 00-10.4 0 6 6 0 00-4 4.4l1 5a2 2 0 002 1.6z" />
            </svg>
        </div>
        
        <h1>Erro 404, Página não encontrada</h1>
        <p>Ops! A página que você está procurando não existe ou foi movida. Verifique o URL ou volte para a área segura.</p>
        
        <a href="/administracao" class="btn">
            Voltar para Administração
        </a>
    </div>
</body>
</html>
    `, { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

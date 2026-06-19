export const metadata = { title: "CETEA API — Documentação" };

export default function ApiDocsPage() {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css" />
      </head>
      <body style={{ margin: 0 }}>
        <div id="swagger-ui" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load', function(){ window.SwaggerUIBundle({ url: '/api/v1/openapi', dom_id: '#swagger-ui' }); });`,
          }}
        />
      </body>
    </html>
  );
}

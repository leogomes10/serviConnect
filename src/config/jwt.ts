// Centraliza a leitura e validação da chave secreta usada para assinar/verificar tokens JWT.
// Qualquer arquivo que precise do JWT_SECRET deve importar daqui, em vez de ler
// process.env diretamente — assim garantimos uma única fonte de verdade e uma
// validação que impede o servidor de rodar sem essa configuração crítica.

// Função auxiliar com retorno tipado explicitamente como "string".
// Isso garante que, para quem importa JWT_SECRET em outro arquivo, o TypeScript
// enxergue o tipo correto (string), e não "string | undefined" — que é o tipo
// bruto de process.env.JWT_SECRET antes da validação.
function obterJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Interrompe a inicialização do servidor imediatamente (fail-fast).
    // Isso evita que o app suba silenciosamente usando uma chave fraca/pública,
    // o que permitiria a qualquer pessoa forjar tokens válidos.
    throw new Error(
      'JWT_SECRET não definido no .env. Configure essa variável antes de iniciar o servidor.'
    );
  }

  return secret;
}

export const JWT_SECRET = obterJwtSecret();
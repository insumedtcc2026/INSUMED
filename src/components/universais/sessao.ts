// Chaves que o Login grava por perfil (components/home/Login.tsx).
export type Perfil = 'ADMIN' | 'AUTORIZADOR' | 'PACIENTE';

const chaves: Record<Perfil, [string, string]> = {
  ADMIN: ['token_admin', 'usuario_admin'],
  AUTORIZADOR: ['token_autorizador', 'usuario_autorizador'],
  PACIENTE: ['token_paciente', 'usuario_paciente'],
};

/**
 * Encerra a sessão do perfil: apaga o token e os dados do usuário.
 * Antes o "Sair" apagava as chaves antigas "token"/"usuario", que o login
 * não usa mais, e o token continuava salvo no navegador.
 */
export function sairDoPerfil(perfil: Perfil) {
  const [token, usuario] = chaves[perfil];
  localStorage.removeItem(token);
  localStorage.removeItem(usuario);
  // chaves antigas, caso ainda existam em algum navegador
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

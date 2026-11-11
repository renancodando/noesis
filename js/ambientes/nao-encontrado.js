// Renan | renancodando
export async function montar({raiz,definirTitulo}){
 definirTitulo('Página não encontrada','Este caminho não existe no NÓESIS.');
 raiz.innerHTML=`<section class="pagina-ambiente"><header class="cabecalho-ambiente"><p class="sobretitulo">CAMINHO DESCONHECIDO</p><h1>Este corredor não leva a lugar nenhum.</h1><p class="introducao">O endereço <code>${location.pathname.replace(/[<>]/g,'')}</code> não corresponde a nenhum ambiente, disciplina, aula, laboratório ou projeto.</p><div class="acoes-painel"><a class="botao" href="/">Voltar ao Santuário</a><a class="botao secundario" href="/pesquisa">Pesquisar um conteúdo</a><a class="botao secundario" href="/saberes">Ver as disciplinas</a></div></header></section>`;
}

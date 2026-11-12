// Renan | renancodando
import {buscar,buscarTodos,escapar,icone,avisar,confirmar} from '../utilitarios/dom.js';
import {formatarData,formatarNumero} from '../utilitarios/texto.js';
import {perfil,guardarPerfil,definirPreferencia,redefinirPerfil,substituirPerfil} from '../progresso/perfil.js';
import {exportarTudo,importarTudo,validarExportacao,apagarTudo,estimarEspaco,usandoMemoria,contar,nomesArmazens} from '../armazenamento/banco.js';
import {limparPreferencias} from '../armazenamento/preferencias.js';
import {aplicarPreferencias} from '../santuario/interface.js';
import {carregarCatalogo} from '../conteudos/catalogo.js';

export const estilos=['/css/ambientes/configuracoes.css'];

export async function montar({raiz,definirTitulo,navegar}){
 definirTitulo('Configurações','Preferências de movimento, qualidade, leitura e gerenciamento dos dados locais.');
 const espaco=await estimarEspaco();
 const contagens={};for(const nome of nomesArmazens)contagens[nome]=await contar(nome);
 const p=perfil.preferencias;
 raiz.innerHTML=`<div class="pagina-ambiente pagina-configuracoes">
  <header class="cabecalho-ambiente"><p class="sobretitulo">PREFERÊNCIAS E DADOS</p><h1>Do seu <em>jeito</em>, no seu dispositivo.</h1><p class="introducao">O NÓESIS não tem contas nem servidor. Suas preferências ficam no armazenamento local; seu progresso, anotações e projetos ficam no banco local do navegador (IndexedDB). Isso significa que os dados estão vinculados a este navegador e a este dispositivo: exporte um arquivo para guardá-los ou levá-los a outro lugar.</p></header>
  <div class="grade larga">
   <section class="placa"><h2>Explorador</h2><form data-form-nome><label for="nome-config">Nome de explorador</label><div class="campo-inline"><input id="nome-config" type="text" maxlength="40" value="${escapar(perfil.nome)}" required><button class="botao" type="submit">Guardar</button></div></form><p class="texto-apoio">Perfil criado em ${formatarData(perfil.criadoEm)} · ${formatarNumero(perfil.xp)} XP.${perfil.demonstracao?' <strong>Perfil de demonstração ativo.</strong>':''}</p></section>
   <section class="placa"><h2>Experiência</h2>
    ${[['movimento','Ambiente em movimento','Água, esferas, partículas e animações de interface.'],['contraste','Mais contraste','Reforça a leitura de painéis e rótulos.'],['texto','Texto ampliado','Mais espaço e tamanho para ler.'],['avisosRevisao','Avisos de revisão','Mostra revisões pendentes nas notificações.']].map(([k,r,d])=>`<div class="linha-configuracao"><label for="pref-${k}">${r}<small>${d}</small></label><input id="pref-${k}" type="checkbox" data-pref="${k}" ${p[k]?'checked':''}></div>`).join('')}
    <div class="linha-configuracao"><label for="pref-qualidade">Qualidade da cena 3D<small>Ajuste ao seu dispositivo.</small></label><select id="pref-qualidade" data-pref-qualidade><option value="economica">Econômica</option><option value="equilibrada">Equilibrada</option><option value="alta">Alta</option></select></div>
    <p class="nota-modelo">A preferência de movimento reduzido do sistema é sempre respeitada, independentemente destas opções.</p></section>
   <section class="placa"><h2>Dados locais</h2><ul class="lista-pontos compacta">${[['progressoAulas','aulas com progresso'],['tentativas','tentativas de exercícios'],['revisoes','perguntas de revisão'],['anotacoes','anotações'],['acervo','itens no acervo'],['projetos','projetos'],['laboratorios','laboratórios com registro'],['descobertas','descobertas'],['atividades','atividades']].map(([k,r])=>`<li>${contagens[k]} ${r}</li>`).join('')}</ul><p class="texto-apoio">${usandoMemoria()?'<strong>Atenção:</strong> o IndexedDB não está disponível neste navegador (modo privado ou bloqueio). Os dados ficam apenas em memória e se perdem ao fechar a aba.':espaco?`Espaço usado pelo site: ${formatarNumero(espaco.uso/1024/1024,2)} MB de ${formatarNumero(espaco.cota/1024/1024,0)} MB disponíveis.`:'Não foi possível estimar o espaço disponível.'}</p>
    <div class="acoes-painel"><button class="botao" data-exportar>${icone('baixar')} Exportar tudo (JSON)</button><label class="botao secundario" for="importar-dados">${icone('enviar')} Importar arquivo<input id="importar-dados" type="file" accept="application/json" hidden></label></div>
    <p class="nota-modelo">A exportação inclui perfil, preferências e todos os armazéns. Ao importar, você escolhe entre substituir os dados atuais ou mesclar.</p></section>
   <section class="placa"><h2>Demonstração</h2><p class="texto-apoio">Carregue um perfil de demonstração, claramente identificado, para ver como os painéis ficam com dados. Ele substitui o seu progresso atual; exporte antes, se quiser mantê-lo.</p><div class="acoes-painel"><button class="botao secundario" data-demonstracao>Carregar perfil de demonstração</button></div></section>
   <section class="placa zona-perigo"><h2>Apagar</h2><p class="texto-apoio">Remove todas as informações pessoais deste navegador: progresso, anotações, projetos, acervo, descobertas e perfil. As preferências de leitura podem ser mantidas.</p><div class="acoes-painel"><button class="botao perigo" data-apagar>${icone('fechar')} Apagar todos os meus dados</button></div></section>
   <section class="placa"><h2>Sobre</h2><p class="texto-apoio">NÓESIS funciona inteiramente no navegador: sem autenticação, sem APIs pagas, sem inteligência artificial em tempo de execução. Conteúdos já visitados ficam disponíveis sem conexão quando o navegador os mantém em cache; recursos ainda não carregados dependem da rede.</p></section>
  </div></div>`;
 buscar('[data-form-nome]',raiz).onsubmit=e=>{e.preventDefault();const nome=buscar('#nome-config',raiz).value.trim();if(!nome)return;perfil.nome=nome;guardarPerfil();buscarTodos('[data-nome]').forEach(n=>n.textContent=nome);avisar('Nome atualizado.');};
 buscarTodos('[data-pref]',raiz).forEach(c=>c.onchange=()=>{definirPreferencia(c.dataset.pref,c.checked);aplicarPreferencias();});
 const qualidade=buscar('[data-pref-qualidade]',raiz);qualidade.value=p.qualidade;qualidade.onchange=()=>{definirPreferencia('qualidade',qualidade.value);aplicarPreferencias();};
 buscar('[data-exportar]',raiz).onclick=async()=>{const armazens=await exportarTudo();const dados={aplicacao:'noesis',versao:1,exportadoEm:new Date().toISOString(),perfil,armazens};const blob=new Blob([JSON.stringify(dados)],{type:'application/json'});const a=document.createElement('a');a.download=`noesis-dados-${new Date().toISOString().slice(0,10)}.json`;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);avisar('Arquivo de dados gerado.');};
 buscar('#importar-dados',raiz).onchange=async e=>{
  const arquivo=e.target.files[0];if(!arquivo)return;
  let dados;try{dados=JSON.parse(await arquivo.text());}catch{avisar('O arquivo não é um JSON válido.');e.target.value='';return;}
  const problema=validarExportacao(dados);if(problema){avisar(problema);e.target.value='';return;}
  const substituir=await confirmar(`O arquivo foi exportado em ${formatarData(dados.exportadoEm)} e contém ${Object.values(dados.armazens).reduce((s,l)=>s+l.length,0)} registros. Substituir os dados atuais por ele? (Cancelar mantém os seus e apenas adiciona o que não existir.)`,{titulo:'Importar dados',confirmacao:'Substituir',cancelamento:'Mesclar'});
  try{await importarTudo(dados,{substituir});if(dados.perfil&&substituir)substituirPerfil(dados.perfil);avisar(substituir?'Dados substituídos pelo arquivo.':'Dados mesclados.');setTimeout(()=>location.reload(),600);}catch(erro){avisar('Não foi possível importar: '+(erro?.message||'erro desconhecido'));}
  e.target.value='';
 };
 buscar('[data-apagar]',raiz).onclick=async()=>{if(!await confirmar('Esta ação apaga permanentemente todos os dados do NÓESIS neste navegador. Não há como desfazer.',{titulo:'Apagar todos os dados',confirmacao:'Apagar tudo',perigo:true}))return;const manter=await confirmar('Manter as preferências de leitura e movimento?',{titulo:'Preferências',confirmacao:'Manter',cancelamento:'Apagar também'});await apagarTudo();redefinirPerfil({manterPreferencias:manter});if(!manter)limparPreferencias();avisar('Dados apagados.');setTimeout(()=>navegar('/'),500);};
 buscar('[data-demonstracao]',raiz).onclick=async()=>{if(!await confirmar('O perfil de demonstração substitui o seu progresso atual. Deseja continuar?',{titulo:'Perfil de demonstração',confirmacao:'Carregar'}))return;const {gerarDemonstracao}=await import('../progresso/demonstracao.js');const catalogo=await carregarCatalogo();const dados=gerarDemonstracao(catalogo);await importarTudo({armazens:dados.armazens},{substituir:true});substituirPerfil(dados.perfil);avisar('Perfil de demonstração carregado.');setTimeout(()=>navegar('/minha-jornada'),600);};
}

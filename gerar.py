# Renan | renancodando
import json,re,shutil
from pathlib import Path
raiz=Path(__file__).parent
caminhos={
 'bussola':'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4 5-3 7-5 3 3-7ZM12 0v4m0 16v4M0 12h4m16 0h4',
 'pena':'M4 21 19 3c4 5-1 11-8 12L4 21Zm2-6 7-1M8 10l1 5',
 'livro':'M2 4c5-2 8 0 10 2 2-2 5-4 10-2v15c-5-2-8 0-10 2-2-2-5-4-10-2ZM12 6v15M5 8h4m-4 4h4m6-4h4m-4 4h4',
 'frasco':'M8 2h8M9 2v7L3 19c-1 2 1 3 3 3h12c2 0 4-1 3-3L15 9V2M6 16h12',
 'cubo':'m12 2 10 6v11l-10 5-10-5V8Zm0 0v11m0 11V13M2 8l10 5 10-5',
 'pessoas':'M10 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M20 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M1 21v-4c0-5 12-5 12 0v4M13 13c5-2 10 0 10 4v4',
 'rolos':'M5 3h13c4 0 4 7 0 7H8M5 3c-4 0-4 7 0 7h3v11h10M5 3v16c0 3 6 3 6 0',
 'engrenagem':'m9 2-1 4-4 1-2 4 3 3-1 4 4 3 4-2 4 2 4-3-1-4 3-3-2-4-4-1-1-4ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 'busca':'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 7 7',
 'sino':'M5 17V9a7 7 0 0 1 14 0v8l3 3H2ZM9 23h6',
 'calendario':'M3 5h18v17H3ZM3 10h18M7 2v6m10-6v6M7 14h2m3 0h2m3 0h1M7 18h2m3 0h2',
 'seta':'M3 12h18m-7-7 7 7-7 7',
 'seta-esquerda':'M21 12H3m7-7-7 7 7 7',
 'fechar':'m5 5 14 14M5 19 19 5',
 'atomo':'M12 11h.01M21 12c0 3-18 3-18 0s18-3 18 0ZM17 4c3 2-6 18-9 16S14 2 17 4ZM7 4c-3 2 6 18 9 16S4 2 7 4Z',
 'folha':'M21 2C6 2 0 11 7 18c8 7 14-2 14-16ZM3 22 16 8m-7 7v-5m3 2h5',
 'coluna':'m2 6 10-5 10 5ZM3 8h18M5 9v11m5-11v11m4-11v11m5-11v11M2 22h20',
 'montanha':'m1 22 8-17 5 11 3-7 6 13ZM5 14l4-3 4 4',
 'paleta':'M21 11a10 10 0 1 0-10 11c3 0 1-4 4-5 3-1 6-1 6-6ZM7 6h.1m5-2h.1m5 3h.1M5 12h.1',
 'estrela':'m12 1 2.5 8L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-3Z',
 'mapa':'M3 4h7l4-2 7 3v17l-7-3-4 2-7-3ZM10 4v17M14 2v17',
 'salvar':'M6 2h12v20l-6-4-6 4Z',
 'som':'M2 9h5l6-6v18l-6-6H2ZM17 7c4 2 4 8 0 10',
 'verificado':'m4 12 5 5L20 5',
 'relogio':'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 5v5l3 3',
 'rede':'M12 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-7 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm14 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-7 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM12 5v14M5 13l7-8 7 8-7 6-7-6',
 'pessoa':'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c0-5 16-5 16 0',
 'lampada':'M9 18h6M10 22h4M8 12a4 4 0 1 1 8 0c0 2-2 3-2 6h-4c0-3-2-4-2-6ZM12 2v2M4 12h2m12 0h2M5 5l1.5 1.5M19 5l-1.5 1.5',
 'lapis':'m3 21 4-1L20 7l-3-3L4 17ZM14 6l3 3',
 'mais':'M12 5v14M5 12h14',
 'menos':'M5 12h14',
 'baixar':'M12 3v13m-5-5 5 5 5-5M4 21h16',
 'enviar':'M12 21V8m-5 5 5-5 5 5M4 3h16',
 'olho':'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
 'coracao':'M12 21 4 13c-3-3-2-8 2-9 3-1 5 1 6 3 1-2 3-4 6-3 4 1 5 6 2 9Z',
 'balanca':'M12 3v18M4 21h16M3 8h18M6 8l-4 7c3 2 5 2 8 0ZM18 8l-4 7c3 2 5 2 8 0Z',
 'codigo':'m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18',
 'circuito':'M3 12h4m10 0h4M7 8h10v8H7ZM10 12h4',
 'regua':'m2 17 15-15 5 5L7 22Zm6-8 2 2m1-5 2 2m1-5 2 2',
 'executar':'M6 3v18l15-9Z',
 'pausar':'M6 4h4v16H6Zm8 0h4v16h-4Z',
 'reiniciar':'M3 12a9 9 0 1 0 3-6.7M3 3v6h6',
 'cadeado':'M5 11h14v11H5ZM8 11V7a4 4 0 0 1 8 0v4M12 15v3',
 'grafico':'M3 21V3M3 21h18M7 15l4-6 4 3 5-7',
 'documento':'M6 2h8l5 5v15H6ZM14 2v5h5M9 12h7M9 16h7',
 'alvo':'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
 'etiqueta':'m2 12 10-10h10v10L12 22ZM17 7h.1',
 'filtro':'M3 4h18l-7 9v7l-4-2v-5Z',
 'compartilhar':'M18 8a3 3 0 1 0-3-3M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 6a3 3 0 1 0-3-3M8.7 10.7l6.6-3.4m-6.6 6 6.6 3.4',
 'globo':'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2c3 3 4 7 4 10s-1 7-4 10c-3-3-4-7-4-10s1-7 4-10Z',
 'ponte':'M2 18h20M4 18V8M20 18V8M4 8c4-4 12-4 16 0M8 18v-7m8 7v-7M12 18v-9',
 'chave':'M15 2a7 7 0 0 0-6.7 9L2 17.3V22h4.7l1.3-1.3v-2h2v-2h2l1.3-1.3A7 7 0 1 0 15 2Zm2 5h.1',
 'trofeu':'M8 2h8v6a4 4 0 0 1-8 0ZM8 4H4c0 3 1 5 4 5m8-5h4c0 3-1 5-4 5M12 12v4m-4 6h8m-4-6c-2 0-3 2-3 6h6c0-4-1-6-3-6',
 'fogo':'M12 22c-5 0-8-4-7-8 1-3 3-4 3-7 2 1 3 3 3 5 1-1 1-3 1-5 3 2 7 6 7 10a7 7 0 0 1-7 5Z'
}
def icone(nome,classe=''):
 return f'<svg class="icone {classe}" viewBox="0 0 24 24" aria-hidden="true"><path d="{caminhos[nome]}"/></svg>'
def simbolo():
 return '<svg class="marca-simbolo" viewBox="0 0 100 100" aria-hidden="true"><use href="/ativos/simbolo.svg#simbolo"/></svg>'
def esc(texto):
 return str(texto).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')
menu=[('santuario','Santuário','pena','/'),('jornadas','Jornadas','bussola','/jornadas'),('saberes','Saberes','livro','/saberes'),('laboratorios','Laboratórios','frasco','/laboratorios'),('construir','Construir','cubo','/construir'),('revisoes','Revisões','relogio','/revisoes'),('exploracao','Exploração','rede','/exploracao'),('minha-jornada','Minha Jornada','pessoa','/minha-jornada'),('acervo','Acervo','rolos','/acervo'),('comunidade','Comunidade','pessoas','/comunidade'),('pesquisa','Pesquisa','busca','/pesquisa'),('configuracoes','Configurações','engrenagem','/configuracoes')]
dominios=[('sociedade','Sociedade','pessoas',15,42),('exatas','Ciências Exatas','atomo',30,23),('vida','Ciências da Vida','folha',50,13),('humanidades','Humanidades','coluna',71,23),('tecnologia','Tecnologia','engrenagem',87,42),('geografia','Geografia','montanha',72,64),('artes','Artes','paleta',30,64),('linguagens','Linguagens','livro',50,80)]
expedicoes=[('interior','INTERIOR','Explore o corpo humano em 3D interativo.'),('prisma','PRISMA','Laboratório virtual de ciências.'),('nucleo','NÚCLEO','Construa e entenda computadores.'),('crono','CRONO','Viaje pela história e descubra suas conexões.')]

indice=json.loads((raiz/'conteudos/indice.json').read_text())
laboratorios=json.loads((raiz/'conteudos/laboratorios.json').read_text())['laboratorios']
projetos=json.loads((raiz/'conteudos/projetos.json').read_text())['projetos']
aulas=[]
for disciplina in indice['disciplinas']:
 pasta=raiz/'conteudos'/disciplina['id']
 for chave in disciplina['jornada']['etapas']:
  arquivo=pasta/f'{chave}.json'
  if not arquivo.exists():continue
  aula=json.loads(arquivo.read_text())
  aula['id']=f"{disciplina['id']}/{chave}";aula['chave']=chave;aula['disciplina']=disciplina['id']
  aulas.append(aula)
por_id={aula['id']:aula for aula in aulas}

def texto_bloco(bloco):
 tipo=bloco.get('tipo')
 if tipo in('texto','destaque','lista','passos','comparacao','tabela','documento','equacao'):
  partes=[]
  if bloco.get('titulo'):partes.append(f"<h2>{esc(bloco['titulo'])}</h2>")
  if bloco.get('html'):partes.append(bloco['html'])
  if bloco.get('itens'):partes.append('<ul>'+''.join(f'<li>{item if isinstance(item,str) else item.get("html",esc(item.get("texto","")))}</li>' for item in bloco['itens'])+'</ul>')
  if bloco.get('colunas'):
   for coluna in bloco['colunas']:partes.append(f"<h3>{esc(coluna.get('titulo',''))}</h3>{coluna.get('html','')}")
  if bloco.get('legenda'):partes.append(f"<p><em>{esc(bloco['legenda'])}</em></p>")
  return ''.join(partes)
 if tipo in('interativo','grafico','simulacao','codigo','pergunta','diagrama'):
  titulo=esc(bloco.get('titulo','Atividade interativa'))
  return f"<h2>{titulo}</h2><p>{esc(bloco.get('instrucao') or bloco.get('html') or 'Este conteúdo é interativo e requer JavaScript.')}</p>"
 return ''

def prerender_aula(aula,disciplina):
 blocos=''.join(texto_bloco(bloco) for bloco in aula.get('blocos',[]))
 objetivos=''.join(f'<li>{esc(objetivo)}</li>' for objetivo in aula.get('objetivos',[]))
 return f'<article class="pagina-ambiente"><header class="cabecalho-ambiente"><p class="sobretitulo">{esc(disciplina["nome"]).upper()}</p><h1>{esc(aula["titulo"])}</h1><p class="introducao">{esc(aula.get("resumo",""))}</p></header><section class="texto-aula"><h2>Objetivos</h2><ul>{objetivos}</ul>{blocos}<p><a href="/saberes/{disciplina["id"]}">Voltar para {esc(disciplina["nome"])}</a></p></section></article>'

def prerender_lista(titulo,chamada,introducao,itens):
 lista=''.join(f'<li><a href="{url}"><strong>{esc(nome)}</strong> — {esc(descricao)}</a></li>' for url,nome,descricao in itens)
 return f'<section class="pagina-ambiente"><header class="cabecalho-ambiente"><p class="sobretitulo">{esc(chamada)}</p><h1>{esc(titulo)}</h1><p class="introducao">{esc(introducao)}</p></header><ul class="lista-estatica">{lista}</ul></section>'

def pagina(rota,titulo,descricao,conteudo_ambiente,ativa):
 santuario_visivel=rota=='/'
 titulo_completo='NÓESIS — Um Universo de Aprendizagem Interativa' if santuario_visivel else f'{titulo} · NÓESIS'
 url=f'https://noesis.app{rota}'
 navegacao=''.join(f'<a href="{href}" data-secao="{chave}"'+(' class="ativo" aria-current="page"' if chave==ativa else '')+f'>{icone(desenho)}<span>{nome}</span></a>' for chave,nome,desenho,href in menu)
 santuario=f'''<main id="conteudo" class="conteudo"{'' if santuario_visivel else ' hidden'}><section class="boas-vindas"><p class="sobretitulo">BEM-VINDO, EXPLORADOR</p><h1>Qual conhecimento deseja <em>explorar</em> hoje?</h1><p>Escolha um domínio, viva experiências interativas e construa o seu próprio<br>caminho de aprendizagem.</p></section>
<section class="palco-orbital" aria-label="Universo dos conhecimentos"><div class="base-reserva" aria-hidden="true"><i></i><i></i><i></i></div><svg class="conexoes-reserva" viewBox="0 0 650 300" aria-hidden="true"><ellipse cx="325" cy="152" rx="245" ry="74"/><ellipse cx="325" cy="153" rx="126" ry="41"/><path d="M98 126 195 69 325 39 462 69 566 126 468 192 325 240 195 192Z"/></svg>{''.join(f'<button class="dominio dominio-{chave}" data-dominio="{chave}" style="--x:{x}%;--y:{y}%" aria-label="Explorar {nome}"><span class="globo-reserva">{icone(desenho)}</span><span class="rotulo-dominio">{icone(desenho)}{nome}</span></button>' for chave,nome,desenho,x,y in dominios)}<button class="nucleo-central" data-acao="conceito" aria-label="Explorar o núcleo do NÓESIS"><span class="cristal-reserva" aria-hidden="true"></span></button><span class="instrucao-orbita">Toque em um mundo. Descubra uma conexão.</span></section>
<section class="expedicoes" aria-labelledby="titulo-expedicoes"><h2 id="titulo-expedicoes">{icone('estrela')}Expedições em Destaque<span></span></h2><div class="lista-expedicoes">{''.join(f'<button class="cartao-expedicao expedicao-{chave}" data-expedicao="{chave}"><span class="arte-expedicao arte-{indice}" aria-hidden="true"></span><span class="texto-expedicao"><strong>{nome}</strong><small>{texto}</small></span><span class="seta-cartao">›</span><span class="marca-salvo" aria-hidden="true">✦</span></button>' for indice,(chave,nome,texto) in enumerate(expedicoes))}</div></section>
<section class="mapa-resumo" aria-labelledby="titulo-mapa"><div class="titulo-mapa"><h2 id="titulo-mapa">{icone('mapa')}Seu Mapa de Conhecimento</h2><p>Veja como os saberes se conectam, descubra novos caminhos e preencha lacunas.</p></div><div class="trilha-conhecimento"><svg viewBox="0 0 720 78" aria-hidden="true"><path d="M10 28 90 47 145 16 215 43 280 16 353 42 420 17 490 48 555 15 625 43 705 60M90 47l70 20 55-24 70 9 68-10 67 13 70-7 55 20 80-25"/></svg>{''.join(f'<button data-dominio="{chave}" class="no-mapa no-{i}" aria-label="Explorar {nome}">{icone(desenho)}</button>' for i,(chave,nome,desenho,*_) in enumerate([dominios[0],dominios[2],dominios[1],dominios[7],dominios[4],dominios[3]]))}<a class="abrir-mapa" href="/exploracao">Abrir mapa {icone('seta')}</a></div></section></main>'''
 painel=f'''<aside class="painel-jornada" aria-label="Seu progresso"{'' if santuario_visivel else ' hidden'}><svg class="moldura-jornada" viewBox="0 0 260 425" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="tecido"><stop stop-color="#090f19"/><stop offset=".16" stop-color="#202b3e"/><stop offset=".25" stop-color="#121b2c"/><stop offset=".62" stop-color="#192335"/><stop offset=".82" stop-color="#0b1524"/><stop offset=".93" stop-color="#1f2938"/><stop offset="1" stop-color="#0c1421"/></linearGradient><pattern id="trama" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 .5h4M.5 0v4" stroke="#e6d3b1" stroke-width=".35" opacity=".13"/><path d="M0 2.5h4M2.5 0v4" stroke="#000" stroke-width=".6" opacity=".2"/></pattern><linearGradient id="ouro"><stop stop-color="#6f4b2c"/><stop offset=".3" stop-color="#e7c680"/><stop offset=".7" stop-color="#97724a"/><stop offset="1" stop-color="#e9c681"/></linearGradient></defs><path d="M12 25 65 17 130 1l65 16 53 8v329l-51 15-67 48-67-48-51-15Z" fill="url(#tecido)" stroke="url(#ouro)" stroke-width="2"/><path d="M12 25 65 17 130 1l65 16 53 8v329l-51 15-67 48-67-48-51-15Z" fill="url(#trama)"/><path d="M21 33 69 25 130 10l61 15 48 8v314l-47 14-62 43-62-43-47-14Z" fill="none" stroke="#ad86544d"/><path d="m130 370 15 18-15 20-15-20Zm0 6v25m-9-13h18M5 27l14 2M241 29l14-2M12 344l22 10M248 344l-22 10" fill="none" stroke="#bd915c"/><path d="M5 27v331m250-331v331" stroke="#b48e5b55" stroke-dasharray="2 5"/><g fill="none" stroke="url(#ouro)" stroke-width=".8"><path d="m28 51 10 12 10-12M28 326l10-12 10 12M212 51l10 12 10-12m-20 275 10-12 10 12M28 43h23M209 43h23M34 72v229m192-229v229" opacity=".65"/><path d="M69 373v24m-4-6 4-4 4 4v10h-8Zm122-18v24m-4-6 4-4 4 4v10h-8M130 415v9"/><path d="m119 405 11 10 11-10"/></g></svg><div class="conteudo-jornada"><h2>{icone('estrela')}Sua Jornada</h2><div class="resumo-progresso"><button class="medalhao-nivel" data-acao="jornada" aria-label="Ver progresso da jornada"><span>Explorador<strong>Nível <b data-nivel>1</b></strong></span></button><div><strong class="valor-xp"><span data-xp>0</span> XP</strong><p>Falta <span data-falta>400</span> XP<br>para o Nível <span data-proximo-nivel>2</span></p><div class="barra-xp"><i></i></div></div></div><button class="missao-semana" data-acao="missao"><h3>{icone('salvar')}Missão da Semana</h3><span>Construa e teste um circuito elétrico funcional no Laboratório.</span><b>›</b></button><div class="conquistas"><div><h3>{icone('estrela')}Conquistas</h3><button data-acao="conquistas">Ver todas ›</button></div><div class="insignias">{''.join(f'<button data-conquista="{i}" aria-label="Ver conquista {nome}">{icone(desenho)}</button>' for i,(desenho,nome) in enumerate([('livro','Primeira descoberta'),('frasco','Espírito científico'),('engrenagem','Mão na massa'),('folha','Conexões vivas'),('coluna','Guardião da memória')]))}</div></div></div></aside>'''
 return f'''<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#121a1a"><meta name="description" content="{esc(descricao)}"><meta property="og:type" content="website"><meta property="og:site_name" content="NÓESIS"><meta property="og:locale" content="pt_BR"><meta property="og:title" content="{esc(titulo_completo)}"><meta property="og:description" content="{esc(descricao)}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://noesis.app/ativos/biblioteca.webp"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="{url}"><title>{esc(titulo_completo)}</title><link rel="icon" href="/ativos/simbolo.svg" type="image/svg+xml"><link rel="manifest" href="/manifesto.webmanifest"><link rel="preload" href="/ativos/biblioteca.webp" as="image"><link rel="stylesheet" href="/css/santuario.css"><link rel="stylesheet" href="/css/ambientes.css"><script type="module" src="/js/principal.js"></script></head><body data-ambiente="{'santuario' if santuario_visivel else ativa}">
<a class="pular-conteudo" href="#{'conteudo' if santuario_visivel else 'ambiente'}">Pular para o conteúdo</a><div class="cenario-fixo" aria-hidden="true"></div><canvas id="cenario-vivo" aria-hidden="true"></canvas><div class="sombra-cenario" aria-hidden="true"></div>
<aside class="barra-lateral" aria-label="Navegação principal"><a class="marca" href="/" aria-label="NÓESIS, início">{simbolo()}<span>NÓESIS</span><small>Um Universo de<br>Aprendizagem Interativa</small></a><nav id="navegacao" aria-label="Ambientes">{navegacao}</nav><div class="assinatura-lateral"><span></span>Onde as ideias se encontram.</div></aside>
<header class="cabecalho"><button class="alternar-menu botao-icone" aria-label="Abrir navegação" aria-expanded="false" aria-controls="navegacao">☰</button><a class="marca-movel" href="/">NÓESIS</a><p class="citacao"><i></i>“ Aprender é explorar o mundo com outros olhos. ”<i></i></p><div class="acoes-superiores"><span class="selo-demonstracao" data-demonstracao hidden>Perfil de demonstração</span><button class="botao-icone" data-acao="busca" aria-label="Pesquisar conhecimentos">{icone('busca')}</button><button class="botao-icone notificacoes" data-acao="notificacoes" aria-label="Ver notificações">{icone('sino')}<b></b></button><button class="botao-icone" data-acao="agenda" aria-label="Abrir agenda de estudos">{icone('calendario')}</button><button class="perfil" data-acao="perfil"><span class="retrato"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#bba785"/><path d="M4 40c0-13 10-12 11-17-8-13 1-22 8-15 5 5 1 13 1 15 0 6 12 3 13 17" fill="#171b1d"/></svg></span><span><strong data-nome>Explorador</strong><small>Explorador Nível <b data-nivel>1</b></small></span><i>⌄</i></button></div></header>
{santuario}
<main id="ambiente" class="ambiente" tabindex="-1"{' hidden' if santuario_visivel else ''}>{conteudo_ambiente}</main>
{painel}
<dialog id="painel" class="painel-contextual" aria-labelledby="titulo-painel"><button class="fechar-painel botao-icone" aria-label="Fechar painel">{icone('fechar')}</button><p class="sobretitulo" id="chamada-painel"></p><h2 id="titulo-painel"></h2><div id="conteudo-painel"></div></dialog><div class="aviso" role="status" hidden></div><div id="anuncios" class="apenas-leitor" aria-live="polite"></div><button class="controle-movimento" aria-label="Pausar animações" aria-pressed="false">Pausar animações</button><noscript><p class="sem-script">Ative o JavaScript para explorar os mundos, as aulas e os laboratórios.</p></noscript></body></html>'''

def escrever(rota,html):
 destino=raiz/('index.html' if rota=='/' else rota.strip('/')+'/index.html')
 destino.parent.mkdir(parents=True,exist_ok=True)
 destino.write_text(html)

disciplinas=indice['disciplinas']
por_disciplina={d['id']:d for d in disciplinas}
paginas=[]
paginas.append(('/','Santuário','NÓESIS — Um Universo de Aprendizagem Interativa. Explore disciplinas, expedições e conexões entre conhecimentos em um santuário vivo.','','santuario'))
paginas.append(('/jornadas','Jornadas','Percursos de aprendizagem por disciplina, com etapas conectadas, pré-requisitos e revisões.',prerender_lista('Jornadas','PERCURSOS DE APRENDIZAGEM','Escolha uma disciplina e acompanhe um caminho de etapas conectadas.',[(f"/jornadas/{d['id']}",d['nome'],d['jornada']['titulo']) for d in disciplinas]),'jornadas'))
for d in disciplinas:
 paginas.append((f"/jornadas/{d['id']}",f"Jornada de {d['nome']}",d['jornada']['descricao'],prerender_lista(d['jornada']['titulo'],f"JORNADA · {d['nome'].upper()}",d['jornada']['descricao'],[(f"/saberes/{d['id']}/{chave}",por_id[f"{d['id']}/{chave}"]['titulo'] if f"{d['id']}/{chave}" in por_id else chave,por_id.get(f"{d['id']}/{chave}",{}).get('resumo','')) for chave in d['jornada']['etapas']]),'jornadas'))
paginas.append(('/saberes','Saberes','Biblioteca de disciplinas e aulas do NÓESIS: ciências exatas, ciências da vida, humanidades, tecnologia, geografia, sociedade, artes e linguagens.',prerender_lista('Saberes','BIBLIOTECA DE DISCIPLINAS','Oito áreas do conhecimento, cada uma com aulas, exercícios e experiências próprias.',[(f"/saberes/{d['id']}",d['nome'],d['descricao']) for d in disciplinas]),'saberes'))
for d in disciplinas:
 lista=[(f"/saberes/{a['id']}",a['titulo'],a.get('resumo','')) for a in aulas if a['disciplina']==d['id']]
 paginas.append((f"/saberes/{d['id']}",d['nome'],d['apresentacao'],prerender_lista(d['nome'],'SABERES',d['apresentacao'],lista),'saberes'))
for a in aulas:
 d=por_disciplina[a['disciplina']]
 paginas.append((f"/saberes/{a['id']}",a['titulo'],a.get('resumo','')[:300],prerender_aula(a,d),'saberes'))
paginas.append(('/laboratorios','Laboratórios','Laboratórios interativos de ciências, matemática, computação, corpo humano, história e criação.',prerender_lista('Laboratórios','EXPERIÊNCIAS REAIS','Manipule parâmetros, observe consequências e cumpra desafios.',[(f"/laboratorios/{l['id']}",l['nome'],l['descricao']) for l in laboratorios]),'laboratorios'))
for l in laboratorios:
 paginas.append((f"/laboratorios/{l['id']}",f"{l['nome']} — {l['subtitulo']}",l['descricao'],prerender_lista(l['nome'],l['subtitulo'].upper(),l['descricao'],[]),'laboratorios'))
paginas.append(('/construir','Construir','Projetos práticos que combinam conhecimentos: calculadora, ponte, circuito, composição visual, investigação histórica e página web.',prerender_lista('Construir','APRENDIZAGEM POR PROJETOS','Aplique conhecimentos para construir algo verificável.',[(f"/construir/{p['id']}",p['nome'],p['descricao']) for p in projetos]),'construir'))
for p in projetos:
 paginas.append((f"/construir/{p['id']}",p['nome'],p['descricao'],prerender_lista(p['nome'],'PROJETO',p['descricao'],[]),'construir'))
for rota,titulo,descricao,chamada,intro in [
 ('/comunidade','Comunidade','Mural local de descobertas, registro de projetos e compartilhamento por arquivo ou link.','COMPARTILHAR','Um espaço pessoal de descobertas, preparado para a colaboração futura.'),
 ('/acervo','Acervo','Biblioteca pessoal: aulas salvas, favoritos, coleções, anotações e referências.','BIBLIOTECA PESSOAL','Seus materiais de estudo, organizados.'),
 ('/configuracoes','Configurações','Preferências de movimento, qualidade, leitura e gerenciamento dos dados locais.','PREFERÊNCIAS','Ajuste a experiência e gerencie seus dados.'),
 ('/minha-jornada','Minha Jornada','Progresso individual: aulas concluídas, exercícios, conceitos dominados, revisões e evolução.','PROGRESSO','Acompanhe sua aprendizagem com dados reais.'),
 ('/revisoes','Revisões','Recuperação ativa e repetição espaçada com intervalos calculados pelo seu desempenho.','REPETIÇÃO ESPAÇADA','Revise no momento certo.'),
 ('/exploracao','Exploração','Mapa interativo das conexões entre disciplinas, aulas e conceitos.','MAPA DO CONHECIMENTO','Navegue pelas conexões entre os saberes.'),
 ('/pesquisa','Pesquisa','Busca integrada entre disciplinas, aulas, conceitos, laboratórios, projetos e exercícios.','BUSCA','Encontre um conteúdo pelo nome ou por uma palavra.')]:
 paginas.append((rota,titulo,descricao,prerender_lista(titulo,chamada,intro,[]),rota.strip('/')))

for rota,titulo,descricao,conteudo,ativa in paginas:
 escrever(rota,pagina(rota,titulo,descricao,conteudo,ativa))
(raiz/'404.html').write_text(pagina('/nao-encontrado','Página não encontrada','Este caminho não existe no NÓESIS.',prerender_lista('Página não encontrada','CAMINHO DESCONHECIDO','Este endereço não corresponde a nenhum ambiente.',[('/','Santuário','Voltar ao início')]),'santuario').replace('data-ambiente="santuario"','data-ambiente="nao-encontrado"'))

sprite='<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'+''.join(f'<symbol id="{nome}" viewBox="0 0 24 24"><path d="{d}"/></symbol>' for nome,d in caminhos.items())+'</svg>'
(raiz/'ativos/icones.svg').write_text(sprite)

conceitos={}
for a in aulas:
 for c in a.get('conceitos',[]):
  if isinstance(c,str):c={'id':c,'nome':c}
  registro=conceitos.setdefault(c['id'],{'id':c['id'],'nome':c.get('nome',c['id']),'definicao':c.get('definicao',''),'aulas':[]})
  if not registro['definicao'] and c.get('definicao'):registro['definicao']=c['definicao']
  registro['aulas'].append(a['id'])
catalogo={
 'autoria':'Renan | renancodando',
 'disciplinas':disciplinas,
 'aulas':[{k:a.get(k) for k in('id','chave','disciplina','titulo','resumo','duracao','objetivos','prerequisitos','relacionados','nivel')}|{'conceitos':[c['id'] if isinstance(c,dict) else c for c in a.get('conceitos',[])],'exercicios':len(a.get('exercicios',[])),'revisoes':len(a.get('revisao',[])),'pratica':bool(a.get('pratica')),'interativos':[b.get('componente') for b in a.get('blocos',[]) if b.get('tipo')=='interativo']} for a in aulas],
 'conceitos':list(conceitos.values()),
 'laboratorios':laboratorios,
 'projetos':projetos
}
(raiz/'conteudos/catalogo.json').write_text(json.dumps(catalogo,ensure_ascii=False,separators=(',',':')))

def limpar_html(html):
 return re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',html or '')).strip()
busca=[]
for d in disciplinas:
 busca.append({'tipo':'disciplina','id':d['id'],'titulo':d['nome'],'texto':limpar_html(d['descricao']+' '+d['apresentacao']+' '+d['pergunta']),'url':f"/saberes/{d['id']}",'disciplina':d['id']})
for a in aulas:
 corpo=' '.join(limpar_html(b.get('html','')) for b in a.get('blocos',[]) if b.get('tipo')=='texto')[:900]
 nomes_conceitos=' '.join(c['nome'] if isinstance(c,dict) else c for c in a.get('conceitos',[]))
 busca.append({'tipo':'aula','id':a['id'],'titulo':a['titulo'],'texto':limpar_html(a.get('resumo','')+' '+nomes_conceitos+' '+' '.join(a.get('objetivos',[])))+' '+corpo,'url':f"/saberes/{a['id']}",'disciplina':a['disciplina']})
 for i,e in enumerate(a.get('exercicios',[])):
  busca.append({'tipo':'exercicio','id':f"{a['id']}#exercicio-{i+1}",'titulo':limpar_html(e.get('enunciado',''))[:110],'texto':limpar_html(e.get('enunciado','')+' '+str(e.get('conceito','')))[:300],'url':f"/saberes/{a['id']}#exercicio-{i+1}",'disciplina':a['disciplina']})
for c in conceitos.values():
 busca.append({'tipo':'conceito','id':c['id'],'titulo':c['nome'],'texto':c['definicao'],'url':f"/saberes/{c['aulas'][0]}#conceito-{c['id']}",'disciplina':por_id[c['aulas'][0]]['disciplina']})
for l in laboratorios:
 busca.append({'tipo':'laboratorio','id':l['id'],'titulo':f"{l['nome']} — {l['subtitulo']}",'texto':l['descricao']+' '+l['palavras'],'url':f"/laboratorios/{l['id']}",'disciplina':l['disciplina']})
for p in projetos:
 busca.append({'tipo':'projeto','id':p['id'],'titulo':p['nome'],'texto':p['descricao']+' '+p['palavras'],'url':f"/construir/{p['id']}",'disciplina':p['disciplinas'][0]})
(raiz/'conteudos/busca.json').write_text(json.dumps(busca,ensure_ascii=False,separators=(',',':')))
print(f'{len(paginas)+1} páginas, {len(aulas)} aulas, {len(conceitos)} conceitos, {len(busca)} entradas de busca')

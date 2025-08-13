------------------------------------------------------------------------
Telemix — CSS Refatorado (organização + mobile hardening)
------------------------------------------------------------------------

O que veio no ZIP
-----------------
assets/css/variables.css  -> tokens de design (cores, breakpoints, safe-area)
assets/css/base.css       -> reset, utilitários, botões, progresso e background
assets/css/layout.css     -> grid estrutural (.app / sidebar / top / content)
assets/css/login.css      -> estilos exclusivos do login
assets/css/dashboard.css  -> seções/tabelas/projetos + modos de página + TV mode
assets/css/mobile.css     -> shell mobile (.is-mobile) + bottom nav + overlays

Ordem de importação no HTML (inalterada) — confira index.html
1) variables.css   2) base.css   3) layout.css   4) login.css   5) dashboard.css   6) mobile.css

Como o modo mobile é ativado
-----------------------------
O app usa uma detecção híbrida feita no JS:
- Heurística (touch + largura <= 900px)
- Força via querystring: adicione ?mobile=1 ou ?mobile=0
- Ou defina no console/localStorage: localStorage.setItem('forceMobile','1')
Sempre que o mobile está ativo, <body> recebe a classe .is-mobile. (ver app.js)
Dica: teste rapidamente acessando /?mobile=1
(refs: detectMobile e toggle .is-mobile no JS) 

Mudanças funcionais (sem quebrar o visual)
------------------------------------------
- Adicionamos variáveis de *safe-area* (iOS/Android) e breakpoints em variables.css.
- Reforçamos o shell mobile para usar 100dvh/100svh, evitando o “salto” de altura.
- Garantimos padding-bottom em .content.panel no mobile para não colidir com a bottom-nav.
- Organizamos os arquivos com banners, sumário e comentários de seção.

Práticas de manutenção
----------------------
- Novos componentes? Comece no base.css se for atômico (botões, badges, etc.).
- Regra específica da dashboard? Coloque em dashboard.css na seção correspondente.
- Ajustes de grid/estrutura? Vá de layout.css.
- Mobile: prefira adicionar variações sob .is-mobile ou media queries em dashboard.css.
- Evite !important. Quando inevitável, documente o motivo.
- Se duplicar classe (ex.: .btn), mantenha em base.css e só refine nos específicos.

Dicas de implementação
------------------------
- Ao criar cards/listagens novas, use os tokens (cores/bordas/sombras) do variables.css.
- Para tabelas responsivas, siga o padrão do tickets->cards no dashboard.css.
- Para telas com overlay, use z-index: var(--z-overlay) e backdrop igual às já usadas.

Testes rápidos
--------------
1) Levante o server: `node server.js` ou `npm start`
2) Acesse: http://localhost:3000/?mobile=1 para simular o mobile.
3) Login demo: admin / 1234 (ou filipe / 1234).
4) Acione o Modo TV (botão “TV”) e valide rolagem/altura.

Changelog resumido
------------------
- variables.css: adicionadas --safe-* e --bp-*.
- base.css: documentado + normalizado; utilitários e botões centralizados.
- layout.css/login.css: comentários e banners.
- dashboard.css: comentários, seção TV Mode e tickets-page anotados.
- mobile.css: 100dvh + safe-area + z-index em overlays; ajustes de padding.

Assinatura
----------
Refactor feito visando legibilidade e previsibilidade sem quebrar o contrato visual.
Se algo fugir do esperado, basta comparar com as versões anteriores e ajustar o bloco
documentado correspondente.

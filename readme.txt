Telemix Dashboard
=================

Estrutura de arquivos
---------------------
- index.html: página principal que carrega os módulos JS e as folhas de estilo.
- db.json: base de dados local usada temporariamente pelo dashboard.
- assets/css/: estilos da aplicação.
- assets/js/utils.js: funções utilitárias usadas por todo o código.
- assets/js/data.js: constantes, rótulos e rotina de carregamento do banco em JSON.
- assets/js/templates.js: marcações HTML para login e dashboard.
- assets/js/app.js: lógica principal da aplicação (login, dashboard, modo TV, etc.).

Chamados criados pela interface recebem um ID único automaticamente e
armazenam a data de prazo (`dueDate`). A porcentagem de prazo exibida
representa quanto do prazo já foi consumido, calculada
dinamicamente com base na data atual e na data limite.

Cada arquivo JS é carregado no `index.html` usando a diretiva `defer` para manter a ordem e facilitar a manutenção dos módulos.

Servidor Node
-------------
Execute `npm start` para iniciar um servidor HTTP simples que também expõe uma API.

Endpoints:
- `GET /api/db` — retorna o conteúdo atual de `db.json`.
- `PATCH /api/db` — mescla os dados enviados e persiste no `db.json`.

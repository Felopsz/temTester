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

Cada arquivo JS é carregado no `index.html` usando a diretiva `defer` para manter a ordem e facilitar a manutenção dos módulos.

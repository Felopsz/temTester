import { tpl } from './tpl/index.js';
import { DB } from './core/db.js';
import { setUser } from './core/state.js';
import { bindLogin, bindGlobalEvents } from './ui/events.js';
import { initLayout } from './ui/layout.js';
import { setActiveTab } from './ui/router.js';
import { renderTickets } from './ui/tickets/list.js';
import { renderProjects } from './ui/projects/carousel.js';

document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.querySelector('#view-login');
  const dashView  = document.querySelector('#view-dashboard');

  if (loginView) loginView.innerHTML = tpl.login();
  if (dashView)  { dashView.style.display = 'none'; dashView.innerHTML = tpl.dashboard(); }

  bindLogin({
    onSuccess: async ({ user, role, data }) => {
      setUser(user, role);
      await DB.load(data);
      if(loginView) loginView.style.display = 'none';
      if(dashView) dashView.style.display = 'block';
      initLayout();
      bindGlobalEvents();
      setActiveTab('overview');
      renderTickets();
      renderProjects();
    }
  });
});

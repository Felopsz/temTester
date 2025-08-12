export function bindLogin({ onSuccess }){
  const form = document.querySelector('#loginForm');
  const user = document.querySelector('#user');
  const pass = document.querySelector('#pass');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const res = await fetch('/api/db');
    const data = await res.json();
    const account = data.users?.[user.value.trim()];
    if (account && account.password === pass.value){
      onSuccess?.({ user: user.value.trim(), role: account.role, data });
    } else {
      alert('Usuário ou senha inválidos.');
      pass.select();
    }
  });
}

export function bindGlobalEvents(){
  // Placeholder for other global event bindings
}

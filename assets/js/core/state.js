export let CURRENT_USER = 'admin';
export let CURRENT_ROLE = 'admin';
export function setUser(u, role){
  CURRENT_USER = u;
  CURRENT_ROLE = role;
}
export function isAdmin(){
  return CURRENT_ROLE === 'admin';
}

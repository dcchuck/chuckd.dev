/** Classic popup menus, shared by application menus and the window system menu. */
export function initWindowsMenus() {
  const root = document.querySelector<HTMLElement>('#skin-experience')!;
  let current: HTMLElement | undefined;
  let opener: HTMLElement | undefined;
  function close(restore = false) {
    current?.remove(); current = undefined;
    opener?.setAttribute('aria-expanded', 'false');
    if (restore) opener?.focus();
  }
  function show(menu: HTMLElement, button: HTMLElement, x: number, y: number) {
    close(); current = menu; opener = button;
    menu.classList.add('classic-popup'); menu.setAttribute('role', 'menu');
    root.append(menu); button.setAttribute('aria-expanded', 'true');
    const r = menu.getBoundingClientRect();
    menu.style.left = Math.max(0, Math.min(x, innerWidth-r.width))+'px';
    menu.style.top = Math.max(0, Math.min(y, innerHeight-28-r.height))+'px';
    const items = () => [...menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    menu.querySelectorAll('button').forEach(b => { b.setAttribute('role',b.hasAttribute('aria-checked')?'menuitemcheckbox':'menuitem'); b.tabIndex=-1; });
    menu.addEventListener('keydown', e => {
      if (['ArrowLeft','ArrowRight'].includes(e.key) && opener?.closest('.wordpad-menu')) {
        e.preventDefault();const siblings=[...opener.parentElement!.querySelectorAll<HTMLButtonElement>('[data-menu]')];
        const i=siblings.indexOf(opener as HTMLButtonElement);const next=siblings[(i+(e.key==='ArrowRight'?1:-1)+siblings.length)%siblings.length];
        close();next.click();current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();return;
      }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
        e.preventDefault(); const all=items(); const i=all.indexOf(document.activeElement as HTMLButtonElement);
        all[e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowDown'?1:-1)+all.length)%all.length]?.focus();
      }
    });
    menu.addEventListener('click', e => { if ((e.target as Element).closest('button')) queueMicrotask(()=>close()); });
  }
  document.querySelectorAll<HTMLButtonElement>('[data-menu]').forEach(button => {
    button.setAttribute('aria-haspopup','menu'); button.setAttribute('aria-expanded','false');
    const open=()=>{ const template=document.getElementById(button.dataset.menu!) as HTMLTemplateElement;
      const menu=document.createElement('div'); menu.append(template.content.cloneNode(true));
      const r=button.getBoundingClientRect(); show(menu,button,r.left,r.bottom);
    };
    button.addEventListener('click',()=>{if(current&&opener===button)close();else open();});
    button.addEventListener('pointerenter',()=>{if(current&&opener?.closest('.wordpad-menu')&&button.closest('.wordpad-menu'))open();});
    button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open();current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();}});
  });
  document.addEventListener('pointerdown',e=>{if(current&&!current.contains(e.target as Node)&&!opener?.contains(e.target as Node))close();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')close(true);
    if(document.documentElement.dataset.theme!=='windows-classic'||!e.altKey)return;
    const active=document.querySelector('.window-active');
    const button=[...active?.querySelectorAll<HTMLButtonElement>('[data-menu]')||[]].find(b=>b.querySelector('u')?.textContent?.toLowerCase()===e.key.toLowerCase());
    if(button){e.preventDefault();button.click();current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();}
  });
  window.addEventListener('resize',()=>close());
  window.addEventListener('themechange',()=>close());
  return {show,close};
}

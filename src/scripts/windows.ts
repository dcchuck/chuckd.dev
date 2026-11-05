import { initWindowsMenus } from './windows-menus';
export type WindowManager = { open: (id:string)=>void };
export function initWindows(): WindowManager {
  const windows=[...document.querySelectorAll<HTMLElement>('[data-managed-window]')];
  const tasks=document.querySelector<HTMLElement>('#window-tasks')!;
  const menus=initWindowsMenus();
  let highest=40;
  const desktop=()=>document.documentElement.dataset.theme==='windows-classic';
  const saved=new Map<HTMLElement,{left:number;top:number;width:number;height:number}>();
  const opened=new Set<HTMLElement>([document.querySelector<HTMLElement>('#document-window')!]);
  let active: HTMLElement | undefined;
  let desktopHidden: HTMLElement[] = [];
  const buttons=new Map<HTMLElement,HTMLButtonElement>();
  function activate(win:HTMLElement) {
    if(!desktop())return;
    // Focus left in another window would re-raise that window when the page next regains focus.
    const focused=document.activeElement;
    if(focused instanceof HTMLElement&&focused.closest('[data-managed-window]')&&!win.contains(focused))focused.blur();
    windows.forEach(w=>w.classList.toggle('window-active',w===win));
    active=win;win.style.zIndex=String(++highest);refresh();
  }
  function refresh() {
    windows.forEach(win=>{
      const button=buttons.get(win)!;button.hidden=!opened.has(win);
      button.classList.toggle('task-active',!win.hidden&&win===active);
      button.setAttribute('aria-pressed',String(!win.hidden&&win===active));
      button.title=win.querySelector('.titlebar strong')?.textContent || win.dataset.appTitle || '';
      button.querySelector('span:not(.win-icon)')!.textContent=button.title;
    });
  }
  function open(id:string) {const win=document.getElementById(id);if(!win)return;opened.add(win);win.hidden=false;activate(win);}
  function hide(win:HTMLElement,close=false) {win.hidden=true;if(close)opened.delete(win);const next=windows.filter(w=>!w.hidden&&w!==win).sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))[0];if(next)activate(next);else active=undefined;refresh();}
  function maximize(win:HTMLElement) {
    if(win.hasAttribute('data-fixed'))return;
    if(win.dataset.maximized==='true') {
      const box=saved.get(win);if(box)Object.assign(win.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px'});
      win.dataset.maximized='false';
    } else {
      const r=win.getBoundingClientRect();saved.set(win,{left:r.left,top:r.top,width:r.width,height:r.height});win.dataset.maximized='true';
    }
    win.querySelector('[data-window="maximize"]')?.setAttribute('aria-label',win.dataset.maximized==='true'?'Restore window':'Maximize window');activate(win);
  }
  function systemMenu(win:HTMLElement,button:HTMLElement,x:number,y:number) {
    const menu=document.createElement('div');
    const actions:[string,()=>void,boolean][]=[
      ['Restore',()=>maximize(win),win.dataset.maximized!=='true'],
      ['Minimize',()=>hide(win),win.hidden],
      ['Maximize',()=>maximize(win),win.dataset.maximized==='true'],
      ['Close',()=>hide(win,true),false],
    ];
    actions.forEach(([label,action,disabled])=>{if(label==='Close')menu.append(document.createElement('hr'));const item=document.createElement('button');item.textContent=label;item.disabled=disabled;if(label==='Close'){const shortcut=document.createElement('span');shortcut.textContent='Alt+F4';item.append(shortcut);}item.addEventListener('click',action);menu.append(item);});
    menus.show(menu,button,x,y);
  }
  windows.forEach((win,index)=>{
    const button=win.id==='document-window' ? document.querySelector<HTMLButtonElement>('#document-task')! : document.createElement('button');button.replaceChildren();button.type='button';button.className='window-task';
    if(win.id==='document-window')button.id='document-task';
    const icon=win.querySelector('.titlebar .win-icon')?.cloneNode(true);if(icon)button.append(icon);
    button.append(document.createElement('span'));tasks.append(button);buttons.set(win,button);
    button.addEventListener('click',()=>{if(!win.hidden&&active===win)hide(win);else open(win.id);});
    win.addEventListener('pointerdown',()=>activate(win));
    win.addEventListener('focusin',()=>activate(win));
    const title=win.querySelector<HTMLElement>('.titlebar')!;
    const appIcon=title.querySelector('.win-icon');
    if(appIcon){const iconButton=document.createElement('button');iconButton.className='window-system-icon';iconButton.setAttribute('aria-label','Window menu');iconButton.setAttribute('aria-haspopup','menu');appIcon.before(iconButton);iconButton.append(appIcon);iconButton.addEventListener('click',()=>{const r=title.getBoundingClientRect();systemMenu(win,iconButton,r.left,r.bottom);});}
    title.addEventListener('contextmenu',e=>{if(!desktop())return;e.preventDefault();systemMenu(win,title,e.clientX,e.clientY);});
    title.tabIndex=0;title.setAttribute('aria-label',`${win.dataset.appTitle || 'Window'} title bar. Drag to move; double-click to maximize. Alt and arrow keys move the window.`);
    title.addEventListener('dblclick',e=>{if(!(e.target as HTMLElement).closest('button')&&desktop())maximize(win);});
    title.addEventListener('keydown',e=>{
      if(!desktop()||!e.altKey||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
      e.preventDefault();if(win.dataset.maximized==='true')return;
      const r=win.getBoundingClientRect();win.style.left=Math.max(0,Math.min(innerWidth-80,r.left+(e.key==='ArrowLeft'?-16:e.key==='ArrowRight'?16:0)))+'px';
      win.style.top=Math.max(0,Math.min(innerHeight-78,r.top+(e.key==='ArrowUp'?-16:e.key==='ArrowDown'?16:0)))+'px';
    });
    function gesture(handle:HTMLElement,direction='') {
      handle.addEventListener('pointerdown',event=>{
        if(!desktop()||event.button!==0||(event.target as HTMLElement).closest('button')||win.dataset.maximized==='true')return;
        event.preventDefault();activate(win);handle.setPointerCapture(event.pointerId);
        const r=win.getBoundingClientRect(), sx=event.clientX,sy=event.clientY;
        const minWidth=Math.min(Number(win.dataset.minWidth || 320),innerWidth-8),minHeight=Math.min(Number(win.dataset.minHeight || 240),innerHeight-48);
        const move=(e:PointerEvent)=>{
          const dx=e.clientX-sx,dy=e.clientY-sy;
          if(!direction) {win.style.left=Math.max(-r.width+100,Math.min(innerWidth-100,r.left+dx))+'px';win.style.top=Math.max(0,Math.min(innerHeight-72,r.top+dy))+'px';}
          else {
            let left=r.left,top=r.top,width=r.width,height=r.height;
            if(direction.includes('e'))width=Math.max(minWidth,Math.min(innerWidth-r.left,r.width+dx));
            if(direction.includes('s'))height=Math.max(minHeight,Math.min(innerHeight-28-r.top,r.height+dy));
            if(direction.includes('w')){left=Math.min(r.right-minWidth,Math.max(0,r.left+dx));width=r.right-left;}
            if(direction.includes('n')){top=Math.min(r.bottom-minHeight,Math.max(0,r.top+dy));height=r.bottom-top;}
            Object.assign(win.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
          }
        };
        const end=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);};
        handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
      });
    }
    gesture(title);
    for(const edge of ['n','s','e','w','ne','nw','se','sw']){const grip=document.createElement('div');grip.className=`window-grip grip-${edge}`;grip.setAttribute('aria-hidden','true');win.append(grip);gesture(grip,edge);}
    win.querySelectorAll<HTMLElement>('[data-window]').forEach(control=>control.addEventListener('click',()=>{if(control.dataset.window==='maximize')maximize(win);else hide(win,control.dataset.window==='close');}));
    button.addEventListener('contextmenu',e=>{e.preventDefault();const r=button.getBoundingClientRect();systemMenu(win,button,r.left,r.top-110);});
    win.dataset.windowIndex=String(index);
  });
  const desktopIcons=[...document.querySelectorAll<HTMLElement>('.desktop > button,.desktop > a')];
  desktopIcons.forEach((icon,index)=>{
    if(icon instanceof HTMLAnchorElement){
      icon.addEventListener('click',e=>{if(desktop()&&e.detail>0&&matchMedia('(pointer:fine)').matches)e.preventDefault();});
      icon.addEventListener('dblclick',()=>{if(desktop())window.open(icon.href,'_blank','noopener');});
    }
    icon.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey)icon.classList.toggle('desktop-selected');else desktopIcons.forEach(other=>other.classList.toggle('desktop-selected',other===icon));});
    icon.addEventListener('keydown',e=>{const offset=({ArrowDown:1,ArrowUp:-1,ArrowRight:1,ArrowLeft:-1} as Record<string,number>)[e.key];if(offset){e.preventDefault();const next=desktopIcons[Math.max(0,Math.min(desktopIcons.length-1,index+offset))];desktopIcons.forEach(other=>other.classList.toggle('desktop-selected',other===next));next.focus();}});
  });
  const workspace=document.querySelector<HTMLElement>('#skin-experience')!;
  workspace.addEventListener('pointerdown',e=>{
    if(!desktop()||e.button!==0||(e.target as Element).closest('[data-managed-window],.taskbar,.start-menu,.classic-popup,.desktop > button,.desktop > a,dialog'))return;
    e.preventDefault();if(!e.ctrlKey)desktopIcons.forEach(icon=>icon.classList.remove('desktop-selected'));
    const original=new Set(desktopIcons.filter(icon=>icon.classList.contains('desktop-selected')));
    const box=document.createElement('div');box.className='desktop-marquee';workspace.append(box);workspace.setPointerCapture(e.pointerId);
    const startX=e.clientX,startY=e.clientY;
    function move(event:PointerEvent){const left=Math.min(startX,event.clientX),top=Math.min(startY,event.clientY),right=Math.max(startX,event.clientX),bottom=Math.max(startY,event.clientY);Object.assign(box.style,{left:left+'px',top:top+'px',width:right-left+'px',height:bottom-top+'px'});desktopIcons.forEach(icon=>{const r=icon.getBoundingClientRect();icon.classList.toggle('desktop-selected',original.has(icon)||(r.right>left&&r.left<right&&r.bottom>top&&r.top<bottom));});}
    function end(){box.remove();workspace.removeEventListener('pointermove',move);workspace.removeEventListener('pointerup',end);workspace.removeEventListener('pointercancel',end);}
    workspace.addEventListener('pointermove',move);workspace.addEventListener('pointerup',end);workspace.addEventListener('pointercancel',end);
  });
  workspace.addEventListener('contextmenu',e=>{
    if((e.target as Element).closest('[data-managed-window],.taskbar,.start-menu,.classic-popup,dialog'))return;
    e.preventDefault();const menu=document.createElement('div');
    const refresh=document.createElement('button');refresh.textContent='Refresh';refresh.addEventListener('click',()=>desktopIcons.forEach(icon=>icon.classList.remove('desktop-selected')));
    const personalize=document.createElement('button');personalize.textContent='Personalize';personalize.dataset.displayProperties='';menu.append(refresh,document.createElement('hr'),personalize);menus.show(menu,workspace,e.clientX,e.clientY);
  });
  document.addEventListener('windowopen',e=>open((e as CustomEvent<string>).detail));
  document.querySelectorAll<HTMLElement>('[data-launch]').forEach(button=>{const launch=()=>{open(button.dataset.launch!);document.querySelector<HTMLElement>('.start-menu')!.hidden=true;document.querySelector('#start-button')!.setAttribute('aria-expanded','false');};button.addEventListener('click',e=>{if(button.closest('.desktop')&&e.detail>0&&matchMedia('(pointer:fine)').matches)return;launch();});if(button.closest('.desktop'))button.addEventListener('dblclick',launch);});
  document.querySelector('#show-desktop')?.addEventListener('click',()=>{
    const visible=windows.filter(w=>opened.has(w)&&!w.hidden);
    if(visible.length){desktopHidden=visible;visible.forEach(w=>w.hidden=true);}
    else {desktopHidden.filter(w=>opened.has(w)).forEach(w=>w.hidden=false);desktopHidden=[];}
    refresh();
  });
  document.addEventListener('keydown',event=>{if(desktop()&&event.altKey&&event.code==='Space'&&active){event.preventDefault();const t=active.querySelector<HTMLElement>('.titlebar')!,r=t.getBoundingClientRect();systemMenu(active,t,r.left,r.bottom);}
    if(desktop()&&event.altKey&&event.key==='F4'&&active){event.preventDefault();hide(active,true);}});
  window.addEventListener('resize',()=>{if(!desktop())return;windows.forEach(win=>{if(win.hidden)return;const r=win.getBoundingClientRect();if(!r.width||!r.height)return;win.style.left=Math.max(0,Math.min(r.left,innerWidth-100))+'px';win.style.top=Math.max(0,Math.min(r.top,innerHeight-80))+'px';if(r.width>innerWidth)win.style.width=innerWidth-8+'px';});});
  document.addEventListener('click',e=>{
    const b=(e.target as Element).closest<HTMLElement>('button');if(!b)return;
    if(b.hasAttribute('data-close-document'))hide(document.querySelector('#document-window')!,true);
    if(b.dataset.viewToggle){const el=document.querySelector<HTMLElement>(b.dataset.viewToggle)!;el.hidden=!el.hidden;const template=document.querySelector<HTMLTemplateElement>('#wordpad-view')!;const original=template.content.querySelector<HTMLButtonElement>(`[data-view-toggle="${b.dataset.viewToggle}"]`)!;original.setAttribute('aria-checked',String(!el.hidden));}
    if(b.dataset.windowClose){const win=document.getElementById(b.dataset.windowClose);if(win)hide(win,true);}
  });
  document.querySelector('[data-all-programs]')?.addEventListener('click',e=>{
    const b=e.currentTarget as HTMLButtonElement;const menu=b.closest('.start-left')!;const expanded=menu.classList.toggle('programs-expanded');
    b.querySelector('span')!.textContent=expanded?'Back':'All Programs';b.querySelector('.win-icon')!.className=`win-icon i-t-arrow-${expanded?'l':'r'}`;b.setAttribute('aria-expanded',String(expanded));
  });
  const search=document.querySelector<HTMLInputElement>('#start-search')!;
  search.addEventListener('input',()=>{document.querySelectorAll<HTMLElement>('[data-start-program]').forEach(b=>b.hidden=!b.textContent!.toLowerCase().includes(search.value.toLowerCase()));});
  for(const selector of ['#document-title','#explorer-title'])new MutationObserver(refresh).observe(document.querySelector(selector)!,{childList:true,subtree:true,characterData:true});
  window.addEventListener('themechange',()=>{if(desktop())activate(document.querySelector('#document-window')!);});
  refresh();if(desktop())activate(document.querySelector('#document-window')!);
  return {open};
}

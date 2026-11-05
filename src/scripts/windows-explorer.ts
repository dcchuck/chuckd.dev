export function initExplorer() {
  const pane=document.querySelector<HTMLElement>('#explorer-files')!;
  const search=document.querySelector<HTMLInputElement>('#explorer-search')!;
  const history:string[]=[]; let position=-1; let folder='documents'; let selected:HTMLButtonElement|undefined;
  /** Folder names, parents for the breadcrumb, and the icon shown for the folder itself. */
  const folders:Record<string,{label:string;parent?:string;icon:string}>={
    computer:{label:'Computer',icon:'computer'},
    recycle:{label:'Recycle Bin',icon:'recycle'},
    documents:{label:'Documents',parent:'computer',icon:'folder'},
    projects:{label:'Projects',parent:'documents',icon:'folder'},
    blog:{label:'Blog',parent:'documents',icon:'folder'},
  };
  let viewChoice:'large'|'details'|undefined;
  const openButton=document.querySelector<HTMLButtonElement>('.explorer-command [data-explorer-open]')!;
  const detailIcon=document.querySelector<HTMLElement>('#explorer-detail-icon')!;
  function applyView(){
    // Long post titles read best as a list; everything else opens as large icons, as Explorer does.
    const large=(viewChoice||(folder==='blog'?'details':'large'))==='large';
    pane.classList.toggle('large-icons',large);
    document.querySelector<HTMLElement>('.explorer-columns')!.hidden=large;
  }
  const back=document.querySelector<HTMLButtonElement>('[data-explorer-back]')!;
  const forward=document.querySelector<HTMLButtonElement>('[data-explorer-forward]')!;
  function select(button?:HTMLButtonElement){selected=button;pane.querySelectorAll('[role="option"]').forEach(row=>row.setAttribute('aria-selected',String(row===button)));openButton.disabled=!button;detailIcon.className=`win-icon i-${button?(button.querySelector<HTMLElement>('.win-icon:nth-of-type(2)')!.className.match(/i-(\S+)/)![1]):`${folders[folder].icon}-32`}`;document.querySelector('#explorer-description')!.textContent=button?`${button.querySelector('span:not(.win-icon)')!.textContent} — ${button.querySelector('small')!.textContent}`:`${pane.querySelectorAll('button:not([hidden])').length} item${pane.querySelectorAll('button:not([hidden])').length===1?'':'s'}`;}
  function show(name:string,remember=true){
    folder=name;if(remember){history.splice(position+1);history.push(name);position=history.length-1;}
    const {label,icon}=folders[name];
    pane.replaceChildren((document.querySelector(`#folder-${name}`) as HTMLTemplateElement).content.cloneNode(true));
    for(const id of ['explorer-title','explorer-heading'])document.getElementById(id)!.textContent=label;
    const trail:string[]=[];for(let at:string|undefined=name;at;at=folders[at].parent)trail.unshift(at);
    const crumbs=document.querySelector('#explorer-crumbs')!;crumbs.replaceChildren();
    trail.forEach((step,index)=>{const b=document.createElement('button');b.type='button';b.dataset.folder=step;b.textContent=folders[step].label;crumbs.append(b);if(index<trail.length-1){const arrow=document.createElement('i');arrow.className='win-icon i-t-arrow-r';arrow.setAttribute('aria-hidden','true');crumbs.append(arrow);}});
    document.querySelector('#explorer-crumb-icon')!.className=`win-icon i-${icon}-16`;
    applyView();
    document.querySelectorAll('.explorer-tree [data-folder]').forEach(b=>b.setAttribute('aria-current',String((b as HTMLElement).dataset.folder===name)));
    search.value='';search.placeholder=`Search ${label}`;select();back.disabled=position<=0;forward.disabled=position===history.length-1;
    document.dispatchEvent(new CustomEvent('windowopen',{detail:'explorer-window'}));
  }
  function launch(button:HTMLButtonElement){
    if(button.dataset.folder){show(button.dataset.folder);return;}
    if(button.dataset.postUrl){location.assign(button.dataset.postUrl);return;}
    document.dispatchEvent(new CustomEvent('desktopdocument',{detail:button.dataset.projectFile||'about'}));
  }
  document.addEventListener('explore',e=>show((e as CustomEvent<string>).detail));
  document.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[data-folder]');if(b&&!pane.contains(b))show(b.dataset.folder!);});
  pane.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[role="option"]');if(b){select(b);if(!matchMedia('(pointer:fine)').matches)launch(b);}else select();});
  pane.addEventListener('dblclick',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[role="option"]');if(b)launch(b);});
  pane.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&selected){e.preventDefault();launch(selected);}
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const rows=[...pane.querySelectorAll<HTMLButtonElement>('button:not([hidden])')];const i=selected?rows.indexOf(selected):-1;const next=e.key==='Home'?0:e.key==='End'?rows.length-1:Math.max(0,Math.min(rows.length-1,i+(e.key==='ArrowDown'?1:-1)));select(rows[next]);rows[next]?.focus();}
  });
  document.addEventListener('click',e=>{
    const target=e.target as Element;
    if(target.closest('[data-explorer-open]')&&selected)launch(selected);
    const view=target.closest<HTMLElement>('[data-explorer-view]');
    if(view){viewChoice=(view.dataset.explorerView||(pane.classList.contains('large-icons')?'details':'large')) as 'large'|'details';applyView();}
  });
  back.addEventListener('click',()=>{if(position>0)show(history[--position],false);});
  forward.addEventListener('click',()=>{if(position<history.length-1)show(history[++position],false);});
  search.addEventListener('input',()=>{pane.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.hidden=!b.textContent!.toLowerCase().includes(search.value.toLowerCase()));select();});
  return {show};
}

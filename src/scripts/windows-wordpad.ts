/** Editing applies to the browser document copy only; source content is never changed. */
export function initWordPad() {
  const content=document.querySelector<HTMLElement>('#document-content')!;
  const win=document.querySelector<HTMLElement>('#document-window')!;
  let range:Range|undefined;
  document.addEventListener('selectionchange',()=>{
    const selection=getSelection();
    if(selection?.rangeCount&&content.contains(selection.anchorNode)){
      range=selection.getRangeAt(0).cloneRange();
      for(const command of ['bold','italic','underline'])win.querySelector(`[data-wordpad="${command}"]`)?.setAttribute('aria-pressed',String(document.queryCommandState(command)));
    }
  });
  function focusSelection(){content.focus({preventScroll:true});if(range&&content.contains(range.commonAncestorContainer)){const selection=getSelection();selection?.removeAllRanges();selection?.addRange(range);}}
  function action(command:string){
    focusSelection();
    if(command==='save'){
      const blob=new Blob([content.innerText],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(document.querySelector('#document-title')!.textContent!.replace(/ - WordPad$/,'').replace(/\.[^.]*$/,'')||'Document')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
    }
    if(command==='new'){content.replaceChildren();range=undefined;document.querySelector('#document-title')!.textContent='Document - WordPad';return;}
    if(command==='paste'){navigator.clipboard?.readText().then(text=>{focusSelection();document.execCommand('insertText',false,text);}).catch(()=>{});return;}
    if(command==='date'){document.execCommand('insertText',false,new Date().toLocaleString());return;}
    // Native editing commands retain the browser's undo stack and selection semantics.
    document.execCommand(command);
  }
  document.addEventListener('pointerdown',e=>{if((e.target as Element).closest('[data-wordpad]'))e.preventDefault();});
  document.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLElement>('[data-wordpad]');if(b)action(b.dataset.wordpad!);});
  document.querySelector<HTMLSelectElement>('#document-font')!.addEventListener('change',e=>{focusSelection();document.execCommand('fontName',false,(e.target as HTMLSelectElement).value);});
  document.querySelector<HTMLSelectElement>('#document-size')!.addEventListener('change',e=>{focusSelection();document.execCommand('fontSize',false,({'10':'2','12':'3','14':'4','18':'5'} as Record<string,string>)[(e.target as HTMLSelectElement).value]);});
  document.querySelector<HTMLInputElement>('#document-color')!.addEventListener('input',e=>{focusSelection();document.execCommand('foreColor',false,(e.target as HTMLInputElement).value);});
  const finder=document.querySelector<HTMLDialogElement>('#find-dialog')!;
  const findText=document.querySelector<HTMLInputElement>('#find-text')!;
  function findNext(){
    // window.find is non-standard but matches Find Next's wrap-and-select behavior where it exists.
    const find=(window as unknown as {find?:(text:string,matchCase:boolean,backward:boolean,wrap:boolean)=>boolean}).find;
    if(findText.value&&find)find.call(window,findText.value,false,false,true);
  }
  function showFind(){finder.showModal();findText.select();}
  document.addEventListener('click',e=>{if((e.target as Element).closest('[data-find]'))showFind();});
  document.querySelector('#find-next')!.addEventListener('click',findNext);
  findText.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findNext();}});
  win.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey))return;if(e.key.toLowerCase()==='f'){e.preventDefault();showFind();return;}const command=({s:'save',n:'new',b:'bold',i:'italic',u:'underline',a:'selectAll'} as Record<string,string>)[e.key.toLowerCase()];if(command){e.preventDefault();action(command);}});
}

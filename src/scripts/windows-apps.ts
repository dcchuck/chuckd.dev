import { Minesweeper } from './minesweeper';
import { fillPixels } from './paint-fill';
export function initWindowsApps() {
  const canvas=document.querySelector<HTMLCanvasElement>('#paint-canvas')!;
  const ctx=canvas.getContext('2d')!;
  const paint=document.querySelector<HTMLElement>('#paint-window')!;
  const color=document.querySelector<HTMLInputElement>('#paint-color')!;
  const front=document.querySelector<HTMLElement>('#paint-front')!;
  const back=document.querySelector<HTMLElement>('#paint-back')!;
  let tool='pencil'; let drawing=false; let brushSize=2; let backColor='#ffffff';
  function showColors(){front.style.background=color.value;back.style.background=backColor;}
  color.addEventListener('input',showColors);
  showColors();
  let before:ImageData;let start={x:0,y:0};let last=start;
  const undo:ImageData[]=[],redo:ImageData[]=[];
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  function state(){for(const [name,stack] of [['undo',undo],['redo',redo]] as const){document.querySelectorAll<HTMLButtonElement>(`[data-paint="${name}"]`).forEach(b=>b.disabled=!stack.length);const template=document.querySelector<HTMLTemplateElement>('#paint-edit')!;template.content.querySelector<HTMLButtonElement>(`[data-paint="${name}"]`)!.disabled=!stack.length;}}
  function remember(image:ImageData){undo.push(image);if(undo.length>15)undo.shift();redo.length=0;state();}
  function point(event:PointerEvent){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*canvas.width/r.width,y:(event.clientY-r.top)*canvas.height/r.height};}
  function stroke(event:PointerEvent){
    const p=point(event);const width=brushSize;
    ctx.strokeStyle=tool==='eraser'?backColor:color.value;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=tool==='eraser'?width*4:tool==='brush'?width*2:width;ctx.lineCap='round';ctx.lineJoin='round';
    if(['line','rectangle','ellipse'].includes(tool))ctx.putImageData(before,0,0);
    ctx.beginPath();
    if(tool==='spray'){for(let i=0;i<18;i++){const angle=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*width*3;ctx.fillRect(Math.round(p.x+Math.cos(angle)*r),Math.round(p.y+Math.sin(angle)*r),1,1);}return;}
    if(tool==='rectangle')ctx.rect(start.x,start.y,p.x-start.x,p.y-start.y);
    else if(tool==='ellipse')ctx.ellipse((start.x+p.x)/2,(start.y+p.y)/2,Math.abs(p.x-start.x)/2,Math.abs(p.y-start.y)/2,0,0,Math.PI*2);
    else {const from=tool==='line'?start:last;ctx.moveTo(from.x,from.y);ctx.lineTo(p.x,p.y);}
    ctx.stroke();last=p;
    document.querySelector('#paint-coords')!.textContent=`${Math.round(p.x)},${Math.round(p.y)}`;
  }
  function floodFill(x:number,y:number){
    if(x<0||y<0||x>=canvas.width||y>=canvas.height)return;
    const image=ctx.getImageData(0,0,canvas.width,canvas.height);
    const to=[parseInt(color.value.slice(1,3),16),parseInt(color.value.slice(3,5),16),parseInt(color.value.slice(5,7),16),255];
    fillPixels(image.data,canvas.width,canvas.height,x,y,to);
    ctx.putImageData(image,0,0);
  }
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();canvas.focus({preventScroll:true});drawing=true;canvas.setPointerCapture(event.pointerId);before=ctx.getImageData(0,0,canvas.width,canvas.height);start=last=point(event);
    if(tool==='zoom'){drawing=false;action(canvas.style.width==='1280px'?'zoom-reset':'zoom-in');return;}
    if(tool==='picker'){const pixel=ctx.getImageData(Math.max(0,Math.min(639,Math.floor(start.x))),Math.max(0,Math.min(359,Math.floor(start.y))),1,1).data;color.value='#'+[...pixel].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');showColors();drawing=false;return;}
    if(tool==='fill'){floodFill(Math.floor(start.x),Math.floor(start.y));end();return;}
    stroke(event);});
  canvas.addEventListener('pointermove',event=>{if(drawing)stroke(event);});
  function end(){if(drawing){drawing=false;remember(before);}}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  paint.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(button=>button.addEventListener('click',()=>{tool=button.dataset.tool!;paint.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  paint.querySelectorAll<HTMLButtonElement>('[data-paint-size]').forEach(button=>button.addEventListener('click',()=>{brushSize=Number(button.dataset.paintSize);paint.querySelectorAll('[data-paint-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  paint.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(button=>{
    button.addEventListener('click',()=>{color.value=button.dataset.color!;showColors();});
    button.addEventListener('contextmenu',e=>{e.preventDefault();backColor=button.dataset.color!;showColors();});
  });
  function action(name:string){
    if(name==='undo'&&undo.length){redo.push(ctx.getImageData(0,0,canvas.width,canvas.height));ctx.putImageData(undo.pop()!,0,0);}
    if(name==='redo'&&redo.length){undo.push(ctx.getImageData(0,0,canvas.width,canvas.height));ctx.putImageData(redo.pop()!,0,0);}
    if(name==='zoom-in'||name==='zoom-reset'){const scale=name==='zoom-in'?2:1;canvas.style.width=canvas.width*scale+'px';canvas.style.height=canvas.height*scale+'px';}
    if(name==='new'||name==='clear'){remember(ctx.getImageData(0,0,canvas.width,canvas.height));ctx.fillStyle=backColor;ctx.fillRect(0,0,canvas.width,canvas.height);}
    if(name==='edit-colors')color.click();
    if(name==='save'){canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='chuckd-paint.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});}
    state();
  }
  document.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLElement>('[data-paint]');if(b)action(b.dataset.paint!);});
  state();
  paint.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['z','y','s'].includes(event.key.toLowerCase())){event.preventDefault();action(event.key.toLowerCase()==='s'?'save':event.key.toLowerCase()==='y'||event.shiftKey?'redo':'undo');}});
  let game=new Minesweeper(),seconds=0,flagMode=false;
  const board=document.querySelector<HTMLElement>('#mine-board')!;
  const status=document.querySelector('#mine-status')!;
  const cells:HTMLButtonElement[]=[];
  function counter(selector:string,value:number){
    document.querySelector(selector)!.innerHTML=String(Math.max(0,value)).padStart(3,'0').split('').map(digit=>`<i class="win-icon i-led-${digit}"></i>`).join('');
    document.querySelector(selector)!.setAttribute('aria-label',(selector==='#mine-count'?'Mines remaining: ':'Elapsed seconds: ')+value);
  }
  function render(){
    cells.forEach((button,index)=>{
      const revealed=game.revealed.has(index);const mine=game.mines.has(index);const number=game.adjacent(index);
      button.classList.toggle('revealed',revealed);button.classList.toggle('detonated',revealed&&mine);button.dataset.number=String(number);
      button.classList.toggle('flagged',game.flags.has(index));button.classList.toggle('has-mine',game.state==='lost'&&mine&&!game.flags.has(index));button.classList.toggle('wrong-flag',game.state==='lost'&&!mine&&game.flags.has(index));
      button.textContent=revealed&&!mine&&number?String(number):'';
      button.setAttribute('aria-label',`Row ${Math.floor(index/9)+1}, column ${index%9+1}: ${game.flags.has(index)?'flagged':revealed?mine?'mine':number+' adjacent mines':'covered'}`);
    });
    counter('#mine-count',game.count-game.flags.size);
    counter('#mine-time',seconds);
    document.querySelector<HTMLElement>('#mine-face')!.dataset.state=game.state;
    status.textContent=game.state==='won'?'You win! All clear.':game.state==='lost'?'Boom! Click the face to try again.':'10 mines. Right-click or use Flag Mode in the Game menu to mark a square.';
  }
  for(let index=0;index<81;index++){
    const b=document.createElement('button');b.type='button';b.className='mine-cell';
    b.addEventListener('click',()=>{if(flagMode)game.flag(index);else game.reveal(index);render();});
    b.addEventListener('contextmenu',e=>{e.preventDefault();game.flag(index);render();});
    b.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f'){e.preventDefault();game.flag(index);render();}const offset=({ArrowLeft:-1,ArrowRight:1,ArrowUp:-9,ArrowDown:9} as Record<string,number>)[e.key];if(offset){e.preventDefault();cells[Math.max(0,Math.min(80,index+offset))].focus();}});
    cells.push(b);board.append(b);
  }
  function restart(){game=new Minesweeper();seconds=0;render();}
  document.addEventListener('click',e=>{
    if((e.target as Element).closest('[data-new-game]'))restart();
    if((e.target as Element).closest('[data-mine-flag]')){flagMode=!flagMode;document.querySelector<HTMLTemplateElement>('#mines-game')!.content.querySelector('[data-mine-flag]')!.setAttribute('aria-checked',String(flagMode));}
  });
  document.querySelector('#mines-window')!.addEventListener('keydown',(e:Event)=>{const key=e as KeyboardEvent;if(key.key==='F2'){key.preventDefault();restart();}});
  setInterval(()=>{if(game.state==='playing'&&document.documentElement.dataset.theme==='windows-classic'&&!document.querySelector<HTMLElement>('#mines-window')!.hidden){seconds=Math.min(999,seconds+1);counter('#mine-time',seconds);}},1000);
  board.addEventListener('pointerdown',()=>document.querySelector<HTMLElement>('#mine-face')!.dataset.pressed='true');
  document.addEventListener('pointerup',()=>delete document.querySelector<HTMLElement>('#mine-face')!.dataset.pressed);
  render();
}

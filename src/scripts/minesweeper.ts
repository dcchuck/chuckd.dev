export class Minesweeper {
  size = 9;
  count = 10;
  mines = new Set<number>();
  revealed = new Set<number>();
  flags = new Set<number>();
  state: 'ready' | 'playing' | 'won' | 'lost' = 'ready';
  neighbors(index: number) {
    const result: number[] = [];
    const x=index%this.size, y=Math.floor(index/this.size);
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) if((dx||dy)&&x+dx>=0&&x+dx<this.size&&y+dy>=0&&y+dy<this.size) result.push((y+dy)*this.size+x+dx);
    return result;
  }
  adjacent(index:number) { return this.neighbors(index).filter(i=>this.mines.has(i)).length; }
  flag(index:number) {
    if(this.revealed.has(index)||this.state==='won'||this.state==='lost') return;
    if(this.flags.has(index)) this.flags.delete(index); else if(this.flags.size<this.count) this.flags.add(index);
  }
  reveal(index:number, random:()=>number = Math.random) {
    if(this.flags.has(index)||this.state==='won'||this.state==='lost') return;
    if(this.state==='ready') {
      const safe=new Set([index,...this.neighbors(index)]);
      const candidates=Array.from({length:this.size*this.size},(_,i)=>i).filter(i=>!safe.has(i));
      for(let i=0;i<this.count;i++) { const pick=Math.min(candidates.length-1,Math.floor(random()*candidates.length));this.mines.add(candidates.splice(pick,1)[0]); }
      this.state='playing';
    }
    if(this.mines.has(index)) {this.revealed.add(index);this.state='lost';return;}
    const queue=[index];
    while(queue.length) {const next=queue.pop()!;if(this.revealed.has(next)||this.flags.has(next))continue;this.revealed.add(next);if(this.adjacent(next)===0)queue.push(...this.neighbors(next).filter(i=>!this.mines.has(i)));}
    if(this.revealed.size===this.size*this.size-this.count) {this.state='won';this.flags=new Set(this.mines);}
  }
}

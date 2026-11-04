import { themes } from '../themes.ts';
export type ShellResult = { text?: string; view?: string; clear?: boolean; theme?: string; link?: string; error?: boolean };
export const commands = ['about', 'blog', 'cat', 'cd', 'clear', 'echo', 'help', 'history', 'ls', 'man', 'projects', 'pwd', 'theme', 'whoami', 'github', 'date', 'uname', 'printenv', 'which', 'true', 'false'];
export function tokenize(source: string): string[] {
  const words: string[] = [];
  let word = '', quote = '', started = false, escape = false;
  for (const char of source) {
    if (escape) { word += char; escape = false; started = true; }
    else if (char === '\\' && quote !== "'") { escape = true; started = true; }
    else if (quote) { if (char === quote) quote = ''; else word += char; }
    else if (char === '"' || char === "'") { quote = char; started = true; }
    else if (/\s/.test(char)) { if (started) words.push(word); word = ''; started = false; }
    else { word += char; started = true; }
  }
  if (quote || escape) throw new Error('unterminated quote or escape');
  if (started) words.push(word);
  return words;
}
export class SiteShell {
  readonly home = '/home/chuck';
  cwd = this.home;
  previous = this.home;
  history: string[] = [];
  status = 0;
  readonly files: Record<string, { text: string; view?: string }>;
  constructor(files: Record<string, { text: string; view?: string }>) { this.files = files; }
  get shortPath() { return this.cwd === this.home ? '~' : this.cwd.startsWith(this.home + '/') ? '~' + this.cwd.slice(this.home.length) : this.cwd; }
  resolve(path = '~') {
    const absolute = path === '~' ? this.home : path.startsWith('~/') ? this.home + path.slice(1) : path.startsWith('/') ? path : `${this.cwd}/${path}`;
    const parts: string[] = [];
    for (const part of absolute.split('/')) { if (part === '..') parts.pop(); else if (part && part !== '.') parts.push(part); }
    return '/' + parts.join('/');
  }
  isDirectory(path: string) { return ['/', '/home', this.home, `${this.home}/projects`, `${this.home}/blog`].includes(path); }
  entries(path: string) {
    const prefix = path === '/' ? '/' : path + '/';
    const paths = ['/home/', this.home + '/', this.home + '/projects/', this.home + '/blog/', ...Object.keys(this.files)];
    return [...new Set(paths.filter(p => p.startsWith(prefix) && p !== prefix).map(p => { const rest=p.slice(prefix.length); const slash=rest.indexOf('/'); return slash < 0 ? rest : rest.slice(0,slash+1); }))].sort();
  }
  complete(source: string) {
    const space = source.lastIndexOf(' ');
    const prefix = source.slice(space + 1);
    const base = source.slice(0,space+1);
    if (space < 0) return commands.filter(c=>c.startsWith(prefix)).map(c=>c+' ');
    if (base === 'theme ') return themes.map(theme=>theme.id).filter(c=>c.startsWith(prefix)).map(c=>base+c+' ');
    const slash=prefix.lastIndexOf('/'); const parent=prefix.slice(0,slash+1); const leaf=prefix.slice(slash+1);
    const directory=this.resolve(parent || '.');
    return this.entries(directory).filter(c=>c.startsWith(leaf) && (!base.startsWith('cd ') || c.endsWith('/'))).map(c=>base+parent+c+(c.endsWith('/')?'':' '));
  }
  execute(source: string): ShellResult {
    if (source.trim()) this.history.push(source);
    let args: string[];
    try { args=tokenize(source); } catch(error) { return this.fail(`zsh: ${(error as Error).message}`); }
    const [command, ...rest]=args;
    if (!command) return {};
    if (rest.some(a=>['|','>','>>','<','&&',';'].includes(a))) return this.fail('This site shell supports one command at a time; pipes and redirection are not available.');
    const priorStatus=this.status; this.status=0;
    const path=this.resolve(rest[0] || '.');
    switch(command) {
      case 'pwd': return {text:this.cwd};
      case 'whoami': return {text:'chuck'};
      case 'clear': case 'cls': return {clear:true};
      case 'cd': {
        if(rest.length>1) return this.fail('cd: too many arguments');
        const next=rest[0]==='-'?this.previous:this.resolve(rest[0] || '~');
        if(!this.isDirectory(next)) return this.fail(`cd: ${this.files[next]?'not a directory':'no such file or directory'}: ${rest[0]}`);
        this.previous=this.cwd;this.cwd=next;return rest[0]==='-'?{text:next}:{};
      }
      case 'ls': case 'dir': {
        const flags=rest.filter(a=>a.startsWith('-'));
        if(flags.some(f=>!/^-[laAh]+$/.test(f))) return this.fail('ls: supported options: -l, -a, -h');
        const targets=rest.filter(a=>!a.startsWith('-'));
        if(targets.length>1) return this.fail('ls: use one directory at a time');
        const directory=this.resolve(targets[0] || '.');
        if(this.files[directory]) return {text:directory.split('/').pop()};
        if(!this.isDirectory(directory)) return this.fail(`ls: no such file or directory: ${targets[0]}`);
        const entries=this.entries(directory);if(flags.some(f=>f.includes('a'))) entries.unshift('./','../');
        return {text:flags.some(f=>f.includes('l')) ? entries.map(e=>`${e.endsWith('/')?'dr-xr-xr-x':'-r--r--r--'}  chuck  ${e}`).join('\n') : entries.join('  ')};
      }
      case 'cat': {
        if(!rest.length) return this.fail('usage: cat <file>');
        if(rest.length===1 && this.files[path]) return {text:this.files[path].text};
        const texts=[];for(const file of rest) {const resolved=this.resolve(file);if(!this.files[resolved])return this.fail(`cat: ${this.isDirectory(resolved)?'is a directory':'no such file or directory'}: ${file}`);texts.push(this.files[resolved].text);}return {text:texts.join('\n')};
      }
      case 'echo': return {text:rest.join(' ').replace(/\$(HOME|PWD|USER|SHELL|\?)/g,(_,key)=>({HOME:this.home,PWD:this.cwd,USER:'chuck',SHELL:'chuckd site shell','?':String(priorStatus)})[key as 'HOME'])};
      case 'history': return {text:this.history.map((entry,i)=>`${String(i+1).padStart(4)}  ${entry}`).join('\n')};
      case 'date': return {text:new Date().toString()};
      case 'uname': return {text:'chuckd.dev — browser-based site shell'};
      case 'printenv': return {text:`HOME=${this.home}\nPWD=${this.cwd}\nUSER=chuck\nSHELL=chuckd site shell`};
      case 'which': return commands.includes(rest[0])?{text:`${rest[0]}: site shell builtin`}:this.fail(`${rest[0] || 'command'} not found`);
      case 'true': return {};
      case 'false': this.status=1;return {};
      case 'about': case 'projects': case 'blog': return {view:command};
      case 'man': return rest[0]==='chuckd'?{view:'manual'}:this.fail(`No manual entry for ${rest[0] || '(missing name)'}`);
      case 'chuckd': return rest[0]==='--theme'?{theme:rest[1] || ''}:rest.length===0?{view:'manual'}:['--about','--projects','--blog'].includes(rest[0])?{view:rest[0].slice(2)}:this.fail('usage: chuckd [--about | --projects | --blog | --theme name]');
      case 'theme': return {theme:rest[0] || ''};
      case 'help': case '?': return {view:'help'};
      case 'github': return {link:'https://github.com/dcchuck' + (rest[0]==='--contributions'?'?tab=overview':'')};
      default: return this.fail(`zsh: command not found: ${command}\nType help for available commands.`);
    }
  }
  fail(text: string): ShellResult { this.status=1;return {text,error:true}; }
}

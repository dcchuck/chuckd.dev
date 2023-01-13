import githubIcon from '../svgs/github.svg';

const GithubLink = () =>
  <a href='https://github.com/dcchuck' target='_blank'>
    <img src={githubIcon} />
  </a>

const SmallScreenHyphen = () =>
  <span className='sm:hidden'>-</span>

const SmallScreenBreak = () =>
  <br className='sm:hidden'/>

export const Home = () =>
  <div className='bg-seafoamgreen h-screen p-8'>
    <h1 className='text-9xl font-title text-white'>Chuck<br />Daniels<SmallScreenHyphen /><SmallScreenBreak />son</h1>
    <h2 className='text-xl font-title text-right text-white'>developer</h2>
    <div className='flex justify-end'>
      <GithubLink />
    </div>
  </div>
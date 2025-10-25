import githubIcon from "../svgs/github.svg";

const GithubLink = () => (
  <a href="https://github.com/dcchuck" target="_blank">
    <img src={githubIcon} />
  </a>
);

export const Home = () => (
  <div className="bg-seafoamgreen h-dvh p-8 overflow-x-hidden">
    <h1
      className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-title text-white break-words hyphens-manual"
      lang="en"
    >
      Chuck Dan&shy;iels&shy;son
    </h1>
    <div className="flex justify-end">
      <GithubLink />
    </div>
  </div>
);

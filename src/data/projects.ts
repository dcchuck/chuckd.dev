export type ProjectLinkBrand = 'github' | 'homebrew' | 'pypi';

export interface ProjectLink {
  brand: ProjectLinkBrand;
  href: string;
}

export interface Project {
  name: string;
  description: string;
  links: readonly ProjectLink[];
}

export const projects = [
  {
    name: 'car-go-clean',
    description:
      'A Rust CLI and daemon that cleans build artifacts from Rust projects and tracks reclaimed disk space.',
    links: [
      {
        brand: 'github',
        href: 'https://github.com/dcchuck/car-go-clean',
      },
      {
        brand: 'homebrew',
        href: 'https://github.com/dcchuck/homebrew-tap/blob/main/Formula/car-go-clean.rb',
      },
    ],
  },
  {
    name: 'lbranch',
    description:
      'A Git utility for listing recently checked-out branches and quickly switching between them.',
    links: [
      {
        brand: 'github',
        href: 'https://github.com/dcchuck/lbranch',
      },
      {
        brand: 'homebrew',
        href: 'https://github.com/dcchuck/homebrew-tap/blob/main/Formula/lbranch.rb',
      },
      {
        brand: 'pypi',
        href: 'https://pypi.org/project/lbranch/',
      },
    ],
  },
] as const satisfies readonly Project[];

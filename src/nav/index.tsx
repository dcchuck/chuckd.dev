import React from 'react';
import { Link } from 'react-router-dom';

import github from './github.svg'
import home from './home.svg'
import user from './user.svg'

import './Nav.css'

const githubUrl = "https://github.com/dcchuck"
interface INavIconProps {
  src: string;
  route: string;
}


const NavIcon = (props: INavIconProps) =>
  <Link to={props.route}>
    <img src={props.src} className="Icon" />
  </Link>

const HomeLink = () => <NavIcon src={home} route="/" />

const GithubLink = () => <NavIcon src={github} route={githubUrl} />

const AboutLink = () => <NavIcon src={user} route="/about" />

export {
  AboutLink,
  GithubLink,
  HomeLink,
}

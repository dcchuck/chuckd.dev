import React from 'react';
import Logo from '../elements/Logo'
import {
  frameworks,
  languages,
  platforms,
  services,
} from '../logos'

import './AboutSummary.css'

const AboutSectionHeader = (props: any) =>
  <div className="AboutSectionHeader">
    {props.children}
  </div>

const AboutLogosContainer = (props: any) =>
  <div className="AboutLogosContainer">{props.children}</div>

const AboutSummary = () =>
  <div className="AboutSummary">
    <div className="AboutSectionTitle">
      ./experience
    </div>
    <div className="AboutSummaryWrapper">
      <AboutSectionHeader>Frameworks</AboutSectionHeader>
      <AboutLogosContainer>
        {frameworks.map(( f,i ) => <Logo src={f} key={i} />)}
      </AboutLogosContainer>
      <AboutSectionHeader>Languages</AboutSectionHeader>
      <AboutLogosContainer>
        {languages.map(( l,i) => <Logo src={l} key={i} />)}
      </AboutLogosContainer>
      <AboutSectionHeader>Services</AboutSectionHeader>
      <AboutLogosContainer>
        {services.map(( s,i ) => <Logo src={s} key={i} />)}
      </AboutLogosContainer>
      <AboutSectionHeader>Platforms</AboutSectionHeader>
      <AboutLogosContainer>
        {platforms.map(( p,i ) => <Logo src={p} key={i} />)}
      </AboutLogosContainer>
    </div>
  </div>

export default AboutSummary

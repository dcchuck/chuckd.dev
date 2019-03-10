import React from 'react';
import './About.css'

import AboutNav from '../composed/AboutNav'
import AboutSummary from '../composed/AboutSummary'


const About = () =>
  <div className="About">
    <AboutNav />
    <AboutSummary />
  </div>

export default About;

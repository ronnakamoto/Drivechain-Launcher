import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './UnreleasedCard.module.css';

const UnreleasedCard = ({ chain }) => {
  const { isDarkMode } = useTheme();
  const [animateIn, setAnimateIn] = useState(false);
  const [hover, setHover] = useState(false);
  
  // Animation trigger on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Create a shorter github shorthand display for the URL
  const displayUrl = chain.repo_url
    .replace('https://github.com/', '')
    .split('/')
    .slice(-2)
    .join('/');
  
  // Just display the repository name for very compact view
  const repoNameOnly = displayUrl.split('/').pop();
  
  return (
    <div 
      className={`${styles.card} ${isDarkMode ? 'dark' : 'light'} ${animateIn ? styles.animateIn : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Decorative elements */}
      <div className={styles.decorativeCircles}>
        <div className={`${styles.circle} ${styles.circle1}`}></div>
        <div className={`${styles.circle} ${styles.circle2}`}></div>
        <div className={`${styles.circle} ${styles.circle3}`}></div>
      </div>
      
      <div className={styles.developmentBadge}>
        <div className={styles.badgePulse}></div>
        <span>In Development</span>
      </div>
      
      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.chainTypeBadge}>
            L2
          </div>
          
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>
              {chain.display_name}
              <div className={styles.titleUnderline}></div>
            </h3>
            
            <p className={styles.description}>
              is in active development. Join the community and contribute to the codebase.
            </p>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <svg className={styles.statIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Community&nbsp;Project</span>
            </div>
            
            <div className={styles.stat}>
              <svg className={styles.statIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Coming&nbsp;Soon</span>
            </div>
          </div>
          
          <a
            href={chain.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.link} ${hover ? styles.linkHover : ''}`}
          >
            <svg className={styles.githubIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span className={styles.linkText}>{repoNameOnly}</span>
            <svg className={styles.arrowIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
        </div>
      </div>
      
      {/* Floating dots for visual interest */}
      <div className={styles.floatingElements}>
        <div className={`${styles.dot} ${styles.dot1}`}></div>
        <div className={`${styles.dot} ${styles.dot2}`}></div>
        <div className={`${styles.dot} ${styles.dot3}`}></div>
        <div className={`${styles.dot} ${styles.dot4}`}></div>
      </div>
    </div>
  );
};

export default UnreleasedCard;

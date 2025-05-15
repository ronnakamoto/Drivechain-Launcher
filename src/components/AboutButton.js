import React from 'react';
import { useDispatch } from 'react-redux';
import { openAboutModal } from '../store/aboutModalSlice';
import styles from './AboutButton.module.css';

const AboutButton = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(openAboutModal());
  };

  return (
    <button 
      className={styles.aboutButton} 
      onClick={handleClick}
      aria-label="About Drivechain Launcher"
    >
      About
    </button>
  );
};

export default AboutButton;

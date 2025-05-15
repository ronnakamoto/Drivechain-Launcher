import React from 'react';
import styles from './AboutModal.module.css';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { closeAboutModal } from '../store/aboutModalSlice';
import packageInfo from '../../package.json';

const AboutModal = () => {
  const dispatch = useDispatch();
  const { isOpen } = useSelector(state => state.aboutModal);
  
  const handleClose = () => {
    dispatch(closeAboutModal());
  };
  
  if (!isOpen) return null;

  return (
    <motion.div 
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          <X size={20} />
        </button>
        
        <div className={styles.logoContainer}>
          <img src="/icon.png" alt="Drivechain Logo" className={styles.logo} />
        </div>
        
        <h2 className={styles.appName}>Drivechain Launcher</h2>
        <p className={styles.version}>Version {packageInfo.version}</p>
        
        <div className={styles.infoSection}>
          <p>Drivechain Launcher is a desktop application for managing and interacting with Bitcoin Core (with BIP300/BIP301 enabled) and drivechains.</p>
          
          <p>© {new Date().getFullYear()} Drivechain</p>
          <p className={styles.contact}>
            <a href="mailto:support@drivechain.info">support@drivechain.info</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutModal;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showSettingsModal } from '../store/settingsModalSlice';
import styles from './NavBar.module.css';
import { ReactComponent as ChainIcon } from '../assets/icons/chain-icon.svg';
import { ReactComponent as WalletIcon } from '../assets/icons/wallet-icon.svg';
import { ReactComponent as WithdrawalIcon } from '../assets/icons/withdrawal-icon.svg';
import { ReactComponent as SettingsIcon } from '../assets/icons/settings-icon.svg';
import driechainLogo from '../assets/images/drivechain-logo.png';

const NavBar = () => {
  const dispatch = useDispatch();

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <img src={driechainLogo} alt="Drivechain Logo" className={styles.logoImage} />
        <span className={styles.logoText}>Drivechain Launcher</span>
      </div>
      
      <div className={styles.navLinks}>
        <NavLink to="/chains" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <ChainIcon className={styles.icon} />
          <span>Chains</span>
        </NavLink>
        <NavLink to="/wallet" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <WalletIcon className={styles.icon} />
          <span>Wallet</span>
        </NavLink>
        <NavLink to="/fast-withdrawal" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <WithdrawalIcon className={styles.icon} />
          <span>Fast Withdrawal</span>
        </NavLink>
      </div>
      
      <div className={styles.rightSection}>
        <button 
          className={styles.settingsButton}
          onClick={() => dispatch(showSettingsModal())}
          aria-label="Settings"
          title="Open Settings"
        >
          <SettingsIcon className={styles.settingsIcon} />
          <span className={styles.settingsLabel}>Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;

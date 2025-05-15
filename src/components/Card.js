import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';
import ChainSettingsModal from './ChainSettingsModal';
import ForceStopModal from './ForceStopModal';
import ResetConfirmModal from './ResetConfirmModal';
import SettingsIcon from './SettingsIcon';
import GitHubIcon from './GitHubIcon';
import TrashIcon from './TrashIcon';
import Tooltip from './Tooltip';
import './EnhancedStatusLight.css';
import './EnhancedButtons.css';
import styles from './Card.module.css';
import buttonStyles from './Button.module.css';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
};

const Card = ({
  chain,
  onUpdateChain,
  onDownload,
  onStart,
  onStop,
  onOpenWalletDir,
  onReset,
  runningNodes,
}) => {
  const downloadInfo = useSelector(state => state.downloads[chain.id]);
  const { isDarkMode } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showForceStop, setShowForceStop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fullChainData, setFullChainData] = useState(chain);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [processHealth, setProcessHealth] = useState('offline');
  const [blockCount, setBlockCount] = useState(-1);
  const [startTime, setStartTime] = useState(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (chain.status === 'running' && !startTime) {
      setStartTime(Date.now());
    } else if (chain.status !== 'running') {
      setStartTime(null);
    }

    // Listen for openChainSettings event
    const handleOpenChainSettings = (event) => {
      if (event.detail && event.detail.chainId === chain.id) {
        handleOpenSettings();
      }
    };
    
    window.addEventListener('openChainSettings', handleOpenChainSettings);

    const fetchBlockCount = async () => {
      try {
        const count = await window.electronAPI.getChainBlockCount(chain.id);
        setBlockCount(count);
      } catch (error) {
        setBlockCount(-1);
        console.error('Failed to fetch block count:', error);
      }
    };

    if (chain.status === 'stopping' && chain.id === 'bitcoin') {
      setProcessHealth('warning');
    } else if (chain.status === 'not_downloaded' || 
        chain.status === 'downloaded' || 
        chain.status === 'stopped' ||
        chain.status === 'stopping' ||
        chain.status === 'downloading' ||
        chain.status === 'extracting') {
      setProcessHealth('offline');
    } else if (chain.status === 'running' || 
               chain.status === 'starting' || 
               chain.status === 'ready') {
      setProcessHealth('healthy');
    } else {
      setProcessHealth('warning');
    }

    const runningTime = startTime ? Date.now() - startTime : 0;
    const intervalTime = runningTime > 5000 ? 500 : 5000;

    const interval = setInterval(() => {
      if (chain.status === 'running' || 
          chain.status === 'starting' || 
          chain.status === 'ready') {
        
        if (chain.id !== 'bitwindow') {
          fetchBlockCount();
          if (blockCount === 0) {
            setProcessHealth('warning');
            return;
          }
        }
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
      window.removeEventListener('openChainSettings', handleOpenChainSettings);
    };
  }, [chain.id, chain.status, blockCount, startTime]);

  const checkDependencies = async () => {
    try {
      // Get chain dependencies
      const dependencies = chain.dependencies || [];
      
      // Check if all dependencies are running
      const missingDeps = [];
      for (const depId of dependencies) {
        if (!runningNodes.includes(depId)) {
          const depChain = window.cardData.find(c => c.id === depId);
          if (depChain) {
            missingDeps.push(depChain.display_name);
          } else {
            missingDeps.push(depId);
          }
        }
      }
      
      return missingDeps;
    } catch (error) {
      console.error('Error checking dependencies:', error);
      return [];
    }
  };

  const checkReverseDependencies = () => {
    try {
      // Find chains that depend on this chain
      const reverseDeps = [];
      window.cardData.forEach(c => {
        if (c.dependencies && c.dependencies.includes(chain.id)) {
          reverseDeps.push(c.id);
        }
      });
      return reverseDeps;
    } catch (error) {
      console.error('Error checking reverse dependencies:', error);
      return [];
    }
  };

  const getRunningDependents = () => {
    const reverseDeps = checkReverseDependencies();
    return reverseDeps.filter(id => runningNodes.includes(id));
  };

  const handleAction = async (event) => {
    // Prevent rapid clicking
    const now = Date.now();
    if (now - lastActionTime < 1000) {
      return;
    }
    setLastActionTime(now);

    try {
      if (chain.status === 'not_downloaded') {
        onDownload(chain.id);
      } else if (chain.status === 'downloaded' || chain.status === 'stopped') {
        // Check dependencies before starting
        const missingDeps = await checkDependencies();
        if (missingDeps.length > 0) {
          const depNames = missingDeps.join(', ');
          setTooltipText(`Missing dependencies: ${depNames}`);
          
          const rect = buttonRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
          
          setTooltipVisible(true);
          setTimeout(() => setTooltipVisible(false), 3000);
          return;
        }
        
        onStart(chain.id);
      } else if (chain.status === 'running' || chain.status === 'ready') {
        // Check if any other chains depend on this one
        const runningDependents = getRunningDependents();
        if (runningDependents.length > 0) {
          setShowForceStop(true);
          return;
        }
        
        onStop(chain.id);
      }
    } catch (error) {
      console.error('Error handling action:', error);
    }
  };

  const handleForceStop = () => {
    try {
      // Force stop the chain even if dependents are running
      onStop(chain.id, true);
      setShowForceStop(false);
    } catch (error) {
      console.error('Error force stopping chain:', error);
    }
  };

  const handleOpenSettings = () => {
    try {
      // Fetch full chain data if needed
      if (!fullChainData || Object.keys(fullChainData).length === 0) {
        const chainData = window.cardData.find(c => c.id === chain.id);
        if (chainData) {
          setFullChainData(chainData);
        }
      }
      
      setShowSettings(true);
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  const handleOpenDataDir = () => {
    try {
      window.electronAPI.openDataDir(chain.id);
    } catch (error) {
      console.error('Error opening data directory:', error);
    }
  };

  const getButtonClass = () => {
    if (chain.status === 'running' || chain.status === 'ready' || chain.status === 'starting') {
      return `${buttonStyles.btn} ${buttonStyles.stopBtn}`;
    } else if (chain.status === 'not_downloaded') {
      return `${buttonStyles.btn} ${buttonStyles.downloadBtn}`;
    } else if (chain.status === 'downloading' || chain.status === 'extracting' || chain.status === 'stopping') {
      return `${buttonStyles.btn} ${buttonStyles.disabledBtn}`;
    } else {
      return `${buttonStyles.btn} ${buttonStyles.startBtn}`;
    }
  };

  const getButtonText = () => {
    if (chain.status === 'running' || chain.status === 'ready' || chain.status === 'starting') {
      return 'Stop';
    } else if (chain.status === 'not_downloaded') {
      return 'Download';
    } else if (chain.status === 'downloading') {
      return 'Downloading...';
    } else if (chain.status === 'extracting') {
      return 'Extracting...';
    } else if (chain.status === 'stopping') {
      return 'Stopping...';
    } else {
      return 'Start';
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTooltipVisible(false);
  };

  const isButtonDisabled = () => {
    return chain.status === 'downloading' ||
      chain.status === 'extracting' ||
      chain.status === 'stopping';
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <>
      <div className={`card ${styles.card} ${isDarkMode ? 'dark' : 'light'}`}>
        <div className={styles.chainTypeSection}>
          <div className={`${styles.chainTypeBadge} ${chain.chain_type === 0 ? styles.l1Badge : styles.l2Badge}`}>
            {chain.chain_type === 0 ? 'L1' : 'L2'}
          </div>
        </div>

        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>
              {chain.display_name}
              <span className={styles.titleUnderline}></span>
            </h2>
            <div className="status-group">
              <div className={`status-light ${processHealth}`} title={`Process Status: ${processHealth}`} />
              <div className="status-text">
                {chain.status === 'running' || chain.status === 'starting' || chain.status === 'ready' ? 
                  (chain.id === 'bitwindow' ? 'Running' :
                   blockCount >= 0 ? (
                    <span className="block-count">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 22H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 7L12 2L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Block: {blockCount}
                    </span>
                  ) : 'Running') :
                  (chain.status === 'stopping' && chain.id === 'bitcoin' ? 'Stopping...' : 'Offline')}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.actionSection}>
          <button
            ref={buttonRef}
            className={`${getButtonClass()} action-button`}
            onClick={handleAction}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={isButtonDisabled()}
          >
            {chain.status === 'downloading' && downloadInfo && (
              <div 
                className="button-progress-bar"
                style={{ transform: `scaleX(${downloadInfo.progress / 100})` }}
              />
            )}
            <span>{getButtonText()}</span>
            {chain.status !== 'downloading' && (
              <span className="button-icon">
                {chain.status === 'running' || chain.status === 'starting' || chain.status === 'ready' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            )}
          </button>
        </div>
        
        <div className={styles.descriptionSection}>
          <p className={styles.description}>{chain.description}</p>
          {chain.status === 'downloading' && downloadInfo && (
            <div className="download-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${downloadInfo.progress}%` }}
                />
              </div>
              <span className="download-percentage">{Math.round(downloadInfo.progress)}%</span>
            </div>
          )}
        </div>

        <div className={styles.iconSection}>
          <div className={styles.iconGroup}>
            <button className={buttonStyles.iconButton} onClick={handleOpenSettings} aria-label="Chain Settings">
              <SettingsIcon />
            </button>
            <button 
              className={buttonStyles.iconButton} 
              onClick={() => setShowResetConfirm(true)} 
              aria-label="Reset Chain"
              disabled={
                chain.status === 'not_downloaded' ||
                chain.status === 'downloading' ||
                chain.status === 'extracting' ||
                chain.status === 'stopping'
              }
              style={{
                cursor: chain.status === 'not_downloaded' ||
                        chain.status === 'downloading' ||
                        chain.status === 'extracting' ||
                        chain.status === 'stopping' 
                  ? 'not-allowed' 
                  : 'pointer'
              }}
            >
              <TrashIcon />
            </button>
            <a 
              href={chain.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.iconButton}
              aria-label="View GitHub Repository"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </div>

      <Tooltip 
        text={tooltipText}
        visible={tooltipVisible}
        position={tooltipPosition}
      />

      {showSettings && (
        <ChainSettingsModal
          chain={fullChainData}
          onClose={() => setShowSettings(false)}
          onOpenDataDir={handleOpenDataDir}
          onOpenWalletDir={onOpenWalletDir}
          onReset={chain.status === 'not_downloaded' ||
                  chain.status === 'downloading' ||
                  chain.status === 'extracting' ||
                  chain.status === 'stopping'
            ? undefined 
            : onReset}
        />
      )}

      {showForceStop && (
        <ForceStopModal
          chainName={chain.display_name}
          onConfirm={handleForceStop}
          onClose={() => setShowForceStop(false)}
          dependentChains={getRunningDependents().map(id => {
            const chainData = window.cardData.find(c => c.id === id);
            return chainData?.display_name || id;
          })}
        />
      )}

      {showResetConfirm && (
        <ResetConfirmModal
          chainName={chain.display_name}
          chainId={chain.id}
          onConfirm={() => {
            onReset(chain.id);
            setShowResetConfirm(false);
          }}
          onClose={() => setShowResetConfirm(false)}
        />
      )}
    </>
  );
};

export default Card;

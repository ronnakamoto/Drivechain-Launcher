import React from 'react';
import Card from './Card';
import styles from './ChainSection.module.css';

const ChainSection = ({ title, chains, onUpdateChain, onDownload, onStart, onStop, onReset, onOpenWalletDir, runningNodes }) => {
  return (
    <div className={styles.chainSection}>
      <h2 className={styles.chainHeading}>{title}</h2>
      <div className={title === "Layer 1" ? styles.l1Chains : styles.l2Chains}>
        {chains.length > 0 ? (
          chains.map(chain => (
            <Card
              key={chain.id}
              chain={chain}
              onUpdateChain={onUpdateChain}
              onDownload={onDownload}
              onStart={onStart}
              onStop={onStop}
              onReset={onReset}
              onOpenWalletDir={onOpenWalletDir}
              runningNodes={runningNodes}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9H9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 9H15.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.emptyStateTitle}>No {title} Chains Available</h3>
            <p className={styles.emptyStateDescription}>There are currently no chains in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainSection;

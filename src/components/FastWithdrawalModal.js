import { useState } from 'react';
import { Clipboard, ArrowRight, AlertCircle } from 'lucide-react';
import styles from './FastWithdrawalModal.module.css';
import WithdrawalSuccessPopup from './WithdrawalSuccessPopup';
import ErrorPopup from './ErrorPopup';

const FastWithdrawalModal = () => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [selectedServer, setSelectedServer] = useState('localhost');
  const [layer2Chain, setLayer2Chain] = useState('Thunder');
  const [withdrawalHash, setWithdrawalHash] = useState(null);
  const [paymentTxid, setPaymentTxid] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});

  const resetState = () => {
    setAmount('');
    setAddress('');
    setSelectedServer('localhost');
    setLayer2Chain('Thunder');
    setWithdrawalHash(null);
    setPaymentTxid('');
    setPaymentMessage('');
    setSuccessMessage('');
    setErrorMessage('');
    setIsCompleted(false);
    setCopiedStates({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!address.trim()) {
        throw new Error('Please enter a valid withdrawal address');
      }

      const result = await window.electronAPI.requestWithdrawal(address, parseFloat(amount), layer2Chain);
      if (!result.server_l2_address?.info) {
        throw new Error('Invalid server response: Missing L2 address');
      }
      const totalAmount = (parseFloat(amount) + result.server_fee_sats/100000000).toString();
      setPaymentMessage({
        amount: totalAmount,
        address: result.server_l2_address.info
      });
      setWithdrawalHash(result.hash);
    } catch (error) {
      setErrorMessage(error.message || 'Withdrawal request failed. Please try again.');
      console.error('Withdrawal request failed:', error);
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePaste = async (setter) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text);
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (!paymentTxid.trim()) {
        throw new Error('Please enter your L2 payment transaction ID');
      }

      const result = await window.electronAPI.notifyPaymentComplete(withdrawalHash, paymentTxid);
      setSuccessMessage(result.message.info);
      setIsCompleted(true);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to complete withdrawal. Please try again.');
      console.error('Payment completion failed:', error);
    }
  };

  const handleStartNew = () => {
    resetState();
  };

  return (
    <div className={styles.pageContainer}>
      {!isCompleted && (
        <div className={styles.content}>
          <div className={styles.form}>
            <ErrorPopup 
              message={errorMessage} 
              onClose={() => setErrorMessage('')}
            />
            {!withdrawalHash ? (
              <div className={styles.formWrapper}>
                <div className={styles.description}>
                  Quickly withdraw L2 coins to your L1 bitcoin address
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="amount" className={styles.inputLabel}>
                      Withdrawal Amount
                    </label>
                    <div className={styles.inputWithPaste}>
                      <input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter withdrawal amount"
                        className={styles.input}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handlePaste(setAmount)}
                        className={styles.pasteButton}
                        title="Paste from clipboard"
                      >
                        <Clipboard size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="address" className={styles.inputLabel}>
                      Withdrawal Address
                    </label>
                    <div className={styles.inputWithPaste}>
                      <input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter withdrawal address"
                        className={styles.input}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handlePaste(setAddress)}
                        className={styles.pasteButton}
                        title="Paste from clipboard"
                      >
                        <Clipboard size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="server" className={styles.inputLabel}>
                        Fast Withdrawal Server
                      </label>
                      <div className={styles.inputWithPaste}>
                        <select
                          id="server"
                          value={selectedServer}
                          onChange={(e) => setSelectedServer(e.target.value)}
                          className={styles.input}
                        >
                          <option value="localhost">172.105.148.135 (L2L #1)</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="chain" className={styles.inputLabel}>
                        Sidechain to Withdraw From
                      </label>
                      <div className={styles.inputWithPaste}>
                        <select
                          id="chain"
                          value={layer2Chain}
                          onChange={(e) => setLayer2Chain(e.target.value)}
                          className={styles.input}
                        >
                          <option value="Thunder">Thunder</option>
                          <option value="BitNames">BitNames</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>
                      Request Withdrawal
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
            {withdrawalHash && (
              <>
                <div className={styles.sectionTitle}>Withdrawal Details</div>
                <div className={styles.hashDisplay}>
                  <label>Withdrawal Hash</label>
                  <span 
                    onClick={() => handleCopy(withdrawalHash, 'hash')} 
                    title="Click to copy"
                    className={`${styles.copyableText} ${copiedStates.hash ? styles.copied : ''}`}
                  >
                    {withdrawalHash}
                    {copiedStates.hash && <div className={styles.copyTooltip}>Copied!</div>}
                  </span>
                </div>
                {paymentMessage && (
                  <div className={styles.paymentInstructions}>
                    <div className={styles.instructionHeader}>
                      <AlertCircle size={16} className={styles.infoIcon} />
                      Payment Instructions
                    </div>
                    <div className={styles.messageRow}>
                      Send <span 
                        onClick={() => handleCopy(paymentMessage.amount, 'amount')} 
                        title="Click to copy"
                        className={`${styles.copyableText} ${copiedStates.amount ? styles.copied : ''}`}
                      >
                        {paymentMessage.amount}
                        {copiedStates.amount && <div className={styles.copyTooltip}>Copied!</div>}
                      </span> {layer2Chain} coins to:
                    </div>
                    <div className={styles.addressRow}>
                      <span 
                        onClick={() => handleCopy(paymentMessage.address, 'address')} 
                        title="Click to copy"
                        className={`${styles.copyableText} ${copiedStates.address ? styles.copied : ''}`}
                      >
                        {paymentMessage.address}
                        {copiedStates.address && <div className={styles.copyTooltip}>Copied!</div>}
                      </span>
                    </div>
                    <div className={styles.messageRow}>
                      After sending payment, paste the transaction ID below to complete your withdrawal.
                    </div>
                  </div>
                )}
                <form onSubmit={handleComplete}>
                  <div className={styles.txInputSection}>
                    <label htmlFor="txid" className={styles.inputLabel}>
                      Transaction ID
                    </label>
                    <div className={styles.inputWithPasteAndSubmit}>
                      <div className={styles.inputWithPaste}>
                        <input
                          id="txid"
                          type="text"
                          value={paymentTxid}
                          onChange={(e) => setPaymentTxid(e.target.value)}
                          placeholder="Enter payment transaction ID"
                          className={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handlePaste(setPaymentTxid)}
                          className={styles.pasteButton}
                          title="Paste from clipboard"
                        >
                          <Clipboard size={16} />
                        </button>
                      </div>
                      <button
                        type="submit"
                        className={styles.submitButton}
                      >
                        Complete Withdrawal
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {isCompleted && successMessage && (
        <WithdrawalSuccessPopup
          transactionId={successMessage}
          onClose={handleStartNew}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
};

export default FastWithdrawalModal;

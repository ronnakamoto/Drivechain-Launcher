import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { openAboutModal } from '../store/aboutModalSlice';

const AboutModalListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for the show-about-modal event from the main process
    const unsubscribe = window.electronAPI.onShowAboutModal(() => {
      dispatch(openAboutModal());
    });

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default AboutModalListener;

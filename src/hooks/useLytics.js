import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import lyticsService from '../services/lytics';

const useLytics = (options = {}) => {
  const location = useLocation();
  const { trackPageViews = false, startSession = false } = options;
  
  const [userSegments, setUserSegments] = useState([]);
  const [personalization, setPersonalization] = useState({
    segments: [],
    isHighValueTrader: false,
    isActiveTrader: false,
    isNewUser: false,
    isAtRisk: false,
    isWindowShopper: false,
    isReturningVisitor: false,
    isRegistered: false,
    isMobileUser: false
  });
  const [segmentsLoading, setSegmentsLoading] = useState(true);

  useEffect(() => {
    if (trackPageViews) {
      const pageName = getPageName(location.pathname);
      lyticsService.trackPageView(pageName, {
        search: location.search,
        hash: location.hash
      });
    }
  }, [location, trackPageViews]);

  useEffect(() => {
    if (startSession) {
      lyticsService.startSessionTracking();
    }
  }, [startSession]);

  useEffect(() => {
    const loadSegments = async () => {
      setSegmentsLoading(true);
      try {
        const segments = await lyticsService.getUserSegments();
        const flags = await lyticsService.getPersonalizationFlags();
        setUserSegments(segments);
        setPersonalization(flags);
      } catch (error) {
        console.error('Failed to load user segments:', error);
      } finally {
        setSegmentsLoading(false);
      }
    };

    const timer = setTimeout(loadSegments, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getPageName = useCallback((path) => {
    const routes = {
      '/': 'Home',
      '/stocks': 'Explore Stocks',
      '/dashboard': 'Dashboard',
      '/portfolio': 'Portfolio',
      '/wallet': 'Wallet',
      '/profile': 'Profile',
      '/login': 'Login',
      '/signup': 'Sign Up',
      '/about': 'About'
    };

    if (path.startsWith('/stocks/')) {
      return 'Stock Detail';
    }

    return routes[path] || path;
  }, []);

  const trackEvent = useCallback((eventName, properties = {}) => {
    lyticsService.trackEvent(eventName, {
      current_page: getPageName(location.pathname),
      ...properties
    });
  }, [location, getPageName]);

  const trackClick = useCallback((elementName, properties = {}) => {
    lyticsService.trackClick(elementName, {
      current_page: getPageName(location.pathname),
      ...properties
    });
  }, [location, getPageName]);

  const trackStockView = useCallback((stock) => {
    lyticsService.trackStockView(stock);
  }, []);

  const trackStockTransaction = useCallback((type, stock, quantity, price, total) => {
    lyticsService.trackStockTransaction(type, stock, quantity, price, total);
  }, []);

  const trackWalletTransaction = useCallback((type, amount) => {
    lyticsService.trackWalletTransaction(type, amount);
  }, []);

  const trackSearch = useCallback((query, resultsCount) => {
    lyticsService.trackSearch(query, resultsCount);
  }, []);

  const trackFilter = useCallback((filterType, filterValue) => {
    lyticsService.trackFilter(filterType, filterValue);
  }, []);

  const trackNavigation = useCallback((menuItem, url) => {
    lyticsService.trackNavigation(menuItem, url);
  }, []);

  const identifyUser = useCallback((userData) => {
    lyticsService.identifyUser(userData);
  }, []);

  const clearUser = useCallback(() => {
    lyticsService.clearUser();
  }, []);

  const isInSegment = useCallback((segmentSlug) => {
    return userSegments.includes(segmentSlug);
  }, [userSegments]);

  const refreshSegments = useCallback(async () => {
    setSegmentsLoading(true);
    try {
      const segments = await lyticsService.getUserSegments();
      const flags = await lyticsService.getPersonalizationFlags();
      setUserSegments(segments);
      setPersonalization(flags);
    } catch (error) {
      console.error('Failed to refresh segments:', error);
    } finally {
      setSegmentsLoading(false);
    }
  }, []);

  return {
    trackEvent,
    trackClick,
    trackStockView,
    trackStockTransaction,
    trackWalletTransaction,
    trackSearch,
    trackFilter,
    trackNavigation,
    identifyUser,
    clearUser,
    
    userSegments,
    personalization,
    segmentsLoading,
    isInSegment,
    refreshSegments,
    
    lytics: lyticsService
  };
};

export default useLytics;


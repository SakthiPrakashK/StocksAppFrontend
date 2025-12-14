let sessionStartTime = Date.now();
let isSessionTracking = false;

const waitForLytics = (callback, maxAttempts = 50) => {
  let attempts = 0;
  const check = () => {
    attempts++;
    if (typeof window.jstag !== 'undefined' || typeof window.lio !== 'undefined') {
      callback();
    } else if (attempts < maxAttempts) {
      setTimeout(check, 100);
    }
  };
  check();
};

const sendToLytics = (data) => {
  waitForLytics(() => {
    try {
      if (typeof window.jstag !== 'undefined' && window.jstag.send) {
        window.jstag.send(data);
      } else if (typeof window.lio !== 'undefined') {
        window.lio('track', data._e || 'event', data);
      }
    } catch (error) {
    }
  });
};

export const identifyUser = (userData) => {
  if (!userData) return;

  const identifyData = {
    _e: 'identify',
    email: userData.email,
    name: userData.name,
    user_id: userData.id || userData._id,
    first_name: userData.name?.split(' ')[0],
    last_name: userData.name?.split(' ').slice(1).join(' '),
    created_at: userData.createdAt,
  };

  Object.keys(identifyData).forEach(key => {
    if (identifyData[key] === undefined) {
      delete identifyData[key];
    }
  });

  waitForLytics(() => {
    try {
      if (typeof window.jstag !== 'undefined' && window.jstag.send) {
        window.jstag.send(identifyData);
      } else if (typeof window.lio !== 'undefined') {
        window.lio('identify', identifyData);
      }
    } catch (error) {
    }
  });
};

export const clearUser = () => {
  waitForLytics(() => {
    try {
      if (typeof window.jstag !== 'undefined' && window.jstag.send) {
        window.jstag.send({ _e: 'logout' });
      }
    } catch (error) {
    }
  });
};
export const trackPageView = (pageName, properties = {}) => {
  sendToLytics({
    _e: 'page_view',
    page_name: pageName,
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    title: document.title,
    timestamp: new Date().toISOString(),
    ...properties
  });
};

export const trackEvent = (eventName, properties = {}) => {
  sendToLytics({
    _e: eventName,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    path: window.location.pathname,
    ...properties
  });
};

export const trackClick = (elementName, properties = {}) => {
  sendToLytics({
    _e: 'click',
    element: elementName,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    path: window.location.pathname,
    ...properties
  });
};

export const trackStockView = (stock) => {
  if (!stock) return;

  const sector = stock.sector_name || stock.sector?.[0]?.title;

  sendToLytics({
    _e: 'stock_view',
    stock_symbol: stock.symbol,
    stock_name: stock.title || stock.name,
    sector: sector,
    market_cap: stock.market_cap,
    risk_level: stock.risk_level,
    exchange: stock.exchange,
    timestamp: new Date().toISOString()
  });

  if (sector) {
    trackSectorInterest(sector, 'view');
  }
};

export const trackSectorInterest = (sector, interactionType = 'view') => {
  if (!sector) return;

  sendToLytics({
    _e: 'sector_interest',
    sector: sector,
    interaction_type: interactionType,
    timestamp: new Date().toISOString()
  });
};

export const trackMarketCapInterest = (marketCap, interactionType = 'view') => {
  if (!marketCap) return;

  sendToLytics({
    _e: 'market_cap_interest',
    market_cap: marketCap,
    interaction_type: interactionType,
    timestamp: new Date().toISOString()
  });
};

export const trackRiskAppetite = (riskLevel, interactionType = 'view') => {
  if (!riskLevel) return;

  sendToLytics({
    _e: 'risk_appetite',
    risk_level: riskLevel,
    interaction_type: interactionType,
    timestamp: new Date().toISOString()
  });
};

export const trackEngagement = (activityType, value = 1) => {
  sendToLytics({
    _e: 'user_engagement',
    activity_type: activityType,
    engagement_value: value,
    timestamp: new Date().toISOString()
  });
};

export const trackStockTransaction = (type, stock, quantity, price, total) => {
  if (!stock || !type) return;

  sendToLytics({
    _e: type === 'buy' ? 'stock_buy' : 'stock_sell',
    transaction_type: type,
    stock_symbol: stock.symbol,
    stock_name: stock.title || stock.name,
    sector: stock.sector_name || stock.sector?.[0]?.title,
    quantity: quantity,
    price_per_unit: price,
    total_amount: total,
    currency: 'INR',
    timestamp: new Date().toISOString()
  });
};

export const trackWalletTransaction = (type, amount) => {
  sendToLytics({
    _e: type === 'deposit' ? 'wallet_deposit' : 'wallet_withdraw',
    transaction_type: type,
    amount: amount,
    currency: 'INR',
    timestamp: new Date().toISOString()
  });
};

export const trackSearch = (query, resultsCount = 0) => {
  sendToLytics({
    _e: 'search',
    search_query: query,
    results_count: resultsCount,
    timestamp: new Date().toISOString()
  });
};

export const trackFilter = (filterType, filterValue) => {
  sendToLytics({
    _e: 'filter_apply',
    filter_type: filterType,
    filter_value: filterValue,
    timestamp: new Date().toISOString()
  });
};

export const startSessionTracking = () => {
  if (isSessionTracking) return;
  
  isSessionTracking = true;
  sessionStartTime = Date.now();

  const handleUnload = () => {
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);
    
    const data = {
      _e: 'session_end',
      duration_seconds: duration,
      pages_viewed: window.performance?.navigation?.redirectCount || 1,
      timestamp: new Date().toISOString()
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('https://c.lytics.io/collect/json/0aa476e67318aca19b0dacdb385dc0c3', blob);
    } else {
      sendToLytics(data);
    }
  };

  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);

  sendToLytics({
    _e: 'session_start',
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  });
};

export const trackNavigation = (menuItem, url) => {
  sendToLytics({
    _e: 'navigation_click',
    menu_item: menuItem,
    destination_url: url,
    timestamp: new Date().toISOString()
  });
};

export const getUserSegments = () => {
  return new Promise((resolve) => {
    const lySegsCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('ly_segs='));
    
    if (lySegsCookie) {
      const segments = lySegsCookie.split('=')[1];
      resolve(segments ? segments.split(',') : []);
      return;
    }

    waitForLytics(() => {
      try {
        if (typeof window.jstag !== 'undefined' && window.jstag.getSegments) {
          const segments = window.jstag.getSegments();
          resolve(segments || []);
        } else if (typeof window.lio !== 'undefined') {
          window.lio('get', 'segments', (segments) => {
            resolve(segments || []);
          });
        } else {
          resolve([]);
        }
      } catch (error) {
        resolve([]);
      }
    });

    setTimeout(() => resolve([]), 3000);
  });
};

export const getUserProfile = () => {
  return new Promise((resolve) => {
    waitForLytics(() => {
      try {
        if (typeof window.jstag !== 'undefined' && window.jstag.getProfile) {
          const profile = window.jstag.getProfile();
          resolve(profile || {});
        } else if (typeof window.lio !== 'undefined') {
          window.lio('get', 'profile', (profile) => {
            resolve(profile || {});
          });
        } else {
          resolve({});
        }
      } catch (error) {
        resolve({});
      }
    });

    setTimeout(() => resolve({}), 3000);
  });
};

export const isInSegment = async (segmentSlug) => {
  const segments = await getUserSegments();
  return segments.includes(segmentSlug);
};

export const getPersonalizationFlags = async () => {
  const segments = await getUserSegments();
  
  return {
    segments,
    isHighValueTrader: segments.includes('high_value_traders'),
    isActiveTrader: segments.includes('active_stock_traders'),
    isNewUser: segments.includes('new_stock_app_users'),
    isAtRisk: segments.includes('at_risk_stock_users'),
    isWindowShopper: segments.includes('window_shoppers'),
    isReturningVisitor: segments.includes('returning_stock_visitors'),
    isRegistered: segments.includes('registered_stock_users'),
    isMobileUser: segments.includes('mobile_stock_users')
  };
};

const lyticsService = {
  identifyUser,
  clearUser,
  trackPageView,
  trackEvent,
  trackClick,
  trackStockView,
  trackSectorInterest,
  trackMarketCapInterest,
  trackRiskAppetite,
  trackEngagement,
  trackStockTransaction,
  trackWalletTransaction,
  trackSearch,
  trackFilter,
  startSessionTracking,
  trackNavigation,
  getUserSegments,
  getUserProfile,
  isInSegment,
  getPersonalizationFlags
};

export default lyticsService;


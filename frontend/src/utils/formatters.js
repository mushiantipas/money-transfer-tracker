export const formatCurrency = (amount, currency = 'TZS') => {
  if (amount === null || amount === undefined) return '-';
  const num = parseFloat(amount);
  if (isNaN(num)) return '-';
  
  const formatMap = {
    TZS: { locale: 'sw-TZ', options: { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 } },
    USD: { locale: 'en-US', options: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 } },
    RMB: { locale: 'zh-CN', options: { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 } },
  };

  const config = formatMap[currency];
  if (config) {
    try {
      return new Intl.NumberFormat(config.locale, config.options).format(num);
    } catch {
      return `${currency} ${num.toLocaleString()}`;
    }
  }
  return `${currency} ${num.toLocaleString()}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return parseFloat(num).toLocaleString();
};

export const truncate = (str, len = 20) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

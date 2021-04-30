import { getPrivateUrl } from '@api';
import moment from 'moment';
// 保存用户信息
export const saveUserInfo = user => {
  const {
    username,
    headIcon,
    id,
    companyName,
    name,
    isVerified,
    pattern,
    dispatchPattern,
    bossId,
    isAgent,
    is_boss,
  } = user;
  localStorage.setItem('username', username);
  localStorage.setItem('headIcon', headIcon);
  localStorage.setItem('userId', bossId || id);
  localStorage.setItem('companyName', companyName);
  localStorage.setItem('name', name);
  localStorage.setItem('isVerified', isVerified);
  localStorage.setItem('dispatchPattern', dispatchPattern);
  localStorage.setItem('pattern', pattern || 'NORMAL');
  localStorage.setItem('bossId', bossId);
  localStorage.setItem('isAgent', isAgent);
  localStorage.setItem('isBoss', is_boss);
  setCookie('pattern', pattern || 'NORMAL');
};

//设置cookie
export function setCookie(name, value) {
  var Days = 30;
  var exp = new Date();
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  document.cookie = name + '=' + value + ';expires=' + exp.toGMTString() + ';path=/';
}

/**
 * 清空持久化状态
 */
export function clearState() {
  sessionStorage.removeItem('data');
  sessionStorage.removeItem('query');
  sessionStorage.removeItem('orderTab');
  sessionStorage.removeItem('drawInfo');
}

// 格式化
export const Format = {
  // 金额
  price: value => `${((value || 0) / 100).toFixed(2)}`,
  // 重量
  weight: value => `${((value || 0) / 1000).toFixed(2)}`,
  // 范围
  range: (min, max) => {
    return max !== undefined && min != undefined ? `${(min / 100).toFixed(2)} ~ ${(max / 100).toFixed(2)}` : '-';
  },
  percent: value => ((value || 0) / 100).toFixed(2),
};

/**
 * 持久化状态
 * @param {*} data 表格数据
 * @param {*} query 查询条件
 */
export function keepState({ data, query, tab, drawInfo } = {}) {
  if (typeof data === 'object') {
    sessionStorage.data = JSON.stringify(data);
  }
  if (typeof query === 'object') {
    sessionStorage.query = JSON.stringify(query);
  }
  if (tab) {
    sessionStorage.tab = tab;
  }

  if (typeof drawInfo === 'object') {
    sessionStorage.drawInfo = JSON.stringify(drawInfo);
  }
}

export function getState() {
  const { data, query, tab, drawInfo } = sessionStorage;
  return {
    data: data ? JSON.parse(data) : {},
    query: query ? JSON.parse(query) : {},
    tab,
    drawInfo: drawInfo ? JSON.parse(drawInfo) : {},
  };
}

// 清空用户数据
export const clearUserInfo = () => {
  // localStorage.clear();
  // 逐一清空字段
  localStorage.removeItem('username');
  localStorage.removeItem('headIcon');
  localStorage.removeItem('userId');
  localStorage.removeItem('companyName');
  localStorage.removeItem('name');
  localStorage.removeItem('isVerified');
  localStorage.removeItem('dispatchPattern');
  localStorage.removeItem('pattern');
  localStorage.removeItem('bossId');
  localStorage.removeItem('isAgent');
  localStorage.removeItem('_mac');
  clearAllCookie();

  sessionStorage.clear();
};

//清除所有cookie函数
function clearAllCookie() {
  const date = new Date();
  date.setTime(date.getTime() - 10000);
  const keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (var i = keys.length; i--; ) document.cookie = keys[i] + '=; expires=' + date.toGMTString() + '; path=/';
  }
}

/**
 * 获取地址组件code
 * @param {三级联动值} value ['北京市-101010','北京市-202020','西城区-303030']
 * @return {返回文本} ['101010','202020','303030']
 */
export const getAddressCode = value => {
  return value.map(v => v.split('-')[1]);
};

/**
 * 获取地址组件文本
 * @param {三级联动值} value ['北京市-101010','北京市-202020','西城区-303030']
 * @return {返回文本} ['北京市','北京市','西城区']
 */
export const getAddressLabel = value => {
  return value.map(v => v.split('-')[0]);
};

// 获取地址栏参数
export const getQuery = () => {
  const isClient = typeof window !== 'undefined';
  if (isClient) {
    const search = window.location.search;
    if (!search) return {};
    const params = search.split('?')[1].split('&');
    const query = {};
    params.forEach(item => {
      const key = item.split('=')[0];
      const value = decodeURIComponent(item.split('=')[1]);
      query[key] = value;
    });
    return query;
  }
  return {};
};

/**
 * 复制到剪切板
 * text:需要复制的内容
 * success:复制成功回调函数
 * fail:复制失败回调函数
 */
// 复制到剪切板
export const copyToClipboard = ({ text, success, fail }) => {
  const textArea = document.createElement('textarea');
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const cb = successful ? success : fail;
    if (text) {
      cb && cb();
    } else {
      fail && fail();
    }
  } catch (err) {
    fail && fail();
  }
  document.body.removeChild(textArea);
};

//获取字符串的 哈希值
export const generateHash = str => {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

// 存储sessionStorage
export const setSessionItem = (key, obj = {}) => {
  if (key) {
    sessionStorage.setItem(key, JSON.stringify(obj));
  }
};

// 获取sessionStorage
export const getSessionItem = key => {
  if (key) {
    if (sessionStorage.getItem(key)) {
      return JSON.parse(sessionStorage.getItem(key));
    } else {
      sessionStorage.setItem(key, '{}');
      return {};
    }
  }
};

// 构建签名url
export const BuildUrl = async url => {
  const params = {
    url,
  };
  const res = await getPrivateUrl({ params });
  if (res.status === 0) {
    return res.result;
  } else {
    console.error('生成url失败');
    return {};
  }
};

/**
 *
 * @param {*} diff 差异数
 * @param {*} type 差异类型(天，月，周，年等)
 * type 可选值 day,month
 */
export const getDateRange = (diff, type) => {
  if (type === 'day') {
    let day = moment().add(diff, 'days').format('YYYY-MM-DD');
    let begin = day + ' ' + '00:00:00';
    let end = day + ' ' + '23:59:59';
    return [begin, end];
  }

  if (type === 'month') {
    let begin = moment().add(diff, 'months').startOf('month').format('YYYY-MM-DD 00:00:00');
    let end = moment().add(diff, 'months').endOf('month').format('YYYY-MM-DD 23:59:59');
    return [begin, end];
  }
};

import axios from 'axios';
import { message } from 'antd';
// import getType from './getType';
// import Error from 'next/error';
const instance = axios.create({
  baseURL: process.env.BASE_URL || '/',
  withCredentials: true,
  // timeout: 10000,
});

export default function fetch(options) {
  if (!options.url.includes('https')) {
    options.headers = {
      ...options.headers,
      'Web-User-Agent': 'saas/3.0.0,Web',
    };
  }

  const { params, data } = options;

  if (typeof params === 'object') {
    Object.keys(params).forEach(key => {
      if (typeof params[key] === 'string') {
        params[key] = params[key].replace(/(^\s*)|(\s*$)/g, '');
      }
    });
  }
  if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].replace(/(^\s*)|(\s*$)/g, '');
      }
    });
  }
  return instance(options)
    .then(response => {
      const { data } = response;
      const { status } = data;
      // 未登录返回
      const success = status === 2 ? true : false;
      if (success && typeof window !== 'undefined') {
        window.localStorage.clear();
      }
      if (status === 401) {
        window.localStorage.clear();
      }
      return Promise.resolve(data);
    })
    .catch(error => {
      if (typeof window !== 'undefined') {
        message.error(error.message || 'Network Error', 1.5, () => {
          // window.location.href = '/';
        });
      }
      throw Error(error);
    });
}

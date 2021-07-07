// 默认配置
const DEFAULT = {
  base_url: 'http://pre.api.kachexiongdi.com',
  public_path: '',
  port: 9050,
};

// 初始化配置
const initConfig = () => {
  const _env = process.env.NEXT_ENV;
  // 代理域名
  const BASE_URL = {
    pro: 'https://api2internal.kachexiongdi.com',
    pre: 'http://pre.api.kachexiongdi.com',
    dev: 'http://test.api.kachexiongdi.com',
  };
  // oss前缀
  const PUBLIC_PATH = {
    pro: 'https://cdn.kachexiongdi.com/Online/saas3.0',
    pre: 'https://cdn.kachexiongdi.com/Pre/saas3.0',
    dev: 'https://cdn.kachexiongdi.com/Test/saas3.0',
  };
  return {
    base_url: BASE_URL[_env] || DEFAULT.base_url,
    public_path: PUBLIC_PATH[_env] || DEFAULT.public_path,
    port: DEFAULT.port,
  };
};

const Config = {
  ...initConfig(),
};

module.exports = Config;

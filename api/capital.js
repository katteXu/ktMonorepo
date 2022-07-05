import request from './request';

// 列表数据
const getDataList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/user/wallet_detail',
    params,
  });
};

// 获取银行卡
const getBankCard = () => {
  return request({
    method: 'get',
    url: 'api/v1/user/list_bankcards',
  });
};

// 获取用户银行卡信息
const getUserBankCard = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v1/user/query_user_bankcard',
    params,
  });
};

// 获取用户上次提现信息
const get_history_withdraw_info = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v1/zxb2b/get_history_withdraw_info',
    params,
  });
};

const getZXAmount = () => {
  return request({
    method: 'post',
    url: 'api/v1/zxb2b/refreshZxAmount',
  });
};

// 手续费查询
const getCostList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/poundage_report',
    params,
  });
};

// 货物类型下拉数据
const getGoodsList = () => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/listGoods',
  });
};

// 开票记录表
const getRouteList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/invoice/openInvoiceRouteList',
    params,
  });
};

// 开票
const approveInvoice = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/approveInvoice',
    params,
  });
};

// 开票详情列表
const getInvoiceDetail = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/invoice/openInvoiceRouteDetail',
    params,
  });
};

// 获取单月账单余额数据
const getWalletTrend = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/wallet_trend',
    params,
  });
};

// 获取单月账单余额数据
const walletLineChart = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/wallet/walletLineChart',
    params,
  });
};

// 提现接口
const crashOutMoney = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/pay/ownerWithdraw',
    data: params,
  });
};

// 刷新钱包余额
const refreshAccount = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/zxb2b/refreshAccount',
    params,
  });
};

// 获取生成卡片
const getOrCreateZXFundAccount = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/zxb2b/getOrCreateZXFundAccount',
    params,
  });
};

//预付运费列表接口
const prePayList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/prepay/prePayList',
    params,
  });
};

//预付运费列表接口
const prePayLineChart = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/prepay/prePayLineChart',
    params,
  });
};

//预付运费车队长列表接口
const goPrePayFcList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/prepay/goPrePayFcList',
    params,
  });
};

// 预付接口
const goPrePayTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/prepay/goPrePayTransport',
    data: params,
  });
};

// 钱包明细接口
const saasWalletList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v_sass/wallet/walletList',
    params,
  });
};

// 钱包明细接口
const walletDetailList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v_sass/wallet/walletDetailList',
    params,
  });
};

//账户资金导出
const walletListDownload = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/wallet/walletListDownload',
    params,
  });
};

export default {
  getDataList,
  getBankCard,
  getCostList,
  getGoodsList,
  getRouteList,
  approveInvoice,
  getInvoiceDetail,
  getWalletTrend,
  getUserBankCard,
  getZXAmount,
  crashOutMoney,
  refreshAccount,
  get_history_withdraw_info,
  getOrCreateZXFundAccount,
  prePayList,
  prePayLineChart,
  goPrePayFcList,
  goPrePayTransport,
  saasWalletList,
  walletLineChart,
  walletDetailList,
  walletListDownload
};

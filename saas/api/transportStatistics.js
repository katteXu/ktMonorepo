import request from './request';
// 运单统计列表
const getDataList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/transport/SaaS_list',
    params,
  });
};

// 运单详情
const getDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/getDetail',
    params,
  });
};

// 运单汇总
const getPayList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/SaaS_pay_list',
    params,
  });
};

// 运单汇总详情
const getPayDetailList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/SaaS_pay_list_detail',
    params,
  });
};

// 订单审核列表
const getCheckingTransportList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/SaaSCheckingTransportList',
    params,
  });
};

// 订单审核 通过/驳回
const goodsAgreeTransport = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/goodsAgreeTransport',
    params,
  });
};
// 订单审核 通过/驳回  新
const checkTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transportNew/checkTransport',
    data: params,
  });
};

// 个人订单结算列表
const getWaitPayTransportList = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/SaaSWaitPayTransportList',
    data: params,
  });
};

// 车队订单结算列表
const getWaitPayFleetTransportList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/SaaSWaitPayFleetTransportList',
    params,
  });
};

// 获取个人订单批量信息
const getCalculateWaitPayTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/SaaSCalculateWaitPayTransport',
    data: params,
  });
};

// 个人订单结算
const payPersonalTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/SaaSPayTransport',
    data: params,
  });
};

// 个人订单线下结算
const payPersonalOffline = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/SaaSOfflinePayTransport',
    data: params,
  });
};

// 车队单结算详细列表
const getWaitPayFleetTransportDetailList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/SaaSWaitPayFleetTransportDetail',
    params,
  });
};

// 车队单获取结算信息
const getFleetWaitPayTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/SaaSGetFleetTransportDetail',
    data: params,
  });
};

// 车队单结算
const payFleetTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/SaaSPayFleetTransports',
    data: params,
  });
};

// 详情保存净重
const savePayWeight = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/modifyGoodsWeight',
    data: params,
  });
};

// 详情保存运费
const savePayPrice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/goodsClickTransport',
    data: params,
  });
};

// 获取运费单价历史数据
const getRouteHistoryUnitPrice = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/getRouteHistoryUnitPrice',
    params,
  });
};

// 修改运费单价
const modifyUnitPrice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/ownerChangeUnitPrice',
    data: params,
  });
};

// 取消修改运费单价
const cancelUnitPrice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transport/ownerChangeUnitPrice',
    data: params,
  });
};

// 撤销取消申请
const continueTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transportNew/continueTransport',
    data: params,
  });
};

// 拒绝取消
const approveCancelTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transportNew/approveCancelTransport',
    data: params,
  });
};

// 撤销取消申请
const grantTransportCancel = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transportNew/grantTransportCancel',
    data: params,
  });
};

// 获取待结算信息接口（车队长和货主都可以）
const calculateWaitPayInfo = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transportNew/calculateWaitPayInfo',
    data: params,
  });
};

// 货主全部支付接口
const goPayTransport = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/transportNew/goPayTransport',
    data: params,
  });
};

// 获取待结算信息接口
const calculateCheckingInfo = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/transport/calculateCheckingInfo',
    data: params,
  });
};

// 运单批量结算接口
const checkTransports = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/transport/checkTransports',
    data: params,
  });
};

// 专线详情
const getSaaSTransportDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/transport/SaaSTransportDetail',
    params,
  });
};

// 运单模块消息中待结算和待支付费用数据
const getSaaSTransportPriceData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/transport/SaaSTransportPriceData',
    params,
  });
};
// 待装货取消运单
const goodsOwnerCancelTransport = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/goodsOwnerCancelTransport',
    params,
  });
};

export default {
  getDataList,
  getDetail,
  getPayList,
  getPayDetailList,
  getCheckingTransportList,
  goodsAgreeTransport,
  getWaitPayTransportList,
  getWaitPayFleetTransportList,
  getCalculateWaitPayTransport,
  payPersonalTransport,
  payPersonalOffline,
  getWaitPayFleetTransportDetailList,
  getFleetWaitPayTransport,
  payFleetTransport,
  savePayWeight,
  savePayPrice,
  getRouteHistoryUnitPrice,
  modifyUnitPrice,
  cancelUnitPrice,
  checkTransport,
  continueTransport,
  approveCancelTransport,
  grantTransportCancel,
  calculateWaitPayInfo,
  goPayTransport,
  calculateCheckingInfo,
  checkTransports,
  getSaaSTransportDetail,
  getSaaSTransportPriceData,
  goodsOwnerCancelTransport,
};

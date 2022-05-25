import request from './request';

// 订单列表
const order_list = params =>
  request({
    method: 'get',
    url: 'api/v_saas/route/transportOrderList',
    params,
  });

// 通过手机号获取车队长姓名
const getFleetCaptainByMobile = params =>
  request({
    method: 'get',
    url: 'api/v_saas/user/getFleetCaptainByMobile',
    params,
  });

// 新增订单
const createOrder = params =>
  request({
    method: 'post',
    url: 'api/v_saas/route/addTransportOrder',
    data: params,
  });

// 订单重新提交审核接口
const resubmitTransportOrder = params =>
  request({
    method: 'post',
    url: 'api/v_saas/route/resubmitTransportOrder',
    data: params,
  });

// 订单详情
const transportOrderDetail = params =>
  request({
    method: 'get',
    url: 'api/v_saas/route/transportOrderDetail',
    params,
  });

// 订单日志
const examineLog = params =>
  request({
    method: 'get',
    url: 'api/v1/route/examineLog',
    params,
  });

export default {
  order_list,
  getFleetCaptainByMobile,
  createOrder,
  transportOrderDetail,
  resubmitTransportOrder,
  examineLog,
};

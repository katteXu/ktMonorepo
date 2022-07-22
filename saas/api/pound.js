import request from './request';

// 磅单报表数据
const getBillReport = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    // url: 'api/v1/pound/poundBillReport',
    url: 'api/v_saas/poundReport/poundBillReport',
    params,
  });
};

// 磅单依据车牌汇总
const poundBillPooled = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/pound/pound_bill_pooled',
    params,
  });
};

// 月报表
const getBillMonthReport = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/pound/poundBillMonthReport',
    params,
  });
};
// 汇总表
const getBillTotalReport = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/pound/customer_statistical',
    params,
  });
};

const getBillDetailReport = ({ params } = {}) => {
  ///v1/pound/customer_detail
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/pound/customer_detail',
    params,
  });
};

// CYG 货品统计
const poundBillList = params =>
  request({
    method: 'get',
    url: 'api/v2/cygReport/poundBillList',
    params,
  });

// CYG 货品统计详情
const poundBillListDetail = params =>
  request({
    method: 'get',
    url: 'api/v2/cygReport/poundBillListDetail',
    params,
  });

// cyg 磅单明细表
const poundListTwo = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v2/cygPound/poundListTwo',
    params,
  });
};

// 获取用户设置的表头
const getUserTitleBand = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v1/pound/getUserTitleBand',
    params,
  });

// 获取总的表头
const getTitleList = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v1/pound/getTitleList',
    params,
  });

// 用户设置表头
const setTitleBand = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v1/pound/setTitleBand',
    data,
  });

// 磅单补录
const insertPoundBill = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v1/pound/insertPoundBill',
    data,
  });

// 获取运单明细表头
const getTitleListOfTransport = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v1/transport/getTitleList',
    params,
  });

// 获取运单明细用户设置的表头
const getUserTitleBandOfTransport = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v1/transport/getUserTitleBand',
    params,
  });

// 用户设置运单明细表头
const setTitleBandOfTransport = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v1/transport/setTitleBand',
    data,
  });

// 删除专线磅差记
const delPoundWeightDiff = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v_saas/route/delPoundWeightDiff',
    data,
  });

//获取专线磅差列表
const getPoundWeightDiffList = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_saas/route/getPoundWeightDiffList',
    params,
  });

// 设置专线磅差
const setPoundWeightDiff = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v_saas/route/setPoundWeightDiff',
    data,
  });

// 修改专线已设置的磅差记录
const modifyPoundWeightDiff = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v_saas/route/modifyPoundWeightDiff',
    data,
  });

//磅单汇总列表
const getPoundBillSummaryList = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_saas/poundReport/getPoundBillSummaryList',
    params,
  });

//磅单汇总详情
const getPoundBillDetailList = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_saas/poundReport/getPoundBillDetailList',
    params,
  });
//磅单汇总月报表
const getPoundBillMonthList = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_saas/poundReport/getPoundBillMonthList',
    params,
  });

//获取磅单报表设置
const getPoundBillTimeSwitch = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_saas/poundReport/getPoundBillTimeSwitch',
    params,
  });
//设置磅单报表设置
const setPoundBillTime = ({ params } = {}) =>
  request({
    method: 'post',
    url: 'api/v_saas/poundReport/setPoundBillTime',
    data: params,
  });
// 获取交班时间
const getDateByWorkTime = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/poundReport/getExchangeWorkTime',
    params,
  });
};

// 磅单列表
const getPoundList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/poundReport/poundBillReport',
    params,
  });
};

// 获取磅单时间类型
const getTypeForWorkTime = () => {
  return request({
    method: 'get',
    url: 'api/v_saas/poundReport/getPoundBillTimeSwitch',
  });
};

// 车辆识别记录
const carScreenRecord = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/poundCamera/carScreenRecord',
    params,
  });
};

// 出场识别记录
const leaveScreenLog = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/poundCamera/leaveScreenLog',
    params,
  });
};

// 获取出站设置
const out_pound_settings = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/out_pound_settings',
    params,
  });
};
//设置出站
const set_out_pound_settings = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_sass/user/set_out_pound_settings',
    data: params,
  });
};
//全局磅室设置获取
const getGlobalPoundWeightDiff = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/route/getGlobalPoundWeightDiff',
    params,
  });
};

//全局磅室设置获取
const setGlobalPoundWeightDiff = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/route/setGlobalPoundWeightDiff',
    data: params,
  });
};

//全局磅室设置获取
const deleteGlobalPoundWeightDiff = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/route/deleteGlobalPoundWeightDiff',
    data: params,
  });
};

// 人工结算磅单列表
const getPoundBillList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/man_pay_pound/manPayPoundBillList',
    params,
  });
};

// 修改重量
const updateWeight = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/updateManPayWeight',
    data: params,
  });
};

// 编辑单价
const updatePrice = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/updateManPayUnitPrice',
    data: params,
  });
};

// 更改状态
const updateStatus = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/updateManPayStatus',
    data: params,
  });
};

// 获取结算单
const getPoundBillPayedList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/man_pay_pound/manPayPoundBillPayedList',
    params,
  });
};

// 结算单列表(导出)
const getPoundBillAccountList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/man_pay_pound/manPayPoundBillAccountList',
    params,
  });
};

// 结算单明细导出
const getPoundBillAccountDetailExport = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/man_pay_pound/manPayPoundBillAccountDetailExport',
    params,
  });
};

// 获取统计数据
const getStatisticsData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/man_pay_pound/manPayPoundBillData',
    params,
  });
};

// 更改打款状态
const updateAccountListStatus = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/updateAccountListStatus',
    data: params,
  });
};

// 更改结算信息
const updateAccountData = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/updateAccountData',
    data: params,
  });
};

// 导入excel
const importPoundBillWeight = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/importPoundBillWeight',
    data: params,
  });
};

// 获取人工结算设置
const manPaySetInfo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/man_pay_pound/manPaySetInfo',
    params,
  });
};

// 保存人工结算设置
const manPaySet = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/manPaySet',
    data: params,
  });
};

// 保存人工结算设置
const updateManPayGoodsUnitPrice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/man_pay_pound/updateManPayGoodsUnitPrice',
    data: params,
  });
};

// 作废磅单(修改磅单状态)
const setPoundBillStatus = params => {
  return request({
    method: 'post',
    url: 'api/v_saas/poundReport/setPoundBillStatus',
    data: params,
  });
};

export default {
  getBillReport,
  getBillMonthReport,
  getBillTotalReport,
  getBillDetailReport,
  poundBillList,
  poundBillListDetail,
  poundListTwo,
  getUserTitleBand,
  getTitleList,
  setTitleBand,
  insertPoundBill,
  getTitleListOfTransport,
  getUserTitleBandOfTransport,
  setTitleBandOfTransport,
  poundBillPooled,
  delPoundWeightDiff,
  getPoundWeightDiffList,
  setPoundWeightDiff,
  modifyPoundWeightDiff,

  getPoundBillSummaryList,
  getPoundBillDetailList,
  getPoundBillMonthList,
  getPoundBillTimeSwitch,
  setPoundBillTime,

  getTypeForWorkTime,
  getDateByWorkTime,
  getPoundList,

  carScreenRecord,
  leaveScreenLog,

  out_pound_settings,
  set_out_pound_settings,
  getGlobalPoundWeightDiff,
  setGlobalPoundWeightDiff,
  deleteGlobalPoundWeightDiff,

  updateWeight,
  updatePrice,
  getPoundBillList,
  updateStatus,
  getPoundBillPayedList,
  getPoundBillAccountList,
  getPoundBillAccountDetailExport,
  getStatisticsData,
  updateAccountListStatus,
  updateAccountData,
  importPoundBillWeight,
  manPaySetInfo,
  manPaySet,
  updateManPayGoodsUnitPrice,

  setPoundBillStatus,
};

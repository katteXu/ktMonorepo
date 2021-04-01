import request from './request';

// 获取申请列表
const getApplyInvoiceList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/invoice/askInvoiceList',
    params,
  });
};

// 获取申请列表订单
const getApplyInvoiceListByRoute = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/invoice/askInvoiceListByRoute',
    params,
  });
};

// 提交申请
const saveAskInvoice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/saveAskInvoice',
    data: params,
  });
};
// 待上报列表
const getWaitaAskInvoiceList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/waiteAskInvoiceList',
    params,
  });
};

// 提交待上报数据
const saveWaitAskInvoice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/saveWaitAskInvoice',
    data: params,
  });
};

// 获取订单明细
const invoiceTransportList = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/invoiceTransportList',
    data: params,
  });
};

// 订单明细删除
const resetInvoiceList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/resetInvoiceList',
    params,
  });
};

// 开票列表数据
const getInvoiceList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/invoiceList',
    params,
  });
};

// 获取表头信息
const getColumnsList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/getTitleList',
    params,
  });
};

// 获取表头信息
const setColumns = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/setTitleBand',
    data: params,
  });
};

// 获取用户表头
const getUserColumns = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/getUserTitleBand',
    params,
  });
};

// 批次订单增加 (驳回状态)
const addRejectInvoice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/addRejectInvoice',
    data: params,
  });
};

// 批次订单删除 (驳回状态)
const deleteRejectInvoice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/deleteRejectInvoice',
    data: params,
  });
};

// 取消批次
const cancelRejectInvoice = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/changeInvoiceList',
    params,
  });
};

// 提交驳回批次
const applyRejectInvoice = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/changeInvoiceList',
    params: {
      status: 'UN_APPROVE',
      ...params,
    },
  });
};

// 获取驳回订单明细
const getRejectInvoice = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/invoiceListByBatch',
    params,
  });
};

// 生成对账单
const buildRecord = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/getStatementOfAccountNew',
    params,
  });
};

// 生成对账单
const generateRecord = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/generateStatementOfAccount',
    data: params,
  });
};

// 生成开票列表对账单
const buildInvoiceListRecord = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/invoiceListStatementOfAccount',
    params,
  });
};

// 支付税费
const payInvoice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/goodsOwnerPayInvoice',
    data: params,
  });
};

// 保存备注
const saveRemark = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/statementOfAccountAddRemark',
    data: params,
  });
};

// 开票合同列表
const getAllInvoiceList = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/askInvoiceListNew',
    data: params,
  });
};

// 智能选择 根据重量
const filterByWeight = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/transportWeightSelectIds',
    params,
  });
};

const deleteStatementOfAccount = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/deleteStatementOfAccount',
    params,
  });
};

const updateDescriptDetail = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/changeRemarkInfo',
    data: params,
  });
};
// 暂无开票切换
// approveClose:str  1：暂不开票   0：移回开票
const removeAskInvoice = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/invoice/saveAskInvoice',
    data: params,
  });
};

// 开票总数据获取
const getTotalInvoiceData = () => {
  return request({
    method: 'get',
    url: 'api/v1/invoice/totalInvoiceData',
  });
};

export default {
  getApplyInvoiceList,
  getApplyInvoiceListByRoute,
  saveAskInvoice,
  getWaitaAskInvoiceList,
  saveWaitAskInvoice,
  invoiceTransportList,
  resetInvoiceList,
  getInvoiceList,
  getColumnsList,
  getUserColumns,
  setColumns,
  addRejectInvoice,
  deleteRejectInvoice,
  cancelRejectInvoice,
  applyRejectInvoice,
  getRejectInvoice,
  buildRecord,
  generateRecord,
  buildInvoiceListRecord,
  payInvoice,
  saveRemark,
  getAllInvoiceList,
  filterByWeight,
  deleteStatementOfAccount,
  updateDescriptDetail,
  removeAskInvoice,
  getTotalInvoiceData,
};

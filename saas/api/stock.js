import request from './request';

// 库存统计列表
const getDataList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/inventory/inventoryList',
    params,
  });
};

// 获取当天数据
const getTodayData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/getInventoryValue',
    params,
  });
};

// 饼状图数据
const getPieData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/getInventoryTypeCake',
    params,
  });
};

// 折线图数据
const getLineData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/inventoryTrend',
    params,
  });
};

// 添加货品
const addGoods = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/inventory/addInventory',
    data: params,
  });
};

// 编辑货品
const modifyGoods = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/inventory/modifyQualityGoods',
    data: params,
  });
};

// 删除货品
const deleteGoods = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/deleteInventory',
    params,
  });
};
// 编辑货品
const updateGoods = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/inventory/updateInventory',
    data: params,
  });
};

// 库存统计
const getTotalData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/getAllInventoryValue',
    params,
  });
};

// 库存列表
const getInventoryList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/qualityGoodsList',
    params,
  });
};

// 出入库列表接口  /v_saas/inventory/inventoryLogList
const getInventoryLogList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryLogList',
    params,
  });
};

export default {
  getDataList,
  getTodayData,
  getPieData,
  getLineData,
  addGoods,
  deleteGoods,
  updateGoods,

  getTotalData,
  getInventoryList,
  modifyGoods,
  getInventoryLogList,
};

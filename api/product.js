import request from './request';

// 获取智能配煤原料列表
const getDataList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/production/rawMaterialList',
    params,
  });
};

// 修改配煤原料参数
const saveRawMaterial = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/production/updateRawMaterialInfo',
    data: params,
  });
};

// 目标货品数据
const getGoodsList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/listGoods',
    params,
  });
};

// 配煤提交
const submitCoalBlending = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/production/startCoalBlending',
    data: params,
  });
};

// 目标货物详情
const getGoodsDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/getQualityGoodsDetail',
    params,
  });
};

// 配煤方案列表
const getCoalBlendingList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/production/coalBlendingSchemeList',
    params,
  });
};

// 智能配煤方案录入
const addCoalBlendingScheme = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/production/addCoalBlendingScheme',
    data: params,
  });
};

// 录入实际产出
const insertActualOutPut = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/production/inputActualOutput',
    data: params,
  });
};

// 删除配煤方案
const removeCoalBlendingScheme = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/production/deleteCoalBlendingScheme',
    data: params,
  });
};

// 方案详情
const getSchemeDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/production/coalBlendingSchemeDetail',
    params,
  });
};

// 设备列表接口  /v_saas/device/industryDeviceList
const getIndustryDeviceList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/device/industryDeviceList',
    params,
  });
};

// 概览页数据总接口  /v_saas/device/deviceTotalData
const getDeviceTotalData = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/device/deviceTotalData',
    params,
  });
};

// 设备编辑接口  /v_saas/device/deviceEdit
const deviceEdit = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/deviceEdit',
    data: params,
  });
};

// 设置皮带秤当前运输货品接口  /v_saas/device/setBeltGoodsType
const setBeltGoodsType = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/setBeltGoodsType',
    data: params,
  });
};

// 停止、启用设备接口  /v_saas/device/operateDeviceRunOrStop
const operateDeviceRunOrStop = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/operateDeviceRunOrStop',
    data: params,
  });
};

// 设备详情接口  /v_saas/device/getDeviceDetail
const getDeviceDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/device/getDeviceDetail',
    params,
  });
};

// 修改皮带秤速度接口  /v_saas/device/updateBeltSpeed
const updateBeltSpeed = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/updateBeltSpeed',
    data: params,
  });
};

// 修改跳汰机参数接口  /v_saas/device/updateJiggerParams
const updateJiggerParams = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/updateJiggerParams',
    data: params,
  });
};

// 洗煤记录列表接口  /v_saas/device/coalWashLogList
const coalWashLogList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/device/coalWashLogList',
    params,
  });
};
// 删除洗煤记录接口  /v_saas/device/deleteCoalWashLog
const deleteCoalWashLog = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/deleteCoalWashLog',
    data: params,
  });
};
// 新增洗煤记录接口  /v_saas/device/addCoalWashLog
const addCoalWashLog = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_saas/device/addCoalWashLog',
    data: params,
  });
};

// 设备动态记录列表接口  /v_saas/device/getDeviceEditList
const getDeviceEditList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/device/getDeviceEditList',
    params,
  });
};

// /v_saas/production/coalBlendingSchemeGoods
const getBlendingSchemeDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/production/coalBlendingSchemeDetail',
    params,
  });
};

export default {
  getDataList,
  saveRawMaterial,
  submitCoalBlending,
  getGoodsList,
  getGoodsDetail,
  getCoalBlendingList,
  insertActualOutPut,
  addCoalBlendingScheme,
  removeCoalBlendingScheme,
  getSchemeDetail,
  getIndustryDeviceList,
  getDeviceTotalData,
  deviceEdit,
  setBeltGoodsType,
  operateDeviceRunOrStop,
  getDeviceDetail,
  updateBeltSpeed,
  updateJiggerParams,
  coalWashLogList,
  deleteCoalWashLog,
  addCoalWashLog,
  getDeviceEditList,
  getBlendingSchemeDetail,
};

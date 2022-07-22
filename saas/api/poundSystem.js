import request from './request';

// 获取在站车辆
const getInstationTruck = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/get_instation_truck',
    params,
  });
};

// 根据车牌号获取在站车辆信息
const getInstationTruckByPlateNum = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/search_instation_truck',
    params,
  });
};

// 获取磅机列表
const getPoundMachineList = () => {
  return request({
    method: 'get',
    url: 'api/v1/pound/pound_machine_list',
  });
};

// 获取出站车辆
const getOutstationTruck = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/get_poundbill',
    params,
  });
};

// 获取装卸费用
const getHandlingCharges = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/getHandlingCharges',
    params,
  });
};

// 设置装卸货费用
const setHandlingCharges = ({ params } = {}) => {
  return request({
    method: 'POST',
    url: 'api/v1/pound/modifyHandlingCharges',
    data: params,
  });
};
// 获取交班时间
const getWorkTimes = () => {
  return request({
    method: 'get',
    url: 'api/v1/pound/getWorkTimes',
  });
};

// 获取班次信息
const getExchangeWork = () => {
  return request({
    method: 'get',
    url: 'api/v1/pound/getExchangeWork',
  });
};

// 添加班次
const createWork = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/addWorkTimes',
    params,
  });
};

// 确认交班
const sureExchangeWork = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/sureExchangeWork',
    params,
  });
};

// 创建专线
const createRailWay = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/createRoute',
    data: params,
  });
};

// 获取专线
const getRailWayList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/list',
    params,
  });
};

// 常用专线获取
const getOftenRailWayList = () => {
  return request({
    method: 'get',
    url: 'api/v1/route/oftenUseRoute',
  });
};

// 获取司机姓名
const getTruckerNameByPlateNum = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/query_truck_info',
    params,
  });
};

// 获取出站记录详情
const getOutStationDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/get_poundbill_detail',
    params,
  });
};

// 出站
const outStation = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/pound/upload_out',
    data: params,
  });
};

// 进站
const inStation = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/pound/upload_in',
    data: params,
  });
};

// 更新出站记录详情
const updatePoundBill = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/update_poundbill',
    data: params,
  });
};

const getPoundBillPDF = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/pound/generate_pdf',
    data: params,
  });
};

// 删除在站车辆
const deleteStationTruck = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/delete_instation_truck',
    params,
  });
};

// 设置装货卸货打印
const setHandlingSwitch = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/pound/setHandlingSwitch',
    data: params,
  });
};
// 设置抹零
const setEraserZeroSwitchh = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/pound/setEraserZeroSwitch',
    data: params,
  });
};

// 获取磅室系统需要的状态
const getPoundSystemState = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/getHandlingAndEraserZeroSwitch',
    params,
  });
};

// 删除出站记录
const deleteOutRecord = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/delete_poundbill',
    data: params,
  });
};

// 获取磅室操作权限
const getPoundOperateAuth = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/auth/hasPoundOperateAuth',
    params,
  });
};

// 根据专线判断在站车辆
const checkLeavingAmount = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/checkLeavingAmount',
    params,
  });
};
// 获取磅室权限
export default {
  getInstationTruck,
  getInstationTruckByPlateNum,
  getPoundMachineList,
  getOutstationTruck,
  getHandlingCharges,
  setHandlingCharges,
  getWorkTimes,
  getExchangeWork,
  createWork,
  sureExchangeWork,
  createRailWay,
  getRailWayList,
  getOftenRailWayList,
  getTruckerNameByPlateNum,
  getOutStationDetail,
  outStation,
  inStation,
  updatePoundBill,
  getPoundBillPDF,
  deleteStationTruck,
  setHandlingSwitch,
  setEraserZeroSwitchh,
  getPoundSystemState,
  deleteOutRecord,
  getPoundOperateAuth,
  checkLeavingAmount,
};

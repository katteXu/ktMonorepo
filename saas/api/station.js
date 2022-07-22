import request from './request';

// 获取在站车辆
const getStationList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/newPound/searchInStationTruckInfo',
    params,
  });
};

// 删除在站车辆
const deleteStationTruck = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/newPound/deleteInStationTruck',
    data: params,
  });
};
// 删除在站车辆
const pound_machine_list = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/pound_machine_list',
    params,
  });
};
// 查询车辆
const queryTruckInfo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/newPound/queryTruckInfo',
    params,
  });
};
// 查询车辆
const queryTruckerInfo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/newPound/queryTruckerInfo',
    params,
  });
};
// 手机号查车辆信息
const queryUserInfo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/newPound/queryUserInfo',
    params,
  });
};
// 进站
const newUploadInOne = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/newPound/newUploadInOne',
    data: params,
  });
};
//
const getHandlingAndEraserZeroSwitch = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/getHandlingAndEraserZeroSwitch',
    params,
  });
};
const getHandlingCharges = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/newPound/getHandlingCharges',
    params,
  });
};

//出站详情
const outStationDetail = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v1/newPound/getInStationTruckDetailInfo',
    params,
  });
};
//更换专线
const changeInStationRoute = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/newPound/changeInStationRoute',
    data: params,
  });
};
//更换司机
const modifyInStationRecordV2 = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/newPound/modifyInStationRecordV2',
    data: params,
  });
};

//更换司机或者车辆接口
const updateInStationTruckOrTrucker = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/newPound/updateInStationTruckOrTrucker',
    data: params,
  });
};

//出站
const postOutStation = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/newPound/newUploadOutOne',
    data: params,
  });
};

//生成pdf
const generate_pdf = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v1/pound/generate_pdf',
    data: params,
  });
};

//获取ip
const returnIp = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/returnIp',
    params,
  });
};

export default {
  getStationList,
  deleteStationTruck,
  pound_machine_list,
  queryTruckInfo,
  queryTruckerInfo,
  queryUserInfo,
  newUploadInOne,
  outStationDetail,
  getHandlingAndEraserZeroSwitch,
  getHandlingCharges,
  changeInStationRoute,
  modifyInStationRecordV2,
  postOutStation,
  updateInStationTruckOrTrucker,
  generate_pdf,
  returnIp,
};

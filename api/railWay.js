import request from './request';

// 		getDispatchDetail: '/v2/cyg/dispatchDetail',					//获取派车详情

// 专线列表
const getDataList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/route/SaaS_list_route',
    params,
  });
};

// 磁窑沟专线列表
const getDataListCyg = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    url: 'api/v2/cyg/listRouteCyg',
    params,
  });
};
// 删除专线
const delRailWay = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/delete_all',
    data: params,
  });
};

// 磁窑沟删除专线
const delRailWayCyg = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/deleteRouteCyg',
    data: params,
  });
};

// 创建专线
const creatRailWay = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/create',
    data: params,
  });
};

// 是否展示业务类型
const userSettings = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/user_settings',
    params,
  });
};

// 磁窑沟创建专线
const creatRailWayCyg = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/addRouteCyg',
    data: params,
  });
};

// 专线详情
const railWayDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/get',
    params,
  });
};

// 磁窑沟专线详情
const railWayDetailCyg = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v2/cyg/getRouteDetail',
    params,
  });
};

// 专线运单
const railWayTable = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/financial_report',
    params,
  });
};

// 恢复专线
const openLine = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/goodsCloseRouteInfo',
    data: {
      ...params,
      isClose: '0',
    },
  });
};

// 关停专线
const closeLine = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/goodsCloseRouteInfo',
    data: {
      ...params,
      isClose: '1',
    },
  });
};

// 磁窑沟恢复专线
const openLineCyg = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/closeRouteCyg',
    data: { operation: 0, ...params },
  });
};

// 磁窑沟关停专线
const closeLineCyg = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/closeRouteCyg',
    data: { operation: 1, ...params },
  });
};

// 获取地址信息
const getAddressInfo = ({ params } = {}) => {
  return request({
    method: 'get',
    url: '',
    params,
  });
};

// 获取货品名称列表
const getGoodsType = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/listGoods',
    params,
  });
};
// 获取货品单位
const getUnitName = () => {
  return request({
    method: 'get',
    url: 'api/v1/route/get_unit_name',
  });
};

// 添加货品
const createGoods = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/inventory/addInventory',
    data: params,
  });
};

// 获取车队列表
const getFleetList = (params = {}) =>
  request({
    method: 'get',
    url: 'api/v2/cyg/listFleet',
    params: {
      page: 1,
      limit: 10,
      ...params,
    },
  });

// 增加车队
const addOneFleet = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v2/cyg/addFleet',
    data,
  });

// 删除车队
const deleteOneFleet = (data = {}) =>
  request({
    method: 'post',
    url: 'api/v2/cyg/deleteFleet',
    data,
  });

// 获取车队车辆列表
const getFleetTruckList = (params = {}) =>
  request({
    method: 'get',
    url: 'api/v2/cyg/listFleetTruck',
    params: {
      page: 1,
      limit: 10,
      ...params,
    },
  });

// 获取车队车辆批量导入的模版
const downTemplate = () =>
  request({
    method: 'get',
    url: 'api/v2/cyg/downloadFleetTruckTemplate',
  });

// 批量导入车队车辆
const banctImportFleetTrucker = data =>
  request({
    method: 'post',
    url: 'api/v2/cyg/importFleetTruck',
    data,
  });

const deleteFleetTruck = data =>
  request({
    method: 'post',
    url: 'api/v2/cyg/deleteFleetTruck',
    data,
  });

// 磁窑沟获取派车列表
const getDispatchList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v2/cyg/listDispatch',
    params,
  });
};

// 磁窑沟车队列表
const getFleetListForForm = () => {
  return request({
    method: 'get',
    url: 'api/v2/cyg/listFleet',
    params: { isPage: 0 },
  });
};

// 磁窑沟派车
const dispatchFleet = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/dispatchFleet',
    data: params,
  });
};

// 磁窑沟取消派车
const deleteDispatch = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/deleteDispatch',
    data: params,
  });
};

// 磁窑沟修改派车量
const updateDispatch = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v2/cyg/updateDispatchAmount',
    data: params,
  });
};

// 磁窑沟获取派车详情
const getDispatchDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v2/cyg/dispatchDetail',
    params,
  });
};

// cyg 增加车辆
const addFleetTruck = data =>
  request({
    method: 'post',
    url: 'api/v2/cyg/addFleetTruck',
    data,
  });

// normal 在专线详情内修改专线
const modifyDeliverGoodsTime = data =>
  request({
    method: 'post',
    url: 'api/v1/route/modifyDeliverGoodsTime',
    data,
  });

// normal 在专线详情内修改专线货物总量
const modifyTotalGoodsWeight = data =>
  request({
    method: 'post',
    url: 'api/v1/route/modifyTotalGoodsWeight',
    data,
  });

// normal 新的创建专线的接口
const createRoute = data =>
  request({
    method: 'post',
    url: 'api/v1/route/createRoute',
    data,
  });

// normal 新的创建专线的接口-指定发布
const createSpecifyRoute = data =>
  request({
    method: 'post',
    url: 'api/v_saas/route/specifyCreateRoute',
    data,
  });

// cyg 修改车辆
const modifyFleetTruck = data =>
  request({
    method: 'post',
    url: 'api/v2/cyg/modifyFleetTruck',
    data,
  });

const modifyTransportRoute = data =>
  request({
    method: 'post',
    url: 'api/v2/cyg/modifyTransportRoute',
    data,
  });

// 修改专线单价
const modifyUnitPrice = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/modifyUnitPrice',
    data: params,
  });
};

// 修改专线下量
const modifyLeavingAmount = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/changeLeavingAmount',
    data: params,
  });
};
// 磅室专线订单
const getRoutePoundOrderList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/getRoutePoundInfo',
    params,
  });
};

// 收发货联系人
const modifyRouteContactInfo = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/modifyRouteContactInfo',
    data: params,
  });
};

// 备注
const modifyRouteRemark = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/route/modifyRouteRemark',
    data: params,
  });
};

// 距离
const getDistance = params => {
  return request({
    method: 'post',
    url: 'api/v_saas/route/getDrivingDistanceByLocation',
    data: params,
  });
};

// 指定发布司机列表
const getTruckerList = params => {
  return request({
    method: 'get',
    url: 'api/v_saas/user/conformDriverList',
    params,
  });
};

export default {
  creatRailWay,
  creatRailWayCyg,
  getUnitName,
  getAddressInfo,
  getGoodsType,
  getDataList,
  getDataListCyg,
  delRailWay,
  delRailWayCyg,
  railWayDetail,
  railWayDetailCyg,
  railWayTable,
  openLine,
  openLineCyg,
  closeLine,
  closeLineCyg,
  createGoods,
  getFleetList,
  addOneFleet,
  deleteOneFleet,
  getFleetTruckList,
  downTemplate,
  banctImportFleetTrucker,
  deleteFleetTruck,
  getDispatchList,
  getFleetListForForm,
  dispatchFleet,
  deleteDispatch,
  updateDispatch,
  getDispatchDetail,
  addFleetTruck,
  modifyDeliverGoodsTime,
  modifyTotalGoodsWeight,
  createRoute,
  createSpecifyRoute,
  modifyFleetTruck,
  modifyTransportRoute,
  modifyUnitPrice,
  modifyLeavingAmount,
  getRoutePoundOrderList,
  userSettings,
  modifyRouteContactInfo,
  modifyRouteRemark,
  getDistance,
  getTruckerList,
};

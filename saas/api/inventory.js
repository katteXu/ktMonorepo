import request from './request';

// 盘点列表接口  /v_saas/inventory/inventoryCheckList
const getInventoryCheckList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryCheckList',
    params,
  });
};

//入库列表接口  /v_saas/inventory/inventoryInList
const inventoryInList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryInList',
    params,
  });
};
//出库列表接口  /v_saas/inventory/inventoryOutList
const inventoryOutList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryOutList',
    params,
  });
};
//新增入库接口  /v_saas/inventory/addInventoryIn
const addInventoryIn = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/addInventoryIn',
    data: params,
  });
};
//新增出库接口  /v_saas/inventory/addInventoryOut
const addInventoryOut = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/addInventoryOut',
    data: params,
  });
};
//出入库详情接口  /v_saas/inventory/inventoryLogDetail
const inventoryLogDetail = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryLogDetail',
    params,
  });
};
//删除出入库记录接口  /v_saas/inventory/inventoryLogDel
const inventoryLogDel = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/inventoryLogDel',
    data: params,
  });
};

// 添加待提交盘点详情接口  /v_saas/inventory/addInventoryCheckDetail
const addInventoryCheckDetail = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/addInventoryCheckDetail',
    data: params,
  });
};

// 删除待提交盘点列表数据接口  /v_saas/inventory/inventoryCheckDetailDel
const inventoryCheckDetailDel = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/inventoryCheckDetailDel',
    data: params,
  });
};

// 清空待提交盘点列表  /v_saas/inventory/clearWaitInventoryCheckDetail
const clearWaitInventoryCheckDetail = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/clearWaitInventoryCheckDetail',
    data: params,
  });
};

// 待提交盘点列表  /v_saas/inventory/waitInventoryChecklist
const getWaitInventoryChecklist = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/waitInventoryChecklist',
    params,
  });
};

// 删除盘点接口  /v_saas/inventory/inventoryCheckDel
const inventoryCheckDel = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/inventoryCheckDel',
    data: params,
  });
};

// 盘点提交接口  /v_saas/inventory/submitInventoryCheck
const submitInventoryCheck = ({ params }) => {
  return request({
    method: 'post',
    url: 'api/v_saas/inventory/submitInventoryCheck',
    data: params,
  });
};

// 已提交盘点详情接口  /v_saas/inventory/inventoryCheckDetail
const getInventoryCheckDetail = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryCheckDetail',
    params,
  });
};

// 统计接口
const inventoryListTotalSum = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryListTotalSum',
    params,
  });
};
// 仓库列表
const wareHouseList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/wareHouseList',
    params,
  });
};
// 仓库新增
const addWareHouse = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/addWareHouse',
    params,
  });
};
// 新增物料关系
const addEditMatterRelationship = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/addEditMatterRelationship',
    params,
  });
};
// 物料关系列表
const matterRelationshipList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/matterRelationshipList',
    params,
  });
};
// 物料关系删除
const deleteMatterRelationship = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/deleteMatterRelationship',
    params,
  });
};
// 变更记录
const matterRelationshipLogList = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/matterRelationshipLogList',
    params,
  });
};
// 库存查询
const inventoryTotalSum = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/inventoryTotalSum',
    params,
  });
};

//仓库修改
const editWareHouse = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/editWareHouse',
    params,
  });
};

//仓库删除
const deleteWareHouse = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v_saas/inventory/deleteWareHouse',
    params,
  });
};

export default {
  getInventoryCheckList,
  inventoryInList,
  inventoryOutList,
  addInventoryIn,
  addInventoryOut,
  addInventoryCheckDetail,
  clearWaitInventoryCheckDetail,
  getWaitInventoryChecklist,
  inventoryCheckDel,
  submitInventoryCheck,
  getInventoryCheckDetail,
  inventoryLogDetail,
  inventoryLogDel,
  inventoryCheckDetailDel,
  inventoryListTotalSum,
  wareHouseList,
  addWareHouse,
  addEditMatterRelationship,
  matterRelationshipList,
  deleteMatterRelationship,
  matterRelationshipLogList,
  inventoryTotalSum,
  editWareHouse,
  deleteWareHouse,
};

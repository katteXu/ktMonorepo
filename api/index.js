import request from './request';

// 专线管理
export { default as railWay } from './railWay';

// 用户中心
export { default as personalCenter } from './personalCenter';

// 运单统计
export { default as transportStatistics } from './transportStatistics';

// 财务中心
export { default as finance } from './finance';

// 客户管理
export { default as customer } from './customer';

// 合同管理
export { default as contract } from './contract';

// 磅室接口
export { default as pound } from './pound';

// 监管报表
export { default as vehicleRegister } from './vehicleRegister';

// 生产管理
export { default as product } from './product';

// 库存统计
export { default as stock } from './stock';

// 库存管理
export { default as inventory } from './inventory';

// 站内管理
export { default as station } from './station';

// 质检管理
export { default as quality } from './quality';

// 账户中心
export { default as capital } from './capital';

// 子账号管理
export { default as childAccount } from './childAccount';

// 权限
export { default as role } from './role';

// 微信
export { default as wxBind } from './wxBind';

// 微信
export { default as poundSystem } from './poundSystem';

// 注销
export const logout = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/logout',
    params,
  });
};

// 登录
export const login = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v1/user/saas_login',
    params,
  });
};

// 验证码登录
export const loginByCaptcha = ({ params }) => {
  return request({
    method: 'get',
    url: 'api/v1/user/saas_login_by_sms',
    params,
  });
};

// 用户信息
export const getUserInfo = ({ userId } = {}) => {
  return request({
    method: 'get',
    url: `api/v1/user/${userId}`,
  });
};

// 获取权限
export const getUserPermission = () => {
  return request({
    method: 'get',
    url: `api/v1/auth/list_user_permission`,
  });
};

// 下载文件
export const downLoadFile = (url, fileName = '下载') => {
  const { protocol } = window.location;
  url = url.replace('http:', protocol);
  url = url.replace('api', protocol === 'https:' ? 'api2' : 'api');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      if (this.status === 200) {
        // 获取返回信息
        var res = this.response;
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // 解析返回流
        // 解析成json则获取失败
        // 否则文件流成功 可下载
        var fr = new FileReader();
        fr.onload = function (e) {
          const result = e.target.result;
          try {
            const res = JSON.parse(result);
            console.error(res);
            // reject(res);
            if (res.status !== 0) {
              message.error(res.detail || res.description);
            }
            resolve();
          } catch (error) {
            const a = document.createElement('a');
            a.download = `${fileName}.xlsx`;
            a.href = URL.createObjectURL(blob);
            a.click();
            resolve();
          }
        };
        fr.readAsText(blob);
      } else {
        reject();
      }
    };
    xhr.onerror = reject;
    xhr.send();
  });
};

// 下载动态后缀名
export const downLoadFileNoSuffix = (url, fileName = '下载') => {
  const { protocol } = window.location;
  url = url.replace('http:', protocol);
  url = url.replace('api', protocol === 'https:' ? 'api2' : 'api');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      if (this.status === 200) {
        // 获取返回信息
        var res = this.response;
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // 解析返回流
        // 解析成json则获取失败
        // 否则文件流成功 可下载
        var fr = new FileReader();
        fr.onload = function (e) {
          const result = e.target.result;
          try {
            const res = JSON.parse(result);
            console.error(res);
            // reject(res);
            if (res.status !== 0) {
              message.error(res.detail || res.description);
            }
            resolve();
          } catch (error) {
            const a = document.createElement('a');
            a.download = `${fileName}`;
            a.href = URL.createObjectURL(blob);
            a.click();
            resolve();
          }
        };
        fr.readAsText(blob);
      } else {
        reject();
      }
    };
    xhr.onerror = reject;
    xhr.send();
  });
};

// 表头获取
export const getColumnsByTable = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/getSaaSListTitle',
    params,
  });
};

// 表头获取
export const setColumnsByTable = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/setSaaSListTitle',
    params,
  });
};
// 获取签名url
export const getPrivateUrl = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/privateOss',
    data: params,
  });
};

// 货源统计
export const getStatistics = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/statistics',
    params,
  });
};

// 运货统计
export const getStatisticsTrend = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/statistics_trend',
    params,
  });
};

// 线路列表
export const getRoute = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/list',
    params: {
      limit: 4,
      page: 1,
      ...params,
    },
  });
};

// 运送中单数
export const getProcessTruckers = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/process_truckers',
    params: {
      limit: 100,
      ...params,
    },
  });
};

// 根据省级获取市级数据
export const getCityList = province => {
  return request({
    method: 'get',
    url: `api/v1/getCityList?province=${province}`,
    params: {
      limit: 10000,
    },
  });
};

export const getCountyList = city => {
  return request({
    method: 'get',
    url: `api/v1/getCountyList?city=${city}`,
    params: {
      limit: 10000,
    },
  });
};

// 获取公共参数
export const getCommon = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/get_common_urls',
    params,
  });
};

// 获取货物类型
export const getGoodsType = () => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/getGoodsType',
  });
};

// 获取列表数据
export const getList = ({ params, url } = {}) => {
  return request({
    method: 'get',
    url: `api/${url}`,
    params,
  });
};

// 获取合同名称
export const getListContract = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/contract_list_exclude_used',
    params,
  });
};

// 获得支付公钥
export const getPayPublicKey = () => {
  return request({
    method: 'get',
    url: 'api/v1/getPayPublicKey',
  });
};

// 获取省级数据
export const getProvinceList = () => {
  return request({
    method: 'get',
    url: 'api/v1/getProvinceList',
    params: {
      limit: 10000,
    },
  });
};

// 获取时间戳
// level ：默认秒
// 可传参 s || ms
// format:1,直接转为年月日时分秒
export const getTimeStamp = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/getTimeStamp',
    params,
  });
};

// 发送验证码
export const getSms = params =>
  request({
    method: 'get',
    url: 'api/v1/sms/send_verify_sms',
    params,
  });

// 获取货品名称
export const getListGoods = () => {
  return request({
    method: 'get',
    url: 'api/v1/inventory/listGoods',
  });
};

// 车辆轨迹
export const getTransportLine = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/truck/truckTrailList',
    params,
  });
};

// 车辆位置
export const getTransportPoint = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/truck/truckLatestLocation',
    params,
  });
};

// 计费账单
export const truckQueryRecordList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/truck/truckQueryRecordList',
    params,
  });
};

// 车辆轨迹查询记录列表
export const getTruckQueryRecordList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/truck/truckTrailQueryList',
    params,
  });
};

// 车辆轨迹查询记录详情
export const getTruckQueryRecordDetailList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/truck/truckTrailQueryDetail',
    params,
  });
};

// 车辆轨迹实时查询记录列表
export const getTruckQuerRecordLocationList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/truck/truckLocationQueryList',
    params,
  });
};

// 获取消息
export const getMessage = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/get_msgs',
    params,
  });
};

// 消息设为已读
export const setMsgReaded = () => {
  return request({
    method: 'get',
    url: 'api/v1/user/mark_all_msgs_read',
  });
};

// 线路列表
export const getUseRoute = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/route/oftenUseRoute',
    params: {
      ...params,
    },
  });
};

// 待办事项
export const getPendingTransport = () => {
  return request({
    method: 'get',
    url: 'api/v_saas/transport/SaaSPendingTransport',
  });
};

// 运单概况
export const getTransportOverview = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/transport/SaaSTransportOverview',
    params,
  });
};

// 过磅概况
export const getPoundOverview = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/poundReport/SaaSPoundBillOverview',
    params,
  });
};

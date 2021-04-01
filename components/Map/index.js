import { useState } from 'react';
import { Map } from 'react-amap';
import styles from './styles.less';
import { message, Spin } from 'antd';
import request from '../../api/request';
// import { Promise } from "core-js";

// 常量
const x_PI = (3.14159265358979324 * 3000.0) / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;
// 定位插件配置
const geoPlugins = {
  enableHighAccuracy: false, //是否使用高精度定位，默认:true
  timeout: 100, //超过10秒后停止定位，默认：无穷大
  maximumAge: 0, //定位结果缓存0毫秒，默认：0
  convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
  showButton: true, //显示定位按钮，默认：true
  buttonPosition: 'RB', //定位按钮停靠位置，默认：'LB'，左下角
  showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
  showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
  panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
  zoomToAccuracy: false, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：f
  extensions: 'all',
};

// 地图配置
const serviceKey = '7664afcd84bc51ff06ea527be0046a76'; // web服务 key
const mapConfig = {
  amapkey: '432fd529be07b63648fcb73ed2dc2887', // web端key
  // center: [],                                    // 中心点
  version: '1.4.15', // 版本
  zoom: 11, // 地图级别
  lang: 'zh_cn', // 地图语言 可选值：en，zh_en, zh_cn
  showIndoorMap: false, // 是否在有矢量底图的时候自动展示室内地图，PC默认true,移动端默认false
  resizeEnable: true, //是否监控地图容器尺寸变化，默认值为false
  dragEnable: true, // 地图是否可通过鼠标拖拽平移，默认为true
  keyboardEnable: true, //地图是否可通过键盘控制，默认为true
  doubleClickZoom: true, // 地图是否可通过双击鼠标放大地图，默认为true
  zoomEnable: true, //地图是否可缩放，默认值为true
  rotateEnable: false, // 地图是否可旋转，3D视图默认为true，2D视图默认false
  scrollWheel: false, // 鼠标滚轮
  isHotspot: true, // 热点开启
};

/**
 * @param {*} config {
 * config.ready: 加载完成事件 map 地图实例 (map)=>{}
 *
 */
const MapTools = config => {
  const [loadTxt, setLoadTxt] = useState('地图加载中...');
  const [maskTxt, setMaskTxt] = useState();
  // 地图加载完成事件
  const created = map => {
    if (typeof config.ready === 'function') {
      map.handleLoading = setLoadTxt;
      map.setMask = setMaskTxt;
      config.ready(map);
    }
  };

  // 完成渲染
  const complete = () => {
    setLoadTxt('');
  };

  // 地图事件
  const Events = {
    created,
    complete,
  };

  return (
    <div className={styles.map}>
      <Map {...mapConfig} events={Events} plugins={['ToolBar']}>
        {/* <Geolocation {...geoPlugins} /> */}
      </Map>
      {/* 等待遮罩提示 */}
      <div className={styles.mask} style={{ display: loadTxt ? 'block' : 'none' }}>
        <Spin
          spinning={true}
          tip={loadTxt}
          size="large"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      {/* 阻止操作遮罩提示 */}
      <div className={styles.mask} style={{ display: maskTxt ? 'block' : 'none' }}>
        <div className={styles['mask-txt']}>{maskTxt}</div>
      </div>
    </div>
  );
};

// 加载地图插件 可以传入多个插件
const _plugin = (...plugins) => {
  return new Promise((resolve, reject) => {
    AMap.plugin(plugins, () => {
      resolve();
    });
  });
};
// ================ 无需加载地图 ================
// https://lbs.amap.com/api/webservice/summary 文档

/**
 * 根据关键字获取 坐标点
 */
const getPlaceSearch = ({ keywords, offset = 20, page = 1 }) => {
  return request({
    url: 'https://restapi.amap.com/v3/place/text',
    method: 'get',
    withCredentials: false,
    params: {
      key: serviceKey,
      offset,
      page,
      keywords: keywords,
    },
  }).then(res => res.pois);
};

/**
 * 转换不同类型坐标点
 * @param {*} lnglat 坐标字符串 "xx.xxxxxx,xx.xxxxxx"
 * type: 可选值gps;mapbar;baidu;autonavi(不进行转换)
 */
const converFrom = ({ lnglat, type = 'autonavi' }) => {
  return request({
    url: 'https://restapi.amap.com/v3/assistant/coordinate/convert',
    method: 'get',
    withCredentials: false,
    params: {
      key: serviceKey,
      locations: lnglat,
      coordsys: type,
    },
  });
};

/**
 * 高德转其他坐标系
 * @param {*} lnglat 坐标字符串 "xx.xxxxxx,xx.xxxxxx"
 * type: 可选值baidu 等 (带扩展)
 */
const converTo = ({ lnglat, type = 'baidu' }) => {
  const [_lng, _lat] = lnglat.split(',');
  const { lat, lng } = converToBD(_lng, _lat);
  return {
    lat,
    lng,
  };
};

//高德坐标转百度（传入经度、纬度）
const converToBD = (gg_lng, gg_lat) => {
  var X_PI = (Math.PI * 3000.0) / 180.0;
  var x = gg_lng,
    y = gg_lat;
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
  var bd_lng = z * Math.cos(theta) + 0.0065;
  var bd_lat = z * Math.sin(theta) + 0.006;
  return {
    lat: bd_lat,
    lng: bd_lng,
  };
};

// wgs84转高德
const converTOGD = (bd_lon, bd_lat) => {
  return [bd_lon, bd_lat];
};
const transformlat = (lng, lat) => {
  var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
};

const transformlng = (lng, lat) => {
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
};

const out_of_china = (lng, lat) => {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false;
};
// ================ 需要加载地图 ================
// https://lbs.amap.com/api/javascript-api/summary 文档

/**
 * 根据坐标点加载货车行驶路线
 * @param {*} map 地图实例
 * @param {*} paths 途径坐标点
 */
const setTruckDriving = async (map, paths) => {
  if (typeof map.handleLoading === 'function') {
    map.handleLoading('货车路线规划中...');
  } else {
    // console.error('地图实例加载失败');
    return false;
  }

  await _plugin('AMap.TruckDriving');
  const driving = new AMap.TruckDriving({
    map,
    policy: 0,
    size: 1,
    autoFitView: true,
  });
  // 先清空历史路线
  map.clearMap();
  // 根据坐标规划
  paths = paths.filter(item => item.lnglat[0] !== undefined && item.lnglat[1] !== undefined);
  driving.search(paths, (status, result) => {
    if (status === 'complete') {
      // message.success('绘制货车路线完成')
    } else {
      message.error('获取货车规划数据失败');
      console.error(result);
    }
    map.handleLoading('');
  });
};

/**
 * 根据坐标点绘制路线图
 * @param {*} map 地图实例
 * @param {*} paths 途径坐标点
 */
const setPolyLine = async (map, paths, zoom = 13) => {
  if (typeof map.handleLoading === 'function') {
    map.handleLoading('路线规划中...');
  } else {
    return false;
  }
  const line = new AMap.Polyline({
    path: paths,
    strokeWeight: 8,
    lineJoin: 'round',
    strokeOpacity: 1,
    strokeColor: '#0091ea',
    showDir: true,
  });
  map.add(line);
  map.setFitView();
  map.setZoom(zoom);
  map.handleLoading('');
};

/**
 * 设置标记点
 * @param {*} map 地图实例
 * @param {*} point 点坐标
 */
const setMarker = async (map, point) => {
  const res = await converFrom({ lnglat: point.toString(), type: 'baidu' });
  if (res.status === '0') return;
  const _point = res.locations.split(',');
  // 先清空历史标记
  map.clearMap();
  const marker = new AMap.Marker({
    map,
    position: _point,
  });
  map.setCenter(_point);
  map.setZoom(14);
};

const setMarkerList = async (map, points) => {
  points.forEach(point => {
    new AMap.Marker({
      map,
      position: point,
    });
  });
  map.setCenter(points[0]);
};

/**
 * 清空地图
 * @param {*} map 地图实例
 */
const clear = map => {
  map.clearMap();
};

// 导出地图组件
export default MapTools;

// 导出函数
export {
  getPlaceSearch,
  converFrom,
  converTo,
  setTruckDriving,
  setPolyLine,
  setMarker,
  setMarkerList,
  clear,
  converTOGD,
};

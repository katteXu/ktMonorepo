const CONFIG = require('../config');
// 概览
console.log('==image==>?', CONFIG.public_path || '没有');
// 首页
const Banner = `${CONFIG.public_path}/image/banner.png`;
const Transport = `${CONFIG.public_path}/image/transport.png`;
const Logistics = `${CONFIG.public_path}/image/logistics.png`;
const Stock = `${CONFIG.public_path}/image/stock.png`;
const Finance = `${CONFIG.public_path}/image/finance.png`;

// 财务中心
const BgCard = `${CONFIG.public_path}/image/bgcard.png`;

// 个人中心
const QrCode = `${CONFIG.public_path}/image/qrcode.png`;
const NoUrl = `${CONFIG.public_path}/image/no-url.png`;

// 运单管理
const EmptyPoundPic = `${CONFIG.public_path}/image/empty_poundPic.jpg`;
const NoPoundPic = `${CONFIG.public_path}/image/noPoundPic.png`;

// 智慧工厂
const Pic1 = `${CONFIG.public_path}/image/pic1.png`;
const Pic2 = `${CONFIG.public_path}/image/pic2.png`;
const Pic3 = `${CONFIG.public_path}/image/pic3.png`;
const Pic4 = `${CONFIG.public_path}/image/pic4.png`;
const FallingPic = `${CONFIG.public_path}/image/falling.png`;

const ChuanSong = `${CONFIG.public_path}/image/chuansong.png`;
const DiBang = `${CONFIG.public_path}/image/dibang.png`;
const TiaoTai = `${CONFIG.public_path}/image/tiaotai.png`;
const FuXuan = `${CONFIG.public_path}/image/fuxuan.png`;
const FenXuan = `${CONFIG.public_path}/image/fenxuan.png`;
const ChuanSongGray = `${CONFIG.public_path}/image/chuansongGrey.png`;
const DiBangGray = `${CONFIG.public_path}/image/dibangGrey.png`;
const TiaoTaiGray = `${CONFIG.public_path}/image/tiaotaiGrey.png`;
const FuXuanGray = `${CONFIG.public_path}/image/fuxuanGrey.png`;
const FenXuanGray = `${CONFIG.public_path}/image/fenxuanGrey.png`;
const HeZi = `${CONFIG.public_path}/image/hezi.png`;

const BlueArr = `${CONFIG.public_path}/image/blueArr.png`;
const GrewArr = `${CONFIG.public_path}/image/grewArr.png`;
const GanShi = `${CONFIG.public_path}/image/ganshi.png`;
const JingMei = `${CONFIG.public_path}/image/jingmei.png`;
const ZhongMei = `${CONFIG.public_path}/image/zhongmei.png`;
const TiaoTaiStatic = `${CONFIG.public_path}/image/tiaotaiStatic.png`;
const TiaoTaiGif = `${CONFIG.public_path}/image/tiaotai.gif`;
const ChuanSongStatic = `${CONFIG.public_path}/image/chuansongStatic.png`;
const ChuanSongGif = `${CONFIG.public_path}/image/chuansong.gif`;
// 其他
const Error404 = `${CONFIG.public_path}/image/error-404.png`;
const Error500 = `${CONFIG.public_path}/image/error-500.png`;

// 个人中心
const InvoiceExample = `${CONFIG.public_path}/image/invoice_example.jpg`;

// 车辆轨迹
const lineFrom = `${CONFIG.public_path}/image/line-from.png`;
const linePlace = `${CONFIG.public_path}/image/line-place.png`;
const lineTo = `${CONFIG.public_path}/image/line-to.png`;

export {
  Banner,
  Transport,
  Logistics,
  Stock,
  Finance,
  lineFrom,
  lineTo,
  linePlace,
  BgCard,
  QrCode,
  NoUrl,
  EmptyPoundPic,
  NoPoundPic,
  Error404,
  Error500,
  InvoiceExample,
  Pic1,
  Pic2,
  Pic3,
  Pic4,
  FallingPic,
  ChuanSong,
  DiBang,
  TiaoTai,
  FuXuan,
  FenXuan,
  ChuanSongGray,
  DiBangGray,
  TiaoTaiGray,
  FuXuanGray,
  FenXuanGray,
  HeZi,
  BlueArr,
  GrewArr,
  GanShi,
  JingMei,
  ZhongMei,
  TiaoTaiStatic,
  TiaoTaiGif,
  ChuanSongStatic,
  ChuanSongGif,
};

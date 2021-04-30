import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
// 概览

// 首页
const Banner = `${publicRuntimeConfig.staticFolder}/image/banner.png`;
const Transport = `${publicRuntimeConfig.staticFolder}/image/transport.png`;
const Logistics = `${publicRuntimeConfig.staticFolder}/image/logistics.png`;
const Stock = `${publicRuntimeConfig.staticFolder}/image/stock.png`;
const Finance = `${publicRuntimeConfig.staticFolder}/image/finance.png`;

// 财务中心
const BgCard = `${publicRuntimeConfig.staticFolder}/image/bgcard.png`;

// 个人中心
const QrCode = `${publicRuntimeConfig.staticFolder}/image/qrcode.png`;
const NoUrl = `${publicRuntimeConfig.staticFolder}/image/no-url.png`;

// 运单管理
const EmptyPoundPic = `${publicRuntimeConfig.staticFolder}/image/empty_poundPic.jpg`;
const NoPoundPic = `${publicRuntimeConfig.staticFolder}/image/noPoundPic.png`;

// 智慧工厂
const Pic1 = `${publicRuntimeConfig.staticFolder}/image/pic1.png`;
const Pic2 = `${publicRuntimeConfig.staticFolder}/image/pic2.png`;
const Pic3 = `${publicRuntimeConfig.staticFolder}/image/pic3.png`;
const Pic4 = `${publicRuntimeConfig.staticFolder}/image/pic4.png`;
const FallingPic = `${publicRuntimeConfig.staticFolder}/image/falling.png`;

const ChuanSong = `${publicRuntimeConfig.staticFolder}/image/chuansong.png`;
const DiBang = `${publicRuntimeConfig.staticFolder}/image/dibang.png`;
const TiaoTai = `${publicRuntimeConfig.staticFolder}/image/tiaotai.png`;
const FuXuan = `${publicRuntimeConfig.staticFolder}/image/fuxuan.png`;
const FenXuan = `${publicRuntimeConfig.staticFolder}/image/fenxuan.png`;
const ChuanSongGray = `${publicRuntimeConfig.staticFolder}/image/chuansongGrey.png`;
const DiBangGray = `${publicRuntimeConfig.staticFolder}/image/dibangGrey.png`;
const TiaoTaiGray = `${publicRuntimeConfig.staticFolder}/image/tiaotaiGrey.png`;
const FuXuanGray = `${publicRuntimeConfig.staticFolder}/image/fuxuanGrey.png`;
const FenXuanGray = `${publicRuntimeConfig.staticFolder}/image/fenxuanGrey.png`;
const HeZi = `${publicRuntimeConfig.staticFolder}/image/hezi.png`;

const BlueArr = `${publicRuntimeConfig.staticFolder}/image/blueArr.png`;
const GrewArr = `${publicRuntimeConfig.staticFolder}/image/grewArr.png`;
const GanShi = `${publicRuntimeConfig.staticFolder}/image/ganshi.png`;
const JingMei = `${publicRuntimeConfig.staticFolder}/image/jingmei.png`;
const ZhongMei = `${publicRuntimeConfig.staticFolder}/image/zhongmei.png`;
const TiaoTaiStatic = `${publicRuntimeConfig.staticFolder}/image/tiaotaiStatic.png`;
const TiaoTaiGif = `${publicRuntimeConfig.staticFolder}/image/tiaotai.gif`;
const ChuanSongStatic = `${publicRuntimeConfig.staticFolder}/image/chuansongStatic.png`;
const ChuanSongGif = `${publicRuntimeConfig.staticFolder}/image/chuansong.gif`;
// 其他
const Error404 = `${publicRuntimeConfig.staticFolder}/image/error-404.png`;
const Error500 = `${publicRuntimeConfig.staticFolder}/image/error-500.png`;

// 个人中心
const InvoiceExample = `${publicRuntimeConfig.staticFolder}/image/invoice_example.jpg`;

// 车辆轨迹
const lineFrom = `${publicRuntimeConfig.staticFolder}/image/line-from.png`;
const linePlace = `${publicRuntimeConfig.staticFolder}/image/line-place.png`;
const lineTo = `${publicRuntimeConfig.staticFolder}/image/line-to.png`;

// 过磅管理
const SettlmentEmpty = `${publicRuntimeConfig.staticFolder}/image/settlment-empty.png`;
const SettlmentLeftBg = `${publicRuntimeConfig.staticFolder}/image/settlment-left.png`;
const SettlmentRightBg = `${publicRuntimeConfig.staticFolder}/image/settlment-right.png`;
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
  SettlmentEmpty,
  SettlmentLeftBg,
  SettlmentRightBg,
};

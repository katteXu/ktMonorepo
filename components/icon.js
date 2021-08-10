import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
const Logo = `${publicRuntimeConfig.staticFolder}/icon/logo.svg`;
const Transport = `${publicRuntimeConfig.staticFolder}/icon/transport-icon.svg`;
const Logistics = `${publicRuntimeConfig.staticFolder}/icon/logistics-icon.svg`;
const Stock = `${publicRuntimeConfig.staticFolder}/icon/stock-icon.svg`;
const Finance = `${publicRuntimeConfig.staticFolder}/icon/finance-icon.svg`;
const User = `${publicRuntimeConfig.staticFolder}/icon/user-icon.svg`;
const People = `${publicRuntimeConfig.staticFolder}/icon/people.svg`;
const Phone = `${publicRuntimeConfig.staticFolder}/icon/phone.svg`;
const LinkIcon = `${publicRuntimeConfig.staticFolder}/fx.ico`;
// 概览
const Wallet = `${publicRuntimeConfig.staticFolder}/icon/wallet.svg`;
const Day = `${publicRuntimeConfig.staticFolder}/icon/day.svg`;
const Month = `${publicRuntimeConfig.staticFolder}/icon/month.svg`;
const Cumulative = `${publicRuntimeConfig.staticFolder}/icon/cumulative.svg`;

const Blue = `${publicRuntimeConfig.staticFolder}/icon/icon-blue.svg`;
const Red = `${publicRuntimeConfig.staticFolder}/icon/icon-red.svg`;
const Yellow = `${publicRuntimeConfig.staticFolder}/icon/icon-yellow.svg`;
const Green = `${publicRuntimeConfig.staticFolder}/icon/icon-green.svg`;

const ShowIcon = `${publicRuntimeConfig.staticFolder}/icon/show.svg`;
const HideIcon = `${publicRuntimeConfig.staticFolder}/icon/hide.svg`;
const FromIcon = `${publicRuntimeConfig.staticFolder}/icon/fromIcon.svg`;
const ToIcon = `${publicRuntimeConfig.staticFolder}/icon/toIcon.svg`;
const DeployIcon = `${publicRuntimeConfig.staticFolder}/icon/deploy-icon.svg`;
const TransportViewIcon = `${publicRuntimeConfig.staticFolder}/icon/transport-view-icon.svg`;
const RailWayIcon = `${publicRuntimeConfig.staticFolder}/icon/rail-way-icon.svg`;
const RecordIcon = `${publicRuntimeConfig.staticFolder}/icon/record-icon.svg`;
const BillIcon = `${publicRuntimeConfig.staticFolder}/icon/bill-icon.svg`;
const PointIcon = `${publicRuntimeConfig.staticFolder}/icon/point.svg`;
// 运单管理
const TransportIcon = `${publicRuntimeConfig.staticFolder}/icon/transportIcon.svg`;
const RouteIcon = `${publicRuntimeConfig.staticFolder}/icon/routeIcon.svg`;
const SpeakerIcon = `${publicRuntimeConfig.staticFolder}/icon/speakerIcon.svg`;
const CarIcon = `${publicRuntimeConfig.staticFolder}/icon/carIcon.svg`;

// 智慧工厂
const ArrowIcon = `${publicRuntimeConfig.staticFolder}/icon/blue-arrow.svg`;
const TotalPic = `${publicRuntimeConfig.staticFolder}/icon/total.svg`;
const CleanCoalPic = `${publicRuntimeConfig.staticFolder}/icon/cleanCoal.svg`;
const ConnectionIcon = `${publicRuntimeConfig.staticFolder}/icon/connection.svg`;
const NoConnectionIcon = `${publicRuntimeConfig.staticFolder}/icon/notConnected.svg`;
// 个人中心
const VerifyNone = `${publicRuntimeConfig.staticFolder}/icon/verify_none.svg`;
const VerifyIcon = `${publicRuntimeConfig.staticFolder}/icon/verify.svg`;

// 过磅管理
const SettlmentLeftIcon = `${publicRuntimeConfig.staticFolder}/icon/settlment-left-icon.svg`;
const SettlmentRightIcon = `${publicRuntimeConfig.staticFolder}/icon/settlment-right-icon.svg`;

// 库存管理
const WareHousing = `${publicRuntimeConfig.staticFolder}/icon/warehousing.svg`;
const Weighting = `${publicRuntimeConfig.staticFolder}/icon/weighing.svg`;
const Washing = `${publicRuntimeConfig.staticFolder}/icon/washing.svg`;
const Blending = `${publicRuntimeConfig.staticFolder}/icon/blending.svg`;

export {
  LinkIcon,
  Logo,
  People,
  Phone,
  Transport,
  Logistics,
  Stock,
  Finance,
  User,
  Wallet,
  Day,
  Month,
  Cumulative,
  Blue,
  Red,
  Yellow,
  Green,
  TransportIcon,
  RouteIcon,
  SpeakerIcon,
  CarIcon,
  VerifyNone,
  VerifyIcon,
  ArrowIcon,
  TotalPic,
  CleanCoalPic,
  SettlmentLeftIcon,
  SettlmentRightIcon,
  WareHousing,
  Weighting,
  Washing,
  Blending,
  ConnectionIcon,
  NoConnectionIcon,
  ShowIcon,
  HideIcon,
  FromIcon,
  ToIcon,
  DeployIcon,
  TransportViewIcon,
  RailWayIcon,
  RecordIcon,
  BillIcon,
  PointIcon,
};

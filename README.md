## 安装依赖
```
yarn install
```

## 服务启动
```
yarn build && yarn export && yarn server
```
## 开发启动 包含热更新
```
yarn dev
```

## 项目部署 包含环境变量配置
```
yarn build && yarn export && pm2 startOrRestart ecosystem.config.js --env dev
```

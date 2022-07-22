## 安装依赖
```
yarn install
```

## 服务启动
```
yarn start
```
## 开发启动 包含热更新
```
yarn dev
```

## 项目部署 包含环境变量配置
1. 打包项目生成静态页面
2. pm2启动
3. 配置nginx反向代理 (可选)
```
yarn build && yarn export && pm2 startOrRestart ecosystem.config.js --env dev
```

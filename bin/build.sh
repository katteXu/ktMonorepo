echo --------------------------开始构建\<$1\>--------------------------

# 删除冗余资源
rm -rf node_modules
rm -rf out/_next
# rm -rf out/icon
# rm -rf out/image

# 安装服务端依赖
yarn install --production
echo --------------------------结束构建\<$1\>--------------------------


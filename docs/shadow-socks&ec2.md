# shadow-socks & ec2 配置
## aws ec2 创建实例
1. 选择亚太地区
2. 选择启动服务
3. 选择ami-05b3bcf7f311194b3（amazon linux 带有Python、Ruby、Perl以及java支持的）
4. 选择安全组，开放10978端口（该端口可以自己定义，后边配置shadow-socks的时候，启用该端口就行了）

## 链接ec2
1. [Amazon EC2 密钥对](https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/ec2-key-pairs.html#having-ec2-create-your-key-pair)
2. copy你的ec2实例的ip地址
3. 执行命令： ssh -i *绝对路径，或者相对路径你的pem文件的地址* ec2-user@*copy的你的远程地址*

## 创建shadow-socks实例
```
mkdir ssh
cd ssh
wget --no-check-certificate -O shadowsocks.sh https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks.sh
chmod +x shadowsocks.sh
./shadowsocks.sh 2>&1 | tee shadowsocks.log
```

配置信息

```
Congratulations, Shadowsocks-python server install completed!
Your Server IP        :your_server_ip
Your Server Port      :your_server_port
Your Password         :your_password
Your Encryption Method:your_encryption_method

Welcome to visit:https://teddysun.com/342.html
Enjoy it!
```

**注意：** port需要选定你在安全组开放的端口，否则访问不了服务器。



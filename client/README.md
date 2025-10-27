# 组织架构API客户端 (Drogon)

这是一个使用Drogon框架构建的HTTP客户端程序，用于测试和操作组织架构API。

## 特性

- 🚀 **Drogon HTTP客户端** - 使用Drogon框架的HttpClient
- 🔐 **JWT认证** - 支持Bearer token认证
- 📊 **JSON处理** - 内置JSON解析和格式化
- 🎯 **完整CRUD操作** - 支持所有API操作
- 💻 **交互式界面** - 用户友好的命令行菜单

## 依赖要求

- C++17 或更高版本
- Drogon框架 (已包含在项目中)
- CMake 3.5 或更高版本

## 编译和运行

### 1. 编译客户端

```bash
cd client
mkdir build && cd build
cmake ..
make
```

### 2. 运行客户端

```bash
./bin/client
```

## 使用方法

### 1. 启动服务端

确保组织架构API服务器正在运行在 `http://localhost:3000`

### 2. 运行客户端

```bash
./bin/client
```

### 3. 登录

- 选择选项 1
- 输入用户名: `admin`
- 输入密码: `password`

### 4. 使用功能

- **选项 2**: 获取所有人员 (无需认证)
- **选项 3**: 获取所有部门 (需要认证)
- **选项 4**: 获取所有职位 (需要认证)
- **选项 5**: 添加人员 (需要认证)
- **选项 6**: 添加部门 (需要认证)
- **选项 7**: 添加职位 (需要认证)
- **选项 8**: 退出登录
- **选项 0**: 退出程序

## API端点支持

### 认证
- `POST /auth/login` - 用户登录

### 人员管理
- `GET /persons` - 获取所有人员
- `POST /persons` - 添加人员

### 部门管理 (需要认证)
- `GET /departments` - 获取所有部门
- `POST /departments` - 添加部门

### 职位管理 (需要认证)
- `GET /jobs` - 获取所有职位
- `POST /jobs` - 添加职位

## 技术实现

### Drogon HTTP客户端

```cpp
// 创建HTTP请求
auto req = HttpRequest::newHttpJsonRequest(jsonData);
req->setMethod(drogon::Post);
req->setPath("/auth/login");

// 发送请求
auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);

// 处理响应
if (resp->getStatusCode() == HttpStatusCode::k200OK) {
    auto json = resp->getJsonObject();
    // 处理JSON响应
}
```

### JWT认证

```cpp
// 添加认证头
req->addHeader("Authorization", "Bearer " + authToken);
```

### JSON处理

```cpp
// 创建JSON数据
Json::Value loginData;
loginData["username"] = username;
loginData["password"] = password;

// 解析JSON响应
auto json = resp->getJsonObject();
if (json && json->isMember("token")) {
    authToken = (*json)["token"].asString();
}
```

## 项目结构

```
client/
├── CMakeLists.txt    # CMake构建配置
├── main.cc          # 主程序文件
├── config.json      # 配置文件 (未使用)
├── build/           # 构建目录
└── README.md        # 说明文档
```

## 优势

1. **统一框架** - 与服务端使用相同的Drogon框架
2. **高性能** - Drogon的异步HTTP客户端
3. **类型安全** - 强类型的JSON处理
4. **易于扩展** - 可以轻松添加新的API端点
5. **错误处理** - 完善的HTTP状态码处理

## 故障排除

### 编译错误
- 确保Drogon框架已正确安装
- 检查CMake版本是否满足要求

### 连接错误
- 确保API服务器正在运行
- 检查服务器地址和端口

### 认证错误
- 确保用户名和密码正确
- 检查token是否过期

## 扩展功能

可以轻松添加以下功能：

- 更新和删除操作
- 批量操作
- 文件上传
- WebSocket支持
- 异步操作
- 连接池管理

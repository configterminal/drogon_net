# Windows平台编译指南 - 从源码编译

## 环境要求

### 必需软件
- **Visual Studio 2019 或更高版本** (推荐 2022) - 包含 MSVC 编译器
- **CMake 3.5 或更高版本**
- **PostgreSQL** (服务端需要) - https://www.postgresql.org/download/windows/
- **Git**
- **OpenSSL** - https://slproweb.com/products/Win32OpenSSL.html

### 安装顺序
1. 安装 Visual Studio (选择 C++ 桌面开发)
2. 安装 CMake
3. 安装 PostgreSQL
4. 安装 OpenSSL
5. 安装 Git

## 编译步骤 - 从源码编译

项目已经包含了所有第三方库的源码（在 `third_party` 目录），无需额外安装。

### 1. 克隆项目

```powershell
git clone <your-repo-url>
cd orgChartApi
```

### 2. 安装依赖库

虽然使用源码编译，但需要系统的运行时库：

#### 安装 OpenSSL

**方式一：使用预编译版本**

下载并安装 Win32 OpenSSL:
- 选择 64位版本
- 安装到 `C:\OpenSSL-Win64`
- 将 `C:\OpenSSL-Win64\bin` 添加到 PATH

**方式二：从源码编译**

项目已包含 OpenSSL 源码：
```powershell
cd server\third_party\openssl
# 需要 Perl 和 NASM
perl Configure VC-WIN64A
nmake
# 编译后库文件在 out32dll 目录
```

#### 安装 PostgreSQL

- 下载并安装 PostgreSQL
- 记住管理员密码
- 确保 `psql` 命令可用

### 3. 编译服务端

```powershell
cd server

# 创建构建目录
mkdir build
cd build

# 配置 CMake
cmake ..

# 编译
cmake --build . --config Release

# 可执行文件在: server/build/Release/org_chart.exe
```

### 4. 编译客户端

```powershell
cd ../../client

# 创建构建目录
mkdir build
cd build

# 配置 CMake
cmake ..

# 编译
cmake --build . --config Release

# 可执行文件在: client/build/bin/Release/org_chart_client.exe
```

## 使用 Visual Studio 编译

### 方法 1: 使用 CMake GUI

1. 打开 CMake GUI
2. 设置源码目录: `C:\path\to\orgChartApi\server`
3. 设置构建目录: `C:\path\to\orgChartApi\server\build`
4. 点击 Configure
5. 选择 Visual Studio 2019 或 2022
6. 点击 Generate
7. 点击 Open Project
8. 在 Visual Studio 中按 F5 运行

### 方法 2: 使用 Visual Studio 的 CMake 集成

1. 打开 Visual Studio 2019/2022
2. 选择 "打开文件夹"
3. 选择 `orgChartApi/server` 或 `orgChartApi/client`
4. Visual Studio 会自动检测 CMakeLists.txt
5. 等待 IntelliSense 完成
6. 按 F5 运行

## 配置说明

### 路径配置

在 Windows 上，由于路径分隔符不同，项目已自动处理：

```cpp
// main.cc 中的路径处理会自动适配 Windows
#ifdef _WIN32
    std::filesystem::path configPath = std::filesystem::current_path().parent_path() / "config.json";
#else
    std::filesystem::path configPath = "../config.json";
#endif
```

### 数据库连接

在 `server/config.json` 中配置数据库连接：

```json
"db_clients": [
    {
        "rdbms": "postgresql",
        "host": "127.0.0.1",
        "port": 5432,
        "dbname": "org_chart",
        "user": "postgres",
        "passwd": "your_password",
        "number_of_connections": 1,
        "timeout": -1.0
    }
]
```

### 运行时依赖

Windows 可执行文件需要以下 DLL：

- `libssl-3.dll` - OpenSSL
- `libcrypto-3.dll` - OpenSSL
- `libpq.dll` - PostgreSQL 客户端库

这些 DLL 通常位于：
- `C:\OpenSSL-Win64\bin`
- `C:\Program Files\PostgreSQL\14\bin`

确保这些目录在 PATH 中，或将 DLL 复制到可执行文件目录。

## 故障排除

### 问题 1: 找不到 OpenSSL

```
错误: Could NOT find OpenSSL
```

**解决方案**:
- 确保 OpenSSL 已安装
- 设置环境变量 `OPENSSL_ROOT_DIR=C:\OpenSSL-Win64`
- 或者在 CMake GUI 中添加

### 问题 2: 找不到 PostgreSQL

```
错误: Could NOT find PostgreSQL
```

**解决方案**:
- 确保 PostgreSQL 已安装
- 设置环境变量 `PostgreSQL_ROOT=C:\Program Files\PostgreSQL\14`
- 或者在 CMake GUI 中添加

### 问题 3: libbcrypt 编译错误

Windows 上的 libbcrypt 可能需要特定配置。

**解决方案**:
- 使用预编译的 bcrypt DLL
- 或跳过 bcrypt，只编译服务端

### 问题 4: MSVC 编译器警告

```
警告: C4996: 'std::filesystem::path::string'
```

**解决方案**:
- 已在 CMakeLists.txt 中添加 `_CRT_SECURE_NO_WARNINGS`
- 使用 `std::filesystem::path::u8string()` 替代

## 快速验证

编译成功后，运行以下命令验证：

```powershell
# 检查可执行文件
dir server\build\Release\org_chart.exe
dir client\build\bin\Release\org_chart_client.exe

# 运行服务端
cd server\build\Release
.\org_chart.exe

# 运行客户端
cd ..\..\..\client\build\bin\Release
.\org_chart_client.exe
```

## 使用预编译版本（备选）

如果从源码编译遇到问题，可以使用 WSL：

```powershell
# 安装 WSL
wsl --install

# 在 WSL 中编译
wsl
cd /mnt/c/path/to/orgChartApi
cd server
./build.sh
```

## 参考

- Drogon 官方文档: https://drogon.docsforge.com/
- CMake 文档: https://cmake.org/documentation/
- Visual Studio CMake 集成: https://docs.microsoft.com/zh-cn/cpp/build/cmake-projects-in-visual-studio
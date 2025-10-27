# OpenSSL 集成说明

本文档说明如何在项目中编译和使用 OpenSSL。

## 目录结构

OpenSSL 源码位于 `server/third_party/openssl/`。

## 编译 OpenSSL

### Linux/MacOS

```bash
cd server/third_party/openssl

# 配置
./Configure

# 编译
make -j$(nproc)

# 安装到本地目录（可选）
make install
```

### Windows

使用 Visual Studio 的开发者命令提示符：

```powershell
cd server\third_party\openssl

# 配置（64位）
perl Configure VC-WIN64A

# 编译
nmake

# 安装（可选）
nmake install
```

## 在项目中使用 OpenSSL

### 方式一：使用系统已安装的 OpenSSL

如果系统已安装 OpenSSL（通过包管理器如 apt、brew 等），CMake 会自动找到。

```bash
cd server/build
cmake ..
make
```

### 方式二：使用第三方库中的 OpenSSL

1. 首先编译 OpenSSL（见上文）

2. 配置 CMake 使用本地 OpenSSL：

```bash
cd server/build
cmake -DOPENSSL_ROOT_DIR=../third_party/openssl ..
make
```

## 注意事项

1. **Windows 上的 OpenSSL 编译需要 Perl 和 NASM**
   - 下载 Perl: https://www.perl.org/get.html
   - 下载 NASM: https://www.nasm.us/

2. **编译时间**
   - OpenSSL 编译需要较长时间，请耐心等待
   - 使用 `-j` 参数可以并行编译

3. **依赖关系**
   - OpenSSL 是 Drogon 和 jwt-cpp 的可选依赖
   - 如果不编译 OpenSSL，项目会使用内置的加密函数（仅 MD5 和 SHA1）

4. **版本兼容性**
   - 建议使用 OpenSSL 3.x 或 1.1.1
   - 该项目已测试兼容 OpenSSL 1.1.1 和 3.x

## 故障排除

### 找不到 OpenSSL

如果 CMake 找不到 OpenSSL，手动指定路径：

```bash
cmake -DOPENSSL_ROOT_DIR=/path/to/openssl -DOPENSSL_LIBRARIES=/path/to/openssl/lib ..
```

### Windows DLL 问题

编译完成后，将以下 DLL 复制到可执行文件目录：
- `libssl-3.dll` 或 `libssl-1_1.dll`
- `libcrypto-3.dll` 或 `libcrypto-1_1.dll`

或将这些目录添加到 PATH：
- `C:\OpenSSL-Win64\bin`
- 编译后的 OpenSSL 的 `bin` 目录

# VS Code 调试配置说明

## 📁 配置文件

本项目已配置好VS Code的调试环境，包含以下文件：

- `.vscode/launch.json` - 调试配置
- `.vscode/tasks.json` - 构建任务
- `.vscode/c_cpp_properties.json` - C++ IntelliSense配置
- `.vscode/settings.json` - 工作区设置

## 🚀 使用方法

### 1. 运行程序
- 按 `F5` 或点击"运行和调试"面板
- 选择 **"运行 org_chart"** 配置
- 程序将以Release模式运行

### 2. 调试程序
- 按 `F5` 或点击"运行和调试"面板
- 选择 **"调试 org_chart"** 配置
- 程序将以Debug模式运行，支持断点调试

### 3. 构建任务
- 按 `Ctrl+Shift+P` 打开命令面板
- 输入 "Tasks: Run Task"
- 选择以下任务之一：
  - `build` - 构建项目 (Release)
  - `build-debug` - 构建项目 (Debug)
  - `clean` - 清理构建文件
  - `rebuild` - 完全重新构建

## 🔧 调试功能

### 断点设置
- 在代码行号左侧点击设置断点
- 支持条件断点、日志断点等高级功能

### 调试控制
- `F5` - 继续执行
- `F10` - 单步跳过
- `F11` - 单步进入
- `Shift+F11` - 单步跳出
- `Ctrl+Shift+F5` - 重启调试

### 变量查看
- 在"变量"面板查看局部变量
- 在"监视"面板添加表达式
- 悬停查看变量值

## 📋 快捷键

| 快捷键 | 功能 |
|--------|------|
| `F5` | 开始调试/运行 |
| `Ctrl+F5` | 运行（不调试） |
| `Shift+F5` | 停止调试 |
| `Ctrl+Shift+P` | 命令面板 |
| `Ctrl+Shift+` ` | 打开终端 |

## ⚠️ 注意事项

1. **数据库连接**：程序需要PostgreSQL数据库服务运行
2. **配置文件**：确保 `config.json` 中的数据库配置正确
3. **权限问题**：如果遇到权限问题，检查文件权限设置

## 🐛 常见问题

### 调试器无法启动
- 确保安装了gdb：`sudo apt install gdb`
- 检查程序路径是否正确

### IntelliSense不工作
- 重新加载窗口：`Ctrl+Shift+P` → "Developer: Reload Window"
- 检查 `compile_commands.json` 是否存在

### 构建失败
- 检查CMake配置：`cmake .. -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`
- 确保所有依赖库已安装

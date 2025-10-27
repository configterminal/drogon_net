#include <drogon/drogon.h>
#include <filesystem>

int main() {
    LOG_DEBUG << "Load config file";
    
    // 跨平台路径处理
    #ifdef _WIN32
        std::filesystem::path configPath = std::filesystem::current_path().parent_path() / "config.json";
    #else
        std::filesystem::path configPath = "../config.json";
    #endif
    
    drogon::app().loadConfigFile(configPath.string());

    LOG_DEBUG << "running on localhost:3000";
    drogon::app().run();
    return 0;
}

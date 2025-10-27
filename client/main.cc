#include <drogon/drogon.h>
#include <iostream>
#include <string>
#include <json/json.h>

using namespace drogon;
using namespace std;

class OrgChartClient {
private:
    string baseUrl;
    string authToken;
    
public:
    OrgChartClient(const string& url = "http://localhost:3000") : baseUrl(url) {}
    
    // 登录并获取认证token
    bool login(const string& username, const string& password) {
        Json::Value loginData;
        loginData["username"] = username;
        loginData["password"] = password;
        
        auto req = HttpRequest::newHttpJsonRequest(loginData);
        req->setMethod(drogon::Post);
        req->setPath("/auth/login");
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            auto json = resp.second->getJsonObject();
            if (json && json->isMember("token")) {
                authToken = (*json)["token"].asString();
                cout << "登录成功! Token: " << authToken.substr(0, 20) << "..." << endl;
                return true;
            }
        }
        cout << "登录失败: " << string(resp.second->getBody()) << endl;
        return false;
    }
    
    // 登出
    void logout() {
        authToken.clear();
        cout << "已退出登录" << endl;
    }
    
    // 检查是否已认证
    bool isAuthenticated() const {
        return !authToken.empty();
    }
    
    // 获取所有人员
    void getPersons() {
        auto req = HttpRequest::newHttpRequest();
        req->setMethod(drogon::Get);
        req->setPath("/persons");
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            cout << "\n=== 所有人员 ===" << endl;
            printJson(string(resp.second->getBody()));
        } else {
            cout << "获取人员失败: " << string(resp.second->getBody()) << endl;
        }
    }
    
    // 获取所有部门
    void getDepartments() {
        if (!isAuthenticated()) {
            cout << "请先登录!" << endl;
            return;
        }
        
        auto req = HttpRequest::newHttpRequest();
        req->setMethod(drogon::Get);
        req->setPath("/departments");
        req->addHeader("Authorization", "Bearer " + authToken);
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            cout << "\n=== 所有部门 ===" << endl;
            printJson(string(resp.second->getBody()));
        } else {
            cout << "获取部门失败: " << string(resp.second->getBody()) << endl;
        }
    }
    
    // 获取所有职位
    void getJobs() {
        if (!isAuthenticated()) {
            cout << "请先登录!" << endl;
            return;
        }
        
        auto req = HttpRequest::newHttpRequest();
        req->setMethod(drogon::Get);
        req->setPath("/jobs");
        req->addHeader("Authorization", "Bearer " + authToken);
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            cout << "\n=== 所有职位 ===" << endl;
            printJson(string(resp.second->getBody()));
        } else {
            cout << "获取职位失败: " << string(resp.second->getBody()) << endl;
        }
    }
    
    // 添加人员
    void addPerson() {
        if (!isAuthenticated()) {
            cout << "请先登录!" << endl;
            return;
        }
        
        string firstName, lastName, hireDate;
        int departmentId, jobId, managerId;
        
        cout << "请输入名字: ";
        cin >> firstName;
        cout << "请输入姓氏: ";
        cin >> lastName;
        cout << "请输入入职日期 (YYYY-MM-DD): ";
        cin >> hireDate;
        cout << "请输入部门ID: ";
        cin >> departmentId;
        cout << "请输入职位ID: ";
        cin >> jobId;
        cout << "请输入经理ID: ";
        cin >> managerId;
        
        Json::Value personData;
        personData["first_name"] = firstName;
        personData["last_name"] = lastName;
        personData["hire_date"] = hireDate;
        personData["department_id"] = departmentId;
        personData["job_id"] = jobId;
        personData["manager_id"] = managerId;
        
        auto req = HttpRequest::newHttpJsonRequest(personData);
        req->setMethod(drogon::Post);
        req->setPath("/persons");
        req->addHeader("Authorization", "Bearer " + authToken);
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            cout << "人员添加成功!" << endl;
        } else {
            cout << "人员添加失败: " << string(resp.second->getBody()) << endl;
        }
    }
    
    // 添加部门
    void addDepartment() {
        if (!isAuthenticated()) {
            cout << "请先登录!" << endl;
            return;
        }
        
        string name;
        cout << "请输入部门名称: ";
        cin >> name;
        
        Json::Value deptData;
        deptData["name"] = name;
        
        auto req = HttpRequest::newHttpJsonRequest(deptData);
        req->setMethod(drogon::Post);
        req->setPath("/departments");
        req->addHeader("Authorization", "Bearer " + authToken);
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            cout << "部门添加成功!" << endl;
        } else {
            cout << "部门添加失败: " << string(resp.second->getBody()) << endl;
        }
    }
    
    // 添加职位
    void addJob() {
        if (!isAuthenticated()) {
            cout << "请先登录!" << endl;
            return;
        }
        
        string title;
        cout << "请输入职位名称: ";
        cin >> title;
        
        Json::Value jobData;
        jobData["title"] = title;
        
        auto req = HttpRequest::newHttpJsonRequest(jobData);
        req->setMethod(drogon::Post);
        req->setPath("/jobs");
        req->addHeader("Authorization", "Bearer " + authToken);
        
        auto resp = HttpClient::newHttpClient(baseUrl)->sendRequest(req);
        if (resp.first == ReqResult::Ok && resp.second->getStatusCode() == HttpStatusCode::k200OK) {
            cout << "职位添加成功!" << endl;
        } else {
            cout << "职位添加失败: " << string(resp.second->getBody()) << endl;
        }
    }
    
    // 打印格式化的JSON
    void printJson(const string& jsonStr) {
        Json::Value root;
        Json::Reader reader;
        if (reader.parse(jsonStr, root)) {
            Json::StreamWriterBuilder builder;
            builder["indentation"] = "  ";
            unique_ptr<Json::StreamWriter> writer(builder.newStreamWriter());
            writer->write(root, &cout);
            cout << endl;
        } else {
            cout << jsonStr << endl;
        }
    }
};

void printMenu() {
    cout << "\n=== 组织架构API客户端 (Drogon) ===" << endl;
    cout << "1. 登录" << endl;
    cout << "2. 获取所有人员" << endl;
    cout << "3. 获取所有部门" << endl;
    cout << "4. 获取所有职位" << endl;
    cout << "5. 添加人员" << endl;
    cout << "6. 添加部门" << endl;
    cout << "7. 添加职位" << endl;
    cout << "8. 退出登录" << endl;
    cout << "0. 退出程序" << endl;
    cout << "请选择操作: ";
}

int main() {
    OrgChartClient client;
    int choice;
    string username, password;
    
    while (true) {
        printMenu();
        cin >> choice;
        
        switch (choice) {
            case 1: {
                cout << "请输入用户名: ";
                cin >> username;
                cout << "请输入密码: ";
                cin >> password;
                
                if (client.login(username, password)) {
                    cout << "登录成功!" << endl;
                } else {
                    cout << "登录失败!" << endl;
                }
                break;
            }
            
            case 2:
                client.getPersons();
                break;
                
            case 3:
                client.getDepartments();
                break;
                
            case 4:
                client.getJobs();
                break;
                
            case 5:
                client.addPerson();
                break;
                
            case 6:
                client.addDepartment();
                break;
                
            case 7:
                client.addJob();
                break;
                
            case 8:
                client.logout();
                break;
                
            case 0:
                cout << "再见!" << endl;
                return 0;
                
            default:
                cout << "无效选择，请重试!" << endl;
                break;
        }
    }
}

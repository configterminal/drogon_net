#pragma once

#include <string>
#include <memory>
#include <json/json.h>
#include "NetworkClient.h"

class OrgChartClient {
private:
    std::string baseUrl;
    std::string authToken;
    NetworkClient networkClient;

public:
    // Constructor
    explicit OrgChartClient(const std::string& url = "http://localhost:3000");
    
    // Destructor
    ~OrgChartClient() = default;

    // Authentication
    bool login(const std::string& username, const std::string& password);
    void logout();
    bool isAuthenticated() const { return !authToken.empty(); }

    // Person operations
    std::string getPersons();
    std::string getPerson(int id);
    bool addPerson(const std::string& firstName, const std::string& lastName, 
                   const std::string& hireDate, int departmentId, int jobId, int managerId);
    bool updatePerson(int id, const std::string& firstName, const std::string& lastName, 
                     const std::string& hireDate, int departmentId, int jobId, int managerId);
    bool deletePerson(int id);

    // Department operations (requires authentication)
    std::string getDepartments();
    std::string getDepartment(int id);
    bool addDepartment(const std::string& name);
    bool updateDepartment(int id, const std::string& name);
    bool deleteDepartment(int id);
    std::string getDepartmentPersons(int departmentId);

    // Job operations (requires authentication)
    std::string getJobs();
    std::string getJob(int id);
    bool addJob(const std::string& title);
    bool updateJob(int id, const std::string& title);
    bool deleteJob(int id);
    std::string getJobPersons(int jobId);

    // Utility functions
    void printJson(const std::string& jsonStr);
    std::string getAuthToken() const { return authToken; }
    void setBaseUrl(const std::string& url) { baseUrl = url; }

private:
    // Helper methods
    std::string makeRequest(const std::string& endpoint, const std::string& method = "GET", 
                           const std::string& data = "", bool requireAuth = false);
    void setAuthHeaders(struct curl_slist*& headers);
};

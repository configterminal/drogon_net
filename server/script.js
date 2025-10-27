// 全局变量
let currentUser = null;
let authToken = null;
const API_BASE = 'http://localhost:3000';

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有保存的认证令牌
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        showMainApp();
        loadDashboard();
    } else {
        showLoginModal();
    }
    
    // 绑定事件监听器
    bindEventListeners();
});

// 绑定事件监听器
function bindEventListeners() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 注册表单
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 人员表单
    document.getElementById('personForm').addEventListener('submit', handlePersonSubmit);
    
    // 部门表单
    document.getElementById('departmentForm').addEventListener('submit', handleDepartmentSubmit);
    
    // 职位表单
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmit);
    
    // 导航菜单
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
}

// API请求封装
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(`${API_BASE}${url}`, finalOptions);
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                throw new Error('认证失败，请重新登录');
            }
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API请求失败:', error);
        showMessage(error.message, 'error');
        throw error;
    }
}

// 显示消息
function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    const messageTextEl = document.getElementById('messageText');
    
    messageTextEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    document.getElementById('message').classList.add('hidden');
}

// 显示加载状态
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// 模态框控制
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
}

function showRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').classList.add('show');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('show');
}

function showMainApp() {
    document.getElementById('mainApp').classList.remove('hidden');
    closeLoginModal();
    closeRegisterModal();
}

// 认证相关
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        showLoading();
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        authToken = response.token;
        localStorage.setItem('authToken', authToken);
        currentUser = userData.username;
        
        showMainApp();
        loadDashboard();
        showMessage('登录成功！', 'success');
    } catch (error) {
        showMessage('登录失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        showLoading();
        await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        closeRegisterModal();
        showLoginModal();
        showMessage('注册成功！请登录', 'success');
    } catch (error) {
        showMessage('注册失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    document.getElementById('mainApp').classList.add('hidden');
    showLoginModal();
}

// 标签页切换
function switchTab(tabName) {
    // 更新导航菜单
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 更新内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // 加载对应数据
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'persons':
            loadPersons();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'jobs':
            loadJobs();
            break;
        case 'orgchart':
            loadOrgChart();
            break;
    }
}

// 仪表板
async function loadDashboard() {
    try {
        showLoading();
        const [persons, departments, jobs] = await Promise.all([
            apiRequest('/persons'),
            apiRequest('/departments'),
            apiRequest('/jobs')
        ]);
        
        document.getElementById('totalPersons').textContent = persons.length;
        document.getElementById('totalDepartments').textContent = departments.length;
        document.getElementById('totalJobs').textContent = jobs.length;
        
        // 计算管理人员数量（有下属的人员）
        const managers = persons.filter(person => 
            persons.some(p => p.manager_id === person.id)
        );
        document.getElementById('totalManagers').textContent = managers.length;
        
    } catch (error) {
        showMessage('加载仪表板数据失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 人员管理
async function loadPersons() {
    try {
        showLoading();
        const persons = await apiRequest('/persons');
        const departments = await apiRequest('/departments');
        const jobs = await apiRequest('/jobs');
        
        const tbody = document.getElementById('personsTableBody');
        tbody.innerHTML = '';
        
        persons.forEach(person => {
            const department = departments.find(d => d.id === person.department_id);
            const job = jobs.find(j => j.id === person.job_id);
            const manager = persons.find(p => p.id === person.manager_id);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${person.id}</td>
                <td>${person.first_name} ${person.last_name}</td>
                <td>${department ? department.name : '未知'}</td>
                <td>${job ? job.title : '未知'}</td>
                <td>${manager ? `${manager.first_name} ${manager.last_name}` : '无'}</td>
                <td>${new Date(person.hire_date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline" onclick="editPerson(${person.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deletePerson(${person.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        showMessage('加载人员数据失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showAddPersonModal() {
    document.getElementById('personModalTitle').textContent = '添加人员';
    document.getElementById('personForm').reset();
    document.getElementById('personId').value = '';
    loadPersonFormData();
    document.getElementById('personModal').classList.add('show');
}

async function editPerson(id) {
    try {
        showLoading();
        const person = await apiRequest(`/persons/${id}`);
        
        document.getElementById('personModalTitle').textContent = '编辑人员';
        document.getElementById('personId').value = person.id;
        document.getElementById('firstName').value = person.first_name;
        document.getElementById('lastName').value = person.last_name;
        document.getElementById('hireDate').value = person.hire_date;
        document.getElementById('departmentSelect').value = person.department_id;
        document.getElementById('jobSelect').value = person.job_id;
        document.getElementById('managerSelect').value = person.manager_id;
        
        loadPersonFormData();
        document.getElementById('personModal').classList.add('show');
    } catch (error) {
        showMessage('加载人员信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadPersonFormData() {
    try {
        const [departments, jobs, persons] = await Promise.all([
            apiRequest('/departments'),
            apiRequest('/jobs'),
            apiRequest('/persons')
        ]);
        
        // 加载部门选项
        const departmentSelect = document.getElementById('departmentSelect');
        departmentSelect.innerHTML = '<option value="">请选择部门</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });
        
        // 加载职位选项
        const jobSelect = document.getElementById('jobSelect');
        jobSelect.innerHTML = '<option value="">请选择职位</option>';
        jobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title;
            jobSelect.appendChild(option);
        });
        
        // 加载经理选项
        const managerSelect = document.getElementById('managerSelect');
        managerSelect.innerHTML = '<option value="">请选择经理</option>';
        persons.forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = `${person.first_name} ${person.last_name}`;
            managerSelect.appendChild(option);
        });
        
    } catch (error) {
        showMessage('加载表单数据失败: ' + error.message, 'error');
    }
}

async function handlePersonSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const personData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        hire_date: formData.get('hire_date'),
        department_id: parseInt(formData.get('department_id')),
        job_id: parseInt(formData.get('job_id')),
        manager_id: parseInt(formData.get('manager_id'))
    };
    
    try {
        showLoading();
        const personId = document.getElementById('personId').value;
        
        if (personId) {
            // 更新
            await apiRequest(`/persons/${personId}`, {
                method: 'PUT',
                body: JSON.stringify(personData)
            });
            showMessage('人员信息更新成功！', 'success');
        } else {
            // 创建
            await apiRequest('/persons', {
                method: 'POST',
                body: JSON.stringify(personData)
            });
            showMessage('人员添加成功！', 'success');
        }
        
        closePersonModal();
        loadPersons();
        
    } catch (error) {
        showMessage('保存人员信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function closePersonModal() {
    document.getElementById('personModal').classList.remove('show');
}

async function deletePerson(id) {
    if (!confirm('确定要删除这个人员吗？')) {
        return;
    }
    
    try {
        showLoading();
        await apiRequest(`/persons/${id}`, {
            method: 'DELETE'
        });
        showMessage('人员删除成功！', 'success');
        loadPersons();
    } catch (error) {
        showMessage('删除人员失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 部门管理
async function loadDepartments() {
    try {
        showLoading();
        const departments = await apiRequest('/departments');
        
        const tbody = document.getElementById('departmentsTableBody');
        tbody.innerHTML = '';
        
        for (const dept of departments) {
            const persons = await apiRequest(`/departments/${dept.id}/persons`);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dept.id}</td>
                <td>${dept.name}</td>
                <td>${persons.length}</td>
                <td>
                    <button class="btn btn-outline" onclick="editDepartment(${dept.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteDepartment(${dept.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }
        
    } catch (error) {
        showMessage('加载部门数据失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showAddDepartmentModal() {
    document.getElementById('departmentModalTitle').textContent = '添加部门';
    document.getElementById('departmentForm').reset();
    document.getElementById('departmentId').value = '';
    document.getElementById('departmentModal').classList.add('show');
}

async function editDepartment(id) {
    try {
        showLoading();
        const department = await apiRequest(`/departments/${id}`);
        
        document.getElementById('departmentModalTitle').textContent = '编辑部门';
        document.getElementById('departmentId').value = department.id;
        document.getElementById('departmentName').value = department.name;
        
        document.getElementById('departmentModal').classList.add('show');
    } catch (error) {
        showMessage('加载部门信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleDepartmentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const departmentData = {
        name: formData.get('name')
    };
    
    try {
        showLoading();
        const departmentId = document.getElementById('departmentId').value;
        
        if (departmentId) {
            // 更新
            await apiRequest(`/departments/${departmentId}`, {
                method: 'PUT',
                body: JSON.stringify(departmentData)
            });
            showMessage('部门信息更新成功！', 'success');
        } else {
            // 创建
            await apiRequest('/departments', {
                method: 'POST',
                body: JSON.stringify(departmentData)
            });
            showMessage('部门添加成功！', 'success');
        }
        
        closeDepartmentModal();
        loadDepartments();
        
    } catch (error) {
        showMessage('保存部门信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function closeDepartmentModal() {
    document.getElementById('departmentModal').classList.remove('show');
}

async function deleteDepartment(id) {
    if (!confirm('确定要删除这个部门吗？')) {
        return;
    }
    
    try {
        showLoading();
        await apiRequest(`/departments/${id}`, {
            method: 'DELETE'
        });
        showMessage('部门删除成功！', 'success');
        loadDepartments();
    } catch (error) {
        showMessage('删除部门失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 职位管理
async function loadJobs() {
    try {
        showLoading();
        const jobs = await apiRequest('/jobs');
        
        const tbody = document.getElementById('jobsTableBody');
        tbody.innerHTML = '';
        
        for (const job of jobs) {
            const persons = await apiRequest(`/jobs/${job.id}/persons`);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${job.id}</td>
                <td>${job.title}</td>
                <td>${persons.length}</td>
                <td>
                    <button class="btn btn-outline" onclick="editJob(${job.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteJob(${job.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }
        
    } catch (error) {
        showMessage('加载职位数据失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showAddJobModal() {
    document.getElementById('jobModalTitle').textContent = '添加职位';
    document.getElementById('jobForm').reset();
    document.getElementById('jobId').value = '';
    document.getElementById('jobModal').classList.add('show');
}

async function editJob(id) {
    try {
        showLoading();
        const job = await apiRequest(`/jobs/${id}`);
        
        document.getElementById('jobModalTitle').textContent = '编辑职位';
        document.getElementById('jobId').value = job.id;
        document.getElementById('jobTitle').value = job.title;
        
        document.getElementById('jobModal').classList.add('show');
    } catch (error) {
        showMessage('加载职位信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleJobSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const jobData = {
        title: formData.get('title')
    };
    
    try {
        showLoading();
        const jobId = document.getElementById('jobId').value;
        
        if (jobId) {
            // 更新
            await apiRequest(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify(jobData)
            });
            showMessage('职位信息更新成功！', 'success');
        } else {
            // 创建
            await apiRequest('/jobs', {
                method: 'POST',
                body: JSON.stringify(jobData)
            });
            showMessage('职位添加成功！', 'success');
        }
        
        closeJobModal();
        loadJobs();
        
    } catch (error) {
        showMessage('保存职位信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function closeJobModal() {
    document.getElementById('jobModal').classList.remove('show');
}

async function deleteJob(id) {
    if (!confirm('确定要删除这个职位吗？')) {
        return;
    }
    
    try {
        showLoading();
        await apiRequest(`/jobs/${id}`, {
            method: 'DELETE'
        });
        showMessage('职位删除成功！', 'success');
        loadJobs();
    } catch (error) {
        showMessage('删除职位失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 组织架构图
async function loadOrgChart() {
    try {
        showLoading();
        const persons = await apiRequest('/persons');
        
        const chartContainer = document.getElementById('orgChart');
        chartContainer.innerHTML = '<p>组织架构图功能开发中...</p>';
        
        // 这里可以集成第三方组织架构图库，如 OrgChart.js
        // 暂时显示简单的文本信息
        
    } catch (error) {
        showMessage('加载组织架构图失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function refreshOrgChart() {
    loadOrgChart();
}

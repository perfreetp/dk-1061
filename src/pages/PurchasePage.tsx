import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Send, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  Users,
  Calendar,
  Building,
  Package,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { useAppStore, getAssignmentsByApplication } from '../store';
import { mockPersonalities, mockApplications, mockEmployees } from '../data/mockData';
import type { PurchaseApplication, Employee } from '../types';

const statusConfig = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function PurchasePage() {
  const { 
    candidateList, 
    removeFromCandidateList, 
    clearCandidateList,
    applications,
    setApplications,
    addApplication,
    personalities,
    setPersonalities,
    employees,
    setEmployees,
    addAssignment,
    quota,
  } = useAppStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [purpose, setPurpose] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidate' | 'history'>('candidate');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<PurchaseApplication | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignQuantity, setAssignQuantity] = useState(1);

  useEffect(() => {
    if (personalities.length === 0) {
      setPersonalities(mockPersonalities);
    }
    if (applications.length === 0) {
      setApplications(mockApplications);
    }
    if (employees.length === 0) {
      setEmployees(mockEmployees);
    }
  }, [personalities.length, applications.length, employees.length, setPersonalities, setApplications, setEmployees]);

  useEffect(() => {
    const newQuantities: Record<string, number> = {};
    candidateList.forEach(item => {
      newQuantities[item.personality_id] = quantities[item.personality_id] || 1;
    });
    setQuantities(newQuantities);
  }, [candidateList]);

  const updateQuantity = (personalityId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [personalityId]: Math.max(1, (prev[personalityId] || 1) + delta)
    }));
  };

  const handleSubmit = async () => {
    if (!purpose.trim()) return;
    if (candidateList.length === 0) return;

    setSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    candidateList.forEach(item => {
      const application: PurchaseApplication = {
        id: `app-${Date.now()}-${item.personality_id}`,
        user_id: '1',
        personality_id: item.personality_id,
        purpose,
        quantity: quantities[item.personality_id] || 1,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        personality: item.personality,
      };
      addApplication(application);
    });

    clearCandidateList();
    setPurpose('');
    setSubmitting(false);
    setShowForm(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAssign = () => {
    if (!selectedApplication || !selectedEmployee || assignQuantity <= 0) return;
    
    addAssignment({
      application_id: selectedApplication.id,
      employee_id: selectedEmployee,
      personality_id: selectedApplication.personality_id,
      quantity: assignQuantity,
    });
    
    setShowAssignModal(false);
    setSelectedApplication(null);
    setSelectedEmployee('');
    setAssignQuantity(1);
  };

  const openAssignModal = (app: PurchaseApplication) => {
    setSelectedApplication(app);
    setSelectedEmployee('');
    setAssignQuantity(1);
    setShowAssignModal(true);
  };

  const getTotalQuantity = () => {
    return candidateList.reduce((sum, item) => sum + (quantities[item.personality_id] || 1), 0);
  };

  const getAssignedCount = (appId: string) => {
    const assignments = getAssignmentsByApplication(appId);
    return assignments.reduce((sum, a) => sum + a.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">采购申请</h1>
          <p className="text-gray-600">管理候选清单，提交采购申请并查看审批状态</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">采购申请提交成功，等待审批</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('candidate')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'candidate'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  候选清单
                  {candidateList.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">
                      {candidateList.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  申请历史
                  {applications.filter(a => a.status === 'pending').length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                      {applications.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'candidate' ? (
                  candidateList.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">候选清单为空</h3>
                      <p className="text-gray-500 mb-6">从人格库选择AI人格加入候选清单</p>
                      <a
                        href="/personalities"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        去人格库选择
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {candidateList.map((item) => {
                        const qty = quantities[item.personality_id] || 1;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                          >
                            <img
                              src={item.personality?.avatar}
                              alt={item.personality?.name}
                              className="w-14 h-14 rounded-xl"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{item.personality?.name}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{item.personality?.industry}</span>
                                <span className="text-gray-300">|</span>
                                <span>{item.personality?.task_type}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.personality_id, -1)}
                                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{qty}</span>
                              <button
                                onClick={() => updateQuantity(item.personality_id, 1)}
                                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCandidateList(item.personality_id)}
                              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}

                      <div className="p-4 bg-primary-50 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-600">共 {candidateList.length} 种人格，总计 </span>
                          <span className="font-bold text-primary-700">{getTotalQuantity()} 个</span>
                        </div>
                        <button
                          onClick={() => setShowForm(true)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
                        >
                          <Send className="w-4 h-4" />
                          提交申请
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  applications.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无申请记录</h3>
                      <p className="text-gray-500">提交采购申请后，记录将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => {
                        const StatusIcon = statusConfig[app.status].icon;
                        const isExpanded = expandedApp === app.id;
                        const assignedCount = getAssignedCount(app.id);
                        const remainingCount = app.quantity - assignedCount;
                        const assignments = getAssignmentsByApplication(app.id);

                        return (
                          <div
                            key={app.id}
                            className="bg-gray-50 rounded-xl overflow-hidden"
                          >
                            <div 
                              className="p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.personality?.avatar}
                                    alt={app.personality?.name}
                                    className="w-12 h-12 rounded-lg"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{app.personality?.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Users className="w-4 h-4" />
                                      <span>数量: {app.quantity} (已分配: {assignedCount})</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[app.status].color}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusConfig[app.status].label}
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{app.purpose}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>提交于 {new Date(app.submitted_at).toLocaleDateString()}</span>
                                </div>
                                {app.approved_at && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>审批于 {new Date(app.approved_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                                {app.status === 'approved' && remainingCount > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAssignModal(app);
                                    }}
                                    className="w-full mb-4 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                                  >
                                    <Package className="w-4 h-4 inline mr-2" />
                                    分配给员工 ({remainingCount} 个剩余)
                                  </button>
                                )}

                                {assignments.length > 0 && (
                                  <div className="bg-white rounded-lg p-4">
                                    <h5 className="text-sm font-medium text-gray-900 mb-3">分配记录</h5>
                                    <div className="space-y-2">
                                      {assignments.map((assign) => (
                                        <div
                                          key={assign.id}
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">
                                              {assign.employee?.name} ({assign.employee?.department})
                                            </span>
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">
                                            ×{assign.quantity}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {app.status === 'approved' && assignments.length === 0 && (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    暂无分配记录
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">采购指南</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">选择人格</h4>
                    <p className="text-sm text-gray-500">从人格库挑选适合的AI人格加入候选清单</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">设置数量</h4>
                    <p className="text-sm text-gray-500">根据需求调整每人格的采购数量</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">提交申请</h4>
                    <p className="text-sm text-gray-500">填写用途后提交审批，通常1-3个工作日完成</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-8 h-8" />
                <h3 className="font-semibold">企业信息</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-100">企业名称</span>
                  <span className="font-medium">示例企业科技有限公司</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-100">剩余额度</span>
                  <span className="font-medium">¥{quota.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-100">已采购人格</span>
                  <span className="font-medium">{applications.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.quantity, 0)} 个</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">提交采购申请</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">采购用途</label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="请描述采购这些AI人格的用途..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
                  />
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">采购清单</h4>
                  <div className="space-y-2">
                    {candidateList.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.personality?.name}</span>
                        <span className="font-medium text-gray-900">×{quantities[item.personality_id] || 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-600">总计</span>
                    <span className="font-bold text-primary-600">{getTotalQuantity()} 个人格</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!purpose.trim() || submitting}
                    className={`flex-1 py-3 font-medium rounded-xl transition-all ${
                      !purpose.trim()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : submitting
                        ? 'bg-primary-500 text-white opacity-70'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
                    }`}
                  >
                    {submitting ? '提交中...' : '提交审批'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAssignModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">分配人格给员工</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedApplication.personality?.avatar}
                      alt={selectedApplication.personality?.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedApplication.personality?.name}</h4>
                      <div className="text-sm text-gray-500">
                        剩余可分配: {selectedApplication.quantity - getAssignedCount(selectedApplication.id)} 个
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择员工</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                  >
                    <option value="">请选择员工</option>
                    {employees.map((emp: Employee) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">分配数量</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAssignQuantity(Math.max(1, assignQuantity - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-12 text-center">{assignQuantity}</span>
                    <button
                      onClick={() => setAssignQuantity(Math.min(selectedApplication.quantity - getAssignedCount(selectedApplication.id), assignQuantity + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedEmployee || assignQuantity <= 0}
                    className={`flex-1 py-3 font-medium rounded-xl transition-all ${
                      !selectedEmployee || assignQuantity <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
                    }`}
                  >
                    确认分配
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

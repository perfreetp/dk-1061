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
  User,
  Eye,
  Ban,
  List,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Link,
  RefreshCw,
  Target
} from 'lucide-react';
import { useAppStore, getAssignmentsByApplication, getAssignmentsByEmployee, getAllEmployeesWithAssignments, getAssignmentProgress, getAffectedAssignmentsByRiskPersonality } from '../store';
import { mockPersonalities, mockApplications, mockEmployees } from '../data/mockData';
import type { PurchaseApplication, Employee, PersonalityAssignment } from '../types';

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
    updateAssignmentQuantity,
    transferAssignment,
    quota,
    riskPersonalityIds,
  } = useAppStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [purpose, setPurpose] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidate' | 'history' | 'employees' | 'progress'>('candidate');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedApp, setExpandedAppState] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<PurchaseApplication | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignQuantity, setAssignQuantity] = useState(1);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState<string | null>(null);
  const [employeeDetailData, setEmployeeDetailData] = useState<{
    employee: Employee | undefined;
    assignments: any[];
  } | null>(null);
  const [transferAssignmentId, setTransferAssignmentId] = useState<string | null>(null);
  const [transferTargetEmployee, setTransferTargetEmployee] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState(1);

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

  const validCandidateList = candidateList.filter(item => !riskPersonalityIds.includes(item.personality_id));
  const invalidCandidateList = candidateList.filter(item => riskPersonalityIds.includes(item.personality_id));

  const handleSubmit = async () => {
    if (!purpose.trim()) return;
    if (validCandidateList.length === 0) return;

    setSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    validCandidateList.forEach(item => {
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
    
    const assignedCount = getAssignedCount(selectedApplication.id);
    const maxAvailable = selectedApplication.quantity - assignedCount;
    
    if (assignQuantity > maxAvailable) {
      return;
    }
    
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

  const openEmployeeDetail = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const assignments = getAssignmentsByEmployee(employeeId);
    setEmployeeDetailData({ employee, assignments });
    setShowEmployeeDetail(employeeId);
  };

  const openTransferModal = (assignmentId: string, currentQuantity: number) => {
    setTransferAssignmentId(assignmentId);
    setTransferTargetEmployee('');
    setTransferQuantity(Math.min(currentQuantity, 1));
  };

  const handleTransfer = () => {
    if (!transferAssignmentId || !transferTargetEmployee || transferQuantity <= 0) return;
    
    transferAssignment(transferAssignmentId, transferTargetEmployee, transferQuantity);
    
    setTransferAssignmentId(null);
    setTransferTargetEmployee('');
    setTransferQuantity(1);
  };

  const getTotalQuantity = () => {
    return validCandidateList.reduce((sum, item) => sum + (quantities[item.personality_id] || 1), 0);
  };

  const getAssignedCount = (appId: string) => {
    const assignments = getAssignmentsByApplication(appId);
    return assignments.reduce((sum, a) => sum + a.quantity, 0);
  };

  const employeesWithAssignments = getAllEmployeesWithAssignments();
  const assignmentProgress = getAssignmentProgress();
  const affectedAssignments = getAffectedAssignmentsByRiskPersonality();
  
  const completedApplications = assignmentProgress.filter(p => p.remainingCount === 0);
  const inProgressApplications = assignmentProgress.filter(p => p.remainingCount > 0);

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
              <div className="flex border-b border-gray-100 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('candidate')}
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
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
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
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
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'progress'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  分配进度
                  {inProgressApplications.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {inProgressApplications.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'employees'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  员工分配汇总
                  {employeesWithAssignments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                      {employeesWithAssignments.length}
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
                      {invalidCandidateList.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Ban className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-700">已停用的人格（将被自动排除）</span>
                          </div>
                          <div className="space-y-2">
                            {invalidCandidateList.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-white rounded-lg opacity-60"
                              >
                                <img
                                  src={item.personality?.avatar}
                                  alt={item.personality?.name}
                                  className="w-12 h-12 rounded-lg grayscale"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 line-through">{item.personality?.name}</h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{item.personality?.industry}</span>
                                    <span className="text-gray-300">|</span>
                                    <span>{item.personality?.task_type}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">已停用</span>
                                  <button
                                    onClick={() => removeFromCandidateList(item.personality_id)}
                                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {validCandidateList.map((item) => {
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
                          <span className="text-sm text-gray-600">共 {validCandidateList.length} 种人格，总计 </span>
                          <span className="font-bold text-primary-700">{getTotalQuantity()} 个</span>
                          {invalidCandidateList.length > 0 && (
                            <span className="text-sm text-gray-500 ml-2">
                              (含 {invalidCandidateList.length} 个已停用人格，将被排除)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowForm(true)}
                          disabled={validCandidateList.length === 0}
                          className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-xl transition-all ${
                            validCandidateList.length === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          提交申请
                        </button>
                      </div>
                    </div>
                  )
                ) : activeTab === 'history' ? (
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
                              onClick={() => setExpandedAppState(isExpanded ? null : app.id)}
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
                                {app.expires_at && (
                                  <div className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    <span>到期于 {new Date(app.expires_at).toLocaleDateString()}</span>
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
                                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                      <List className="w-4 h-4" />
                                      分配记录
                                    </h5>
                                    <div className="space-y-2">
                                      {assignments.map((assign) => {
                                        const isRisk = riskPersonalityIds.includes(assign.personality_id);
                                        return (
                                          <div
                                            key={assign.id}
                                            className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                              isRisk ? 'bg-red-50' : 'bg-gray-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 flex-1">
                                              <User className="w-4 h-4 text-gray-500" />
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm text-gray-700">
                                                    {assign.employee?.name} ({assign.employee?.department})
                                                  </span>
                                                  {isRisk && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">已停用</span>
                                                  )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  分配于 {new Date(assign.assigned_at).toLocaleDateString()}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className="text-sm font-medium text-gray-900">
                                                ×{assign.quantity}
                                              </span>
                                              {!isRisk && assign.quantity > 1 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openTransferModal(assign.id, assign.quantity);
                                                  }}
                                                  className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                                  title="转移分配"
                                                >
                                                  <RefreshCw className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
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
                ) : activeTab === 'progress' ? (
                  assignmentProgress.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分配进度</h3>
                      <p className="text-gray-500">审批通过的采购申请将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {inProgressApplications.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            分配中 ({inProgressApplications.length})
                          </h3>
                          <div className="space-y-4">
                            {inProgressApplications.map((progress) => (
                              <div
                                key={progress.application.id}
                                className="bg-gray-50 rounded-xl p-4"
                                onClick={() => {
                                  setActiveTab('history');
                                  setExpandedAppState(progress.application.id);
                                }}
                              >
                                <div className="flex items-center gap-4 mb-4">
                                  <img
                                    src={progress.personality?.avatar}
                                    alt={progress.personality?.name}
                                    className="w-12 h-12 rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{progress.personality?.name}</h4>
                                    <p className="text-sm text-gray-500">{progress.application.purpose}</p>
                                  </div>
                                  <Link className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="grid grid-cols-4 gap-4 mb-3">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{progress.totalPurchased}</div>
                                    <div className="text-xs text-gray-500">已采购</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{progress.assignedCount}</div>
                                    <div className="text-xs text-gray-500">已分配</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{progress.remainingCount}</div>
                                    <div className="text-xs text-gray-500">剩余</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{progress.employeeCount}</div>
                                    <div className="text-xs text-gray-500">涉及员工</div>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${(progress.assignedCount / progress.totalPurchased) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {completedApplications.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            已分配完成 ({completedApplications.length})
                          </h3>
                          <div className="space-y-4">
                            {completedApplications.map((progress) => (
                              <div
                                key={progress.application.id}
                                className="bg-gray-50 rounded-xl p-4 opacity-75"
                                onClick={() => {
                                  setActiveTab('history');
                                  setExpandedAppState(progress.application.id);
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <img
                                    src={progress.personality?.avatar}
                                    alt={progress.personality?.name}
                                    className="w-12 h-12 rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{progress.personality?.name}</h4>
                                    <p className="text-sm text-gray-500">{progress.employeeCount} 名员工已分配</p>
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    已完成
                                  </div>
                                  <Link className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  employeesWithAssignments.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无员工分配记录</h3>
                      <p className="text-gray-500">将已通过的采购申请分配给员工后，记录将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {employeesWithAssignments.map((item) => (
                        <div
                          key={item.employee?.id}
                          className="bg-gray-50 rounded-xl overflow-hidden"
                        >
                          <div 
                            className="p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => openEmployeeDetail(item.employee?.id || '')}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{item.employee?.name}</h4>
                                  <p className="text-sm text-gray-500">{item.employee?.department} | {item.employee?.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">已分配人格</div>
                                  <div className="text-xl font-bold text-primary-600">{item.totalQuantity} 个</div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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

            {affectedAssignments.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-700">受影响的分配</h3>
                </div>
                <p className="text-sm text-red-600 mb-4">以下分配涉及已停用的风险人格，无法继续转移</p>
                <div className="space-y-2">
                  {affectedAssignments.slice(0, 3).map((assign) => (
                    <div key={assign.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{assign.employee?.name}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                        {assign.personality?.name}
                      </span>
                    </div>
                  ))}
                  {affectedAssignments.length > 3 && (
                    <div className="text-xs text-red-500 text-center">
                      还有 {affectedAssignments.length - 3} 条受影响记录...
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    {validCandidateList.map((item) => (
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
                    disabled={!purpose.trim() || submitting || validCandidateList.length === 0}
                    className={`flex-1 py-3 font-medium rounded-xl transition-all ${
                      !purpose.trim() || validCandidateList.length === 0
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
                      disabled={assignQuantity <= 1}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        assignQuantity <= 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-12 text-center">{assignQuantity}</span>
                    <button
                      onClick={() => setAssignQuantity(Math.min(selectedApplication.quantity - getAssignedCount(selectedApplication.id), assignQuantity + 1))}
                      disabled={assignQuantity >= selectedApplication.quantity - getAssignedCount(selectedApplication.id)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        assignQuantity >= selectedApplication.quantity - getAssignedCount(selectedApplication.id) 
                          ? 'bg-gray-100 cursor-not-allowed' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    最大可分配: {selectedApplication.quantity - getAssignedCount(selectedApplication.id)} 个
                  </p>
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
                    disabled={!selectedEmployee || assignQuantity <= 0 || assignQuantity > (selectedApplication.quantity - getAssignedCount(selectedApplication.id))}
                    className={`flex-1 py-3 font-medium rounded-xl transition-all ${
                      !selectedEmployee || assignQuantity <= 0 || assignQuantity > (selectedApplication.quantity - getAssignedCount(selectedApplication.id))
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

        {showEmployeeDetail && employeeDetailData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">员工分配详情</h3>
                <button
                  onClick={() => {
                    setShowEmployeeDetail(null);
                    setEmployeeDetailData(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-xl">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{employeeDetailData.employee?.name}</h4>
                    <p className="text-sm text-gray-500">{employeeDetailData.employee?.department} | {employeeDetailData.employee?.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">已分配人格</h5>
                  {employeeDetailData.assignments.length > 0 ? (
                    <div className="space-y-3">
                      {employeeDetailData.assignments.map((assign) => {
                        const isRisk = riskPersonalityIds.includes(assign.personality_id);
                        return (
                          <div
                            key={assign.id}
                            className={`p-3 rounded-lg ${isRisk ? 'bg-red-50' : 'bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={assign.personality?.avatar}
                                alt={assign.personality?.name}
                                className={`w-10 h-10 rounded-lg ${isRisk ? 'grayscale' : ''}`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h6 className="font-medium text-gray-900">{assign.personality?.name}</h6>
                                  {isRisk && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">已停用</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{assign.personality?.task_type}</p>
                              </div>
                              <span className="text-lg font-bold text-primary-600">×{assign.quantity}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>分配于 {new Date(assign.assigned_at).toLocaleDateString()}</span>
                              </div>
                              {assign.application?.expires_at && (
                                <div className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  <span>到期于 {new Date(assign.application.expires_at).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-xs">
                              <span className="text-gray-500">来源申请:</span>
                              <span className="text-gray-700 ml-1">
                                {assign.application?.purpose || '未知'}
                              </span>
                            </div>
                            {!isRisk && assign.quantity > 1 && (
                              <button
                                onClick={() => openTransferModal(assign.id, assign.quantity)}
                                className="mt-2 px-3 py-1.5 bg-blue-100 text-blue-600 text-xs rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3 inline mr-1" />
                                转移分配
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无分配记录
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">总计分配</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {employeeDetailData.assignments.reduce((sum, a) => sum + a.quantity, 0)} 个人格
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {transferAssignmentId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">转移分配</h3>
                <button
                  onClick={() => {
                    setTransferAssignmentId(null);
                    setTransferTargetEmployee('');
                    setTransferQuantity(1);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择目标员工</label>
                  <select
                    value={transferTargetEmployee}
                    onChange={(e) => setTransferTargetEmployee(e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">转移数量</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTransferQuantity(Math.max(1, transferQuantity - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-12 text-center">{transferQuantity}</span>
                    <button
                      onClick={() => setTransferQuantity(transferQuantity + 1)}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setTransferAssignmentId(null);
                      setTransferTargetEmployee('');
                      setTransferQuantity(1);
                    }}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!transferTargetEmployee || transferQuantity <= 0}
                    className={`flex-1 py-3 font-medium rounded-xl transition-all flex items-center justify-center justify-center gap-2 ${
                      !transferTargetEmployee || transferQuantity <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    确认转移
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

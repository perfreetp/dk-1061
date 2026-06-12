import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit,
  Ban,
  Play,
  Bell,
  Filter,
  Download
} from 'lucide-react';
import { useAppStore } from '../store';
import { mockPersonalities, mockUsageData, mockFeedbackData, mockRenewalReminders } from '../data/mockData';
import type { Personality, Feedback, UsageLog } from '../types';

export function MonitorPage() {
  const { 
    personalities, 
    setPersonalities,
    usageData,
    setUsageData,
    feedbackData,
    setFeedbackData
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'risk' | 'reminders'>('dashboard');
  const [riskPersonalities, setRiskPersonalities] = useState<Personality[]>([]);
  const [quota, setQuota] = useState(50000);
  const [editingQuota, setEditingQuota] = useState(false);
  const [tempQuota, setTempQuota] = useState(50000);

  useEffect(() => {
    if (personalities.length === 0) {
      setPersonalities(mockPersonalities);
    }
    if (usageData.length === 0) {
      setUsageData(mockUsageData);
    }
    if (feedbackData.length === 0) {
      setFeedbackData(mockFeedbackData);
    }
  }, [personalities.length, usageData.length, feedbackData.length, setPersonalities, setUsageData, setFeedbackData]);

  const toggleRiskStatus = (personality: Personality) => {
    if (riskPersonalities.find(p => p.id === personality.id)) {
      setRiskPersonalities(riskPersonalities.filter(p => p.id !== personality.id));
    } else {
      setRiskPersonalities([...riskPersonalities, personality]);
    }
  };

  const saveQuota = () => {
    setQuota(tempQuota);
    setEditingQuota(false);
  };

  const totalCalls = usageData.reduce((sum, log) => sum + log.call_count, 0);
  const avgSatisfaction = feedbackData.length > 0 
    ? (feedbackData.reduce((sum, f) => sum + f.satisfaction_score, 0) / feedbackData.length).toFixed(1)
    : '0';
  const abnormalCount = feedbackData.filter(f => f.is_abnormal).length;

  const weeklyData = [
    { day: '周一', calls: 120 },
    { day: '周二', calls: 150 },
    { day: '周三', calls: 135 },
    { day: '周四', calls: 180 },
    { day: '周五', calls: 165 },
    { day: '周六', calls: 90 },
    { day: '周日', calls: 85 },
  ];

  const maxCalls = Math.max(...weeklyData.map(d => d.calls));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">使用监控</h1>
          <p className="text-gray-600">监控AI人格使用情况，管理风险和到期续约</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-400">本周数据</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalCalls}</div>
            <div className="text-sm text-gray-500">总调用次数</div>
            <div className="mt-3 flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% 较上周</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-400">平均满意度</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{avgSatisfaction}</div>
            <div className="text-sm text-gray-500">满意度评分</div>
            <div className="mt-3 flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+0.3 较上周</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs text-gray-400">异常反馈</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{abnormalCount}</div>
            <div className="text-sm text-gray-500">异常反馈数量</div>
            <div className="mt-3 flex items-center gap-1 text-red-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+2 较上周</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-400">可用额度</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">¥{quota.toLocaleString()}</div>
            <div className="text-sm text-gray-500">剩余额度</div>
            <button
              onClick={() => setEditingQuota(true)}
              className="mt-3 flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>修改额度</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">调用量趋势</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Filter className="w-4 h-4" />
                    筛选
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Download className="w-4 h-4" />
                    导出
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between h-48 gap-4">
                {weeklyData.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center">
                    <div className="text-sm font-medium text-gray-900 mb-2">{item.calls}</div>
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-400"
                      style={{ height: `${(item.calls / maxCalls) * 100}%`, minHeight: '8px' }}
                    />
                    <div className="text-xs text-gray-500 mt-2">{item.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">满意度分布</h3>
            
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((score) => {
                const count = feedbackData.filter(f => f.satisfaction_score === score).length;
                const percentage = feedbackData.length > 0 ? (count / feedbackData.length * 100).toFixed(0) : '0';
                
                return (
                  <div key={score}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{score}分</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 4 ? 'bg-green-500' : score === 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">最近反馈</div>
              <div className="space-y-3">
                {feedbackData.slice(0, 3).map((feedback) => (
                  <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        feedback.is_abnormal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {feedback.is_abnormal ? '异常' : '正常'}
                      </span>
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < feedback.satisfaction_score ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                人格管理
              </div>
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'risk'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                风险管控
                {riskPersonalities.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                    {riskPersonalities.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'reminders'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                到期提醒
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">人格名称</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">行业</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">调用量</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">满意度</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalities.map((personality) => {
                      const usage = usageData.find(u => u.personality_id === personality.id);
                      const feedbacks = feedbackData.filter(f => f.personality_id === personality.id);
                      const avgScore = feedbacks.length > 0 
                        ? (feedbacks.reduce((sum, f) => sum + f.satisfaction_score, 0) / feedbacks.length).toFixed(1)
                        : '-';
                      const isRisk = riskPersonalities.find(p => p.id === personality.id);
                      
                      return (
                        <tr key={personality.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={personality.avatar} alt={personality.name} className="w-10 h-10 rounded-lg" />
                              <div>
                                <div className="font-medium text-gray-900">{personality.name}</div>
                                <div className="text-xs text-gray-500">{personality.task_type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{personality.industry}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{usage?.call_count || 0}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-900">{avgScore}</span>
                              <svg className="w-4 h-4 text-secondary-500 fill-secondary-500" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              isRisk 
                                ? 'bg-red-100 text-red-700' 
                                : personality.is_active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isRisk ? (
                                <>
                                  <Ban className="w-3 h-3" />
                                  已停用
                                </>
                              ) : personality.is_active ? (
                                <>
                                  <Play className="w-3 h-3" />
                                  正常
                                </>
                              ) : (
                                '已禁用'
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'risk' && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">风险管控说明</h4>
                      <p className="text-sm text-yellow-700">标记为风险的人格将被自动停用，禁止继续调用。请谨慎操作。</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personalities.map((personality) => {
                    const isRisk = riskPersonalities.find(p => p.id === personality.id);
                    const abnormalFeedbacks = feedbackData.filter(f => f.personality_id === personality.id && f.is_abnormal);
                    
                    return (
                      <div
                        key={personality.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isRisk 
                            ? 'bg-red-50 border-red-200' 
                            : abnormalFeedbacks.length > 0
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img src={personality.avatar} alt={personality.name} className="w-12 h-12 rounded-lg" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{personality.name}</h4>
                              <div className="text-xs text-gray-500">{personality.industry}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isRisk 
                              ? 'bg-red-100 text-red-700' 
                              : abnormalFeedbacks.length > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}>
                            {isRisk ? '已停用' : abnormalFeedbacks.length > 0 ? `${abnormalFeedbacks.length}异常` : '正常'}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleRiskStatus(personality)}
                          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                            isRisk 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {isRisk ? '恢复使用' : '标记为风险'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-4">
                {mockRenewalReminders.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无到期提醒</h3>
                    <p className="text-gray-500">即将到期的订阅会在这里显示</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockRenewalReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          reminder.days_left <= 30 
                            ? 'bg-red-50 border-red-200' 
                            : reminder.days_left <= 60
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            reminder.days_left <= 30 
                              ? 'bg-red-100' 
                              : reminder.days_left <= 60
                                ? 'bg-yellow-100'
                                : 'bg-gray-100'
                          }`}>
                            <Bell className={`w-6 h-6 ${
                              reminder.days_left <= 30 
                                ? 'text-red-600' 
                                : reminder.days_left <= 60
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{reminder.personality_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>到期日期: {reminder.expires_at}</span>
                              <span>数量: {reminder.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            reminder.days_left <= 30 
                              ? 'text-red-600' 
                              : reminder.days_left <= 60
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                          }`}>
                            {reminder.days_left}
                          </div>
                          <div className="text-xs text-gray-500">天后到期</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {editingQuota && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">设置可用额度</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">额度金额</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                    <input
                      type="number"
                      value={tempQuota}
                      onChange={(e) => setTempQuota(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                      placeholder="输入额度金额"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingQuota(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveQuota}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all"
                  >
                    保存
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

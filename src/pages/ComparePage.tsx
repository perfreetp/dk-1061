import { useState, useEffect } from 'react';
import { 
  Send, 
  Star, 
  Clock, 
  Zap, 
  X, 
  Plus,
  MessageSquare,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../store';
import { mockPersonalities } from '../data/mockData';
import type { Personality, TrialResult } from '../types';

const mockResponses: Record<string, string> = {
  '1': '您好！感谢您的咨询。根据您的需求，我们提供全方位的金融服务解决方案，涵盖存款、理财、贷款等多个领域。如需了解详细信息，请随时告知。',
  '2': '您好呀~ 很高兴为您服务！请问有什么可以帮到您的吗？关于医疗健康方面的问题，我很乐意为您解答哦！😊',
  '3': '哈喽！我来帮您推荐最合适的商品！咱们这款产品可是爆款哦，性价比超高，很多客户都回购了呢！感兴趣的话我给您详细讲讲~',
  '4': '您好，欢迎参加本次培训课程。本次培训将涵盖企业管理的核心要点，帮助您提升团队管理能力和业务水平。',
  '5': '您好！感谢您的技术支持请求。根据您描述的问题，我将为您提供专业的技术解决方案。',
  '6': '欢迎光临！有什么我可以帮您推荐的吗？我们店里最近有很多新品上市，优惠多多哦！',
};

export function ComparePage() {
  const { 
    compareList, 
    setCompareList,
    addToCompareList,
    removeFromCompareList,
    trialResults,
    setTrialResults,
    clearTrialResults,
    personalities,
    setPersonalities
  } = useAppStore();

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);

  useEffect(() => {
    if (personalities.length === 0) {
      setPersonalities(mockPersonalities);
    }
  }, [personalities.length, setPersonalities]);

  const availablePersonalities = personalities.filter(p => 
    !compareList.some(c => c.id === p.id)
  );

  const handleRunTrial = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    clearTrialResults();

    await new Promise(resolve => setTimeout(resolve, 1500));

    const results: TrialResult[] = compareList.map((p) => ({
      personality_id: p.id,
      personality_name: p.name,
      response: mockResponses[p.id] || `这是${p.name}对您问题的回答：${question}`,
      latency: Math.floor(Math.random() * 1000) + 500,
      tokens_used: Math.floor(Math.random() * 100) + 50,
    }));

    setTrialResults(results);
    setIsLoading(false);
  };

  const handleAddFromAvailable = (personality: Personality) => {
    if (compareList.length >= 5) return;
    addToCompareList(personality);
  };

  const handleRemoveFromCompare = (personalityId: string) => {
    removeFromCompareList(personalityId);
  };

  const toggleSelect = (id: string) => {
    setSelectedPersonalities((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getBestPerformer = () => {
    if (trialResults.length === 0) return null;
    return trialResults.reduce((best, current) => 
      current.latency < best.latency ? current : best
    );
  };

  const bestPerformer = getBestPerformer();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">评测对比</h1>
          <p className="text-gray-600">
            选择多个AI人格进行对比测试，对同一问题查看不同回答差异
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">待对比人格</h2>
              
              {compareList.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待对比人格</h3>
                  <p className="text-gray-500 mb-4">从右侧选择人格加入对比列表</p>
                  <a
                    href="/personalities"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    从人格库选择
                  </a>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mb-6">
                  {compareList.map((personality) => (
                    <div
                      key={personality.id}
                      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                    >
                      <img
                        src={personality.avatar}
                        alt={personality.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{personality.name}</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-secondary-500 fill-secondary-500" />
                          <span className="text-xs text-gray-500">{personality.rating}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCompare(personality.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">测试问题</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="输入您想要测试的问题，例如：如何提高客户满意度？"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleRunTrial}
                  disabled={!question.trim() || compareList.length === 0 || isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200 ${
                    !question.trim() || compareList.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isLoading
                      ? 'bg-primary-500 text-white opacity-70'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      正在生成回答...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      发起测试
                    </>
                  )}
                </button>
              </div>
            </div>

            {trialResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">对比结果</h2>
                  {bestPerformer && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>最佳: {bestPerformer.personality_name}</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {trialResults.map((result) => {
                      const isBest = bestPerformer?.personality_id === result.personality_id;
                      const personality = compareList.find(p => p.id === result.personality_id);
                      
                      return (
                        <div
                          key={result.personality_id}
                          className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${
                            isBest 
                              ? 'border-green-300 bg-gradient-to-br from-green-50 to-white shadow-lg shadow-green-100' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {isBest && (
                            <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              最优
                            </div>
                          )}

                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <img
                                src={personality?.avatar}
                                alt={result.personality_name}
                                className="w-12 h-12 rounded-lg"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">{result.personality_name}</h3>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-secondary-500 fill-secondary-500" />
                                  <span className="text-xs text-gray-500">{personality?.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-gray-600 leading-relaxed">{result.response}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{result.latency}ms</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Zap className="w-3 h-3" />
                                <span>{result.tokens_used} tokens</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">可用人格</h3>
              
              {availablePersonalities.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  所有人格已加入对比
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePersonalities.slice(0, 10).map((personality) => (
                    <div
                      key={personality.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={personality.avatar}
                        alt={personality.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{personality.name}</div>
                        <div className="text-xs text-gray-500">{personality.industry}</div>
                      </div>
                      <button
                        onClick={() => handleAddFromAvailable(personality)}
                        disabled={compareList.length >= 5}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          compareList.length >= 5
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {availablePersonalities.length > 10 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      还有 {availablePersonalities.length - 10} 个人格...
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-3">对比说明</div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5" />
                    最多支持5个人格同时对比
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                    系统自动识别最佳 performer
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 mt-1.5" />
                    基于响应速度和质量评分
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

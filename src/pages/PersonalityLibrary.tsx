import { useState, useMemo } from 'react';
import { 
  Star, 
  Filter, 
  Check, 
  X, 
  MessageCircle, 
  Briefcase, 
  GraduationCap,
  Plus,
  GitCompare,
  ShoppingCart,
  Search
} from 'lucide-react';
import { useAppStore } from '../store';
import { mockPersonalities } from '../data/mockData';
import type { Personality } from '../types';
import { INDUSTRY_OPTIONS, TASK_TYPE_OPTIONS, RESPONSE_STYLE_OPTIONS, COMPLIANCE_LEVELS } from '../types';

const categoryIcons = {
  customer_service: MessageCircle,
  sales_coach: Briefcase,
  training_lecturer: GraduationCap,
};

const categoryLabels = {
  customer_service: '客服',
  sales_coach: '销售陪练',
  training_lecturer: '培训讲师',
};

const styleLabels: Record<string, string> = {
  professional: '专业',
  friendly: '友好',
  humorous: '幽默',
  formal: '正式',
};

export function PersonalityLibrary() {
  const { 
    personalities, 
    setPersonalities,
    filters, 
    setFilters, 
    candidateList,
    compareList,
    addToCandidateList, 
    removeFromCandidateList,
    addToCompareList,
    removeFromCompareList
  } = useAppStore();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  useState(() => {
    if (personalities.length === 0) {
      setPersonalities(mockPersonalities);
    }
  });

  const filteredPersonalities = useMemo(() => {
    return personalities.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.industry.length > 0 && !filters.industry.includes(p.industry)) {
        return false;
      }
      if (filters.taskType.length > 0 && !filters.taskType.includes(p.task_type)) {
        return false;
      }
      if (filters.complianceLevel.length > 0 && !filters.complianceLevel.includes(p.compliance_level)) {
        return false;
      }
      if (filters.responseStyle.length > 0 && !filters.responseStyle.includes(p.response_style)) {
        return false;
      }
      return true;
    });
  }, [personalities, filters, searchQuery]);

  const toggleFilter = (type: keyof typeof filters, value: string | number) => {
    if (type === 'complianceLevel') {
      const currentValues = filters[type] as number[];
      const numValue = Number(value);
      setFilters({
        ...filters,
        [type]: currentValues.includes(numValue)
          ? currentValues.filter((v) => v !== numValue)
          : [...currentValues, numValue],
      });
    } else {
      const currentValues = filters[type] as string[];
      const stringValue = String(value);
      setFilters({
        ...filters,
        [type]: currentValues.includes(stringValue)
          ? currentValues.filter((v) => v !== stringValue)
          : [...currentValues, stringValue],
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      industry: [],
      taskType: [],
      complianceLevel: [],
      responseStyle: [],
    });
  };

  const isInCandidateList = (id: string) => {
    return candidateList.some((item) => item.personality_id === id);
  };

  const isInCompareList = (id: string) => {
    return compareList.some((p) => p.id === id);
  };

  const handleAddToCandidate = (personality: Personality) => {
    if (isInCandidateList(personality.id)) {
      removeFromCandidateList(personality.id);
    } else {
      addToCandidateList(personality);
    }
  };

  const handleAddToCompare = (personality: Personality) => {
    if (isInCompareList(personality.id)) {
      removeFromCompareList(personality.id);
    } else {
      addToCompareList(personality);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPersonalities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPersonalities.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getComplianceStars = (level: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < level ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'
          }`}
        />
      ));
  };

  const hasActiveFilters =
    filters.industry.length > 0 ||
    filters.taskType.length > 0 ||
    filters.complianceLevel.length > 0 ||
    filters.responseStyle.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">人格库</h1>
          <p className="text-gray-600">
            浏览并筛选适合您业务需求的AI人格，支持多维度筛选和批量操作
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索人格名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">筛选</span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-sm rounded-full">
                  {filters.industry.length + filters.taskType.length + filters.complianceLevel.length + filters.responseStyle.length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">行业</h4>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => toggleFilter('industry', industry)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                          filters.industry.includes(industry)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">任务类型</h4>
                  <div className="flex flex-wrap gap-2">
                    {TASK_TYPE_OPTIONS.map((task) => (
                      <button
                        key={task}
                        onClick={() => toggleFilter('taskType', task)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                          filters.taskType.includes(task)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {task}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">合规等级</h4>
                  <div className="flex flex-wrap gap-2">
                    {COMPLIANCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => toggleFilter('complianceLevel', level)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                          filters.complianceLevel.includes(level)
                            ? 'bg-secondary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level}级
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">响应风格</h4>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_STYLE_OPTIONS.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => toggleFilter('responseStyle', style.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                          filters.responseStyle.includes(style.value)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    清除所有筛选
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredPersonalities.length && filteredPersonalities.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">全选</span>
              </label>
              <span className="text-sm text-gray-400">
                共 {filteredPersonalities.length} 个人格
              </span>
            </div>
            
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">已选择 {selectedIds.length} 项</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {filteredPersonalities.map((personality: Personality) => {
              const CategoryIcon = categoryIcons[personality.category];
              const isSelected = selectedIds.includes(personality.id);
              const inCandidate = isInCandidateList(personality.id);
              const inCompare = isInCompareList(personality.id);

              return (
                <div
                  key={personality.id}
                  className={`relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? 'border-primary-300 ring-2 ring-primary-100'
                      : 'border-gray-100 hover:border-primary-200'
                  }`}
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => toggleSelect(personality.id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={personality.avatar}
                      alt={personality.name}
                      className="w-14 h-14 rounded-xl bg-gray-200 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{personality.name}</h3>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-primary-500" />
                        <span className="text-xs text-gray-500">{categoryLabels[personality.category]}</span>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs text-gray-500">{personality.industry}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {personality.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />
                      <span className="text-sm font-medium text-gray-700">{personality.rating}</span>
                      <span className="text-xs text-gray-400">({personality.usage_count.toLocaleString()}次)</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {getComplianceStars(personality.compliance_level)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-md">{personality.task_type}</span>
                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md">
                      {styleLabels[personality.response_style]}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCandidate(personality)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        inCandidate
                          ? 'bg-primary-500 text-white hover:bg-primary-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {inCandidate ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {inCandidate ? '已加入候选' : '加入候选'}
                    </button>
                    <button
                      onClick={() => handleAddToCompare(personality)}
                      disabled={compareList.length >= 5 && !inCompare}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        inCompare
                          ? 'bg-secondary-500 text-white hover:bg-secondary-600'
                          : compareList.length >= 5
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {inCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                      {inCompare ? '已加入对比' : '加入对比'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPersonalities.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的人格</h3>
              <p className="text-gray-500">请尝试调整筛选条件或搜索关键词</p>
            </div>
          )}
        </div>

        {compareList.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4 z-50">
            <div className="flex -space-x-3">
              {compareList.slice(0, 4).map((p) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.name}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
              {compareList.length > 4 && (
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm font-medium text-gray-600">
                  +{compareList.length - 4}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{compareList.length} 人格待对比</div>
              <div className="text-xs text-gray-500">最多支持5人格对比</div>
            </div>
            <a
              href="/compare"
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              去对比
            </a>
          </div>
        )}

        {candidateList.length > 0 && (
          <div className="fixed bottom-6 left-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4 z-50">
            <ShoppingCart className="w-8 h-8 text-primary-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">{candidateList.length} 人格待采购</div>
              <div className="text-xs text-gray-500">已加入候选清单</div>
            </div>
            <a
              href="/purchase"
              className="px-4 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-medium rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200"
            >
              去采购
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

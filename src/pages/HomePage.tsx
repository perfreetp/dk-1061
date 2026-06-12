import { useEffect } from 'react';
import { Users, Star, TrendingUp, Award, ArrowRight, MessageCircle, Briefcase, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockPersonalities } from '../data/mockData';
import type { Personality } from '../types';

const stats = [
  { icon: Users, value: '500+', label: 'AI人格', color: 'primary' },
  { icon: Briefcase, value: '100+', label: '企业客户', color: 'secondary' },
  { icon: Star, value: '4.8', label: '平均评分', color: 'orange' },
  { icon: TrendingUp, value: '98%', label: '满意度', color: 'green' },
];

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

export function HomePage() {
  const { setPersonalities } = useAppStore();

  useEffect(() => {
    setPersonalities(mockPersonalities);
  }, [setPersonalities]);

  const featuredPersonalities = mockPersonalities.slice(0, 4);

  const getComplianceStars = (level: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < level ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-transparent to-secondary-500/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-200/30 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>企业级AI人格服务平台</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              为企业挑选
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                {' '}最适合的AI人格{' '}
              </span>
              助力业务增长
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              提供客服、销售陪练、培训讲师等多类型AI人格，支持多维度筛选、评测对比和采购管理，帮助企业快速找到最匹配的AI助手。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/personalities"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
              >
                浏览人格库
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-800 font-medium rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                开始评测对比
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorMap = {
                primary: 'bg-primary-100 text-primary-600',
                secondary: 'bg-secondary-100 text-secondary-600',
                orange: 'bg-orange-100 text-orange-600',
                green: 'bg-green-100 text-green-600',
              };
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorMap[stat.color as keyof typeof colorMap]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">热门AI人格推荐</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">精选优质AI人格，覆盖客服、销售、培训等多个场景</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPersonalities.map((personality: Personality) => {
              const CategoryIcon = categoryIcons[personality.category];
              
              return (
                <div
                  key={personality.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={personality.avatar}
                      alt={personality.name}
                      className="w-14 h-14 rounded-xl bg-gray-200 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{personality.name}</h3>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-primary-500" />
                        <span className="text-xs text-gray-500">{categoryLabels[personality.category]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{personality.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />
                      <span className="text-sm font-medium text-gray-700">{personality.rating}</span>
                      <span className="text-xs text-gray-400">({personality.usage_count.toLocaleString()}次使用)</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {getComplianceStars(personality.compliance_level)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-10">
            <Link
              to="/personalities"
              className="inline-flex items-center gap-2 px-6 py-3 text-primary-600 font-medium hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors duration-200"
            >
              查看全部人格
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">多维度筛选，精准匹配</h2>
              <p className="text-gray-600 mb-8">
                支持按行业、任务类型、合规等级、响应风格等多维度筛选，快速找到最适合您业务需求的AI人格。
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">选择行业</h4>
                    <p className="text-sm text-gray-500">金融、医疗、教育、电商等8大行业</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                    <span className="text-secondary-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">筛选任务类型</h4>
                    <p className="text-sm text-gray-500">客户咨询、售后支持、销售跟进等</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">设置合规等级</h4>
                    <p className="text-sm text-gray-500">1-5级合规标准，满足不同行业需求</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">行业</span>
                    <span className="text-primary-600 font-medium">金融</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">任务类型</span>
                    <span className="text-primary-600 font-medium">客户咨询</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">合规等级</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Star
                          key={level}
                          className={`w-4 h-4 ${level <= 4 ? 'text-secondary-500 fill-secondary-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">响应风格</span>
                    <span className="text-primary-600 font-medium">专业</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200">
                  开始筛选
                </button>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200/50 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-200/50 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">准备好提升您的业务了吗?</h2>
          <p className="text-primary-100 mb-8">加入100+企业客户，体验AI人格带来的效率革命</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/personalities"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              免费试用
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/purchase"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-500/30 text-white font-medium rounded-xl border border-white/20 hover:bg-primary-500/40 transition-all duration-200"
            >
              提交采购申请
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">AI人格市场</span>
              </div>
              <p className="text-sm text-gray-500">企业级AI人格服务平台，助力业务增长</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">产品</h4>
              <ul className="space-y-2">
                <li><a href="/personalities" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">人格库</a></li>
                <li><a href="/compare" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">评测对比</a></li>
                <li><a href="/purchase" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">采购申请</a></li>
                <li><a href="/monitor" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">使用监控</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">解决方案</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-500">客服自动化</span></li>
                <li><span className="text-sm text-gray-500">销售培训</span></li>
                <li><span className="text-sm text-gray-500">员工培训</span></li>
                <li><span className="text-sm text-gray-500">技术支持</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">联系我们</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-gray-500">邮箱: contact@aipersonality.com</span></li>
                <li><span className="text-sm text-gray-500">电话: 400-123-4567</span></li>
                <li><span className="text-sm text-gray-500">工作时间: 周一至周五 9:00-18:00</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
            Copyright 2024 AI人格市场. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

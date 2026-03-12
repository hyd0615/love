import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MessageSquare, Lock, Image, Book, ChevronRight, ChevronLeft, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

// 定义数据类型
interface Photo {
  id: number;
  url: string;
  caption: string;
  date: string;
}

interface Message {
  id: number;
  content: string;
  date: string;
  sender: string;
}

interface SecretNote {
  id: number;
  content: string;
  date: string;
  isRead: boolean;
}

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
}

// 生理期相关数据类型
interface PeriodEntry {
  id: number;
  startDate: string;
  endDate?: string;
  symptoms?: string;
}

// Mock数据
const initialPhotos: Photo[] = [
  {
    id: 1,
    url: "https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=Romantic%20couple%20in%20park%2C%20sunset&sign=048e2bbb8799eed1d492fc8d1642370f",
    caption: "我们的第一次约会",
    date: "2026-01-15"
  },
  {
    id: 2,
    url: "https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=Couple%20holding%20hands%2C%20beach&sign=82d11d477054b4b71901032f0dd2aaef",
    caption: "海边漫步",
    date: "2026-02-08"
  },
  {
    id: 3,
    url: "https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=Couple%20smiling%2C%20cafe&sign=7bc21287bfda5d8d5d8662e573f29a23",
    caption: "咖啡馆的下午",
    date: "2026-03-01"
  }
];

const initialMessages: Message[] = [
  {
    id: 1,
    content: "遇见你是我最大的幸运",
    date: "2026-01-20",
    sender: "我"
  },
  {
    id: 2,
    content: "每天和你在一起都很开心",
    date: "2026-02-14",
    sender: "TA"
  }
];

const initialSecretNotes: SecretNote[] = [
  {
    id: 1,
    content: "其实我偷偷为你准备了一个惊喜...",
    date: "2026-02-20",
    isRead: false
  }
];

const initialDiaryEntries: DiaryEntry[] = [
  {
    id: 1,
    title: "初次相遇",
    content: "今天是我们第一次见面的日子，阳光很好，心情也很好。",
    date: "2026-01-10"
  }
];

// 生理期初始数据
const initialPeriodEntries: PeriodEntry[] = [
  {
    id: 1,
    startDate: "2026-02-10",
    endDate: "2026-02-15",
    symptoms: "轻微腹痛"
  },
  {
    id: 2,
    startDate: "2026-03-12",
    symptoms: "刚来"
  }
];

// 恋爱统计数据
const relationshipStats = [
  { name: '甜蜜时光', value: 70 },
  { name: '小争执', value: 5 },
  { name: '平淡日子', value: 25 },
];

const COLORS = ['#ff85a2', '#ffb6c1', '#ffd9e3'];

const Home: React.FC = () => {
  // 状态管理
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [secretNotes, setSecretNotes] = useState<SecretNote[]>(initialSecretNotes);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(initialDiaryEntries);
  // 生理期相关状态
  const [periodEntries, setPeriodEntries] = useState<PeriodEntry[]>(initialPeriodEntries);
  const [averageCycle, setAverageCycle] = useState<number>(28); // 平均周期天数
  const [nextPeriodPrediction, setNextPeriodPrediction] = useState<string>('');
  const [periodStatus, setPeriodStatus] = useState<{status: string, days?: number, color: string}>({
    status: '安全期',
    color: '#94a3b8'
  });
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [relationshipDays, setRelationshipDays] = useState(0);
  const [nextAnniversary, setNextAnniversary] = useState<{days: number, date: string}>({days: 0, date: ''});
  
  // 表单状态
  const [showAddPeriodForm, setShowAddPeriodForm] = useState(false);
  const [newPeriodStartDate, setNewPeriodStartDate] = useState('');
  const [newPeriodEndDate, setNewPeriodEndDate] = useState('');
  const [newPeriodSymptoms, setNewPeriodSymptoms] = useState('');
  
  // 计算恋爱天数和生理期相关信息
  useEffect(() => {
    const startDate = new Date('2026-01-10'); // 假设恋爱开始日期
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRelationshipDays(diffDays);
    
    // 计算下一个纪念日
    const nextAnniversaryDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    const diffAnniversary = Math.ceil((nextAnniversaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setNextAnniversary({
      days: diffAnniversary,
      date: nextAnniversaryDate.toLocaleDateString('zh-CN')
    });
    
    // 计算生理期相关信息
    calculatePeriodInfo();
  }, [periodEntries]);
  
  // 计算生理期相关信息
  const calculatePeriodInfo = () => {
    if (periodEntries.length === 0) return;
    
    // 按日期排序，获取最近的生理期
    const sortedEntries = [...periodEntries].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const latestPeriod = sortedEntries[0];
    const latestStartDate = new Date(latestPeriod.startDate);
    const today = new Date();
    
    // 计算平均周期（如果有多个记录）
    if (sortedEntries.length > 1) {
      let totalDays = 0;
      for (let i = 0; i < sortedEntries.length - 1; i++) {
        const currentDate = new Date(sortedEntries[i].startDate);
        const nextDate = new Date(sortedEntries[i + 1].startDate);
        totalDays += Math.abs(currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);
      }
      setAverageCycle(Math.round(totalDays / (sortedEntries.length - 1)));
    }
    
    // 预测下一次生理期
    const nextPeriodDate = new Date(latestStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + averageCycle);
    setNextPeriodPrediction(nextPeriodDate.toLocaleDateString('zh-CN'));
    
    // 计算当前状态（生理期、排卵期、安全期）
    const daysSinceLastPeriod = Math.floor((today.getTime() - latestStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 假设生理期持续5天，排卵期在下次生理期前14天左右
    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod < 5) {
      // 生理期
      setPeriodStatus({
        status: '生理期',
        days: 5 - daysSinceLastPeriod,
        color: '#ef4444'
      });
    } else if (daysSinceLastPeriod >= averageCycle - 17 && daysSinceLastPeriod <= averageCycle - 11) {
      // 排卵期
      const daysLeft = (averageCycle - 11) - daysSinceLastPeriod;
      setPeriodStatus({
        status: '易孕期',
        days: daysLeft,
        color: '#f97316'
      });
    } else {
      // 安全期或接近生理期
      const daysUntilNextPeriod = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilNextPeriod <= 7) {
        setPeriodStatus({
          status: '经期将至',
          days: daysUntilNextPeriod,
          color: '#fb923c'
        });
      } else {
        setPeriodStatus({
          status: '安全期',
          color: '#94a3b8'
        });
      }
    }
  };
  
  // 照片轮播控制
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };
  
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };
  
  // 添加新内容
  const addMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      content,
      date: new Date().toLocaleDateString('zh-CN'),
      sender: '我'
    };
    setMessages([...messages, newMessage]);
  };
  
  const addDiaryEntry = (title: string, content: string) => {
    const newEntry: DiaryEntry = {
      id: Date.now(),
      title,
      content,
      date: new Date().toLocaleDateString('zh-CN')
    };
    setDiaryEntries([...diaryEntries, newEntry]);
  };
  
  // 添加生理期记录
  const addPeriodEntry = () => {
    if (!newPeriodStartDate) return;
    
    const newEntry: PeriodEntry = {
      id: Date.now(),
      startDate: newPeriodStartDate,
      endDate: newPeriodEndDate || undefined,
      symptoms: newPeriodSymptoms || undefined
    };
    
    setPeriodEntries([...periodEntries, newEntry]);
    // 重置表单
    setNewPeriodStartDate('');
    setNewPeriodEndDate('');
    setNewPeriodSymptoms('');
    setShowAddPeriodForm(false);
  };
  
  // 删除内容
  const deleteMessage = (id: number) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };
  
  const deleteDiaryEntry = (id: number) => {
    setDiaryEntries(diaryEntries.filter(entry => entry.id !== id));
  };
  
  const deletePeriodEntry = (id: number) => {
    setPeriodEntries(periodEntries.filter(entry => entry.id !== id));
  };
  
  // 标记悄悄话为已读
  const markSecretNoteAsRead = (id: number) => {
    setSecretNotes(secretNotes.map(note => 
      note.id === id ? { ...note, isRead: true } : note
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-800 font-sans">
      {/* 装饰元素 - 漂浮的爱心 */}
      <motion.div 
        className="fixed top-10 right-10 text-pink-400 opacity-70"
        animate={{ 
          y: [0, -15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Heart size={30} fill="#ff85a2" />
      </motion.div>
      
      <motion.div 
        className="fixed bottom-20 left-10 text-pink-300 opacity-50"
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Heart size={20} fill="#ffb6c1" />
      </motion.div>
      
      {/* 页面内容 */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部 */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-pink-600 mb-2 flex items-center justify-center">
              <Heart className="mr-2" fill="#ff4d6d" /> 我们的恋爱日记 
              <Heart className="ml-2" fill="#ff4d6d" />
            </h1>
            <p className="text-pink-500 text-lg">记录我们的每一刻美好时光</p>
          </motion.div>
          
          {/* 恋爱天数统计 */}
          <motion.div 
            className="mt-8 bg-white rounded-16 shadow-lg p-6 inline-block border border-pink-200"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <Calendar className="text-pink-500" size={28} />
              <div>
                <p className="text-gray-600">我们已经相爱</p>
                <p className="text-3xl font-bold text-pink-600">{relationshipDays} 天</p>
              </div>
            </div>
          </motion.div>
        </header>
        
        {/* 主内容区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧 - 照片轮播 */}
          <motion.div 
            className="bg-white rounded-16 shadow-lg overflow-hidden border border-pink-200"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-80">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === currentPhotoIndex ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ display: index === currentPhotoIndex ? 'block' : 'none' }}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-medium">{photo.caption}</p>
                    <p className="text-white/80 text-sm">{photo.date}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* 轮播控制 */}
              <button 
                onClick={prevPhoto} 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full text-pink-600 hover:bg-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextPhoto} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full text-pink-600 hover:bg-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* 指示器 */}
              <div className="absolute bottom-14 left-0 right-0 flex justify-center space-x-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* 右侧 - 恋爱统计 */}
          <motion.div 
            className="bg-white rounded-16 shadow-lg p-6 border border-pink-200"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center">
              <Book className="mr-2" size={20} /> 恋爱小统计
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full md:w-1/2 h-48">
                <PieChart width={200} height={200}>
                  <Pie
                    data={relationshipStats}
                    cx={100}
                    cy={100}
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {relationshipStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="mb-4 p-4 bg-pink-50 rounded-12">
                  <p className="text-gray-600 mb-1">下一个周年纪念日</p>
                  <p className="text-2xl font-bold text-pink-600">{nextAnniversary.days} 天后</p>
                  <p className="text-gray-500">{nextAnniversary.date}</p>
                </div>
                
                <div className="p-4 bg-pink-50 rounded-12">
                  <p className="text-gray-600 mb-1">照片数量</p>
                  <p className="text-2xl font-bold text-pink-600">{photos.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* 留言板 */}
          <motion.div 
            className="bg-white rounded-16 shadow-lg p-6 border border-pink-200 md:col-span-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center">
              <MessageSquare className="mr-2" size={20} /> 爱的留言板
            </h2>
            
            <div className="mb-4">
              <input 
                type="text"
                placeholder="写下你想对TA说的话..."
                className="w-full p-3 border border-pink-200 rounded-12 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addMessage(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-12 ${message.sender === '我' ? 'bg-pink-100' : 'bg-purple-100'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-pink-700">{message.sender}</span>
                    <button 
                      onClick={() => deleteMessage(message.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="mt-1">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{message.date}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* 悄悄话 */}
          <motion.div 
            className="bg-white rounded-16 shadow-lg p-6 border border-pink-200"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center">
              <Lock className="mr-2" size={20} /> 悄悄话
            </h2>
            
            <div className="space-y-3">
              {secretNotes.map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-12 cursor-pointer ${note.isRead ? 'bg-gray-100' : 'bg-pink-100 border-l-4 border-pink-500'}`}
                  onClick={() => markSecretNoteAsRead(note.id)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-medium ${note.isRead ? 'text-gray-600' : 'text-pink-700'}`}>
                      {note.isRead ? '已读' : '新消息'}
                    </span>
                    {!note.isRead && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  </div>
                  <p className="mt-1">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{note.date}</p>
                </motion.div>
              ))}
              
              {secretNotes.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无悄悄话</p>
              )}
            </div>
          </motion.div>
          
           {/* 恋爱日记 */}
          <motion.div 
            className="bg-white rounded-16 shadow-lg p-6 border border-pink-200"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center">
              <Book className="mr-2" size={20} /> 恋爱日记
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {diaryEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-12 bg-purple-50"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-purple-700">{entry.title}</h3>
                    <button 
                      onClick={() => deleteDiaryEntry(entry.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm">{entry.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{entry.date}</p>
                </motion.div>
              ))}
              
              {diaryEntries.length === 0 && (
                <p className="text-gray-500 text-center py-4">还没有日记，写点什么吧</p>
              )}
            </div>
            
            <button className="mt-4 w-full py-2 px-4 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-12 flex items-center justify-center transition-colors">
              <Plus size={16} className="mr-1" /> 写新日记
            </button>
          </motion.div>
          
          {/* 生理期记录 */}
          <motion.div 
            className="bg-white rounded-16 shadow-lg p-6 border border-pink-200 md:col-span-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center">
              <Calendar className="mr-2" size={20} /> 生理期记录
            </h2>
            
            {/* 当前状态卡片 */}
            <motion.div 
              className="mb-6 p-5 rounded-16 shadow-sm bg-gradient-to-r from-red-50 to-pink-50 border border-red-100"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center mr-4">
                    <AlertCircle size={32} color={periodStatus.color} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">当前状态</h3>
                    <p className="text-2xl font-bold" style={{ color: periodStatus.color }}>
                      {periodStatus.status}
                    </p>
                    {periodStatus.days !== undefined && (
                      <p className="text-gray-500">
                        {periodStatus.status === '生理期' ? '还剩约' : '还有约'} 
                        <span className="font-medium" style={{ color: periodStatus.color }}>
                          {periodStatus.days}
                        </span> 天
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-600 mb-1">平均周期</p>
                  <p className="text-2xl font-bold text-pink-600">{averageCycle} 天</p>
                  
                  {nextPeriodPrediction && (
                    <div className="mt-3">
                      <p className="text-gray-600 mb-1">预计下次生理期</p>
                      <p className="text-lg font-medium text-pink-600">{nextPeriodPrediction}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* 记录列表 */}
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-2">
              {periodEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-12 bg-white border border-pink-100 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-pink-700">
                        {new Date(entry.startDate).toLocaleDateString('zh-CN')}
                        {entry.endDate && (
                          <> ~ {new Date(entry.endDate).toLocaleDateString('zh-CN')}</>
                        )}
                      </div>
                      {entry.symptoms && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <Info size={14} className="mr-1" /> {entry.symptoms}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => deletePeriodEntry(entry.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {periodEntries.length === 0 && (
                <p className="text-gray-500 text-center py-4">还没有记录，开始记录生理期吧</p>
              )}
            </div>
            
            {/* 添加记录表单 */}
            {showAddPeriodForm ? (
              <div className="p-4 bg-pink-50 rounded-12 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                  <input 
                    type="date"
                    value={newPeriodStartDate}
                    onChange={(e) => setNewPeriodStartDate(e.target.value)}
                    className="w-full p-2 border border-pink-200 rounded-8 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束日期（可选）</label>
                  <input 
                    type="date"
                    value={newPeriodEndDate}
                    onChange={(e) => setNewPeriodEndDate(e.target.value)}
                    className="w-full p-2 border border-pink-200 rounded-8 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">症状（可选）</label>
                  <input 
                    type="text"
                    placeholder="例如：腹痛、疲劳等"
                    value={newPeriodSymptoms}
                    onChange={(e) => setNewPeriodSymptoms(e.target.value)}
                    className="w-full p-2 border border-pink-200 rounded-8 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={addPeriodEntry}
                    className="flex-1 py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-8 transition-colors"
                  >
                    保存记录
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddPeriodForm(false);
                      setNewPeriodStartDate('');
                      setNewPeriodEndDate('');
                      setNewPeriodSymptoms('');
                    }}
                    className="px-4 py-2 border border-pink-300 hover:bg-pink-50 text-pink-600 rounded-8 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddPeriodForm(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-12 flex items-center justify-center transition-colors shadow-md"
              >
                <Plus size={18} className="mr-2" /> 添加生理期记录
              </button>
            )}
          </motion.div>
        </div>
        
        {/* 页脚 */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>❤️ 我们的恋爱日记 © 2026 ❤️</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
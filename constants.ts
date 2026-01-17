
import { Article, User } from './types';

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: '硅悖论：为什么量子技术突破比预期提前了 5 年？',
    excerpt: '探索从开放式办公区的嘈杂到专注于声学舱和禅意冥想空间的转变。随着技术的不断演进，我们正处于一个信息爆炸的时代。',
    author: '连线杂志',
    category: '科技',
    readTime: '8 分钟',
    readCount: 12540,
    commentCount: 156,
    matchScore: 98,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTptVF-0tRid1ts8kxrPynyhH1EzqLGowOXlUZshryP_SY9RF1_THFwg1i9RjbMUekB7DGq3QY7mh1jy2lfvyRuj_4jyq0edIuTORNkp4aXYMEVm5ouo1KItB80qE-87PHg37jgaAqKaIKDne7fGcoI_LrQCDNMi43D3LRZr7x8zlJYnGfUadZavq6EYmFLCbVR5bhdp3RW49QYLa-TLkd4sjAi5PAt6xqPczb1HqG8VWFDPxIo8Ej85SnTTe1VFFAOjk_nArBJ0',
    images: [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800'
    ],
    date: '2024-03-20',
    source: '连线杂志'
  },
  {
    id: '2',
    title: '华尔街的新型预测算法解析',
    excerpt: '利用人工智能重塑现代金融市场的交易逻辑。',
    author: '金融周刊',
    category: '金融',
    readTime: '12 分钟',
    readCount: 8420,
    commentCount: 89,
    matchScore: 94,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0KrRvJhegHoBvPuJrVXUV582X8ZivmRD7w6Eo_ytFZ52dYkXS2YPfeQI22bO9FNydgsfByQBaFOvZBp_qzD7m5EMhQudBA4K27-JMPwg4YNrRePNVWiVYFsibYqEbqGKjvbEm8Aw3dZcc5S90d6dIxJpWEwMK2ZsT4SdsZ8_r18_2W9wDv5wek2MMZa3u2eBPbVMgrSr7m7G5H82TAfPHxN4SPlBU_ZOsp3frMkcJUhACMszrbTicrJ637GCWTqK5gGKIiLIn_NE',
    images: [
      'https://images.unsplash.com/photo-1611974717483-5828fd165509?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    ],
    date: '2024-03-19',
    source: '彭博社'
  },
  {
    id: '3',
    title: '数据驱动选拔：足球运动的未来',
    excerpt: '如何通过大数据分析提升球队的竞争优势。',
    author: '体育观察',
    category: '体育',
    readTime: '10 分钟',
    readCount: 5120,
    commentCount: 42,
    matchScore: 91,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxnF8LRRHzloXn4cEvcaH1Yua0hF6SIEKFhoIf_HwCFykZQeSQU58o632RYlLTNbeJH83temooWx2SfKoS4QSoOENCuHR36Wyw2xgiVlt10Kf9gzCbE0sTe-BdcHP1H4_XuIyoiH3hhayzkPcYmi81LDc85rWnTQMs-ThiDDHQ4Fe56LwW5yC8d7ivTeGPq_9w-nqMTDLscw1xLnrHyIQNNvUaX3vAJvUoEH7Jz95k6RwoMiAs22tNwIS4pRHpaAntBreu_mY6ylo',
    date: '2024-03-18',
    source: 'ESPN'
  },
  {
    id: '4',
    title: '高市早苗对华正式“宣战”！中国两邻居站队日本，特朗普告示全球',
    excerpt: '最新地缘政治动态分析，各方势力角逐进入白热化阶段。',
    author: '南笔墨舞',
    category: '国际',
    readTime: '4 分钟',
    readCount: 45000,
    commentCount: 2304,
    matchScore: 85,
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541872703-74c5e443d1f5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&q=80&w=800'
    ],
    date: '2024-03-21',
    source: '国际观察'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex.r@newspulse.com',
    role: '管理员',
    status: 'active',
    joinDate: '2023年10月24日',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkmgSg5qHxzsOgMrdbFNgtDcflKj89Kr9XcvX0RKAQhODsgzCq-HP_eHhcGuL1HUvPM4bPtC4I9gznITPI65xrndQ4GdDVyCwyU3mV9b-26rtx07-GVc6ztELutGyUtaqgvrqp6-2_b0dBvieSNoxXA5S_pS0vq5KIF5xzCTZJeCaat7hCHVFSVx_kENpkgrPXyu0q19ND9Vy74KhCzbdr96cmEVehKj4I3LYEhZd5xB2_rW4JI7cGCw-Ud1VFHgDEUG9vG3El9KM',
    interests: ['tech', 'finance', 'science']
  }
];

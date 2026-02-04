import { ref } from 'vue'
import { api } from '../utils/api'

// 时间格式化
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diff = now - d
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getMonth() + 1}-${d.getDate()}`
}

// 数字格式化
const formatCount = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return String(num || 0)
}

// 每页条数
const PAGE_SIZE = 20

export function useSquareNews() {
  const newsList = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const total = ref(0)

  const loadNews = async (refresh = false) => {
    if (refresh) {
      page.value = 1
      hasMore.value = true
    }
    
    loading.value = true
    try {
      const res = await api.get('/square/news', { 
        params: { page: page.value, pageSize: PAGE_SIZE } 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(n => ({
          id: n.id,
          title: n.title,
          source: n.source || '快讯',
          time: n.time || formatTime(n.createdAt),
          cover: n.cover,
          url: n.url
        }))
        
        if (refresh) {
          newsList.value = list
        } else {
          newsList.value = [...newsList.value, ...list]
        }
        
        total.value = res.data.total || 0
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        if (refresh) {
          newsList.value = []
        }
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载新闻失败', e)
      if (refresh) {
        newsList.value = []
      }
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  const loadMoreNews = async () => {
    if (loadingMore.value || !hasMore.value) return
    
    loadingMore.value = true
    page.value++
    
    try {
      const res = await api.get('/square/news', { 
        params: { page: page.value, pageSize: PAGE_SIZE } 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(n => ({
          id: n.id,
          title: n.title,
          source: n.source || '快讯',
          time: n.time || formatTime(n.createdAt),
          cover: n.cover,
          url: n.url
        }))
        
        newsList.value = [...newsList.value, ...list]
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载更多新闻失败', e)
      page.value--
    } finally {
      loadingMore.value = false
    }
  }

  const refreshNews = () => loadNews(true)

  return {
    newsList,
    loading,
    loadingMore,
    hasMore,
    page,
    total,
    loadNews,
    loadMoreNews,
    refreshNews
  }
}

export function useSquarePosts() {
  const postsList = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const total = ref(0)

  const formatPost = (p) => ({
    id: p.id,
    authorId: p.userId || p.user?.id,
    author: p.user?.nickname || p.user?.username || '用户',
    avatar: p.user?.avatar,
    verified: p.user?.verified || false,
    level: p.user?.level,
    content: p.content,
    images: p.images || [],
    topics: p.topics || (p.topic ? [p.topic] : []),
    time: formatTime(p.createdAt),
    likes: p.likeCount || 0,
    comments: p.commentCount || 0,
    isLiked: p.isLiked || false,
    isFollowing: p.isFollowing || false
  })

  const loadPosts = async (refresh = false) => {
    // 防止重复加载
    if (loading.value) return
    
    if (refresh) {
      page.value = 1
      hasMore.value = true
    }
    
    loading.value = true
    try {
      const res = await api.square.getPosts({ 
        tab: 'recommend', 
        page: page.value, 
        pageSize: PAGE_SIZE 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(formatPost)
        
        if (refresh) {
          postsList.value = list
        } else {
          postsList.value = [...postsList.value, ...list]
        }
        
        total.value = res.data.total || 0
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        if (refresh) {
          postsList.value = []
        }
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载动态失败', e)
      if (refresh) {
        postsList.value = []
      }
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore.value || !hasMore.value) return
    
    loadingMore.value = true
    page.value++
    
    try {
      const res = await api.square.getPosts({ 
        tab: 'recommend', 
        page: page.value, 
        pageSize: PAGE_SIZE 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(formatPost)
        postsList.value = [...postsList.value, ...list]
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载更多动态失败', e)
      page.value--
    } finally {
      loadingMore.value = false
    }
  }

  const likePost = async (post) => {
    // 乐观更新
    const wasLiked = post.isLiked
    post.isLiked = !wasLiked
    post.likes += wasLiked ? -1 : 1
    
    try {
      await api.square.toggleLike({ 
        targetType: 'post', 
        targetId: post.id 
      })
    } catch (e) {
      // 回滚
      post.isLiked = wasLiked
      post.likes += wasLiked ? 1 : -1
      console.error('点赞失败', e)
    }
  }

  const refreshPosts = () => loadPosts(true)

  return {
    postsList,
    loading,
    loadingMore,
    hasMore,
    page,
    total,
    loadPosts,
    loadMorePosts,
    likePost,
    refreshPosts
  }
}

export function useSquareTopics() {
  const topics = ref([])
  const loading = ref(false)

  const loadTopics = async () => {
    loading.value = true
    try {
      const res = await api.get('/square/topics/hot')
      if (res.success && res.data?.list) {
        topics.value = res.data.list.map(t => ({
          name: t.name || t.tag,
          count: formatCount(t.count || t.postCount || 0)
        }))
      } else {
        topics.value = []
      }
    } catch (e) {
      console.error('加载话题失败', e)
      topics.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    topics,
    loading,
    loadTopics
  }
}

export function useSquareFollowing() {
  const followingList = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const total = ref(0)

  const formatPost = (p) => ({
    id: p.id,
    authorId: p.userId || p.user?.id,
    author: p.user?.nickname || p.user?.username || '用户',
    avatar: p.user?.avatar,
    content: p.content,
    images: p.images || [],
    topics: p.topics || [],
    time: formatTime(p.createdAt),
    likes: p.likeCount || 0,
    comments: p.commentCount || 0,
    isLiked: p.isLiked || false
  })

  const loadFollowing = async (refresh = false) => {
    if (refresh) {
      page.value = 1
      hasMore.value = true
    }
    
    loading.value = true
    try {
      const res = await api.square.getPosts({ 
        tab: 'following', 
        page: page.value, 
        pageSize: PAGE_SIZE 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(formatPost)
        
        if (refresh) {
          followingList.value = list
        } else {
          followingList.value = [...followingList.value, ...list]
        }
        
        total.value = res.data.total || 0
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        if (refresh) {
          followingList.value = []
        }
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载关注动态失败', e)
      if (refresh) {
        followingList.value = []
      }
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  const loadMoreFollowing = async () => {
    if (loadingMore.value || !hasMore.value) return
    
    loadingMore.value = true
    page.value++
    
    try {
      const res = await api.square.getPosts({ 
        tab: 'following', 
        page: page.value, 
        pageSize: PAGE_SIZE 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(formatPost)
        followingList.value = [...followingList.value, ...list]
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载更多关注动态失败', e)
      page.value--
    } finally {
      loadingMore.value = false
    }
  }

  const refreshFollowing = () => loadFollowing(true)

  return {
    followingList,
    loading,
    loadingMore,
    hasMore,
    page,
    total,
    loadFollowing,
    loadMoreFollowing,
    refreshFollowing
  }
}

// 学习内容
export function useSquareLearn() {
  const learnList = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const total = ref(0)

  const loadLearn = async (refresh = false) => {
    if (refresh) {
      page.value = 1
      hasMore.value = true
    }
    
    loading.value = true
    try {
      const res = await api.get('/square/learn', { 
        params: { page: page.value, pageSize: PAGE_SIZE } 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary || item.description,
          cover: item.cover || item.image,
          source: item.source || '学习强国',
          category: item.category,
          time: item.time || formatTime(item.createdAt),
          views: item.views || 0,
          url: item.url
        }))
        
        if (refresh) {
          learnList.value = list
        } else {
          learnList.value = [...learnList.value, ...list]
        }
        
        total.value = res.data.total || 0
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        if (refresh) {
          learnList.value = []
        }
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载学习内容失败', e)
      if (refresh) {
        learnList.value = []
      }
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  const loadMoreLearn = async () => {
    if (loadingMore.value || !hasMore.value) return
    
    loadingMore.value = true
    page.value++
    
    try {
      const res = await api.get('/square/learn', { 
        params: { page: page.value, pageSize: PAGE_SIZE } 
      })
      
      if (res.success && res.data?.list) {
        const list = res.data.list.map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary || item.description,
          cover: item.cover || item.image,
          source: item.source || '学习强国',
          category: item.category,
          time: item.time || formatTime(item.createdAt),
          views: item.views || 0,
          url: item.url
        }))
        
        learnList.value = [...learnList.value, ...list]
        hasMore.value = list.length >= PAGE_SIZE
      } else {
        hasMore.value = false
      }
    } catch (e) {
      console.error('加载更多学习内容失败', e)
      page.value--
    } finally {
      loadingMore.value = false
    }
  }

  const refreshLearn = () => loadLearn(true)

  return {
    learnList,
    loading,
    loadingMore,
    hasMore,
    page,
    total,
    loadLearn,
    loadMoreLearn,
    refreshLearn
  }
}

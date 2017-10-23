import Vue from 'vue'
import Router from 'vue-router'
// 全部一二级路由都改成异步加载的模式
// import Recommend from '@/components/recommend/recommend'
// import Singer from '@/components/singer/singer'
// import SingerDetail from '@/components/singer-detail/singer-detail'
// import Rank from '@/components/rank/rank'
// import Search from '@/components/search/search'
// import Disc from '@/components/disc/disc'
// import TopList from '@/components/top-list/top-list'
// import UserCenter from '@/components/user-center/user-center'

Vue.use(Router)

// 把组件全部变成异步加载 可以更缩小文件体积
// vue 1.X 中 有 resolve => {require.ensure([component], ()=> {resolve(require(component))})}
// webpack2 有 require.ensure()
// 所以可以把 require.ensure 改成 import
const Recommend = (resolve) => {
  // 引入相对路径
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  // 引入相对路径
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  // 引入相对路径
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  // 引入相对路径
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  // 引入相对路径
  import('components/search/search').then((module) => {
    resolve(module)
  })
}

const Disc = (resolve) => {
  // 引入相对路径
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  // 引入相对路径
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}

const UserCenter = (resolve) => {
  // 引入相对路径
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      // 默认起始页跳转 redirect
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    },
    {
      path: '/rank',
      component: Rank,
      children: [{
        path: ':id',
        component: TopList
      }]
    },
    {
      path: '/search',
      component: Search,
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})

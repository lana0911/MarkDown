import { createStore } from 'vuex'
import { status } from './modules/status'
import { loading } from './modules/loading'
import { advance } from './modules/advance'
export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    status,
    loading,
    advance
  },
})

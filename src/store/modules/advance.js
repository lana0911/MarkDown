export const advance = {
  namespaced: true,
  state: {
    img_overwrite: false,
    deleAll_file_dir: false,
    encoding: false,
  },
  mutations: {
    setImgOverwrite (state, val) {
        state.img_overwrite = val
    },
    setDeleAllFile (state, val) {
        state.deleAll_file_dir = val
    },
    setEncoding (state, val) {
        state.encoding = val
    }
  }
}
  

export const status = {
  namespaced: true,
  state: {
    content_status: '已儲存',
    original: '',
    md_content: '',
    reload_file: false,
    dialog: false,
    editOrAdd: '',
    usedVersion: '',
    BreadCurmb: [],
    //
    now_selected: {
        id: -1,
        type: '',
        name: ''
    },
    currtMd: {
        id: -1,
        type: '',
        name: ''
    },

    ImgURl: ''
  },
  mutations: {
    setSelect (state, pair) {
        state.now_selected = pair
    },
    setCurrentMd (state, md) {
        state.currtMd = md
    },
    setBreadCurmb (state, list) {
        state.BreadCurmb = list
    },
    setContent (state, md) {
        state.md_content = md
    },

    setStatus (state, NewStatus) {
        state.content_status = NewStatus
    },
    setOriginal (state, str) {
        state.original = str
    },
    setReload (state, status) {
        state.reload_file = status
    },
    setDialog (state, dialog) {
        state.dialog = dialog
    },
    setEditOrAdd (state, mode) {
        state.editOrAdd = mode
    },
    setVersion (state, version) {
        state.usedVersion = version
    },
    setImgURL (state, url) {
        var fullPath = url + "/mdapi/api/markdown/file/path/?file_path="
        state.ImgURl = fullPath
    },
  }
}
  
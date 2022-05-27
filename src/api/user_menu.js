import http from '@/api/http'

export default {
  getList() {
    return http({
      url: '/esmanageapi/role-menu/custom-menu/',
      method: 'get',
    })
  },
  // getItemById(id) {
  //   return http({
  //     url: `/esmanageapi/role-menu/custom-menu/${id}/`,
  //     method: 'get',
  //   })
  // },
  addItem(data) {
    return http({
      url: '/esmanageapi/role-menu/custom-menu/',
      method: 'post',
      data,
    })
  },
  // update(data, id) {
  //   return http({
  //     url: `/esmanageapi/role-menu/custom-menu/${id}/`,
  //     method: 'put',
  //     data,
  //   })
  // },
  // 更新部分
  updatePartOf(data, id) {
    return http({
      url: `/esmanageapi/role-menu/custom-menu/${id}/`,
      method: 'patch',
      data,
    })
  },
  delete(id) {
    return http({
      url: `/esmanageapi/role-menu/custom-menu/${id}/`,
      method: 'delete',
    })
  },
}

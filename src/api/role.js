import http from '@/api/http'
export default {
  getList() {
    return http({
      url: `/esmanageapi/role-menu/role-perms/get_role_perms_list/`,
      method: 'get',
    })
  },
  getItemById(id) {
    return http({
      url: `/esmanageapi/role-menu/role-perms/get_role_perms_by_id/${id}/`,
      method: 'get',
    })
  },
  addItem(data) {
    return http({
      url: '/esmanageapi/role-menu/role-perms/create_perms_manager/',
      method: 'post',
      data,
    })
  },
  update(data, id) {
    return http({
      url: `/esmanageapi/role-menu/role-perms/update_perms_manager/${id}/`,
      method: 'post',
      data,
    })
  },
  delete(id) {
    return http({
      url: `/esmanageapi/role-menu/role-perms/delete_role/${id}/`,
      method: 'delete',
    })
  },
}

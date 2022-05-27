import authApi from '@/api/auth'
export const removeEmpty = (params) => {
  const tem = params
  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === undefined) {
      delete tem[key]
    }
  })
  return tem
}

export const getCookie = (cname) => {
  var name = cname + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1)
    if (c.indexOf(name) != -1) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

export const updateLocalStorgeToken = (response) => {
const { access_token/*, user */} = response
  localStorage.setItem('access_token', access_token)
  // store.dispatch('user/setUser', user)
  const csrftoken = getCookie('csrftoken')
  localStorage.setItem('csrftoken', csrftoken)
}


export const refreshToken = async () => {
  const response = await authApi.refreshToken()
  if (response.access_token) {
    await updateLocalStorgeToken(response)
    return true
  } else {
    return false
  }
}
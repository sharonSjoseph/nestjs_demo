export default {
  APPLICANT: 'applicant',
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'superadmin',
  paginationLimit: 5000000,
  ACTIVE: 1,
  INACTIVE: 0,
  DELETED: 2,
  OTHER: 'other',
  DYNAMIC: 'dynamic',
  currentOnlyDate: function () {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let current = dd + '-' + mm + '-' + yyyy;
    return current;
  },
  randomString: function (length?: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  const n = length || 15
  for (let i = 0; i < n; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
},
};

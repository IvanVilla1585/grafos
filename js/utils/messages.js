'use strict'

import toastr from 'toastr'

const messages = {
  success(msg) {
    toastr.success(msg)
  },
  info(msg) {
    toastr.info(msg)
  }
}

export default messages
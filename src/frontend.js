// TODO:
const API_ENDPOINT = "https://creeper-twitter.herokuapp.com"
// const API_ENDPOINT = "https://41713b36.ngrok.io"
class CreeperMessage {
  constructor (elm) {
    this.username = null
    this.usernameElm = null
    this.reportButton = null
    this.creepCounter = null
    this.isCreep = false
    this.elm = elm
    this.markMessage()
    this.findUserName()
    this.createReportButton()
  }
  hasCounter () {
   return $(this.elm).find('div.creepCounter').length > 0
  }
  createCreepCounter (number) {
    if (this.hasCounter()) {
      return
    }
    this.isCreep = true
    this.creepCounter = document.createElement('div')
    this.creepCounter.classList.add('creepCounter')
    this.creepCounter.innerText = number
    this.elm.append(this.creepCounter)
  }
  alreadyMarked () {
    return $(this.elm).find('a.creeper').length > 0
  }
  createReportButton () {
    let that = this
    if (this.alreadyMarked()) {
      return
    }
    this.reportButton = document.createElement('a')
    this.reportButton.classList.add('creeper')
    this.reportButton.innerText = '8=>'
    $(this.reportButton).on('click', (e) => {
      e.preventDefault()
      $.post(API_ENDPOINT + "/api/v1/reports",
        {
          reporter_id: document.creeper.me,
          creep_id: this.username
        }).done((data) => {
            that.markAsCreeper()
            that.elm.removeChild(this.reportButton)
        })
    })
    this.elm.append(this.reportButton)
  }
  markAsCreeper () {
    $(this.elm).css('background', '#b22222')
    this.usernameElm.css('color', 'red')
  }
  findUserName () {
    this.usernameElm = $(this.elm).find('span:contains("@")')
    this.username = $(this.usernameElm).text()
  }
  markMessage () {
    $(this.elm).data('creeper-init', "true")
    $(this.elm).attr('data-creeper-init', "true")
  }
}
class Creeper {
  constructor () {
    this.myUsername = null
    this.messages = []
    this.usernames = new Set()
    this.findAllMessages()
  }
  findMe () {
    let me = $('div[data-testid="SideNav_AccountSwitcher_Button"]').find('span:contains("@")').text()
    return me
  }
  getMessageForUser (username) {
    return this.messages.find((msg) => msg.username === username)
  }
  checkForCreepers () {
    let that = this
    $.get(API_ENDPOINT + "/api/v1/reports", {
      creeper_ids: [...new Set(that.usernames)].join(','),
    }).done((data) => {
      that.usernames.forEach((username) => {
        if (username.indexOf('@') > -1) {
          if (data.creeps[username] > 0) {
            console.log('creep:', 'marking', username)
            let elm = $('div[data-testid="conversation"]:contains(' + username+')')
            let message = new CreeperMessage(elm)
            message.createCreepCounter(data.creeps[username])
            message.markAsCreeper()
          }
        }
      })
    })
  }
  findAllMessages () {
    let that = this
    setInterval(() => {
      this.me = this.findMe()
      let newMessages = $('div[data-testid="conversation"]').map((index, msgElm) => {
        return new CreeperMessage(msgElm)
      })

      newMessages.map((index, msg) => {
        if (!that.usernames.has(msg.username)) {
          that.usernames.add(msg.username)
          that.messages.push(msg)
        }
      })
    }, 2000)
    setInterval(() => {
      this.checkForCreepers()
    }, 1000)
  }
}

document.creeper = new Creeper()

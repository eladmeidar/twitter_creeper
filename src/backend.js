
class Creeper {
  constructor () {
    this.onInstalled()
  }
  onInstalled () {
    chrome.runtime.onInstalled.addListener(function() {
      console.log('Installed')
    });
  }
}

let backend = new Creeper()

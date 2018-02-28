export default class Group {
  constructor (name, id = +new Date()) {
    this.name = name
    this.id = id
  }
}

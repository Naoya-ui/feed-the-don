export class StoryManager {
  constructor(ui = null) { this.ui = ui; }
  async say(name, text) { return this.ui?.say?.(name, text); }
  async choose(options) { return this.ui?.choose?.(options); }
}

class RenderLoop {
    constructor(app) {
      this.app = app;
      this._loop = this._loop.bind(this);
      this.running = false;
      this.lastTime = 0;
      this.deltaTime = 0;
    }

    start() {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this._loop);
    }

    stop() {
      this.running = false;
    }

    _loop(timestamp) {
      if (!this.running) return;
      this.deltaTime = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      this.app.update(this.deltaTime);
      requestAnimationFrame(this._loop);
    }
}

export { RenderLoop };

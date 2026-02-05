class AiInterviewProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    this.chunkSize = 4096;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }

    const data = input[0];
    const next = new Float32Array(this.buffer.length + data.length);
    next.set(this.buffer);
    next.set(data, this.buffer.length);
    this.buffer = next;

    while (this.buffer.length >= this.chunkSize) {
      const chunk = this.buffer.slice(0, this.chunkSize);
      this.port.postMessage(chunk);
      this.buffer = this.buffer.slice(this.chunkSize);
    }

    return true;
  }
}

registerProcessor("ai-interview-processor", AiInterviewProcessor);

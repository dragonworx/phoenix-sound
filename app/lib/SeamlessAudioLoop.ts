/**
 * SeamlessAudioLoop - A Web Audio API-based audio player for gapless looping
 *
 * This implementation uses advanced techniques to achieve truly seamless looping:
 * 1. Dual-buffer crossfading for smooth transitions
 * 2. Automatic silence trimming at start/end
 * 3. Precise scheduling with lookahead
 * 4. Zero-crossing detection for optimal loop points
 */

export interface SeamlessAudioLoopOptions {
  url: string;
  volume?: number;
  crossfadeDuration?: number; // Duration of crossfade in seconds (default: 0.01)
  trimSilence?: boolean; // Automatically trim silence from start/end (default: true)
  silenceThreshold?: number; // Threshold for silence detection (default: 0.001)
  onError?: (error: Error) => void;
  onReady?: () => void;
}

export class SeamlessAudioLoop {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNodes: AudioBufferSourceNode[] = [];
  private gainNode: GainNode | null = null;
  private crossfadeGainNodes: GainNode[] = [];
  private isPlaying: boolean = false;
  private volume: number = 1.0;
  private url: string;
  private crossfadeDuration: number = 0.01;
  private trimSilence: boolean = true;
  private silenceThreshold: number = 0.001;
  private onError?: (error: Error) => void;
  private onReady?: () => void;
  private isLoaded: boolean = false;
  private loopStart: number = 0;
  private loopEnd: number = 0;
  private nextLoopTime: number = 0;
  private scheduleAheadTime: number = 0.1; // Schedule 100ms ahead

  constructor(options: SeamlessAudioLoopOptions) {
    this.url = options.url;
    this.volume = options.volume ?? 1.0;
    this.crossfadeDuration = options.crossfadeDuration ?? 0.01;
    this.trimSilence = options.trimSilence ?? true;
    this.silenceThreshold = options.silenceThreshold ?? 0.001;
    this.onError = options.onError;
    this.onReady = options.onReady;
  }

  /**
   * Initialize the audio context and load the audio file
   */
  async initialize(): Promise<void> {
    try {
      // Create audio context (handles browser prefixes automatically)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);

      // Load and decode audio file
      const response = await fetch(this.url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Analyze buffer to find optimal loop points
      if (this.trimSilence) {
        this.findLoopPoints();
      } else {
        this.loopStart = 0;
        this.loopEnd = this.audioBuffer.duration;
      }

      this.isLoaded = true;
      this.onReady?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Find optimal loop points by detecting silence at start/end and zero-crossings
   */
  private findLoopPoints(): void {
    if (!this.audioBuffer) return;

    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;
    const length = channelData.length;

    // Find start point (first non-silent sample)
    let startSample = 0;
    for (let i = 0; i < length; i++) {
      if (Math.abs(channelData[i]) > this.silenceThreshold) {
        startSample = i;
        break;
      }
    }

    // Find end point (last non-silent sample)
    let endSample = length - 1;
    for (let i = length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > this.silenceThreshold) {
        endSample = i;
        break;
      }
    }

    // Find nearest zero-crossing for start
    startSample = this.findNearestZeroCrossing(channelData, startSample);

    // Find nearest zero-crossing for end
    endSample = this.findNearestZeroCrossing(channelData, endSample);

    // Convert samples to time
    this.loopStart = startSample / sampleRate;
    this.loopEnd = endSample / sampleRate;
  }

  /**
   * Find the nearest zero-crossing point to minimize clicks
   */
  private findNearestZeroCrossing(data: Float32Array, startIndex: number): number {
    const searchRange = 100; // Search within 100 samples
    let minDistance = Infinity;
    let bestIndex = startIndex;

    for (let i = Math.max(0, startIndex - searchRange);
         i < Math.min(data.length - 1, startIndex + searchRange);
         i++) {
      // Check if we're crossing zero
      if ((data[i] >= 0 && data[i + 1] < 0) || (data[i] < 0 && data[i + 1] >= 0)) {
        const distance = Math.abs(i - startIndex);
        if (distance < minDistance) {
          minDistance = distance;
          bestIndex = i;
        }
      }
    }

    return bestIndex;
  }

  /**
   * Start playing the audio loop with crossfading
   */
  async play(): Promise<void> {
    if (this.isPlaying) return;

    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.audioContext || !this.audioBuffer || !this.gainNode) {
      throw new Error('Audio context not initialized');
    }

    // Resume audio context if suspended (required for mobile browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;
    this.nextLoopTime = this.audioContext.currentTime;

    // Schedule the first loop iteration
    this.scheduleLoop();
  }

  /**
   * Schedule the next loop iteration with crossfading
   */
  private scheduleLoop(): void {
    if (!this.isPlaying || !this.audioContext || !this.audioBuffer || !this.gainNode) {
      return;
    }

    const currentTime = this.audioContext.currentTime;

    // Clean up old source nodes that have finished
    this.cleanupFinishedSources(currentTime);

    // Schedule loops ahead of time
    while (this.nextLoopTime < currentTime + this.scheduleAheadTime) {
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;

      // Create crossfade gain node
      const crossfadeGain = this.audioContext.createGain();
      crossfadeGain.connect(this.gainNode);
      source.connect(crossfadeGain);

      // Calculate loop duration
      const loopDuration = this.loopEnd - this.loopStart;

      // Set up crossfade envelope
      const fadeStart = this.nextLoopTime;
      const fadeInEnd = fadeStart + this.crossfadeDuration;
      const fadeOutStart = fadeStart + loopDuration - this.crossfadeDuration;
      const fadeEnd = fadeStart + loopDuration;

      // Fade in
      crossfadeGain.gain.setValueAtTime(0, fadeStart);
      crossfadeGain.gain.linearRampToValueAtTime(1, fadeInEnd);

      // Hold at full volume
      crossfadeGain.gain.setValueAtTime(1, fadeOutStart);

      // Fade out
      crossfadeGain.gain.linearRampToValueAtTime(0, fadeEnd);

      // Start playback at the loop start point
      source.start(this.nextLoopTime, this.loopStart, loopDuration);

      // Stop at the exact end time
      source.stop(fadeEnd);

      // Store references
      this.sourceNodes.push(source);
      this.crossfadeGainNodes.push(crossfadeGain);

      // Schedule next iteration
      this.nextLoopTime += loopDuration;
    }

    // Schedule next check
    if (this.isPlaying) {
      setTimeout(() => this.scheduleLoop(), 50); // Check every 50ms
    }
  }

  /**
   * Clean up source nodes that have finished playing
   */
  private cleanupFinishedSources(currentTime: number): void {
    const loopDuration = this.loopEnd - this.loopStart;

    // Keep only recent sources (within the last 2 loop durations)
    const cutoffTime = currentTime - (loopDuration * 2);

    while (this.sourceNodes.length > 0 &&
           this.nextLoopTime - (this.sourceNodes.length * loopDuration) < cutoffTime) {
      const oldSource = this.sourceNodes.shift();
      const oldGain = this.crossfadeGainNodes.shift();

      try {
        oldSource?.disconnect();
        oldGain?.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
    }
  }

  /**
   * Stop playing the audio loop
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    // Stop and disconnect all source nodes
    for (const source of this.sourceNodes) {
      try {
        source.stop();
        source.disconnect();
      } catch (error) {
        // Ignore errors from stopping already stopped nodes
      }
    }

    // Disconnect all gain nodes
    for (const gain of this.crossfadeGainNodes) {
      try {
        gain.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
    }

    this.sourceNodes = [];
    this.crossfadeGainNodes = [];
  }

  /**
   * Toggle play/pause state
   */
  async toggle(): Promise<boolean> {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      await this.play();
      return true;
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Check if audio is loaded and ready
   */
  getIsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioBuffer = null;
    this.isLoaded = false;
  }
}

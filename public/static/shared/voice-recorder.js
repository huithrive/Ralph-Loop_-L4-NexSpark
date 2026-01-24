/**
 * Voice Recorder Module
 * Handles audio recording and transcription
 */

class VoiceRecorder {
  constructor(options = {}) {
    // Try to find a supported audio format
    const supportedTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg'
    ];

    let selectedMimeType = 'audio/webm';
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        console.log('Using MIME type:', type);
        break;
      }
    }

    this.options = {
      transcribeEndpoint: options.transcribeEndpoint || '/api/conversational-interview/transcribe',
      language: options.language || null, // null = auto-detect (supports multi-language)
      mimeType: options.mimeType || selectedMimeType,
      onStatusChange: options.onStatusChange || (() => {}),
      onTranscriptionComplete: options.onTranscriptionComplete || (() => {}),
      onError: options.onError || ((error) => console.error(error))
    };

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
    this.recordingStartTime = null;
  }

  /**
   * Request microphone access
   */
  async requestPermission() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      this.options.onError(new Error('Microphone access denied. Please enable microphone permissions.'));
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }

    // Check if stream exists and is still active
    const streamActive = this.stream && this.stream.getTracks().some(track => track.readyState === 'live');

    // Request permission if not already granted or stream is inactive
    if (!streamActive) {
      const permitted = await this.requestPermission();
      if (!permitted) return false;
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.options.onStatusChange('listening');

      console.log('Recording started with MIME type:', this.options.mimeType);
      return true;
    } catch (error) {
      this.options.onError(error);
      return false;
    }
  }

  /**
   * Stop recording and transcribe
   */
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('Not currently recording');
      return null;
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;

        // Calculate recording duration
        const recordingDuration = Date.now() - this.recordingStartTime;
        console.log('Recording duration:', recordingDuration, 'ms');

        // Validate recording duration (minimum 500ms)
        if (recordingDuration < 500) {
          this.mediaRecorder = null;
          this.audioChunks = [];
          this.options.onStatusChange('ready');
          const error = new Error('Recording too short. Please hold the microphone button longer.');
          this.options.onError(error);
          reject(error);
          return;
        }

        this.options.onStatusChange('processing');

        try {
          const audioBlob = new Blob(this.audioChunks, { type: this.options.mimeType });
          console.log('Audio blob created:', audioBlob.size, 'bytes', 'type:', this.options.mimeType);

          // Validate blob size (minimum 1KB)
          if (audioBlob.size < 1000) {
            throw new Error('Recording too small. Please speak louder or check your microphone.');
          }

          const transcription = await this.transcribe(audioBlob);

          // Clear the media recorder reference
          this.mediaRecorder = null;
          this.audioChunks = [];

          this.options.onStatusChange('ready');
          this.options.onTranscriptionComplete(transcription);

          resolve(transcription);
        } catch (error) {
          // Clear the media recorder reference even on error
          this.mediaRecorder = null;
          this.audioChunks = [];

          this.options.onStatusChange('ready');
          this.options.onError(error);
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcribe audio using Whisper API
   */
  async transcribe(audioBlob) {
    // Extract file extension from MIME type
    const mimeType = this.options.mimeType.split(';')[0]; // Remove codec info
    const fileExtension = mimeType.split('/')[1] || 'webm';

    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${fileExtension}`);
    // Only send language if explicitly set (otherwise Whisper auto-detects)
    if (this.options.language) {
      formData.append('language', this.options.language);
    }

    console.log('Sending audio for transcription:', {
      size: audioBlob.size,
      type: audioBlob.type,
      filename: `recording.${fileExtension}`
    });

    try {
      const response = await fetch(this.options.transcribeEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription API error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success && data.text) {
        console.log('Transcription successful:', data.text.substring(0, 50) + '...');
        return data.text;
      } else {
        throw new Error(data.error || data.message || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Cleanup media recorder and stream
   */
  cleanup() {
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  /**
   * Destroy recorder and release resources
   */
  destroy() {
    if (this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.cleanup();
    this.stream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

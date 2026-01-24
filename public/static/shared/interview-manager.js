/**
 * Interview Manager
 * Handles interview flow, questions, and responses
 */

class InterviewManager {
  constructor(questions, options = {}) {
    this.questions = questions;
    this.options = {
      userId: options.userId,
      saveEndpoint: options.saveEndpoint || '/api/interview/save',
      completeEndpoint: options.completeEndpoint || '/api/interview/complete',
      onQuestionChange: options.onQuestionChange || (() => {}),
      onProgress: options.onProgress || (() => {}),
      onComplete: options.onComplete || (() => {}),
      onError: options.onError || ((error) => console.error(error)),
      autoSave: options.autoSave !== false // Default true
    };

    this.currentQuestion = 0;
    this.responses = [];
    this.interviewId = this.generateInterviewId();
    this.completed = false;
  }

  /**
   * Generate unique interview ID
   */
  generateInterviewId() {
    return 'int_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get current question
   */
  getCurrentQuestion() {
    if (this.currentQuestion >= this.questions.length) {
      return null;
    }
    return {
      index: this.currentQuestion,
      text: this.questions[this.currentQuestion],
      number: this.currentQuestion + 1,
      total: this.questions.length
    };
  }

  /**
   * Get progress percentage
   */
  getProgress() {
    return ((this.currentQuestion + 1) / this.questions.length) * 100;
  }

  /**
   * Add answer to current question
   */
  async addAnswer(answer) {
    if (this.completed) {
      throw new Error('Interview already completed');
    }

    if (!answer || !answer.trim()) {
      throw new Error('Answer cannot be empty');
    }

    const response = {
      questionId: `q${this.currentQuestion + 1}`,
      question: this.questions[this.currentQuestion],
      answer: answer.trim(),
      timestamp: new Date().toISOString()
    };

    this.responses.push(response);
    console.log(`Answer saved for question ${this.currentQuestion + 1}/${this.questions.length}`);

    // Auto-save to backend
    if (this.options.autoSave) {
      try {
        await this.saveProgress();
      } catch (error) {
        console.warn('Auto-save failed:', error.message);
        // Don't throw - we have local state
      }
    }

    return response;
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    if (this.currentQuestion >= this.questions.length - 1) {
      return false; // No more questions
    }

    this.currentQuestion++;
    this.options.onQuestionChange(this.getCurrentQuestion());
    this.options.onProgress(this.getProgress());

    return true;
  }

  /**
   * Skip current question (saves empty answer)
   */
  async skipQuestion() {
    await this.addAnswer('[Skipped]');
    return this.nextQuestion();
  }

  /**
   * Save current progress to backend
   */
  async saveProgress() {
    try {
      const response = await fetch(this.options.saveEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.options.userId,
          interviewId: this.interviewId,
          responses: this.responses,
          currentQuestion: this.currentQuestion,
          completed: false
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save progress');
      }

      return data;
    } catch (error) {
      throw new Error(`Save failed: ${error.message}`);
    }
  }

  /**
   * Complete interview
   */
  async complete() {
    if (this.completed) {
      console.warn('Interview already completed');
      return;
    }

    if (this.responses.length < this.questions.length) {
      throw new Error(`Only ${this.responses.length}/${this.questions.length} questions answered`);
    }

    try {
      const response = await fetch(this.options.completeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.options.userId,
          interviewId: this.interviewId,
          responses: this.responses,
          completed: true,
          completedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete interview');
      }

      this.completed = true;
      console.log('Interview completed successfully');

      // Save to localStorage for report generation
      if (typeof Storage !== 'undefined' && Storage.setInterview) {
        Storage.setInterview({
          id: this.interviewId,
          userId: this.options.userId,
          responses: this.responses,
          completed: true,
          completedAt: new Date().toISOString()
        });
      }

      this.options.onComplete(this.interviewId);

      return data;
    } catch (error) {
      this.options.onError(error);
      throw error;
    }
  }

  /**
   * Get interview data
   */
  getData() {
    return {
      interviewId: this.interviewId,
      userId: this.options.userId,
      responses: this.responses,
      currentQuestion: this.currentQuestion,
      totalQuestions: this.questions.length,
      progress: this.getProgress(),
      completed: this.completed
    };
  }

  /**
   * Resume from saved state
   */
  static fromSavedState(savedData, questions, options) {
    const manager = new InterviewManager(questions, options);
    manager.interviewId = savedData.interviewId;
    manager.responses = savedData.responses || [];
    manager.currentQuestion = savedData.currentQuestion || 0;
    manager.completed = savedData.completed || false;
    return manager;
  }
}

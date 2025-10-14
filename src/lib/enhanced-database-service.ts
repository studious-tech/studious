// Enhanced Database Service - placeholder restoration
import { getMockData } from '@/lib/dummy-data';

export class EnhancedDatabaseService {
  static async getExam(examId: string) {
    // Placeholder implementation
    return null;
  }

  static async getQuestions() {
    return getMockData().questions;
  }
}

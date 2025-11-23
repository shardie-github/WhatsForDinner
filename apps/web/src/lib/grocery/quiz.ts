/**
 * Grocery Quiz System
 * Interactive quizzes to help users discover preferences and earn rewards
 */

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'rating' | 'category-select';
  options?: string[];
  category?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
  reward: {
    points: number;
    badge?: string;
  };
  estimatedTime: number; // minutes
}

export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  answers: Record<string, unknown>;
  preferences: Record<string, unknown>;
  pointsEarned: number;
  completedAt: string;
}

export class GroceryQuizSystem {
  private quizzes: Quiz[] = [
    {
      id: 'dietary-preferences',
      title: 'Dietary Preferences Quiz',
      description: 'Help us understand your dietary needs',
      icon: '🥗',
      questions: [
        {
          id: 'diet-type',
          question: 'What best describes your diet?',
          type: 'multiple-choice',
          options: ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean'],
          points: 5,
        },
        {
          id: 'allergies',
          question: 'Do you have any food allergies?',
          type: 'multiple-choice',
          options: ['None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Gluten'],
          points: 3,
        },
        {
          id: 'cooking-level',
          question: 'How would you rate your cooking skills?',
          type: 'rating',
          points: 2,
        },
        {
          id: 'meal-prep',
          question: 'Do you meal prep?',
          type: 'true-false',
          points: 2,
        },
      ],
      reward: {
        points: 10,
        badge: 'dietary-expert',
      },
      estimatedTime: 2,
    },
    {
      id: 'grocery-habits',
      title: 'Grocery Shopping Habits',
      description: 'Tell us about your shopping style',
      icon: '🛒',
      questions: [
        {
          id: 'shopping-frequency',
          question: 'How often do you grocery shop?',
          type: 'multiple-choice',
          options: ['Daily', '2-3 times per week', 'Weekly', 'Bi-weekly', 'Monthly'],
          points: 3,
        },
        {
          id: 'budget',
          question: 'What\'s your typical grocery budget per week?',
          type: 'multiple-choice',
          options: ['Under $50', '$50-$100', '$100-$150', '$150-$200', 'Over $200'],
          points: 3,
        },
        {
          id: 'preferred-stores',
          question: 'Select your preferred grocery stores',
          type: 'category-select',
          category: 'stores',
          points: 5,
        },
        {
          id: 'organic-preference',
          question: 'How important is buying organic?',
          type: 'rating',
          points: 2,
        },
      ],
      reward: {
        points: 10,
        badge: 'shopping-pro',
      },
      estimatedTime: 3,
    },
    {
      id: 'cuisine-preferences',
      title: 'Cuisine Preferences',
      description: 'Discover your favorite cuisines',
      icon: '🌍',
      questions: [
        {
          id: 'favorite-cuisines',
          question: 'Select your favorite cuisines',
          type: 'multiple-choice',
          options: ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'French', 'Thai'],
          points: 5,
        },
        {
          id: 'spice-level',
          question: 'How spicy do you like your food?',
          type: 'rating',
          points: 2,
        },
        {
          id: 'cooking-time',
          question: 'Preferred cooking time?',
          type: 'multiple-choice',
          options: ['Under 15 min', '15-30 min', '30-60 min', 'Over 60 min'],
          points: 3,
        },
      ],
      reward: {
        points: 10,
        badge: 'cuisine-explorer',
      },
      estimatedTime: 2,
    },
  ];

  getQuizzes(): Quiz[] {
    return this.quizzes;
  }

  getQuiz(quizId: string): Quiz | undefined {
    return this.quizzes.find(q => q.id === quizId);
  }

  calculateScore(quiz: Quiz, answers: Record<string, unknown>): number {
    let score = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] !== undefined) {
        score += question.points;
      }
    });
    return score;
  }

  extractPreferences(quiz: Quiz, answers: Record<string, unknown>): Record<string, unknown> {
    const preferences: Record<string, unknown> = {};
    
    quiz.questions.forEach(question => {
      if (answers[question.id] !== undefined) {
        preferences[question.id] = answers[question.id];
      }
    });

    return preferences;
  }

  async submitQuiz(userId: string, quizId: string, answers: Record<string, unknown>): Promise<QuizResult> {
    const quiz = this.getQuiz(quizId);
    if (!quiz) {
      throw new Error(`Quiz ${quizId} not found`);
    }

    const score = this.calculateScore(quiz, answers);
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const preferences = this.extractPreferences(quiz, answers);

    const result: QuizResult = {
      quizId,
      score,
      maxScore,
      answers,
      preferences,
      pointsEarned: quiz.reward.points,
      completedAt: new Date().toISOString(),
    };

    // Save to database
    // TODO: Implement database persistence

    // Award points
    // await groceryGamification.awardPoints(userId, 'COMPLETE_QUIZ');

    return result;
  }
}

export const groceryQuizSystem = new GroceryQuizSystem();

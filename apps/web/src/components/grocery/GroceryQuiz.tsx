/**
 * Grocery Quiz Component
 * Interactive quiz with animations and progress tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Quiz, QuizQuestion, QuizResult } from '@/lib/grocery/quiz';
import { groceryQuizSystem } from '@/lib/grocery/quiz';
import { groceryGamification } from '@/lib/grocery/gamification';
import { Sparkles, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GroceryQuizProps {
  quizId: string;
  onComplete?: (result: QuizResult) => void;
  userId: string;
}

export function GroceryQuiz({ quizId, onComplete, userId }: GroceryQuizProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    const q = groceryQuizSystem.getQuiz(quizId);
    if (q) {
      setQuiz(q);
    }
  }, [quizId]);

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswer = (answer: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleComplete = async () => {
    const quizResult = await groceryQuizSystem.submitQuiz(userId, quizId, answers);
    const points = await groceryGamification.awardPoints(userId, 'COMPLETE_QUIZ');
    
    setResult(quizResult);
    setPointsEarned(quizResult.pointsEarned);
    setCompleted(true);
    onComplete?.(quizResult);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                  {answers[currentQuestion.id] === option && (
                    <CheckCircle2 className="ml-auto h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="grid grid-cols-2 gap-4">
            {['True', 'False'].map((option) => (
              <Button
                key={option}
                variant={answers[currentQuestion.id] === option ? 'default' : 'outline'}
                onClick={() => handleAnswer(option)}
                className="h-20"
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={answers[currentQuestion.id] === rating ? 'default' : 'outline'}
                onClick={() => handleAnswer(rating)}
                className="w-16 h-16 text-2xl"
              >
                {rating === 1 ? '😞' : rating === 2 ? '😐' : rating === 3 ? '🙂' : rating === 4 ? '😊' : '🤩'}
              </Button>
            ))}
          </div>
        );

      case 'category-select':
        return (
          <div className="text-muted-foreground">
            Category selection coming soon
          </div>
        );

      default:
        return null;
    }
  };

  if (completed && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <Trophy className="h-16 w-16 text-yellow-500" />
            </motion.div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>
              Score: {result.score} / {result.maxScore}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold">
                +{pointsEarned} Points Earned!
              </span>
            </div>
            {quiz.reward.badge && (
              <Badge variant="secondary" className="w-full justify-center py-2">
                Badge Unlocked: {quiz.reward.badge}
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              <CardDescription>
                {currentQuestion.points} points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderQuestion()}
              
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="w-full"
              >
                {isLastQuestion ? 'Complete Quiz' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

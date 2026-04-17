/**
 * Study Plan Prompt Builder for AajExam
 * Generates personalized study plans using AI
 */

export function buildStudyPlanPrompt(userContext) {
    const {
        examName,
        examDate,
        dailyHours,
        weakSubjects = [],
        strongSubjects = [],
        currentReadiness = 0,
        subjectAccuracy = {},
        daysRemaining
    } = userContext;

    return `You are an expert Indian competitive exam preparation coach. Generate a detailed, personalized study plan.

STUDENT CONTEXT:
- Target Exam: ${examName}
- Exam Date: ${examDate}
- Days Remaining: ${daysRemaining}
- Daily Study Hours: ${dailyHours}
- Current Readiness: ${currentReadiness}%
- Weak Subjects: ${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'Not specified'}
- Strong Subjects: ${strongSubjects.length > 0 ? strongSubjects.join(', ') : 'Not specified'}
- Subject Accuracy: ${JSON.stringify(subjectAccuracy)}

RULES:
1. Allocate MORE time to weak subjects (60% time) and LESS to strong subjects (20% time), remaining 20% for revision and mock tests.
2. Include daily practice questions and weekly mock tests.
3. Follow the 80/20 rule - focus on high-weightage topics first.
4. Include revision cycles using spaced repetition pattern (revise after 1 day, 3 days, 7 days, 15 days).
5. Last 15 days should be ONLY revision + mock tests.
6. Be specific with topic names relevant to Indian competitive exams.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no explanation, just JSON):
{
    "summary": "Brief plan overview in 2-3 lines",
    "weeklySchedule": [
        {
            "week": 1,
            "focus": "Main focus area for this week",
            "tasks": [
                {
                    "day": 1,
                    "subject": "Subject Name",
                    "topic": "Specific Topic",
                    "duration": 2,
                    "taskType": "study",
                    "description": "What to do"
                }
            ]
        }
    ],
    "dailyRoutine": {
        "morning": "What to study in morning hours",
        "afternoon": "What to study in afternoon",
        "evening": "What to study in evening",
        "night": "Revision/practice"
    },
    "tips": ["Tip 1", "Tip 2", "Tip 3"],
    "milestones": [
        {"week": 2, "target": "Complete X topic with 70% accuracy"},
        {"week": 4, "target": "First full mock test"}
    ]
}`;
}

export function buildDailyTaskPrompt(planContext) {
    const { examName, todayDate, weekNumber, completedTasks, pendingTopics, weakAreas } = planContext;

    return `You are a study coach. Generate today's study tasks for a student preparing for ${examName}.

Context:
- Today: ${todayDate}
- Week: ${weekNumber}
- Recently completed: ${completedTasks.join(', ') || 'None'}
- Pending topics: ${pendingTopics.join(', ') || 'On track'}
- Weak areas: ${weakAreas.join(', ') || 'None identified'}

Generate 4-6 specific tasks for today. Respond in JSON array format:
[
    {
        "subject": "Subject",
        "topic": "Topic",
        "duration": 1.5,
        "taskType": "study|practice|revision|mock_test",
        "description": "Specific instruction"
    }
]`;
}

import { SurveyConfig, TaskData, File } from './types';
import { systemPrompt } from '@/utils/promts';

export const SURVEY_CONFIGS: SurveyConfig[] = [
    {
        id: 'hints',
        name: 'Survey A: AI Hints',
        description: 'AI assistant will provide hints and guidance to help you solve problems step by step.',
        aiEnabled: true,
        systemPrompt: systemPrompt
    },
    {
        id: 'solutions',
        name: 'Survey B: AI Solutions',
        description: 'AI assistant will provide direct solutions and code when you ask for help.',
        aiEnabled: true,
    },
    {
        id: 'terminal',
        name: 'Survey C: Terminal Only',
        description: 'No AI assistance - only standard Python error messages and terminal output.',
        aiEnabled: false,
    }
];

export const TASKS: TaskData[] = [
    {
        title: 'Task 1: Variable Shadowing',
        md: `# Task 1: Fix Variable Shadowing

The code below has a variable that shadows a built-in Python function, causing an error.

**Your goal:** Fix the code so it correctly filters words longer than 3 characters.

**Expected output:** ['tool', 'python']
`,
        main: `
# The function below is supposed to filter words longer than 3 characters.
def get_word_count_and_filter(word_list):
    len = 0
    long_words = []
    for word in word_list:
        if len(word) > 3:
            long_words.append(word)
    return long_words

print(get_word_count_and_filter(["a", "tool", "bee", "python"]))
# Expected output: ['tool', 'python']`,
        verify: (out: string) => out.includes("['tool', 'python']") || out.includes('["tool", "python"]')
    },
    {
        title: 'Task 2: Index Out of Range',
        md: `# Task 2: Fix Index Error

The function below is supposed to check for adjacent duplicate values but has an indexing error.

**Your goal:** Fix the range in the loop to prevent IndexError.

**Expected output:** 2 (for the test case [1,2,2,3])
`,
        main: `

# The function below is supposed to check output the number of adjacent duplicate values.
def has_adjacent_duplicate(items):
    adjacent_duplicates = []
    for i in range(len(items)):
        if items[i] == items[i + 1]:
            adjacent_duplicates.append(items[i])
    return len(adjacent_duplicates)

print(has_adjacent_duplicate([1,2,2,3]))
# Expected output: 1
`,
        verify: (out: string) => out.trim().endsWith('1')
    },
    {
        title: 'Task 3: Variable Scope Issue',
        md: `# Task 3: Fix Variable Scope

The function should count vowels in each word separately, but has a scope issue.

**Your goal:** Fix the variable initialization to count vowels per word correctly.

**Expected output:** [1, 1] (for "cat" and "python")
`,
        main: `def count_vowels_per_word(words):
    vowels = "aeiou"
    counts = []
    vowel_count = 0     
    for word in words:
        for char in word.lower():
            if char in vowels:
                vowel_count += 1
        counts.append(vowel_count)
    return counts

print(count_vowels_per_word(["cat", "python"]))
Expected output: [1, 1]`,
        verify: (out: string) => out.includes('[1, 1]')
    },
    {
        title: 'Task 4: Logic Error',
        md: `# Task 4: Fix Logic Error

The password validation uses the wrong logical operator.

**Your goal:** Fix the condition to require BOTH length >= 8 AND containing a digit.

**Expected output:** 
False
True
`,
        main: `
# The function below is supposed to check if the password contains a digit and has a length of at least 8.
def has_digit(s):
    return any(char.isdigit() for char in s)

def is_valid_password(password):
    if len(password) >= 8 or has_digit(password):
        return True
    else:
        return False
print(is_valid_password("secret_password"))
print(is_valid_password("secret_password123"))
# Expected output: False
# Expected output: True`,
        verify: (out: string) => {
            const lines = out.trim().split('\n');
            return lines.length >= 2 && lines[lines.length - 2].trim() === 'False' && lines[lines.length - 1].trim() === 'True';
        }
    }
];

export const EXPLORATION_FILES: File[] = [
    {
        name: 'explore.py',
        content: `# Feel free to explore the editor and try different Python code!
# Test the AI assistant (if available) or just experiment with coding.

def greet(name):
    return f"Hello, {name}!"

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Try running this code and experiment with modifications
print(greet("Participant"))
print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
`,
        language: 'python'
    },
    {
        name: 'notes.md',
        content: `# Exploration Notes

Feel free to use this space to:
- Try different coding tasks
- Test the AI assistant (if available)
- Experiment with the editor features
- Take notes about your experience

## Features to explore:
- Code editing and syntax highlighting
- Running Python code
- File management (create/edit/delete files)
- AI assistant interactions (if available)
- Terminal output

You can navigate through the app after the final questionnaire.
`,
        language: 'markdown'
    }
];

export const NAVIGATION_FILES: File[] = [
    {
        name: 'welcome.py',
        content: `# Welcome to the free navigation phase!
# You can now explore all pages of the application.

# Try visiting different pages:
# - Dashboard (home)
# - Editor (current page)
# - Projects
# - Suggestions  
# - Resources

print("Welcome to the free navigation phase!")
print("Feel free to explore all features of the application.")
print("Visit different pages using the navigation bar.")
`,
        language: 'python'
    }
];

export const TIMER_LIMITS = {
    TASK: 420, // 7 minutes
    NAVIGATE: 60, // 10 minutes
} as const;

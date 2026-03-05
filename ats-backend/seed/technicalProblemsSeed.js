require("dotenv").config();
const mongoose = require("mongoose");
const TechnicalProblem = require("../models/TechnicalProblem");

const problems = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    difficulty: "easy",
    category: "Array",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  // Parse input
  const lines = input.split('\\n');
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1]);
  
  // Your code here
  
  return JSON.stringify(result);
}`],
      ["python", `def solve(input_data):
    lines = input_data.strip().split('\\n')
    nums = eval(lines[0])
    target = int(lines[1])
    
    # Your code here
    
    return str(result)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        int target = Integer.parseInt(br.readLine());
        
        // Parse array from string like "[2,7,11,15]"
        // Your code here
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: "[2,7,11,15]\\n9",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "[3,2,4]\\n6",
        expectedOutput: "[1,2]",
        isHidden: false
      },
      {
        input: "[3,3]\\n6",
        expectedOutput: "[0,1]",
        isHidden: true
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    hints: [
      "Use a hash map to store complements",
      "Check if target - current number exists in the map"
    ]
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]`,
    difficulty: "easy",
    category: "String",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  const s = JSON.parse(input);
  
  // Your code here
  
  return JSON.stringify(s);
}`],
      ["python", `def solve(input_data):
    s = eval(input_data.strip())
    
    # Your code here
    
    return str(s)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        
        // Parse char array and reverse it
        // Your code here
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
        isHidden: false
      },
      {
        input: '["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
        isHidden: false
      }
    ],
    constraints: [
      "1 <= s.length <= 105",
      "s[i] is a printable ascii character"
    ],
    hints: [
      "Use two pointers approach",
      "Swap characters from both ends"
    ]
  },
  {
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

Example:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.`,
    difficulty: "easy",
    category: "Math",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  const x = parseInt(input.trim());
  
  // Your code here
  
  return result.toString();
}`],
      ["python", `def solve(input_data):
    x = int(input_data.strip())
    
    # Your code here
    
    return str(result)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int x = Integer.parseInt(br.readLine().trim());
        
        // Your code here
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: "121",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "-121",
        expectedOutput: "false",
        isHidden: false
      },
      {
        input: "10",
        expectedOutput: "false",
        isHidden: true
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    hints: [
      "Convert to string and compare",
      "Or reverse the number mathematically"
    ]
  },
  {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()[]{}"
Output: true`,
    difficulty: "medium",
    category: "Stack",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  const s = input.trim();
  
  // Your code here
  
  return result.toString();
}`],
      ["python", `def solve(input_data):
    s = input_data.strip()
    
    # Your code here
    
    return str(result)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        // Your code here - use Stack for validation
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: "()[]{}",
        expectedOutput: "true",
        isHidden: false
      },
      {
        input: "(]",
        expectedOutput: "false",
        isHidden: false
      },
      {
        input: "([)]",
        expectedOutput: "false",
        isHidden: true
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    hints: [
      "Use a stack data structure",
      "Push opening brackets and pop when closing bracket matches"
    ]
  },
  {
    title: "Fibonacci Number",
    description: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given n, calculate F(n).

Example:
Input: n = 4
Output: 3
Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3.`,
    difficulty: "easy",
    category: "Dynamic Programming",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  const n = parseInt(input.trim());
  
  // Your code here
  
  return result.toString();
}`],
      ["python", `def solve(input_data):
    n = int(input_data.strip())
    
    # Your code here
    
    return str(result)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        
        // Your code here - calculate Fibonacci
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: "2",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "3",
        expectedOutput: "2",
        isHidden: false
      },
      {
        input: "4",
        expectedOutput: "3",
        isHidden: true
      }
    ],
    constraints: [
      "0 <= n <= 30"
    ],
    hints: [
      "Try dynamic programming approach",
      "Or use recursion with memoization"
    ]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.`,
    difficulty: "medium",
    category: "String",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  const s = input.trim();
  
  // Use sliding window technique
  // Your code here
  
  return result.toString();
}`],
      ["python", `def solve(input_data):
    s = input_data.strip()
    
    # Use sliding window technique
    # Your code here
    
    return str(result)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        // Use sliding window technique
        // Your code here
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: "abcabcbb",
        expectedOutput: "3",
        isHidden: false
      },
      {
        input: "bbbbb",
        expectedOutput: "1",
        isHidden: false
      },
      {
        input: "pwwkew",
        expectedOutput: "3",
        isHidden: false
      },
      {
        input: "dvdf",
        expectedOutput: "3",
        isHidden: true
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    hints: [
      "Use a sliding window with two pointers",
      "Keep track of characters in a HashSet or HashMap",
      "When you find a duplicate, slide the left pointer"
    ]
  },
  {
    title: "Trapping Rain Water",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example 1:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.

Example 2:
Input: height = [4,2,0,3,2,5]
Output: 9`,
    difficulty: "hard",
    category: "Array",
    starterCode: new Map([
      ["javascript", `function solve(input) {
  const height = JSON.parse(input.trim());
  
  // Calculate trapped water using two pointers or dynamic programming
  // Your code here
  
  return result.toString();
}`],
      ["python", `def solve(input_data):
    height = eval(input_data.strip())
    
    # Calculate trapped water using two pointers or dynamic programming  
    # Your code here
    
    return str(result)`],
      ["java", `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        // Parse the array from string like "[0,1,0,2,1,0,1,3,2,1,2,1]"
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            height[i] = Integer.parseInt(parts[i].trim());
        }
        
        // Calculate trapped water using two pointers or dynamic programming
        // Your code here
        
        System.out.println(result);
    }
}`]
    ]),
    testCases: [
      {
        input: "[0,1,0,2,1,0,1,3,2,1,2,1]",
        expectedOutput: "6",
        isHidden: false
      },
      {
        input: "[4,2,0,3,2,5]",
        expectedOutput: "9",
        isHidden: false
      },
      {
        input: "[4,2,3]",
        expectedOutput: "1",
        isHidden: true
      },
      {
        input: "[3,0,2,0,4]",
        expectedOutput: "7",
        isHidden: true
      }
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    hints: [
      "Think about what determines the water level at each position",
      "The water level is determined by min(leftMax, rightMax) - current height",
      "Use two pointers from both ends moving towards center",
      "Or use dynamic programming to precompute left and right max arrays"
    ]
  }
];

async function seedProblems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    
    await TechnicalProblem.deleteMany({});
    console.log("Cleared existing problems");
    
    await TechnicalProblem.insertMany(problems);
    console.log(`✅ Seeded ${problems.length} technical problems`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedProblems();

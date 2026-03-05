const service = require('./services/codeExecutionService');

async function testAll() {
  // Test JavaScript
  console.log('=== JAVASCRIPT TESTS ===\n');
  
  const jsCode = `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const n = parseInt(lines[0]);
  let a = 0, b = 1;
  if (n === 0) console.log(0);
  else if (n === 1) console.log(1);
  else {
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    console.log(b);
  }
});`;
  
  const r1 = await service.executeCode(jsCode, 'javascript', '5', 10000);
  console.log('JavaScript Fibonacci(5):');
  console.log('  Success:', r1.success);
  console.log('  Output:', r1.output);
  console.log('  Error:', r1.error || 'none');
  console.log('  Time:', r1.executionTime + 'ms\n');

  // Test Python
  console.log('=== PYTHON TESTS ===\n');
  
  const pythonCode = `n = int(input())
if n == 0:
    print(0)
elif n == 1:
    print(1)
else:
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    print(b)`;
  
  const r2 = await service.executeCode(pythonCode, 'python', '5', 10000);
  console.log('Python Fibonacci(5):');
  console.log('  Success:', r2.success);
  console.log('  Output:', r2.output);
  console.log('  Error:', r2.error || 'none');
  console.log('  Time:', r2.executionTime + 'ms\n');

  // Test Java
  console.log('=== JAVA TESTS ===\n');
  
  const javaCode = `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        if (n == 0) {
            System.out.println(0);
        } else if (n == 1) {
            System.out.println(1);
        } else {
            int a = 0, b = 1;
            for (int i = 2; i <= n; i++) {
                int temp = a + b;
                a = b;
                b = temp;
            }
            System.out.println(b);
        }
        sc.close();
    }
}`;
  
  const r3 = await service.executeCode(javaCode, 'java', '5', 15000);
  console.log('Java Fibonacci(5):');
  console.log('  Success:', r3.success);
  console.log('  Output:', r3.output);
  console.log('  Error:', r3.error || 'none');
  console.log('  Time:', r3.executionTime + 'ms\n');
}

testAll().then(() => process.exit(0)).catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});

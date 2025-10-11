const fs = require('fs');

// Read the file
const content = fs.readFileSync('C:\\Users\\Myles\\Desktop\\rehearsely\\src\\app\\components\\editor\\EditLine.tsx', 'utf8');
const lines = content.split('\n');

// Stack to track opening symbols
const stack = [];
const errors = [];

// Track all brackets/parens/braces
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : '';
    const nextChar = j < line.length - 1 ? line[j + 1] : '';

    // Skip strings and comments (simple check)
    if (char === '/' && nextChar === '/') break; // rest of line is comment

    // Opening brackets
    if (char === '(' || char === '[' || char === '{') {
      stack.push({ char, line: lineNum, col: j });
    }
    // Closing brackets
    else if (char === ')' || char === ']' || char === '}') {
      if (stack.length === 0) {
        errors.push(`Line ${lineNum}: Unexpected closing '${char}' with no matching opening`);
        continue;
      }

      const last = stack.pop();
      const pairs = { '(': ')', '[': ']', '{': '}' };

      if (pairs[last.char] !== char) {
        errors.push(`Line ${lineNum}: Closing '${char}' doesn't match opening '${last.char}' from line ${last.line}`);
      }
    }
  }
}

// Check for unclosed brackets
if (stack.length > 0) {
  stack.forEach(item => {
    errors.push(`Line ${item.line}: Unclosed '${item.char}'`);
  });
}

// Output results
if (errors.length > 0) {
  console.log('❌ BRACKET MATCHING ERRORS FOUND:');
  errors.forEach(err => console.log(err));
} else {
  console.log('✅ All brackets, parentheses, and braces are properly matched!');
  console.log(`Total lines checked: ${lines.length}`);
}

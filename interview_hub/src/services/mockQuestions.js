// Mock questions data as fallback when external API is unavailable
// Each question follows the QuizAPI format

export const mockQuestions = {
  javascript: [
    {
      id: 1,
      question: "What is the correct way to declare a variable in JavaScript?",
      answers: {
        answer_a: "var x = 5",
        answer_b: "variable x = 5",
        answer_c: "let x = 5",
        answer_d: "int x = 5"
      },
      correct_answers: {
        answer_a_correct: "true",
        answer_c_correct: "true"
      }
    },
    {
      id: 2,
      question: "Which method is used to add an element to the end of an array?",
      answers: {
        answer_a: "push()",
        answer_b: "pop()",
        answer_c: "shift()",
        answer_d: "unshift()"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 3,
      question: "What does '===' operator do in JavaScript?",
      answers: {
        answer_a: "Assigns a value",
        answer_b: "Compares value only",
        answer_c: "Compares value and type",
        answer_d: "Declares a constant"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 4,
      question: "Which keyword is used to define a constant in JavaScript?",
      answers: {
        answer_a: "var",
        answer_b: "let",
        answer_c: "const",
        answer_d: "define"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is the output of: console.log(typeof [])?",
      answers: {
        answer_a: "'array'",
        answer_b: "'object'",
        answer_c: "'list'",
        answer_d: "'undefined'"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "Which method creates a new array with all elements that pass a test?",
      answers: {
        answer_a: "map()",
        answer_b: "filter()",
        answer_c: "reduce()",
        answer_d: "forEach()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is a closure in JavaScript?",
      answers: {
        answer_a: "A way to close the browser",
        answer_b: "A function with access to its outer scope's variables",
        answer_c: "A method to end a loop",
        answer_d: "A type of error"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "Which statement correctly declares an arrow function?",
      answers: {
        answer_a: "function => () {}",
        answer_b: "() => {}",
        answer_c: "arrow function() {}",
        answer_d: "=> function() {}"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "What does 'NaN' represent in JavaScript?",
      answers: {
        answer_a: "Not a Name",
        answer_b: "Not a Number",
        answer_c: "New and Null",
        answer_d: "Null and None"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "Which method converts JSON string to object?",
      answers: {
        answer_a: "JSON.stringify()",
        answer_b: "JSON.parse()",
        answer_c: "JSON.convert()",
        answer_d: "JSON.toObject()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is the purpose of 'use strict' in JavaScript?",
      answers: {
        answer_a: "To enable strict typing",
        answer_b: "To enforce stricter parsing and error handling",
        answer_c: "To restrict variable scope",
        answer_d: "To enable debugging"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "Which event occurs when a user clicks on an HTML element?",
      answers: {
        answer_a: "onmouseover",
        answer_b: "onchange",
        answer_c: "onclick",
        answer_d: "onkeypress"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is the correct way to write a comment in JavaScript?",
      answers: {
        answer_a: "<!-- comment -->",
        answer_b: "// comment",
        answer_c: "# comment",
        answer_d: "** comment **"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "Which method is used to remove the last element from an array?",
      answers: {
        answer_a: "push()",
        answer_b: "pop()",
        answer_c: "shift()",
        answer_d: "splice()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is hoisting in JavaScript?",
      answers: {
        answer_a: "Moving code to another file",
        answer_b: "Declaration of variables being moved to the top of their scope",
        answer_c: "A type of animation",
        answer_d: "Loading external scripts"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "Which operator is used for string concatenation in JavaScript?",
      answers: {
        answer_a: "+",
        answer_b: "&",
        answer_c: "concat()",
        answer_d: "Both A and C"
      },
      correct_answers: {
        answer_d_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is the purpose of the 'this' keyword in JavaScript?",
      answers: {
        answer_a: "Refers to the current function",
        answer_b: "Refers to the current object",
        answer_c: "Creates a new variable",
        answer_d: "Declares a new class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "Which method returns the length of a string?",
      answers: {
        answer_a: "size()",
        answer_b: "length()",
        answer_c: "len()",
        answer_d: "count()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is a Promise in JavaScript?",
      answers: {
        answer_a: "A guarantee that code will run",
        answer_b: "An object representing the eventual completion of an async operation",
        answer_c: "A type of loop",
        answer_d: "A debugging tool"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 20,
      question: "Which keyword is used to handle exceptions in JavaScript?",
      answers: {
        answer_a: "catch",
        answer_b: "try",
        answer_c: "throw",
        answer_d: "All of the above"
      },
      correct_answers: {
        answer_d_correct: "true"
      }
    }
  ],
  python: [
    {
      id: 1,
      question: "What is the correct way to create a list in Python?",
      answers: {
        answer_a: "list = (1, 2, 3)",
        answer_b: "list = [1, 2, 3]",
        answer_c: "list = {1, 2, 3}",
        answer_d: "list = <1, 2, 3>"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "Which keyword is used to define a function in Python?",
      answers: {
        answer_a: "function",
        answer_b: "def",
        answer_c: "func",
        answer_d: "define"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "What is the output of: print(type([]))?",
      answers: {
        answer_a: "<class 'array'>",
        answer_b: "<class 'list'>",
        answer_c: "<class 'tuple'>",
        answer_d: "<class 'dict'>"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "Which method is used to add an element to the end of a list?",
      answers: {
        answer_a: "add()",
        answer_b: "append()",
        answer_c: "insert()",
        answer_d: "extend()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is a tuple in Python?",
      answers: {
        answer_a: "A mutable collection",
        answer_b: "An immutable collection",
        answer_c: "A type of function",
        answer_d: "A loop structure"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "How do you create a dictionary in Python?",
      answers: {
        answer_a: "dict = [key: value]",
        answer_b: "dict = {key: value}",
        answer_c: "dict = (key: value)",
        answer_d: "dict = <key: value>"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is the correct way to comment in Python?",
      answers: {
        answer_a: "// comment",
        answer_b: "/* comment */",
        answer_c: "# comment",
        answer_d: "<!-- comment -->"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 8,
      question: "Which method is used to read a line from standard input?",
      answers: {
        answer_a: "input()",
        answer_b: "read()",
        answer_c: "gets()",
        answer_d: "scanf()"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 9,
      question: "What is the purpose of 'self' in Python class methods?",
      answers: {
        answer_a: "Refers to the class itself",
        answer_b: "Refers to the instance of the class",
        answer_c: "A global variable",
        answer_d: "A keyword for loops"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "Which operator is used for exponentiation in Python?",
      answers: {
        answer_a: "^",
        answer_b: "**",
        answer_c: "exp()",
        answer_d: "pow()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What does 'import' do in Python?",
      answers: {
        answer_a: "Creates a new variable",
        answer_b: "Includes external modules or functions",
        answer_c: "Defines a class",
        answer_d: "Starts a loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "Which method is used to get the length of a list?",
      answers: {
        answer_a: "size()",
        answer_b: "len()",
        answer_c: "length()",
        answer_d: "count()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is a lambda function in Python?",
      answers: {
        answer_a: "A named function",
        answer_b: "An anonymous function",
        answer_c: "A recursive function",
        answer_d: "A built-in function"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "Which keyword is used to handle exceptions in Python?",
      answers: {
        answer_a: "catch",
        answer_b: "try and except",
        answer_c: "throw",
        answer_d: "handle"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is the output of: bool([])?",
      answers: {
        answer_a: "True",
        answer_b: "False",
        answer_c: "Error",
        answer_d: "None"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "Which data structure uses key-value pairs?",
      answers: {
        answer_a: "List",
        answer_b: "Tuple",
        answer_c: "Dictionary",
        answer_d: "Set"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is slicing in Python?",
      answers: {
        answer_a: "Cutting code into files",
        answer_b: "Extracting portions of sequences using index ranges",
        answer_c: "Removing elements from a list",
        answer_d: "Converting data types"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "Which method is used to remove the last element from a list?",
      answers: {
        answer_a: "remove()",
        answer_b: "pop()",
        answer_c: "delete()",
        answer_d: "clear()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is inheritance in Python?",
      answers: {
        answer_a: "A way to import modules",
        answer_b: "A class inheriting properties from another class",
        answer_c: "A type of loop",
        answer_d: "A data type"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 20,
      question: "Which keyword is used to create a class in Python?",
      answers: {
        answer_a: "class",
        answer_b: "Class",
        answer_c: "create",
        answer_d: "object"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    }
  ],
  java: [
    {
      id: 1,
      question: "What is the correct way to declare a variable in Java?",
      answers: {
        answer_a: "x = 5",
        answer_b: "int x = 5",
        answer_c: "var x = 5",
        answer_d: "let x = 5"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "Which keyword is used to define a class in Java?",
      answers: {
        answer_a: "Class",
        answer_b: "class",
        answer_c: "define",
        answer_d: "object"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "What is the entry point of a Java program?",
      answers: {
        answer_a: "start()",
        answer_b: "main()",
        answer_c: "run()",
        answer_d: "init()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "Which data type is used to store text in Java?",
      answers: {
        answer_a: "Text",
        answer_b: "String",
        answer_c: "Char",
        answer_d: "Varchar"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is inheritance in Java?",
      answers: {
        answer_a: "A way to import packages",
        answer_b: "A class acquiring properties of another class",
        answer_c: "A type of loop",
        answer_d: "A variable declaration"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "Which keyword is used to prevent method overriding?",
      answers: {
        answer_a: "static",
        answer_b: "private",
        answer_c: "final",
        answer_d: "abstract"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is polymorphism in Java?",
      answers: {
        answer_a: "Multiple inheritance",
        answer_b: "Ability to take many forms",
        answer_c: "Data hiding",
        answer_d: "Code reusability"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "Which operator is used for equality comparison in Java?",
      answers: {
        answer_a: "=",
        answer_b: "==",
        answer_c: "===",
        answer_d: "!="
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "What is the superclass of all classes in Java?",
      answers: {
        answer_a: "Parent",
        answer_b: "Object",
        answer_c: "Base",
        answer_d: "Root"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "Which keyword is used to implement an interface?",
      answers: {
        answer_a: "extends",
        answer_b: "implements",
        answer_c: "interface",
        answer_d: "import"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is encapsulation in Java?",
      answers: {
        answer_a: "Hiding implementation details",
        answer_b: "Inheriting properties",
        answer_c: "Creating objects",
        answer_d: "Defining methods"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 12,
      question: "Which collection class allows duplicate elements?",
      answers: {
        answer_a: "Set",
        answer_b: "List",
        answer_c: "Map",
        answer_d: "Queue"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is a constructor in Java?",
      answers: {
        answer_a: "A method to destroy objects",
        answer_b: "A special method to initialize objects",
        answer_c: "A loop structure",
        answer_d: "A variable type"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "Which access modifier makes a member visible only within the same package?",
      answers: {
        answer_a: "private",
        answer_b: "protected",
        answer_c: "default (no modifier)",
        answer_d: "public"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is the output of: System.out.println(5/2)?",
      answers: {
        answer_a: "2.5",
        answer_b: "2",
        answer_c: "3",
        answer_d: "2.0"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "Which keyword is used to create a thread in Java?",
      answers: {
        answer_a: "thread",
        answer_b: "Thread",
        answer_c: "runnable",
        answer_d: "Both B and C"
      },
      correct_answers: {
        answer_d_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is exception handling in Java?",
      answers: {
        answer_a: "Preventing errors",
        answer_b: "Handling runtime errors gracefully",
        answer_c: "Debugging code",
        answer_d: "Compiling programs"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "Which keyword is used to throw an exception manually?",
      answers: {
        answer_a: "try",
        answer_b: "catch",
        answer_c: "throw",
        answer_d: "throws"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is abstraction in Java?",
      answers: {
        answer_a: "Hiding complex implementation",
        answer_b: "Inheriting properties",
        answer_c: "Creating objects",
        answer_d: "Defining constants"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 20,
      question: "Which keyword makes a variable constant in Java?",
      answers: {
        answer_a: "const",
        answer_b: "final",
        answer_c: "static",
        answer_d: "immutable"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ],
  react: [
    {
      id: 1,
      question: "What is React?",
      answers: {
        answer_a: "A JavaScript library for building user interfaces",
        answer_b: "A programming language",
        answer_c: "A database",
        answer_d: "An operating system"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 2,
      question: "What is JSX?",
      answers: {
        answer_a: "A new programming language",
        answer_b: "A syntax extension for JavaScript that looks like HTML",
        answer_c: "A CSS framework",
        answer_d: "A database query language"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "Which hook is used for managing state in functional components?",
      answers: {
        answer_a: "useEffect",
        answer_b: "useState",
        answer_c: "useContext",
        answer_d: "useReducer"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "What is the purpose of the useEffect hook?",
      answers: {
        answer_a: "To create animations",
        answer_b: "To perform side effects in functional components",
        answer_c: "To manage routing",
        answer_d: "To store data"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is a component in React?",
      answers: {
        answer_a: "A database table",
        answer_b: "A reusable piece of UI",
        answer_c: "A CSS file",
        answer_d: "A server"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "How do you pass data from parent to child component?",
      answers: {
        answer_a: "Using global variables",
        answer_b: "Using props",
        answer_c: "Using local storage",
        answer_d: "Using cookies"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is the virtual DOM?",
      answers: {
        answer_a: "A browser API",
        answer_b: "A lightweight copy of the real DOM",
        answer_c: "A CSS framework",
        answer_d: "A database"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "What is the purpose of the key prop in React lists?",
      answers: {
        answer_a: "For styling purposes",
        answer_b: "To help React identify changed items",
        answer_c: "To create unique IDs",
        answer_d: "For routing"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "Which method is used to update state in a class component?",
      answers: {
        answer_a: "this.state = {}",
        answer_b: "this.setState()",
        answer_c: "this.updateState()",
        answer_d: "this.changeState()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "What is the purpose of the context API in React?",
      answers: {
        answer_a: "To create animations",
        answer_b: "To pass data through the component tree without props",
        answer_c: "To manage routing",
        answer_d: "To make HTTP requests"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is a React fragment?",
      answers: {
        answer_a: "A type of hook",
        answer_b: "A way to group elements without adding extra DOM nodes",
        answer_c: "A component lifecycle method",
        answer_d: "A routing library"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "What is the purpose of the useRef hook?",
      answers: {
        answer_a: "To fetch data",
        answer_b: "To persist values between renders",
        answer_c: "To create routing",
        answer_d: "To style components"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is conditional rendering in React?",
      answers: {
        answer_a: "Rendering only on server",
        answer_b: "Rendering different UI based on conditions",
        answer_c: "Rendering with animations",
        answer_d: "Rendering multiple components"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "What is the purpose of props in React?",
      answers: {
        answer_a: "To store local state",
        answer_b: "To pass data from parent to child components",
        answer_c: "To create animations",
        answer_d: "To make API calls"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is the difference between state and props?",
      answers: {
        answer_a: "There is no difference",
        answer_b: "State is internal to component, props are passed from outside",
        answer_c: "Props are mutable, state is immutable",
        answer_d: "State is for styling, props is for data"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "What is the purpose of the map() function in React?",
      answers: {
        answer_a: "To create maps/geo locations",
        answer_b: "To render lists of elements",
        answer_c: "To navigate between pages",
        answer_d: "To make HTTP requests"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is React Router used for?",
      answers: {
        answer_a: "Database routing",
        answer_b: "Client-side routing in React applications",
        answer_c: "API calls",
        answer_d: "State management"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "What is the purpose of the useMemo hook?",
      answers: {
        answer_a: "To create memos",
        answer_b: "To memoize expensive calculations",
        answer_c: "To manage memory",
        answer_d: "To store large data"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is a controlled component in React?",
      answers: {
        answer_a: "A component that is fully controlled by React state",
        answer_b: "A component with no state",
        answer_c: "A component that controls other components",
        answer_d: "A server-side component"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is the purpose of the useCallback hook?",
      answers: {
        answer_a: "To create callbacks",
        answer_b: "To memoize functions",
        answer_c: "To handle events",
        answer_d: "To make HTTP requests"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ],
  sql: [
    {
      id: 1,
      question: "What does SQL stand for?",
      answers: {
        answer_a: "Structured Query Language",
        answer_b: "Simple Query Language",
        answer_c: "Standard Query Language",
        answer_d: "System Query Language"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 2,
      question: "Which command is used to retrieve data from a database?",
      answers: {
        answer_a: "GET",
        answer_b: "SELECT",
        answer_c: "FETCH",
        answer_d: "RETRIEVE"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "Which command is used to insert data into a table?",
      answers: {
        answer_a: "ADD",
        answer_b: "INSERT",
        answer_c: "CREATE",
        answer_d: "PUT"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "Which command is used to modify existing data in a table?",
      answers: {
        answer_a: "MODIFY",
        answer_b: "UPDATE",
        answer_c: "CHANGE",
        answer_d: "ALTER"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "Which command is used to delete data from a table?",
      answers: {
        answer_a: "REMOVE",
        answer_b: "DELETE",
        answer_c: "DROP",
        answer_d: "CLEAR"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "What is a primary key?",
      answers: {
        answer_a: "The first column in a table",
        answer_b: "A unique identifier for each record",
        answer_c: "A foreign key",
        answer_d: "An index"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is a foreign key?",
      answers: {
        answer_a: "A key used for encryption",
        answer_b: "A key that references a primary key in another table",
        answer_c: "The main key in a table",
        answer_d: "A duplicate key"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "Which clause is used to filter results in a SELECT statement?",
      answers: {
        answer_a: "FILTER",
        answer_b: "WHERE",
        answer_c: "HAVING",
        answer_d: "GROUP BY"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "Which clause is used to group results in a SELECT statement?",
      answers: {
        answer_a: "GROUP BY",
        answer_b: "ORDER BY",
        answer_c: "HAVING",
        answer_d: "DISTINCT"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 10,
      question: "What is the purpose of the JOIN clause?",
      answers: {
        answer_a: "To combine rows from two or more tables",
        answer_b: "To filter records",
        answer_c: "To sort results",
        answer_d: "To delete records"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is a view in SQL?",
      answers: {
        answer_a: "A virtual table based on a query",
        answer_b: "A physical table",
        answer_c: "A type of index",
        answer_d: "A database"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 12,
      question: "Which function is used to count rows in SQL?",
      answers: {
        answer_a: "TOTAL()",
        answer_b: "COUNT()",
        answer_c: "SUM()",
        answer_d: "NUMBER()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is normalization in databases?",
      answers: {
        answer_a: "Converting data to normal format",
        answer_b: "Organizing data to reduce redundancy",
        answer_c: "Creating backups",
        answer_d: "Encrypting data"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "Which command is used to create a new table?",
      answers: {
        answer_a: "NEW TABLE",
        answer_b: "CREATE TABLE",
        answer_c: "ADD TABLE",
        answer_d: "MAKE TABLE"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is an index in SQL?",
      answers: {
        answer_a: "A type of constraint",
        answer_b: "A data structure that improves query speed",
        answer_c: "A type of table",
        answer_d: "A backup"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "Which keyword is used to remove duplicate values from a result?",
      answers: {
        answer_a: "UNIQUE",
        answer_b: "DISTINCT",
        answer_c: "DIFFERENT",
        answer_d: "SEPARATE"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is the order of execution of SQL clauses?",
      answers: {
        answer_a: "SELECT, FROM, WHERE, ORDER BY",
        answer_b: "FROM, WHERE, SELECT, ORDER BY",
        answer_c: "WHERE, FROM, SELECT, ORDER BY",
        answer_d: "SELECT, ORDER BY, FROM, WHERE"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "What is a subquery?",
      answers: {
        answer_a: "A query inside another query",
        answer_b: "A simple query",
        answer_c: "A complex query",
        answer_d: "A deleted query"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 19,
      question: "Which constraint ensures a column cannot have NULL values?",
      answers: {
        answer_a: "UNIQUE",
        answer_b: "PRIMARY KEY",
        answer_c: "NOT NULL",
        answer_d: "CHECK"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is a transaction in SQL?",
      answers: {
        answer_a: "A single SQL statement",
        answer_b: "A sequence of SQL statements executed as a single unit",
        answer_c: "A type of table",
        answer_d: "A type of index"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ],
  cpp: [
    {
      id: 1,
      question: "What is C++?",
      answers: {
        answer_a: "A markup language",
        answer_b: "An object-oriented programming language",
        answer_c: "A database",
        answer_d: "A web browser"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "Which operator is used to access members of a class through pointer?",
      answers: {
        answer_a: ".",
        answer_b: "::",
        answer_c: "->",
        answer_d: "&"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 3,
      question: "What is a constructor in C++?",
      answers: {
        answer_a: "A method to destroy objects",
        answer_b: "A special method to initialize objects",
        answer_c: "A type of loop",
        answer_d: "A type of pointer"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "What is inheritance in C++?",
      answers: {
        answer_a: "A way to include headers",
        answer_b: "A class deriving properties from another class",
        answer_c: "A type of variable",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "Which keyword is used to define a class in C++?",
      answers: {
        answer_a: "Class",
        answer_b: "class",
        answer_c: "define",
        answer_d: "struct"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "What is polymorphism in C++?",
      answers: {
        answer_a: "Multiple inheritance only",
        answer_b: "Ability to take many forms through virtual functions",
        answer_c: "Data hiding",
        answer_d: "Code duplication"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is a virtual function?",
      answers: {
        answer_a: "A function that doesn't exist",
        answer_b: "A function that can be overridden in derived classes",
        answer_c: "A function with no return type",
        answer_d: "A static function"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "What is the size of int in C++ (typically)?",
      answers: {
        answer_a: "2 bytes",
        answer_b: "4 bytes",
        answer_c: "8 bytes",
        answer_d: "1 byte"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "Which keyword is used to prevent inheritance?",
      answers: {
        answer_a: "static",
        answer_b: "final",
        answer_c: "sealed",
        answer_d: "const"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "What is a destructor?",
      answers: {
        answer_a: "A method called when an object is created",
        answer_b: "A method called when an object is destroyed",
        answer_c: "A type of constructor",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is a pointer in C++?",
      answers: {
        answer_a: "A type of variable that stores a reference to another variable",
        answer_b: "A type of loop",
        answer_c: "A type of function",
        answer_d: "A type of class"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 12,
      question: "What is a reference in C++?",
      answers: {
        answer_a: "An alias for another variable",
        answer_b: "A type of pointer",
        answer_c: "A type of array",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is the output of: cout << sizeof(char)?",
      answers: {
        answer_a: "1",
        answer_b: "2",
        answer_c: "4",
        answer_d: "8"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 14,
      question: "Which keyword is used to define a constant in C++?",
      answers: {
        answer_a: "constant",
        answer_b: "const",
        answer_c: "final",
        answer_d: "immutable"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is namespace in C++?",
      answers: {
        answer_a: "A type of class",
        answer_b: "A way to organize code into logical groups",
        answer_c: "A type of function",
        answer_d: "A type of variable"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "What is a template in C++?",
      answers: {
        answer_a: "A type of class only",
        answer_b: "A feature for generic programming",
        answer_c: "A type of function",
        answer_d: "A type of pointer"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is exception handling in C++?",
      answers: {
        answer_a: "Preventing errors",
        answer_b: "Handling runtime errors using try-catch blocks",
        answer_c: "Debugging code",
        answer_d: "Compiling programs"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "Which operator is used for scope resolution?",
      answers: {
        answer_a: ".",
        answer_b: "::",
        answer_c: "->",
        answer_d: "#"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is multiple inheritance?",
      answers: {
        answer_a: "A class inheriting from one base class",
        answer_b: "A class inheriting from multiple base classes",
        answer_c: "A type of function",
        answer_d: "A type of pointer"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is the purpose of 'this' pointer in C++?",
      answers: {
        answer_a: "To point to the current object",
        answer_b: "To create new objects",
        answer_c: "To delete objects",
        answer_d: "To compare objects"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    }
  ],
  csharp: [
    {
      id: 1,
      question: "What is C#?",
      answers: {
        answer_a: "A markup language",
        answer_b: "A modern object-oriented programming language",
        answer_c: "A database",
        answer_d: "A web browser"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "Which keyword is used to define a class in C#?",
      answers: {
        answer_a: "CLASS",
        answer_b: "class",
        answer_c: "define",
        answer_d: "object"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "What is the entry point of a C# program?",
      answers: {
        answer_a: "start()",
        answer_b: "Main()",
        answer_c: "run()",
        answer_d: "begin()"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "Which keyword is used to prevent method overriding?",
      answers: {
        answer_a: "static",
        answer_b: "private",
        answer_c: "sealed",
        answer_d: "abstract"
      },
      correct_answers: {
        answer_c_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is inheritance in C#?",
      answers: {
        answer_a: "A way to import namespaces",
        answer_b: "A class acquiring properties from another class",
        answer_c: "A type of loop",
        answer_d: "A variable declaration"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "What is polymorphism in C#?",
      answers: {
        answer_a: "Multiple inheritance",
        answer_b: "Ability to take many forms through virtual/override",
        answer_c: "Data hiding",
        answer_d: "Code reusability"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "Which keyword is used to implement an interface?",
      answers: {
        answer_a: "extends",
        answer_b: "implements",
        answer_c: "interface",
        answer_d: "inherits"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "What is a property in C#?",
      answers: {
        answer_a: "A type of variable",
        answer_b: "A class member that provides controlled access to fields",
        answer_c: "A method",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "What is a namespace in C#?",
      answers: {
        answer_a: "A type of class",
        answer_b: "A way to organize code into logical groups",
        answer_c: "A type of function",
        answer_d: "A type of variable"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "What is a delegate in C#?",
      answers: {
        answer_a: "A type of variable",
        answer_b: "A type-safe function pointer",
        answer_c: "A type of loop",
        answer_d: "A type of array"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is an event in C#",
      answers: {
        answer_a: "A type of variable",
        answer_b: "A message sent by an object to signal an action",
        answer_c: "A type of method",
        answer_d: "A type of class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "What is LINQ in C#?",
      answers: {
        answer_a: "A type of database",
        answer_b: "Language Integrated Query for querying data",
        answer_c: "A type of loop",
        answer_d: "A type of class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is the base class for all classes in C#?",
      answers: {
        answer_a: "Parent",
        answer_b: "Object",
        answer_c: "Root",
        answer_d: "Base"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "What is encapsulation in C#?",
      answers: {
        answer_a: "Hiding implementation details using properties",
        answer_b: "Inheriting properties",
        answer_c: "Creating objects",
        answer_d: "Defining methods"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 15,
      question: "Which keyword is used to create a struct?",
      answers: {
        answer_a: "structure",
        answer_b: "struct",
        answer_c: "class",
        answer_d: "record"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "What is a nullable type in C#?",
      answers: {
        answer_a: "A type that can be null",
        answer_b: "A type that cannot be null",
        answer_c: "A type of loop",
        answer_d: "A type of array"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is async/await in C#?",
      answers: {
        answer_a: "A type of loop",
        answer_b: "Asynchronous programming pattern",
        answer_c: "A type of variable",
        answer_d: "A debugging tool"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "What is a generic in C#?",
      answers: {
        answer_a: "A type of variable",
        answer_b: "A feature allowing type-safe collections",
        answer_c: "A type of method",
        answer_d: "A type of class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is exception handling in C#?",
      answers: {
        answer_a: "Preventing errors",
        answer_b: "Handling runtime errors using try-catch blocks",
        answer_c: "Debugging code",
        answer_d: "Compiling programs"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is the purpose of the 'using' statement in C#?",
      answers: {
        answer_a: "To include namespaces",
        answer_b: "To automatically dispose of resources",
        answer_c: "To create aliases",
        answer_d: "To define types"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ],
  angular: [
    {
      id: 1,
      question: "What is Angular?",
      answers: {
        answer_a: "A JavaScript library",
        answer_b: "A TypeScript-based web application framework",
        answer_c: "A CSS framework",
        answer_d: "A database"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "What is a component in Angular?",
      answers: {
        answer_a: "A database table",
        answer_b: "A building block of Angular applications",
        answer_c: "A CSS file",
        answer_d: "A server"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "What is a service in Angular?",
      answers: {
        answer_a: "A type of component",
        answer_b: "A singleton object for sharing data and logic",
        answer_c: "A type of directive",
        answer_d: "A type of module"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "What is dependency injection in Angular?",
      answers: {
        answer_a: "A way to inject CSS",
        answer_b: "A design pattern for providing dependencies to components",
        answer_c: "A type of routing",
        answer_d: "A debugging tool"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is a directive in Angular?",
      answers: {
        answer_a: "A type of database",
        answer_b: "A custom HTML element or attribute that extends HTML",
        answer_c: "A type of service",
        answer_d: "A type of module"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "What is data binding in Angular?",
      answers: {
        answer_a: "Connecting to databases",
        answer_b: "Synchronization between component and template",
        answer_c: "Creating forms",
        answer_d: "Routing"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is a module in Angular?",
      answers: {
        answer_a: "A type of component",
        answer_b: "A container for related components, services, and directives",
        answer_c: "A type of service",
        answer_d: "A type of pipe"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "What is the purpose of ngFor directive?",
      answers: {
        answer_a: "Conditional rendering",
        answer_b: "Looping through collections to render elements",
        answer_c: "Hiding elements",
        answer_d: "Styling elements"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "What is the purpose of ngIf directive?",
      answers: {
        answer_a: "Looping",
        answer_b: "Conditional rendering of elements",
        answer_c: "Styling",
        answer_d: "Routing"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "What is a pipe in Angular?",
      answers: {
        answer_a: "A type of component",
        answer_b: "A way to transform data in templates",
        answer_c: "A type of service",
        answer_d: "A type of directive"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is routing in Angular?",
      answers: {
        answer_a: "Connecting to databases",
        answer_b: "Navigation between different views/pages",
        answer_c: "Creating forms",
        answer_d: "Styling components"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "What is a form control in Angular?",
      answers: {
        answer_a: "A type of directive",
        "answer_b": "An object that manages the value and validity of a form input",
        answer_c: "A type of pipe",
        answer_d: "A type of module"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is the purpose of HttpClient in Angular?",
      answers: {
        answer_a: "To create components",
        answer_b: "To make HTTP requests to APIs",
        answer_c: "To manage routing",
        answer_d: "To style components"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "What is the CLI in Angular?",
      answers: {
        answer_a: "A type of service",
        answer_b: "Command Line Interface for creating Angular projects",
        answer_c: "A type of component",
        answer_d: "A type of directive"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is a lifecycle hook in Angular?",
      answers: {
        answer_a: "A type of routing",
        answer_b: "Methods called at different stages of a component's life",
        answer_c: "A type of service",
        answer_d: "A type of pipe"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "What is ngOnInit used for?",
      answers: {
        answer_a: "To destroy a component",
        answer_b: "To initialize the component",
        answer_c: "To update the view",
        answer_d: "To handle errors"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is a reactive form in Angular?",
      answers: {
        answer_a: "A form that reacts to user input",
        answer_b: "A form built using FormBuilder and FormControl",
        answer_c: "A template-driven form",
        answer_d: "A simple HTML form"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "What is a template-driven form in Angular?",
      answers: {
        answer_a: "A form using FormGroup",
        answer_b: "A form using ngModel directive in templates",
        answer_c: "A reactive form",
        answer_d: "A complex form"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is the purpose of @Input decorator?",
      answers: {
        answer_a: "To output data",
        answer_b: "To pass data from parent to child component",
        answer_c: "To create services",
        answer_d: "To define routes"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is the purpose of @Output decorator?",
      answers: {
        answer_a: "To receive data",
        answer_b: "To emit events from child to parent component",
        answer_c: "To create services",
        answer_d: "To define routes"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ],
vue: [
    {
      id: 1,
      question: "What is Vue.js?",
      answers: {
        answer_a: "A JavaScript library",
        answer_b: "A progressive JavaScript framework for building user interfaces",
        answer_c: "A CSS framework",
        answer_d: "A database"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "What is a component in Vue?",
      answers: {
        answer_a: "A database table",
        answer_b: "A reusable Vue instance with a name",
        answer_c: "A CSS file",
        answer_d: "A server"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "What is the Vue CLI?",
      answers: {
        answer_a: "A type of component",
        answer_b: "Command Line Interface for Vue development",
        answer_c: "A type of directive",
        answer_d: "A type of router"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 4,
      question: "What is the purpose of v-if directive?",
      answers: {
        answer_a: "Looping through collections",
        answer_b: "Conditionally rendering elements",
        answer_c: "Binding attributes",
        answer_d: "Handling events"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 5,
      question: "What is the purpose of v-for directive?",
      answers: {
        answer_a: "Conditional rendering",
        answer_b: "Looping through collections to render elements",
        answer_c: "Binding classes",
        answer_d: "Handling forms"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "What is a computed property in Vue?",
      answers: {
        answer_a: "A method that runs on every render",
        answer_b: "A property that caches results based on dependencies",
        answer_c: "A property that cannot be changed",
        answer_d: "A watch function"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 7,
      question: "What is the purpose of v-bind directive?",
      answers: {
        answer_a: "To bind form inputs",
        answer_b: "To dynamically bind attributes to expressions",
        answer_c: "To bind events",
        answer_d: "To create computed properties"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "What is the purpose of v-on directive?",
      answers: {
        answer_a: "To bind attributes",
        answer_b: "To listen to DOM events",
        answer_c: "To create computed properties",
        answer_d: "To define methods"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "What is Vuex?",
      answers: {
        answer_a: "A Vue component",
        answer_b: "A state management library for Vue",
        answer_c: "A Vue router",
        answer_d: "A Vue template"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "What is Vue Router?",
      answers: {
        answer_a: "A state management library",
        answer_b: "The official routing library for Vue",
        answer_c: "A Vue component",
        answer_d: "A build tool"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is the purpose of data option in Vue component?",
      answers: {
        answer_a: "To define methods",
        answer_b: "To define component's reactive state",
        answer_c: "To define computed properties",
        answer_d: "To define watchers"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "What is a method in Vue?",
      answers: {
        answer_a: "A reactive property",
        answer_b: "A function defined in a component",
        answer_c: "A computed property",
        answer_d: "A lifecycle hook"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is the purpose of watch option in Vue?",
      answers: {
        answer_a: "To create computed properties",
        answer_b: "To watch for changes in data and perform actions",
        answer_c: "To define methods",
        answer_d: "To handle events"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "What is the purpose of created lifecycle hook?",
      answers: {
        answer_a: "To mount the component to DOM",
        answer_b: "Called after the instance is created",
        answer_c: "To update the component",
        answer_d: "To destroy the component"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is v-model directive used for?",
      answers: {
        answer_a: "One-way data binding",
        answer_b: "Two-way data binding on form inputs",
        answer_c: "Event binding",
        answer_d: "Attribute binding"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 16,
      question: "What is a single file component in Vue?",
      answers: {
        answer_a: "A component with one element",
        answer_b: "A .vue file containing template, script, and style",
        answer_c: "A component used once",
        answer_d: "A simple component"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is the purpose of keep-alive?",
      answers: {
        answer_a: "To keep the component alive forever",
        answer_b: "To cache component instances to avoid re-rendering",
        answer_c: "To prevent component destruction",
        answer_d: "To create persistent data"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "What is a slot in Vue?",
      answers: {
        answer_a: "A type of directive",
        answer_b: "A placeholder for content distribution",
        answer_c: "A type of component",
        answer_d: "A type of router"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is the purpose of nextTick?",
      answers: {
        answer_a: "To wait for the next tick of the event loop",
        answer_b: "To create a tick",
        answer_c: "To destroy the component",
        answer_d: "To update the data"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is Vue 3 Composition API?",
      answers: {
        answer_a: "A different framework",
        answer_b: "A set of functions for organizing component logic",
        answer_c: "A new routing system",
        answer_d: "A build tool"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ],
  php: [
    {
      id: 1,
      question: "What does PHP stand for?",
      answers: {
        answer_a: "Personal Home Page",
        answer_b: "PHP: Hypertext Preprocessor",
        answer_c: "Private Home Page",
        answer_d: "Public Home Page"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 2,
      question: "How do you declare a variable in PHP?",
      answers: {
        answer_a: "var x = 5;",
        answer_b: "$x = 5;",
        answer_c: "int x = 5;",
        answer_d: "let x = 5;"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 3,
      question: "Which symbol is used to access a property of an object in PHP?",
      answers: {
        answer_a: "->",
        answer_b: ".",
        answer_c: "::",
        answer_d: "#"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 4,
      question: "What is the correct way to start a PHP block?",
      answers: {
        answer_a: "<?php",
        answer_b: "<php",
        answer_c: "<?",
        answer_d: "Both A and C"
      },
      correct_answers: {
        answer_d_correct: "true"
      }
    },
    {
      id: 5,
      question: "Which superglobal is used to access form data sent with POST method?",
      answers: {
        answer_a: "$_GET",
        answer_b: "$_POST",
        answer_c: "$_REQUEST",
        answer_d: "$_SERVER"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 6,
      question: "What is the correct way to create a function in PHP?",
      answers: {
        answer_a: "function myFunction()",
        answer_b: "create function myFunction()",
        answer_c: "def myFunction()",
        answer_d: "func myFunction()"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 7,
      question: "Which operator is used for string concatenation in PHP?",
      answers: {
        answer_a: "+",
        answer_b: ".",
        answer_c: "&",
        answer_d: ","
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 8,
      question: "What is a class in PHP?",
      answers: {
        answer_a: "A type of variable",
        answer_b: "A blueprint for creating objects",
        answer_c: "A type of function",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 9,
      question: "What is an interface in PHP?",
      answers: {
        answer_a: "A type of class",
        answer_b: "A contract that defines methods a class must implement",
        answer_c: "A type of variable",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 10,
      question: "Which keyword is used to include a file in PHP?",
      answers: {
        answer_a: "import",
        answer_b: "include",
        answer_c: "require",
        answer_d: "Both B and C"
      },
      correct_answers: {
        answer_d_correct: "true"
      }
    },
    {
      id: 11,
      question: "What is the purpose of the 'echo' statement in PHP?",
      answers: {
        answer_a: "To create a variable",
        answer_b: "To output text to the screen",
        answer_c: "To define a function",
        answer_d: "To create a class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 12,
      question: "What is a session in PHP?",
      answers: {
        answer_a: "A type of loop",
        answer_b: "A way to store user data across multiple pages",
        answer_c: "A type of variable",
        answer_d: "A type of function"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 13,
      question: "What is the purpose of $_GET superglobal?",
      answers: {
        answer_a: "To send data securely",
        answer_b: "To collect form data sent with GET method",
        answer_c: "To access server variables",
        answer_d: "To access session data"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 14,
      question: "What is a cookie in PHP?",
      answers: {
        answer_a: "A type of function",
        answer_b: "A small file stored on the user's computer",
        answer_c: "A type of loop",
        answer_d: "A type of class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 15,
      question: "What is the purpose of 'foreach' loop in PHP?",
      answers: {
        answer_a: "To iterate over arrays",
        answer_b: "To create a conditional loop",
        answer_c: "To define a function",
        answer_d: "To create a class"
      },
      correct_answers: {
        answer_a_correct: "true"
      }
    },
    {
      id: 16,
      question: "What is PDO in PHP?",
      answers: {
        answer_a: "A type of loop",
        answer_b: "PHP Data Objects - a database access layer",
        answer_c: "A type of function",
        answer_d: "A type of class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 17,
      question: "What is the purpose of 'public' access modifier?",
      answers: {
        answer_a: "To restrict access",
        answer_b: "To allow access from anywhere",
        answer_c: "To allow access within the class only",
        answer_d: "To allow access within the same package"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 18,
      question: "What is namespace in PHP?",
      answers: {
        answer_a: "A type of variable",
        answer_b: "A way to organize code and avoid naming conflicts",
        answer_c: "A type of function",
        answer_d: "A type of loop"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 19,
      question: "What is exception handling in PHP?",
      answers: {
        answer_a: "Preventing errors",
        answer_b: "Handling runtime errors using try-catch blocks",
        answer_c: "Debugging code",
        answer_d: "Compiling programs"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    },
    {
      id: 20,
      question: "What is the purpose of 'return' statement in PHP?",
      answers: {
        answer_a: "To output text",
        answer_b: "To exit a function and return a value",
        answer_c: "To define a variable",
        answer_d: "To create a class"
      },
      correct_answers: {
        answer_b_correct: "true"
      }
    }
  ]
};

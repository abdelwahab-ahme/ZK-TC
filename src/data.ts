import { Course, SqlChallenge, Inquiry, Review, JobPosition } from "./types";

export const cs50Course: Course = {
  id: "cs50",
  title: "CS50 Introduction to Computer Science",
  titleAr: "دورة CS50 لعلوم الحاسب",
  description: "The legendary Harvard course covering the foundations of computer science and programming basics.",
  descriptionAr: "الدورة الشهيرة من جامعة هارفارد لتأسيس علوم الحاسب ومبادئ البرمجة للمبتدئين والمحترفين.",
  icon: "Binary",
  lessons: [
    {
      id: "cs50-w0",
      title: "Week 0 - Scratch (Visual Programming)",
      titleAr: "الأسبوع 0 - Scratch (البرمجة المرئية)",
      duration: "2h 15m",
      youtubeId: "yO7Mw3S2D0U",
      summary: "Introduction to loops, conditions, variables, and events using a friendly visual blocks interface.",
      summaryAr: "مقدمة للبرمجة باستخدام المكعبات المرئية لتفهم بشكل عملي الحلقات التكرارية والشروط والمتغيرات والأحداث.",
      quiz: {
        question: "What is a main benefit of Scratch before learning syntax-heavy languages?",
        questionAr: "ما هي الفائدة الرئيسية من تعلم Scratch قبل اللغات النصية؟",
        options: [
          "It helps focus on logic and conceptual programming rather than syntax spelling.",
          "It compiles directly to native assembly code.",
          "It is used to write high-frequency trading systems.",
          "It is the only language that supports multiple variables."
        ],
        correctIndex: 0
      }
    },
    {
      id: "cs50-w1",
      title: "Week 1 - C (Syntax, Variables, Conditions)",
      titleAr: "الأسبوع 1 - لغة C (الكتابة، المتغيرات، الشروط)",
      duration: "2h 30m",
      youtubeId: "1-9_e_001K8",
      summary: "Transitioning to writing actual code in C, understanding compilers, data types, and loop structures.",
      summaryAr: "الانتقال لكتابة الأكواد النصية باستخدام لغة C، وفهم المترجمات (Compilers)، وأنواع البيانات والشروط والدوران.",
      quiz: {
        question: "Which of the following is the correct format specifier for a string in C?",
        questionAr: "أي من التالي هو رمز التنسيق الصحيح للنصوص (Strings) في لغة C؟",
        options: ["%d", "%c", "%f", "%s"],
        correctIndex: 3
      }
    },
    {
      id: "cs50-w2",
      title: "Week 2 - Arrays & Memory Layout",
      titleAr: "الأسبوع 2 - المصفوفات وتوزيع الذاكرة",
      duration: "2h 10m",
      youtubeId: "W9m5B8Vpx6g",
      summary: "Exploring memory addresses, debugging code, array indices, and how strings are stored in memory.",
      summaryAr: "استكشاف عناوين الذاكرة، مراجعة الأخطاء وتصحيحها، وكيفية حفظ المصفوفات والنصوص في خلايا الذاكرة المتجاورة.",
      quiz: {
        question: "How do strings terminate in C memory?",
        questionAr: "كيف تنتهي النصوص (Strings) في ذاكرة لغة C؟",
        options: [
          "With a special null terminator byte '\\0'",
          "With a semicolon ';'",
          "With an empty space ' '",
          "At the fixed length of 255 characters"
        ],
        correctIndex: 0
      }
    },
    {
      id: "cs50-w3",
      title: "Week 3 - Algorithms (Searching & Sorting)",
      titleAr: "الأسبوع 3 - الخوارزميات (البحث والترتيب)",
      duration: "2h 20m",
      youtubeId: "fM52V7s2s6I",
      summary: "Comparing Big O notation, Linear and Binary Search, Bubble Sort, Selection Sort, and Merge Sort.",
      summaryAr: "مقارنة كفاءة الأكواد عبر Big O، والبحث الخطي والثنائي، وخوارزميات الترتيب كـ الفقاعي والاختياري والدمج.",
      quiz: {
        question: "What is the worst-case time complexity of Binary Search?",
        questionAr: "ما هو التعقيد الزمني لأسوأ حالة في البحث الثنائي (Binary Search)؟",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        correctIndex: 1
      }
    },
    {
      id: "cs50-w4",
      title: "Week 4 - Memory & Pointers",
      titleAr: "الأسبوع 4 - الذاكرة والمؤشرات (Pointers)",
      duration: "2h 40m",
      youtubeId: "rZ6b6v9z18M",
      summary: "Understanding hexadecimal numbering, memory addresses, dynamic allocation with malloc, and pointers.",
      summaryAr: "فهم النظام السداسي عشري، وعناوين الذاكرة المباشرة، وحجز الذاكرة ديناميكياً باستخدام malloc ومفهوم المؤشرات القوي.",
      quiz: {
        question: "What operator is used in C to get the address of a variable?",
        questionAr: "ما هو الرمز المستخدم في لغة C للحصول على عنوان متغير في الذاكرة؟",
        options: ["*", "&", "#", "->"],
        correctIndex: 1
      }
    },
    {
      id: "cs50-w5",
      title: "Week 5 - Data Structures (Linked Lists, Trees)",
      titleAr: "الأسبوع 5 - هياكل البيانات (القوائم المترابطة والأشجار)",
      duration: "2h 15m",
      youtubeId: "W9m5B8Vpx6g",
      summary: "Creating custom structures: Linked Lists, Hash Tables, Binary Search Trees, and Tries.",
      summaryAr: "إنشاء هياكل بيانات مخصصة كـ القوائم المتصلة، وجداول التجزئة (Hash Tables)، وأشجار البحث الثنائية والـ Tries.",
      quiz: {
        question: "Which data structure provides O(1) average lookup time?",
        questionAr: "أي هيكل بيانات يوفر وقت بحث بمتوسط O(1)؟",
        options: ["Singly Linked List", "Binary Search Tree", "Hash Table", "Queue"],
        correctIndex: 2
      }
    },
    {
      id: "cs50-w6",
      title: "Week 6 - Python (Modern Language Syntax)",
      titleAr: "الأسبوع 6 - لغة بايثون (صياغة اللغات الحديثة)",
      duration: "2h 05m",
      youtubeId: "W9m5B8Vpx6g",
      summary: "Translating computer science concepts into Python, utilizing dynamic typing and powerful built-in libraries.",
      summaryAr: "ترجمة المفاهيم البرمجية إلى لغة Python، واستغلال السهولة البرمجية والتعرف على المكتبات المدمجة الجاهزة.",
      quiz: {
        question: "How are code blocks defined in Python?",
        questionAr: "كيف يتم تحديد الكتل البرمجية (Blocks) في لغة بايثون؟",
        options: [
          "Using curly braces { }",
          "Using indentation (whitespace/tabs)",
          "Using begin and end keywords",
          "Using parentheses ( )"
        ],
        correctIndex: 1
      }
    }
  ]
};

export const sqlCourse: Course = {
  id: "sql",
  title: "Mastering Relational Databases & SQL",
  titleAr: "دورة احتراف قواعد البيانات ولغة SQL",
  description: "Learn to design database schemas, query tables, join datasets, and optimize database storage.",
  descriptionAr: "تعلم تصميم هياكل قواعد البيانات، كتابة الاستعلامات المعقدة، ربط الجداول، وتحسين الأداء بكفاءة.",
  icon: "Database",
  lessons: [
    {
      id: "sql-l1",
      title: "Lesson 1: Introduction to Databases & Schemas",
      titleAr: "الدرس 1: مقدمة في قواعد البيانات والجداول",
      duration: "30m",
      youtubeId: "HXV3zeQKqGY",
      summary: "Understand relational databases, primary keys, foreign keys, and tables.",
      summaryAr: "فهم قواعد البيانات العلاقاتية، والمفاتيح الأساسية والفرعية، وهيكل الجداول والصفوف.",
      quiz: {
        question: "What is a primary key?",
        questionAr: "ما هو المفتاح الأساسي (Primary Key)؟",
        options: [
          "A key that can decrypt passwords.",
          "A unique identifier for each record/row in a table.",
          "The first column in any database table.",
          "A password used to access the database admin panel."
        ],
        correctIndex: 1
      }
    },
    {
      id: "sql-l2",
      title: "Lesson 2: Querying with SELECT & WHERE",
      titleAr: "الدرس 2: استرجاع البيانات وتصفيتها بالشرط",
      duration: "40m",
      youtubeId: "7S_tz1z_5bA",
      summary: "Master extracting specific columns and filtering records using comparison operators.",
      summaryAr: "احتراف سحب أعمدة معينة وتصفية الصفوف باستخدام شروط المقارنة (WHERE, AND, OR, LIKE).",
      quiz: {
        question: "Which clause is used to filter records in a SQL query?",
        questionAr: "أي جملة برمجية تستخدم لتصفية الصفوف في استعلام SQL؟",
        options: ["GROUP BY", "WHERE", "ORDER BY", "SELECT"],
        correctIndex: 1
      }
    },
    {
      id: "sql-l3",
      title: "Lesson 3: Sorting & Aggregate Functions",
      titleAr: "الدرس 3: الترتيب والدوال التجميعية",
      duration: "35m",
      youtubeId: "W9m5B8Vpx6g",
      summary: "Learn ORDER BY, and using aggregate commands like COUNT, SUM, AVG, MIN, and MAX.",
      summaryAr: "تعلم ترتيب النتائج تنازلياً وتصاعدياً، وحساب الإحصائيات مثل العدد والمجموع والمتوسط الحسابي.",
      quiz: {
        question: "Which aggregate function is used to calculate the number of rows?",
        questionAr: "أي دالة تجميعية تستخدم لحساب عدد الصفوف المسترجعة؟",
        options: ["SUM()", "COUNT()", "AVG()", "TOTAL()"],
        correctIndex: 1
      }
    },
    {
      id: "sql-l4",
      title: "Lesson 4: Table Joins (INNER & LEFT JOIN)",
      titleAr: "الدرس 4: ربط الجداول (INNER & LEFT JOIN)",
      duration: "50m",
      youtubeId: "8O6v3Sg8L1M",
      summary: "Combine columns from two or more tables based on a related column between them.",
      summaryAr: "دمج أعمدة من جدولين أو أكثر بناءً على عمود مشترك ومترابط بينهما لحل تشتت البيانات.",
      quiz: {
        question: "What does an INNER JOIN return?",
        questionAr: "ماذا يرجع الربط من النوع INNER JOIN؟",
        options: [
          "Only rows that have matching values in both tables.",
          "All rows from both tables, regardless of any match.",
          "Only rows from the left table with no match on the right.",
          "A random sample of matching and non-matching records."
        ],
        correctIndex: 0
      }
    }
  ]
};

// Database mock data representing the database engine in the SQL sandbox
export const mockDatabaseTables = {
  students: [
    { id: 1, name: "عبدالرحمن علي", age: 19, track: "CS50", city: "القاهرة", grade: 95 },
    { id: 2, name: "فاطمة أحمد", age: 22, track: "SQL", city: "الأسكندرية", grade: 88 },
    { id: 3, name: "محمد محمود", age: 20, track: "CS50", city: "الجيزة", grade: 72 },
    { id: 4, name: "سارة حسن", age: 23, track: "SQL", city: "المنصورة", grade: 91 },
    { id: 5, name: "يوسف إبراهيم", age: 18, track: "CS50", city: "القاهرة", grade: 64 },
    { id: 6, name: "نور الدين", age: 21, track: "SQL", city: "طنطا", grade: 85 }
  ],
  instructors: [
    { id: 1, name: "المهندس عبدالوهاب أحمد", course: "CS50 & SQL", exp_years: 6 },
    { id: 2, name: "أحمد حجاج", course: "Frontend Web", exp_years: 4 }
  ]
};

export const sqlChallenges: SqlChallenge[] = [
  {
    id: "chal-1",
    title: "Filter High Grades",
    titleAr: "تصفية الدرجات المرتفعة",
    difficulty: "سهل",
    difficultyEn: "Easy",
    description: "Write a query to SELECT all students from the 'students' table who have a grade greater than or equal to 90.",
    descriptionAr: "اكتب استعلاماً برمجياً لاسترجاع جميع بيانات الطلاب من جدول 'students' الذين حصلوا على درجة (grade) أكبر من أو تساوي 90.",
    initialQuery: "SELECT * FROM students WHERE ...",
    expectedQuery: "SELECT * FROM students WHERE grade >= 90",
    hint: "Use comparison operator `>= 90` with the column `grade`.",
    hintAr: "استخدم عامل المقارنة `>= 90` مع العمود `grade`.",
    pointsReward: 15
  },
  {
    id: "chal-2",
    title: "Target Cairo Students",
    titleAr: "استهداف طلاب القاهرة",
    difficulty: "سهل",
    difficultyEn: "Easy",
    description: "Write a query to get only the 'name' and 'age' of students who live in 'القاهرة'.",
    descriptionAr: "اكتب استعلاماً لاسترجاع اسم الطالب (name) وسنه (age) فقط للطلاب المقيمين في مدينة 'القاهرة' (city).",
    initialQuery: "SELECT name, age FROM students WHERE ...",
    expectedQuery: "SELECT name, age FROM students WHERE city = 'القاهرة'",
    hint: "Set column `city` equal to the text string 'القاهرة'.",
    hintAr: "اضبط الشرط بحيث يكون العمود `city` مساوياً للقيمة النصية 'القاهرة'.",
    pointsReward: 20
  },
  {
    id: "chal-3",
    title: "The SQL Track Students",
    titleAr: "طلاب مسار SQL",
    difficulty: "متوسط",
    difficultyEn: "Medium",
    description: "Retrieve all students who are in the 'SQL' track AND are under 23 years old.",
    descriptionAr: "استرجع جميع بيانات الطلاب الذين يدرسون مسار 'SQL' (track) وحرص على أن تكون أعمارهم (age) أقل من 23 سنة.",
    initialQuery: "SELECT * FROM students WHERE track = 'SQL' ...",
    expectedQuery: "SELECT * FROM students WHERE track = 'SQL' AND age < 23",
    hint: "Combine conditions using the `AND` keyword.",
    hintAr: "اجمع الشرطين معاً باستخدام المعامل المنطقي `AND` في جملة WHERE.",
    pointsReward: 30
  }
];

export const mockInquiries: Inquiry[] = [
  {
    id: "inq-1",
    title: "مشكلة في فهم المؤشرات (Pointers) في لغة C",
    author: "أحمد علي",
    content: "يا بشمهندس عبد الوهاب، بقالي يومين بحاول أفهم المؤشرات في لغة C بس دايماً بتلخبط بين النجمة (*) وعلامة العنوان (&). ممكن توضيح بسيط وسريع يخليني أحفظهم ومستوايا يتحسن؟ وشكراً ليك.",
    timestamp: "منذ ساعتين",
    replies: [
      {
        id: "rep-1",
        author: "المهندس عبدالوهاب أحمد",
        content: "أهلاً بك يا أحمد! تذكرها دائماً هكذا:\n1. علامة (&) تعني 'عنوان المتغير' (Address of)، كأنك تسأل في أي صندوق في الذاكرة يسكن هذا المتغير.\n2. علامة (*) في التعريف تخلق مؤشراً يشير للعنوان، أما قبل مؤشر قائم فتعني 'القيمة التي بداخل العنوان' (Value at Address).\nسأقوم بشرح هذا مجدداً برسمة بسيطة في المحاضرة القادمة لتثبيت المعلومة!",
        timestamp: "منذ ساعة",
        isTutor: true
      }
    ]
  },
  {
    id: "inq-2",
    title: "هل أبدأ بـ CS50 ولا أتعلم مسار الويب علطول؟",
    author: "سلوى محمد",
    content: "أنا حابة أدخل مجال برمجة المواقع والفرونت إند، هل لازم أذاكر كورس CS50 كامل الأول، ولا أدخل في الويب وكتابة الأكواد مباشرة؟ حابة أسمع رأيك يا بشمهندس.",
    timestamp: "منذ يوم واحد",
    replies: [
      {
        id: "rep-2",
        author: "المهندس عبدالوهاب أحمد",
        content: "أهلاً بك يا سلوى. البداية بـ CS50 تمنحك 'تأسيساً فكرياً قاطناً بالصلابة'. ستفهمين كيف يفكر الكمبيوتر والذاكرة والخوارزميات، وهذا يجعلك مبرمجة محترفة سريعة التعلم لاحقاً وتتفوقين على من تعلم السطحيات فقط.\nنصيحتي: ابدئي بـ CS50 لغاية أسبوع بايثون (الأسبوع السادس)، ثم توازياً ادخلي في مسار تطوير الويب. هذا هو المزيج الذهبي للنجاح!",
        timestamp: "منذ ٢٠ ساعة",
        isTutor: true
      }
    ]
  }
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    author: "كريم يحيى",
    rating: 5,
    content: "أفضل شرح وتأسيس شفته في حياتي للبرمجة! المهندس عبدالوهاب بيبسط المعلومة الصعبة ويخليك تفهمها وتطبقها بإيدك. كورس CS50 باللغة العربية معاه كان نقطة تحول في حياتي المهنية.",
    timestamp: "2026-06-25"
  },
  {
    id: "rev-2",
    author: "مريم عبد الله",
    rating: 5,
    content: "الدروس منظمة جداً والمنصة بتساعدك تطبق وتحل مسائل بيدك. المتابعة والاستفسارات سريعة جداً. شكراً أستاذ عبدالوهاب وجزاك الله كل خير.",
    timestamp: "2026-07-02"
  },
  {
    id: "rev-3",
    author: "محمود الصاوي",
    rating: 5,
    content: "تعلمت الـ SQL بشكل ممتاز وبدأت أكتب استعلامات معقدة في أسبوع واحد بس. بجد كورس ممتاز جداً وتأسيس متين للي عايز يفهم بجد مش مجرد حفظ كود.",
    timestamp: "2026-07-08"
  }
];

export const jobPositions: JobPosition[] = [
  {
    id: "job-1",
    title: "Junior SQL Database Developer",
    titleAr: "مطور قواعد بيانات SQL مبتدئ",
    type: "Full-Time",
    typeAr: "دوام كامل",
    location: "Cairo, Egypt (Hybrid)",
    locationAr: "القاهرة، مصر (هجين)",
    salary: "12,000 - 15,000 EGP",
    description: "We are seeking a junior database developer to write clean SQL scripts, design schema structures, optimize queries, and generate routine data reports under senior supervision.",
    descriptionAr: "نبحث عن مبرمج قواعد بيانات مبتدئ للمساعدة في تصميم الجداول، وكتابة الاستعلامات وتحسين الأداء وإخراج تقارير دورية للبيانات تحت توجيه الإدارة الفنية.",
    requirements: [
      "Solid understanding of relational database design & Normalization forms.",
      "Proficient in writing SELECT, JOINs, subqueries, and grouping commands.",
      "Basic understanding of indexing and query execution plans.",
      "Completed Zakora-TC SQL course or equivalent program."
    ],
    requirementsAr: [
      "فهم ممتاز لمبادئ تصميم قواعد البيانات العلاقاتية وهيكلتها.",
      "القدرة على كتابة استعلامات الربط (JOINs)، التصفية (WHERE)، والدوال التجميعية.",
      "معرفة أولية بالفهارس (Indexes) وكيفية تسريع استرجاع البيانات.",
      "إتمام دورة SQL التدريبية في Zakora-TC أو ما يعادلها بنجاح."
    ]
  },
  {
    id: "job-2",
    title: "Educational Assistant / Tutor Partner",
    titleAr: "مساعد تعليمي ومعيد برمجة",
    type: "Part-Time / Remote",
    typeAr: "دوام جزئي / عن بعد",
    location: "Remote (Egypt)",
    locationAr: "عن بعد (مصر)",
    salary: "6,000 - 8,000 EGP",
    description: "Help students solve code problems in C, Python, or SQL, review and grade submitted tasks, and answer technical inquiries in our platform discussion boards.",
    descriptionAr: "مساعدة طلاب المنصة في حل مشاكل الأكواد في لغات C وبايثون وSQL، ومراجعة وتقييم المهام والتكليفات التعليمية والرد السريع على الاستفسارات الفنية.",
    requirements: [
      "Strong coding foundation (successfully completed CS50 with premium score).",
      "Patience and passion for explaining technical concepts in Egyptian Arabic.",
      "Detail-oriented when reading and debugging students' C or Python code.",
      "Good written communication skills."
    ],
    requirementsAr: [
      "أساس برمجى قوي جداً (الحصول على تقييم ممتاز في دورة CS50 أو ما يماثلها).",
      "الصبر والشغف بتبسيط المفاهيم البرمجية الصعبة للطلاب بالعامية المصرية.",
      "الدقة الشديدة في قراءة وتصحيح أكواد الطلاب واكتشاف الأخطاء البرمجية (Debugging).",
      "مهارات تواصل كتابية راقية وواضحة."
    ]
  }
];

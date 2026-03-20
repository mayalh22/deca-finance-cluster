# DECA Finance Quiz

A spaced-repetition study tool for the DECA Finance cluster exam. 500+ exam-style questions with detailed explanations, persistent progress tracking, and a clean three-pile system that keeps working until every answer is mastered.

## Parts

- **Three-pile spaced repetition** — questions move between Mastered, Review, and Unseen piles based on your answers
- **Explanations on every question** — so you (I rn) can understand the reasoning behind each correct answer
- **Persistent progress** — saved to localStorage, with no account required!!!
- **Reset anytime** — you can wipe progress and start fresh on click
- **Responsive** — this works on desktop, tablet, and mobile
- **No dependencies** — vanilla HTML, CSS, and JavaScript

## File structure

```
├── index.html       Landing page
├── quiz.html        Quiz interface
├── quiz.js          All quiz logic
├── questions.js     Question bank (500+ questions)
├── style.css        Design system and component styles
└── README.md
```

## Question format

Each question in `questions.js` follows this shape:

```js
{
  q:    "Question text",
  opts: ["Option A", "Option B", "Option C", "Option D"],
  ans:  0,        // index of the correct option (0–3)
  exp:  "Explanation of why this answer is correct."
}
```

To add questions, append objects to the `ALL_QUESTIONS` array in `questions.js`.

This covers Accounting & Recordkeeping, Financial Planning, Banking & Credit, Securities & Investments, Risk Management, Corporate Finance, Insurance, Economics & Markets, Business Law & Ethics, Corporate Governance, Data & Analytics, Global Finance

## Contributing

Pull requests welcome. If you spot a wrong answer or want to add questions, open an issue or submit a PR with the corrected/new entries in `questions.js`.

## License

MIT
// quiz-loader.js
// This file should be hosted at: https://raw.githubusercontent.com/oxbridgeetf/chartdata/main/quiz-loader.js

(function() {
  const JSON_URL = "https://raw.githubusercontent.com/oxbridgeetf/chartdata/main/certification.json";
  
  function loadQuestion(qNum) {
    const player = GetPlayer();
    
    // Show loading state
    player.SetVar("QText", "Loading question...");
    
    fetch(JSON_URL + "?t=" + Date.now())
      .then(response => response.json())
      .then(data => {
        // Find the question with matching QNum
        const q = data.find(item => item.QNum === qNum);
        
        if (!q) {
          console.error(`Question ${qNum} not found in JSON`);
          player.SetVar("QText", `Error: Question ${qNum} not found`);
          return;
        }
        
        // Map letter answers to indices (A=0, B=1, C=2, D=3, E=4)
        const letterToIndex = { "A": 0, "B": 1, "C": 2, "D": 3, "E": 4 };
        const correctIndex = letterToIndex[q.Correct.toUpperCase()] ?? 0;
        const letterLabels = ["A", "B", "C", "D", "E"];
        
        // Create choices array from Choice1-Choice5
        const choices = [
          q.Choice1 || "",
          q.Choice2 || "",
          q.Choice3 || "",
          q.Choice4 || "",
          q.Choice5 || ""
        ];
        
        const correctLetter = q.Correct.toUpperCase();
        const correctText = choices[correctIndex] || "";
        
        // Set all answer variables
        for (let i = 0; i < 5; i++) {
          const text = choices[i] || "";
          const showAns = text.trim() !== "";
          player.SetVar(`Answer${i + 1}`, text);
          player.SetVar(`ShowAns${i + 1}`, showAns);
          console.log(`ShowAns${i + 1} = ${showAns}, Text = "${text}"`);
        }
        
        // Set question text and correct answer
        player.SetVar("QText", q.QText || "");
        player.SetVar("CorrectAnswerIndex", correctIndex + 1); // 1-based for Storyline
        
        // Set feedback with correct answer
        const feedbackText = `The correct answer is ${correctLetter}: ${correctText}`;
        player.SetVar("incorrect", feedbackText);
        
        console.log(`Question ${qNum} loaded successfully`);
      })
      .catch(error => {
        console.error("Error loading question:", error);
        player.SetVar("QText", "Error loading question. Please try again.");
      });
  }
  
  // Expose function globally so it can be called from slides
  window.loadQuizQuestion = loadQuestion;
})();

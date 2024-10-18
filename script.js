/*---Players input their names and start the game.---*/

const player1 = document.getElementById('player1')
const player2 = document.getElementById('player2')

const startButton = document.getElementById('startButton')
const categorydiv = document.getElementById('category')
const questiondiv = document.getElementById('question')
const next = document.getElementById('next')
const exit = document.getElementById('exitgame')


/* The selected category fetches 6 questions (2 easy, 2 medium, 2 hard) from The Trivia API. */
let player1_score = 0;
let player2_score = 0;
let currentPlayer = 1
let currentQuestionIndex = 0;
let currentQuestions = [];
let easy = []
let medium = []
let hard = []
let selectedCategory = []



/* Start the Game */

const startGame = (e) => {
    const player1_name = player1.value.trim();
    const player2_name = player2.value.trim();
    categorydiv.innerHTML = '';
    questiondiv.innerHTML = '';
    questiondiv.classList.remove('questiondiv')
    next.style.display = 'none'
    e.preventDefault()
    if(player1_name && player2_name) {
       addCategoryList()
    }
    else{
        alert('Please enter names for both players!')
    }
}

startButton.addEventListener('click', startGame)


/*---Fetch Categories---*/

const fetchCategories = async () => {
    try{
        const response = await fetch('https://the-trivia-api.com/v2/categories')
        const category = await response.json()
        console.log(category)
        return category 
    }
    catch(err){
        console.log(`Error Fetching Categories: ${err.message}`)
    }
}

/*--- Load Categories ---*/



const addCategoryList = async () =>
    {
        categorydiv.innerHTML = ''
        const categorydata = await fetchCategories()
        if(categorydata)
        {
            const div = document.createElement('div')
            div.classList.add('categorydiv')
            /* add a line to choose the category */
            for(let category in categorydata){
                const button = document.createElement('button')
                button.textContent = category
                button.addEventListener('click',() => fetchQuestions(category))
                div.appendChild(button)
            }
            categorydiv.appendChild(div)
        }
    }

// Fetch the questions
const fetchQuestions = async (category) => {
    if(selectedCategory.includes(category)){
        console.log(selectedCategory)
        alert(`Already selected category. Please select some other category`)
    }
    else{
        selectedCategory.push(category)
        const question_response = await fetch(`https://the-trivia-api.com/v2/questions?limit=50&categories=${category}`)
        const fetchedQuestions = await question_response.json()
        startQuiz(fetchedQuestions) //function call to start the game
    }

}

/* --- Game Play ---*/


const startQuiz = (questions) => {

    //Filters questions based on difficulty level
   const easy = questions.filter((ques) => ques.difficulty === 'easy')
   const medium = questions.filter((ques) => ques.difficulty === 'medium')
   const hard = questions.filter((ques) => ques.difficulty === 'hard')
    
   //All the 3 arrays into an single array using spread operator 
   currentQuestions = [...fetchRandomQuestions(easy),...fetchRandomQuestions(medium),...fetchRandomQuestions(hard)]
   displayQuestions()
}

const fetchRandomQuestions = (filteredQuestions) => {
    //shuffle and slice the questions
    const shuffledArray = filteredQuestions.sort(()=> 0.5 - Math.random())
    return shuffledArray.slice(0,2)
}

const displayQuestions = () => {    
    //Clearing Previous Question
    questiondiv.innerHTML = '';
    questiondiv.classList.add('questiondiv')
    //conditional check to display all the questions.
    if(currentQuestionIndex < currentQuestions.length){
        const questionElement = document.createElement('div')
        questionElement.classList.add('questionelement')
        questionElement.innerHTML = `<p class = 'question'> ${currentQuestions[currentQuestionIndex].question.text} </p>`
        questiondiv.appendChild(questionElement)
        const answerdiv = document.createElement('div')
        answerdiv.classList.add('answer')

        //fetching answers into an array
        
        const answers = [currentQuestions[currentQuestionIndex].correctAnswer,...currentQuestions[currentQuestionIndex].incorrectAnswers]
        console.log(answers)

        //shuffling the answer array
        const shuffle_answer = answers.sort(()=> 0.5 - Math.random())
        shuffle_answer.forEach((option)=>{
                //Creating radio button
                const radio = document.createElement('input')
                radio.type = 'radio'
                radio.name = 'answer'
                radio.value = option
                radio.id = option

                //Creating label for radio button
                const label = document.createElement('label')
                label.textContent = option
                label.htmlFor = option
                answerdiv.appendChild(radio)
                answerdiv.appendChild(label)
            })
        questiondiv.appendChild(answerdiv)  
        //added style functionality to display the next button.
        next.style.display = 'block'
    }
    else{
        alert('No more questions available')
    }
}
// next button trigger this function //
const checkAnswer = () => {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked')

    if(!selectedAnswer) {
        alert("Please select an answer!!")
        return // exit if no answer is selected
    }

   const currentQuestion = currentQuestions[currentQuestionIndex];
   //check for correct answer from the arrays of objects.
    if (selectedAnswer.value === currentQuestion.correctAnswer){
        alert('Correct!')  
        //switch function to deal with difficulty levels
        switch (currentQuestion.difficulty)
        {
            case 'easy':
                //ternary operator to update the score's to respective players.
                currentPlayer === 1 ? player1_score  += 10: player2_score += 10;
                break;
            case 'medium':
                currentPlayer === 1 ? player1_score  += 15: player2_score += 15;
                break;
            case 'hard':
                currentPlayer === 1 ? player1_score  += 20: player2_score += 20;
                break;            
        }  
    }
    else{
        alert(`Wrong! ${currentQuestion.correctAnswer} is the correct answer`)
    }

    currentQuestionIndex++
    next.style.display = 'none'
    //conditional check to switch between players for every question.
    if(currentQuestionIndex<currentQuestions.length){
        //ternary operator to switch between players.
        currentPlayer = currentPlayer === 1 ? 2 : 1
        //function call to display the next question.
        displayQuestions()
    }
    else{
        //Result Display - if all the questions are answered.
        questiondiv.innerHTML = ''
        questiondiv.classList.add('background-change')
        const resultdiv = document.createElement('div')
        resultdiv.classList.add('resultdiv')
        //conditional check to decide on the winners.
        if(player1_score>player2_score){
            resultdiv.innerHTML = `<p class="result">Congratulations!! You have completed the quiz!!! Choose another category if you wish to continue!! </p> <h1>${player1.value.trim()} is the winner!!!!</h1> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2>`
        }
        else if(player1_score === player2_score)
        {
            resultdiv.innerHTML = `<p class="result">Congratulations!! You have completed the quiz!!! Choose another category if you wish to continue!! </p> <h1>It's a tie!!!</h1> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2>`
        }
        else{
            resultdiv.innerHTML = `<p class="result">Congratulations!! You have completed the quiz!!! Choose another category if you wish to continue!! </p> <h1>${player2.value.trim()} is the winner!!!!</h1> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2>`
        }
       
        questiondiv.appendChild(resultdiv)
        //reset all the values to initial level.
        player1_score = 0;
        player2_score = 0;
        currentQuestionIndex = 0;
        currentQuestions = [];
        next.style.display = 'none'
    }

}
//next button triggers the checkAnswer function.
next.addEventListener('click',checkAnswer)
//end button triggers the exitGame function.
const exitGame = () => {
    //Check for user names to decide the user start the game, before ending.
    if(player1.value && player2.value)
    {
        //reset the question div.
        questiondiv.innerHTML = ''
        questiondiv.classList.add('background-change')
        const resultdiv = document.createElement('div')
        resultdiv.classList.add('resultdiv')
        //display the current result.
        resultdiv.innerHTML = `<p class="result"> You just ended the game!! </p><h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2>`
       

        questiondiv.appendChild(resultdiv)
        //remove the user input's to start fresh.
        player1.value = '';
        player2.value = '';
        //reset all the elements to initial level.
        player1_score = 0;
        player2_score = 0;
        currentQuestionIndex = 0;
        currentQuestions = [];
        selectedCategory = [];
        next.style.display = 'none';
        categorydiv.innerHTML = '';
    }
    else{
        alert('You cannot end the game until you start.')
    }
    
}

exit.addEventListener('click',exitGame)
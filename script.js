/*---Players input their names and start the game.---*/

//fetching all the html elements into the DOM
const player1 = document.getElementById('player1')
const player2 = document.getElementById('player2')

const startButton = document.getElementById('startButton')
//categroydiv-to display categories.
const categorydiv = document.getElementById('category')
//questiondiv-to display questions
const questiondiv = document.getElementById('question')
//resultdiv - to display results.
const resultdiv = document.getElementById('resultdiv')
//resultbutton - to view results.
const result = document.getElementById('result')
//refresh button - to refresh and restart the game again.
const refresh = document.getElementById('refresh')
//next button -  to move to next questions and check the answers.
const next = document.getElementById('next')
//end game button - to exit the game.
const exit = document.getElementById('exitgame')


/* Declaration */
//to store player's scores
let player1_score = 0;
let player2_score = 0;
//to track and change player's turn for every questions.
let currentPlayer = 1
let currentQuestionIndex = 0;
//to store the filtered questions from the API.
let currentQuestions = [];
//to filter the fetched questions based on difficulty level.
let easy = []
let medium = []
let hard = []
//to store the selected category. -players are not allowed to play again for alread selected category,
let selectedCategory = []



/* Start the Game */

const startGame = (e) => {
    const player1_name = player1.value.trim();
    const player2_name = player2.value.trim();
    document.getElementById('inputdiv').style.display = 'none'
    categorydiv.innerHTML = '';
    questiondiv.innerHTML = '';
    resultdiv.style.display='none'
    questiondiv.classList.remove('background-change')
    result.style.display='flex'
    next.style.display = 'none'
    e.preventDefault()
    if(player1_name && player2_name) {
        
        addCategoryList() //function call to fetch and display categories.
    }
    else{
        alert('Please enter names for both players!')
    }
}

//added eventlistener for start button to play. 
//startGame function will be triggered when you click start button.
startButton.addEventListener('click', startGame)


/*---Fetch Categories---*/

const fetchCategories = async () => {
    try{
        const response = await fetch('https://the-trivia-api.com/v2/categories')//API call to fetch categories.
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
        categorydiv.style.display = 'grid'
        const categorydata = await fetchCategories() //function call to fetch categories from API--category arrays will be returned.
        if(categorydata)
        {
            const div = document.createElement('div')
            div.classList.add('categorydiv')
            /* For loop to display categories as buttons from the category array*/
            for(let category in categorydata){
                const button = document.createElement('button')
                button.textContent = category
                //added eventlistener to each category buttons to fetch questions from the API.
                button.addEventListener('click',() => fetchQuestions(category))
                div.appendChild(button)
            }
            categorydiv.appendChild(div)
        }
    }

// Fetch the questions
const fetchQuestions = async (category) => {
    if(selectedCategory.includes(category)){
        alert(`Already selected category. Please select some other category`)
    }
    else{
        selectedCategory.push(category)
        const question_response = await fetch(`https://the-trivia-api.com/v2/questions?limit=50&categories=${category}`)//API call to fetch questions based on category.
        const fetchedQuestions = await question_response.json()
        startQuiz(fetchedQuestions) //function call to start the game
    }

}

/* --- Game Play ---*/


const startQuiz = (questions) => {
    currentPlayer = 1 // initializing again to reset the player's turn when player ends the quiz before completing all the questions.

    //Filters questions based on difficulty level
   const easy = questions.filter((ques) => ques.difficulty === 'easy')
   const medium = questions.filter((ques) => ques.difficulty === 'medium')
   const hard = questions.filter((ques) => ques.difficulty === 'hard')
    
   //All the 3 arrays into an single array using spread operator-finalized array having 6 questions.
   currentQuestions = [...fetchRandomQuestions(easy),...fetchRandomQuestions(medium),...fetchRandomQuestions(hard)]
   displayQuestions()
}

const fetchRandomQuestions = (filteredQuestions) => {
    //shuffle and slice the questions
    const shuffledArray = filteredQuestions.sort(()=> 0.5 - Math.random())
    return shuffledArray.slice(0,2)
}

const displayQuestions = () => {    

    categorydiv.style.display = 'none'
    resultdiv.style.display = 'none'
    questiondiv.innerHTML = '';
    questiondiv.style.display = 'flex';
    questiondiv.classList.add('questiondiv')
    
    questiondiv.classList.remove('background-change')
    const questionElement = document.createElement('div')
    questionElement.classList.add('questionelement')
    //displaying player's turn and questions..
    questionElement.innerHTML = `<h2 class="playerturn">${currentPlayer === 1 ? player1.value.trim():player2.value.trim()}'s turn </h2> 
    <p class = 'question'> ${currentQuestions[currentQuestionIndex].question.text} </p>`
    questiondiv.appendChild(questionElement)
    const answerdiv = document.createElement('div')
    answerdiv.classList.add('answer')
    //fetching answers into an array.
    const answers = [currentQuestions[currentQuestionIndex].correctAnswer,...currentQuestions[currentQuestionIndex].incorrectAnswers]
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

// next button trigger this function call //
const checkAnswer = () => {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked')
    if(!selectedAnswer) {
        alert("Please select an answer!!")
        return // exit if no answer is selected
    }
    //to get the currentquestion to verify the answer
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
        currentPlayer = currentPlayer === 1 ? 2 : 1
        displayQuestions()
    }
    else{
        //if all the questions are answered!!
        questiondiv.innerHTML = '<h1> You completed your quiz!!! Check on results to know your scores!!!</h1>'
        result.style.display = 'flex'
        next.style.display = 'none'
    }

}
//next button triggers the checkAnswer function.
next.addEventListener('click',checkAnswer)
//end button triggers the exitGame function.
const exitGame = () => {
    //Check for user names to decide the user start the game, before ending.
    if((player1.value && player2.value))
    {
        //reset the question div.
        questiondiv.style.display = 'none'
        categorydiv.style.display = 'none'
        resultdiv.style.display = 'flex'
        result.style.display = 'none'
        document.getElementById('inputdiv').style.display = 'none'
        resultdiv.classList.remove('resultdiv')
        resultdiv.classList.add('background-change')
        //display the current result.
        resultdiv.innerHTML = `<p class="result"> You exit!! Click on refresh button to play again!`
        //reset all the elements to initial level.
        player1.value = ''
        player2.value = ''
        player1_score = 0;
        player2_score = 0;
        currentQuestionIndex = 0;
        currentQuestions = [];
        selectedCategory = [];
        next.style.display = 'none';

    }
    else{
        alert('You cannot end the game until you start.')
    }
    
}
exit.addEventListener('click',exitGame)
const resultDisplay = () => {
    if(player1.value&&player2.value)
    {   
        if(currentQuestionIndex>0){
            if(currentQuestionIndex === currentQuestions.length){
                //Result Display - if all the questions are answered.
                resultdiv.innerHTML = '';
                resultdiv.style.display = 'flex'
                resultdiv.classList.add('resultdiv')
                questiondiv.style.display = 'none'
                categorydiv.style.display = 'flex'
                //conditional check to decide on the winners.
                if(player1_score>player2_score){
                    resultdiv.innerHTML = `<p class="result">Congratulations!! You have completed the quiz!!! Choose another category if you wish to continue!! </p> <h1>${player1.value.trim()} is the winner!!!!</h1> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2> <h3> Categories Selected: ${selectedCategory.join(', ')} </h3>`
                }
                else if(player1_score === player2_score)
                {
                    resultdiv.innerHTML = `<p class="result">Congratulations!! You have completed the quiz!!! Choose another category if you wish to continue!! </p> <h1>It's a tie!!!</h1> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2> <h3> Categories Selected: ${selectedCategory.join(', ')} </h3>`
                }
                else{
                    resultdiv.innerHTML = `<p class="result">Congratulations!! You have completed the quiz!! Choose aother category if you wish to continue!! </p> <h1>${player2.value.trim()} is the winner!!!!</h1> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2> <h3> Categories Selected: ${selectedCategory.join(', ')} </h3>`
                }
                //reset all the values to initial level.
                player1_score = 0;
                player2_score = 0;
                currentQuestionIndex = 0;
                currentQuestions = [];
            }else
            {   
                //if player's click the results button before completing all the questions for the particular category.
                resultdiv.innerHTML = '';
                resultdiv.style.display = 'flex'
                resultdiv.classList.add('resultdiv')
                questiondiv.style.display = 'none'
                categorydiv.style.display = 'flex'
                next.style.display = 'none'
                resultdiv.innerHTML = `<p class="result"> You didn't completed the quiz. You played only for ${currentQuestionIndex} questions.</p> <h2 class="score"> ${player1.value.trim()}'s score: ${player1_score} </h2> <h2 class="score"> ${player2.value.trim()}'s score: ${player2_score} </h2> <h3> Categories Selected: ${selectedCategory.join(', ')} </h3>`
                //reset all the values to initial level.
                player1_score = 0;
                player2_score = 0;
                currentQuestionIndex = 0;
                currentQuestions = [];
            }    
        }
        else{
            //if player clicks the result button before answering a single question.
            resultdiv.innerHTML = '';
            resultdiv.style.display = 'flex'
            resultdiv.classList.add('background-change')
            resultdiv.innerHTML = '<p> You can"t see the results until you play atleast one question!</p>'
            //reset all the values to initial level.
        }
    }
    else
    {
        //if player's click end button before start the game.
        resultdiv.innerHTML = '';
        resultdiv.style.display = 'flex'
        resultdiv.classList.add('background-change')
        resultdiv.innerHTML = '<p> You can"t see the results before you play</p>'
        //reset all the values to initial level.
        player1_score = 0;
        player2_score = 0;
        currentQuestionIndex = 0;
        currentQuestions = [];
    }          
}
result.addEventListener('click',resultDisplay)
const refreshGame = () => {
    document.getElementById('inputdiv').style.display = 'flex'
    resultdiv.innerHTML = " "
    resultdiv.style.display = 'none'
    categorydiv.style.display = 'none'
    questiondiv.style.display = 'none'
    next.style.display = 'none'
    player1.value = ''
    player2.value = ''
    player1_score = 0;
    player2_score = 0;
    currentQuestionIndex = 0;
    currentQuestions = [];
    selectedCategory = [];
}
refresh.addEventListener('click',refreshGame)
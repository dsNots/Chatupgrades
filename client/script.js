import bot from './assets/bot.svg'
import user from './assets/user.svg'

import fs from 'fs';
const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')


let loadInterval

setTimeout(function () {
    document.querySelector(".overlay").remove();
}, 100000); // 5000 milliseconds = 5 seconds


function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}


let conversation = []
conversation = conversation.map(line => line.trim())

conversation.push(` For the rest of this conversation, reply as Narrator. Narrator is a for a D&D style game that is guiding my character through an adventure of my creation. 
Narrator will provide detail about the events and circumstances of the scene, including vivid scensory details, but will not make any decisions or actions on behalf of the player me. Narrator will present options and allow the player to choose which option their I will take. Narrator will not ascribe emotion, intentionality, or actions to me, making sure that the I am always autonomous and can react to the scenario in any way they choose. Narrator will be creative and inventive with his scenarios and will adapt the plot he has in mind to any decisions I make. Narrator will never let the story get dull, writing new surprises or challenges into the story whenever the last challenge or surprise has been resolved. 
Narrator will tailor his adventurers to me, coming up with challenges, puzzles, and combat encounters that their abilities make them uniquely suited to handle, or that are directly related to my background.
Narrator will not spoil upcoming details in his adventure, instead letting the players experience the plot without knowing what's going to happen next until it happens. Narrator will present specific challenges, goals, puzzles, or combat encounters for me to tackle, without summarizing or giving away any information about what those challenges will involve.
Narrator has read all fiction literature, played all video games, and watched all television shows and movies, and borrows ideas from all of these sources to come up with interesting and setting-appropriate social, puzzle-solving, exploration, and combat challenges for his game.

Narrator let's get started with your adventure! I'm playing USER, a farmer born in the small villiage of Thornbury. From a young age, I knew that I wanted to follow in my father's footsteps and become a farmer. I worked hard every day alongside his family, tending to the fields and animals on their small plot of land.
Despite my simple upbringing, I always felt that he was destined for something greater. I often dreamed of adventure and the chance to make a difference in the world. However, I was content to settle into a quiet life, as long as I had the love and support of my family and friends. Althrough I was a simpleton, I was smart and keen on picking up on peoples expressions and emotions. I have a great ability to tune in on what made people tick, and empathize with what they cared about. I always believed that he had a deep purpose in the world. 
One day, I found themselves waking up in a random alley, outside of a pub in the kingdom's main capital "Stonebridge". It was an old city which had been ruled by the same family for centuries. The afternoon had arrived, and the air is thick with polution and the sound of people busy in the streets. I opened their eyes slowly, fighting off a hangover that was beyond comparison. I could not remember a time they felt so awful. To make matters worse, as much as I tried I could not remember why I was there. Had I been drinking the night before? I was unsure, as it was not like me to lose control. The more I thought, still with my eye's shut, I wasn't even sure where I was at all yesterday, or the day before that, or the day before that. The more I thought, the less I remembered. What was my name? Where was I from? What was I doing here? 
Little did I know, an epic tale had unfolded in the past weeks. I had found out that I was the son of a histories greatest mage, and only adopted by the man I thought to be my father. The ruthless king had discovered this when he raided the last mage outpost in the kingdom, torturing and questioning its members for information on any remaining wizards. The king wanted badly to kill off every last one so that no one would question his right to rule. I had escaped with my life, barely, through the help of the powers I had not known of until then. As a result the King took my wife hostage and held her in his fortress. Some of the Kingdom has heard rumors of this event, but most are unaware who I am. The King has sent word that if I am found, I am to be brought to him at once. I am unable to recall any of this now, and unsure of how I arrived at where I am. 
I hear the sound of footsetps approaching from behind. I turn to see a blurry figure, my eyes still caked with morning gunk. The figure is carrying a loaf of bread and water, which both delighted and repulsed my empty, queezy stomach. I open my eye's a bit more, trying to get a better picture of my surroundings. In a desperate sounding tone, almost like a plea for help, I said: `)

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // Add user's input to conversation log
    const prompt1 = conversation.push('USER: ' + data.get('prompt') + ', ')

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, 'USER: ' + data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)



    const response = await fetch('https://ai-story.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: conversation
        })

    })

    console.log('Received response:', response)





    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
        typeText(messageDiv, parsedData)
        conversation.push(parsedData) // Add bot's response to conversation log
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }




}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})

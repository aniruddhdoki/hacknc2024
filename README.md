## Inspiration
Financial literacy is a pervasive issue in the United States. Studies show that the average American loses over $1500 a year due to financial illiteracy, and nearly 50% do not have retirement savings. These gaps in understanding lead to poor financial decisions, high debt levels, and ultimately poor economic mobility. Furthermore, these issues disproportionately affect low-income communities and other minority groups.

Traditional methods of learning personal finance, like watching online videos, attending classes, or reading wiki-sites like Investopedia, are helpful but often lack the personalized guidance that many people need to truly understand and apply financial concepts to their unique situations. Additionally, limited access to resources, language barriers, and complicated interfaces can feel inaccessible, overwhelming, or simply out of reach.

This is where Aurora AI comes in. Our vision was to create a tool that doesn’t just provide information but feels like a trusted companion in the financial journey. By using hologram technology and LLM processing, we’ve built an interactive experience that guides users step-by-step, answering questions in real time, and adapting to their language preferences.

Aurora AI aims to bridge the financial literacy gap by making complex information easy to understand and accessible anywhere at any time. We’re especially passionate about reaching communities that have been underserved by the financial system—helping people gain control over their finances, avoid costly mistakes, and build a foundation for financial success. 

## What it does

Aurora AI is a tool built to provide equitable financial services across social economic statuses. Designed with an intuitive, user-friendly interface, Aurora AI empowers users to access critical financial insights quickly and effortlessly, regardless of their financial knowledge or background. Our innovative hologram technology creates an immersive, human-like interaction that feels as though you’re engaging with a financial advisor, not just a chatbot. Users can ask questions about budgeting, savings, investments, loans, or any other financial topic, and Aurora AI responds with clear, relevant, and actionable information tailored to their personalized needs. We plan on expanding our hologram technology to support all languages. Aurora AI can detect the language it’s being spoken to in and respond accordingly, making the experience feel even more personalized and accessible. By recognizing and adapting to each user’s language, XXXX ensures that everyone receives guidance in a way that feels natural and intuitive. This feature is especially valuable for reaching people from diverse backgrounds, enabling them to connect with financial resources in their native language without any barriers. By breaking down language barriers, we aim to make financial knowledge and tools accessible to everyone, supporting communities that have historically been underserved due to linguistic limitations. 

## How we built it

Creating a solution that is personalized to cultural preferences, speaks any language, and is deeply knowledgeable required a robust and dynamic question and answer service. We created this by building an agent that uses chain of thought (CoT) prompting and retrieval augmented generation (RAG). Our RAG system is powered by LangChain and LanceDB, an open source vector database, which we populated with content scraped from Investopedia and Capital One. We then used FastAPI to serve the generation endpoint to our frontend.

We used Docker to containerize our application and allow for any one to use our framework (pmoharana/rag-app). Terraform was used to generate the AWS resources required to run our API such as the underlying virutal machines, load balances, and container service. Our Infrastructure as Code implementation allows to deploy, update, and destroy our infrastructure as needed.

The hologram interface was designed by building a basic cardboard frame with a cutout at the top for a screen, like a phone or tablet. Inside, we placed a clear piece of glass at a 45-degree angle. This simple setup allows the screen’s image to reflect off the glass, creating the 3D floating effect. 

## Challenges we ran into

We ran into a few challenges along the way. The first big hurdle was getting our multi-language feature to respond at an appropriate language level for the user. During testing, we noticed that our model would often use language that was more complex than what the average speaker might use, which wasn’t ideal. To tackle this, we decided to first convert everything into romanized English and then translate it back into the target language. This approach helped us keep the responses more natural and at a level that would be easy for users to understand. 

## Accomplishments that we're proud of

We’re incredibly proud of our multi-language feature, which can accurately converse in various languages. Testing our model in languages we already know beyond English allowed us to gauge its accuracy firsthand, confirming that it communicates effectively and naturally across linguistic barriers. Seeing it respond naturally in multiple languages is such a rewarding experience and gets us even more excited about making financial knowledge accessible for everyone, no matter where they’re from or what language they speak.

## What we learned

Throughout this project, we learned that it is much more difficult to build a multi-lingual assistant and even harder to create a hologram that we can talk to. Finding a solution that allows us to help different groups of people and create a product that would create a change in the world was difficult. We got experience creating a physical MVP, a RAG agent, deployment of a product into a cloud environment, and tying everything together in a clean frontend. 

## What's next for Finance

In the future we aim to having different models that will be more personalized for each community. Avatars that reflect users’ own communities—not just in appearance, but in voice, accent, and even local dialects. This level of customization will make interactions feel more relatable, authentic, and inclusive, which will help users feel understood and connected to the information they receive.

To achieve this, we plan to leverage local language models (LLMs) to fine-tune responses based on region-specific data, making our guidance more relevant and accurate. By aligning with cultural and linguistic nuances, these models will ensure that financial advice resonates personally with each user. 
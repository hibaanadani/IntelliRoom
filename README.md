<img src="./readme/title1.svg"/>

<br><br>

<!-- project overview -->
<img src="./readme/title2.svg"/>

> Intelliroom: Your Ultimate AI Decor Guru ✨

> Hey fellow design enthusiasts! Ready to level up your living space? Meet Intelliroom, the mobile app designed to be your ultimate interior design partner. Just snap a pic of your room, and our powerful AI and Machine Learning models get to work, instantly identifying your furniture and decor. It’s like having a personal design assistant in your pocket!

> No more design dilemmas! Intelliroom takes that smart analysis and provides actionable suggestions for furniture modifications and additions. We help you create a space that's not just functional, but also a true reflection of your style. Get ready to transform your room and become a home design pro! 🏡

<br><br>

<!-- System Design -->
<img src="./readme/title3.svg"/>

### ER Diagram

<img src="./readme/demo/Schema.png"/>

### Components Diagram

<img src="./readme/demo/ComponentsDiagram.png"/>

<br><br>

<!-- Project Highlights -->
<img src="./readme/title4.svg"/>

### Main Highlights

> What Can Intelliroom Do for You?

- Instant Design Feedback: Snap or upload a pic of your space, and our AI will serve up instant design suggestions to make it pop.

- Visualize the Vibe: The app generates a new image so you can visualize your revamped space before even lifting a finger.

- Book Your Dream Room: Ready to shop? Our AI handles booking meetings with your favorite furniture stores directly through the app.

<br><br>

<!-- Demo -->
<img src="./readme/title5.svg"/>

### User Screens (Mobile)

| Landing screen                         | Register screen                    | Signup screen                       |
| -------------------------------------- | ---------------------------------- | ----------------------------------- |
| ![Landing](./readme/demo/landing.jpeg) | ![fsdaf](./readme/demo/login.jpeg) | ![fsdaf](./readme/demo/signup.jpeg) |

| Home screen                         | Gallery screen                       | Room screen                               |
| ----------------------------------- | ------------------------------------ | ----------------------------------------- |
| ![Landing](./readme/demo/home.jpeg) | ![fsdaf](./readme/demo/gallery.jpeg) | ![fsdaf](./readme/demo/roomanalysis.jpeg) |

| Chatbot screen                        | Rooms screen                      | Booking screen                      |
| ------------------------------------- | --------------------------------- | ----------------------------------- |
| ![Landing](./readme/demo/chatbot.gif) | ![fsdaf](./readme/demo/rooms.gif) | ![fsdaf](./readme/demo/booking.gif) |

<br><br>

<!-- Development & Testing -->
<img src="./readme/title6.svg"/>

### Add Title Here

| Services                              | Validation                       | Testing                             |
| ------------------------------------- | -------------------------------- | ----------------------------------- |
| ![Landing](./readme/demo/service.png) | ![fsdaf](./readme/demo/auth.png) | ![fsdaf](./readme/demo/testing.png) |

<br><br>

<!-- AI-Powered APP -->
<img src="./readme/title8.svg"/>

### Calendar Workflow

<img src="./readme/demo/Calendarworkflow.png"/>

> Intelliroom uses AI agent to provide a smoother booking experience!

- Returns the available booking times at the selected date.
- Handles booking with selected gallery of the users choice.
- Chatbot agent that assists the user when needed.

| Calendar Service                              | Chatbot Service                            |
| --------------------------------------------- | ------------------------------------------ |
| ![Landing](./readme/demo/calendarservice.png) | ![fsdaf](./readme/demo/chatbotservice.png) |

<br><br>

<!-- Deployment -->
<img src="./readme/title7.svg"/>

### CI/CD

<img src="./readme/demo/CICD.png"/>

- A new feature begins development on a local branch.
- The local branch is pushed to its remote counterpart.
- The remote branch is merged into the staging branch.
- This merge triggers GitHub Actions to run the CI/CD workflow.
- The workflow first attempts to boot the database, then runs migrations and tests.
- If the CI is successful, the CD process begins. GitHub Actions pushes the code to the AWS EC2 staging instance and executes a deployment script.
- The deployment script builds separate Docker containers for the Laravel, Node, React, and database services.
- Once the feature is finished and passes staging, the staging branch is merged into the main branch.
- The production deployment is initiated, following the same steps as the staging CD process.

| GitHub Pull Request                        | GitHub Testing Pipeline              | GitHub Deployment Pipeline Success  |
| ------------------------------------------ | ------------------------------------ | ----------------------------------- |
| ![Landing](./readme/demo/pullrequests.png) | ![fsdaf](./readme/demo/pipeline.png) | ![fsdaf](./readme/demo/success.png) |

| Postman API 1                          | Postman API 2                        | Swagger                             |
| -------------------------------------- | ------------------------------------ | ----------------------------------- |
| ![Landing](./readme/demo/postman1.png) | ![fsdaf](./readme/demo/postman2.png) | ![fsdaf](./readme/demo/swagger.png) |

<br><br>

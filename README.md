## Server Installation and Setup

### Install Node.js and npm (if not already installed):
Node installation instructions: https://nodejs.org/en/download/

### Clone the repository:
```
git clone https://github.com/mynamecharlesrothbaum/TuringSim/blob/main/README.md
```
Navigate to the Server Directory:

```
cd TuringSim
cd TuringSimServer
```
### Create a .env file:
In the project’s root directory, create a file named .env and fill it out with the following format:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Chucko12!
DB_DATABASE=TuringMachine
```

### Install Dependencies:
```
npm install
```

This will install express, cors, mysql, dotenv, and any other dependencies listed in package.json.

### Start the Server:
```
node index.js
```

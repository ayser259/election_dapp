IN ORDER TO MAKE THIS WORK, YOU HAVE TO RUN THE FOLLOWING COMMANDS IN THIS SPECIFIC ORDER IN THE CONSOLE. OTHERWISE THE ELECTION CONTRACT DOESNT CREATE THE CANDIDATES

truffle migrate --reset
npm run dev
truffle migrate --reset

then keep hitting refresh. If that doesnt work, run truffle migrate --reset again

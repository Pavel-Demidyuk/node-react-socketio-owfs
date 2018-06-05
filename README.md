1. Install nodejs
1. Clone this project
1. Update configs in /conigs folder (self-explanatory)
1. From the parent folder run 
    ```bash 
    DEBUG=automation,owfs NODE_ENV=prod node server.js
    ```
1. In separate terminal window run
    ```bash
    cd socket-client
    npm start
    ```
1. Application is available at http://localhost:3000
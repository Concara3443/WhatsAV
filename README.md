# WhatsAV

WhatsAV is a WhatsApp bot designed for aviation enthusiasts. You can chat with the bot using the number +34601557035 or by following [https://wa.me/34601557035](https://wa.me/34601557035).

## Features

- **Commands**: The bot supports various commands related to aircrafts, airports, and general information.
- **Events**: The bot handles multiple events to ensure smooth operation.
- **Error Handling**: Robust error handling to manage unhandled rejections and exceptions.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/WhatsAV.git
    cd WhatsAV
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file and add your environment variables.

### Running the Bot

1. Prepare the session:
    ```sh
    npm run prepare
    ```

2. Start the bot:
    ```sh
    npm start
    ```

## Configuration

You can configure the bot by editing the [config/config.json](config/config.json) file. For example, you can change the command prefix:

```json
{
    "prefix": "!"
}
```

## Contributing
Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
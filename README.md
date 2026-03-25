# WhatsAV

WhatsAV is a WhatsApp bot designed for aviation enthusiasts. You can chat with the bot using the number **+44 73 0856 4711** or by following [https://wa.me/447308564711](https://wa.me/447308564711).

**Author:** Guillermo Cortés | [guillermocort.es](https://guillermocort.es)

## Features

- **Aviation Data**: Get real-time METAR, TAF, NOTAMs, and airport information.
- **Flight Search**: Search for flights between airports.
- **AIP Information**: Access amendments and AIP data for Spain.
- **Easy to Use**: No prefix needed in private chats!

## How to Use

### Private Chat
Simply write the command directly:
```
metar LEMD
taf KJFK
help
```

### Groups
Mention the bot followed by your command:
```
@WhatsAV metar LEMD
@WhatsAV help
```

## Available Commands

### Information
| Command | Description |
|---------|-------------|
| `help` | Shows all available commands |
| `ping` | Check bot latency |
| `about` | Information about the bot |
| `status` | Bot status and uptime |

### Airports
| Command | Usage | Description |
|---------|-------|-------------|
| `metar` | `metar <ICAO> [ICAO...]` | Get METAR data for airports |
| `taf` | `taf <ICAO> [ICAO...]` | Get TAF forecast for airports |
| `wx` | `wx <ICAO>` | Human-readable weather summary |
| `decode` | `decode <ICAO>` | Detailed METAR decode with explanations |
| `notam` | `notam <ICAO>` | Get active NOTAMs for an airport |
| `ainfo` | `ainfo <ICAO/IATA>` | Get airport information |
| `runway` | `runway <ICAO>` | Get runway information with wind conditions |
| `search` | `search <name>` | Search airports by name |

### Flights
| Command | Usage | Description |
|---------|-------|-------------|
| `fsearch` | `fsearch <DEP> [ARR]` | Search flights between airports |

### AIP (Spain)
| Command | Description |
|---------|-------------|
| `amendments` | Get AIP Spain amendments |
| `airac` | Current and next AIRAC cycle info |

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Concara3443/WhatsAV.git
    cd WhatsAV
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file with your API keys:
    ```
    RAPIDAPI_KEY=your_rapidapi_key_here
    ```

### Running the Bot

1. Prepare the session (scan QR code):
    ```sh
    npm run prepare
    ```

2. Start the bot:
    ```sh
    npm start
    ```

### Running as a Windows Service (WinSW)

1. Download WinSW and place it in the project directory
2. Create/edit `WhatsAV-service.xml`:
    ```xml
    <service>
      <id>WhatsAV</id>
      <name>WhatsAV Bot</name>
      <description>WhatsApp Aviation Bot</description>
      <executable>node</executable>
      <arguments>src/index.js</arguments>
      <workingdirectory>C:\path\to\WhatsAV</workingdirectory>
      <logpath>C:\path\to\WhatsAV\logs</logpath>
      <log mode="roll-by-size">
        <sizeThreshold>10240</sizeThreshold>
        <keepFiles>8</keepFiles>
      </log>
    </service>
    ```
3. Install and start the service:
    ```sh
    WhatsAV-service.exe install
    WhatsAV-service.exe start
    ```

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Author

**Guillermo Cortés**
- Website: [guillermocort.es](https://guillermocort.es)
- GitHub: [Concara3443](https://github.com/Concara3443)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
